#! /usr/bin/env node
var package = require('./package');
var cmd = require('commander');
var colour = require('colour');
var fs = require('fs');
var p = require('path');
var omit = require('lodash/omit');
var merge = require('lodash/merge');
var get = require('lodash/get');
var mapValues = require('lodash/mapValues');
var fm = require('front-matter');
var Promise = require('bluebird');
var fsp = Promise.promisifyAll(fs);
var glob = Promise.promisifyAll(require('node-glob'));
var rp = require('request-promise');

cmd
.version('0.0.1')
.option('-C --config [config]', 'Your settings file (.json), will override any other settings you pass in')
.option('-t, --token <token>', 'Your contentful api token')
.option('-l, --lang [lang]', 'The language setting for this content, defaults to en-US', 'en-US')
.option('-m, --mapper [mapper]', 'You can pass in a mapper file (.js) which has to export one function which can be used to map over the imported data')
.option('-c, --content-type <content-type>', 'Id for the contentful content type. You need this so that contentful knows which content type to use for these entries')
.option('-s --space-id <space-id>', 'Id of the contentful space that you want to upload the entries to.')
.option('-p, --publish', 'Whether or not to publish your uploaded entries immediately', false)
.usage('-t <token> -s <space-id> -c <content-type> <glob>')
.parse(process.argv);

if (cmd.config) {
  // if there's a config file we merge all the options
  cmd = merge(cmd, JSON.parse(fs.readFileSync(cmd.config, 'utf8')));
}

var mapper = function(val) { return val };
if (cmd.mapper) {
  mapper = require(p.resolve(process.cwd(), cmd.mapper));
}

var throwError = function(msg, args) {
  var errorMsg = 'Error: '.red + msg.red;
  args = args || [];
  args.forEach(function(arg) {
    errorMsg+= '\n>>{\n';
    errorMsg+= '>>  ' + arg.key + ': ';
    errorMsg+= '"' + arg.val.red + '"';
    errorMsg+= '\n>>}';
  });
  console.log(errorMsg.red);
  process.exit(1);
};

var throwApiError = function(error) {
  var type = get(error, 'sys.id');
  console.log(type);
  console.log(error.details.errors);
  console.log('booom');
  //if (type )
  process.exit(1);
};

var showProgress = function(msg) {
  console.log('>> Progress: '.blue + msg.blue);
}

var showSuccess = function(msg) {
  console.log('>> Success: '.green + msg.green);
};

var contentfulApi = 'https://api.contentful.com/' + 'spaces/' + cmd.spaceId;
var isError = false;

if (!cmd.token) {
  isError = true;
  throwError('Api token is required');
}

if (!cmd.spaceId) {
  isError = true;
  throwError('A contentful space id is required');
}

if (!cmd.contentType) {
  isError = true;
  throwError('A contentful content type id is required');
}

if (cmd.args.length < 1) {
  isError = true;
  throwError('You need to pass a file or a folder name');
}

if (isError) {
  console.log(
    "\nYou didn't enter all required options, please use as specified:\n".red +
      ">>  ".red + 
      "cfupload -t <token> -s <space-id> -c <content-type> <glob>\n".yellow
  );
}

var validateFile = function(file) {
  typeSpec.fields.forEach(function(field) {
    // if a field is required but isn't contained by the file
    // we throw
    if (field.required === true && !file.content.attributes[field.id]) {
      console.log('error missing field '.red + field.id.red + ''.red);
      console.log('>> ' + file.path);
      process.exit(1);
    }
  });
  console.log(file);
};

var mapFile = function(file) {
  var data = file.content.attributes;
  data.body = file.content.body;

  file.content.fields = mapValues(data, function(value, key) {
    var obj = { };
    obj[cmd.lang] = value
    return obj;
  });

  return mapper(file);
};

var contentTypeEndpoint = contentfulApi + '/content_types/' + cmd.contentType + '?access_token=' + cmd.token;
var path = p.resolve(process.cwd(), cmd.args[0]);
var toString = function(file) { return file.toString(); };
var addDir = function(files) {
  return files.map(function(file){
    return p.join(path, file);
  });
};

console.log('\nchecking authorisation and if content type exists'.blue +
            '\n>> url: ' + contentTypeEndpoint.underline);

var typeSpec;
rp.get(contentTypeEndpoint)
.then(function(type) {
  typeSpec = JSON.parse(type);
  showSuccess('Content type with name ' + typeSpec.name + ' has been found.');
})
.catch(function(err) {
  throwError(JSON.parse(err.error).message);
})
.then(function() {
  return glob(path);
})
.catch(function(err) {
  throwError('Please supply a valid directory or path to upload', [{
    key: 'invalid path', val: path,
  },
  {
    key: 'error', val: err
  }]);
})
.then(function(filenames) {
  return Promise.all(filenames.map(function(file){
    return fsp.readFileAsync(file, 'utf8')
    .then(function(content) {
      return {path: file, content: fm(content)};
    });
  }));
})
// map all the 
.then(function(files) {
  files = files.map(mapFile);
  files.forEach(validateFile);
  return files;
})
.then(function(files) {
  return Promise.all(files.map(function(file){
    var data = file.content;
    showProgress('uploading file ' + file.path);
    var apiOptions = {
      method: 'POST',
      json: true,
      url: contentfulApi + '/entries',
      headers: {
        'Authorization': 'Bearer ' + cmd.token,
        'X-Contentful-Content-Type': cmd.contentType
      },
      body: { fields: data.fields,  }
    };

    return rp.post(apiOptions)
    .catch(function(err) {
      var error = JSON.parse(err.message.replace(/^[^{]+/, ''));
      throwApiError(error);
    })
    .then(function(resp) {
      showSuccess('uploaded file ' + file.path);
      return resp;
    })
    .then(function(entry) {
      if (cmd.publish) {
        showProgress('publishing entry ' +  entry.fields.title);
        return request({
          url: contentFulApi + '/entries/' + entry.sys.id + '/published',
          method: 'PUT',
          headers: {
            'Authorization': 'Bearer ' + cmd.token,
            'X-Contentful-Content-Type': cmd.contentType
          }
        }).then(function(publishedEntry) {
          showSuccess('published entry ' +  publishedEntry.fields.title);
          return publishedEntry;
        });
      }
      return resp;
    });
  }));
}).then(function(){
  var msg = 'All content uploaded';
  if (cmd.publish === true) {
    msg += ' & published';
  }
  showSuccess(msg);
});

module.exports
