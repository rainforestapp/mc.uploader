# Mc Uploader (Markdown Contentful Uploader)

Mc Uploader in the house!

![](https://media.giphy.com/media/hxc32veg6tbqg/giphy.gif)

A tool to upload markdown files with frontmatter to contentful. This is the first release, if you find an issue or would like a feature added, please open an issue.

### Features
- Validates your data against your contentful content type before it uploads.
- Rate limits requests according to contentful rate limit.
- Transform your data with a mapper before you upload to contentful.

## Installation

Install like so:

```bash
npm install mc.uploader
```

## Usage

There are two ways to use mc.uploader. With or without a config file. Without a config file you pass in all parameters with command line arguments like so:

```
mc.uploader -t <token> -s <space-id> -c <content-type> <glob>
```

For convenience you can also a config file
```
mc.uploader -C <my-config-file.json> <glob>
```

### Options

To get all available options, simply go
```
mc.uploader --help

```
That'll print out the cli help:

```
  Options:

    -h, --help                         output usage information
    -V, --version                      output the version number
    -C --config [config]               Your settings file (.json), will override any other settings you pass in
    -t, --token <token>                Your contentful api token
    -l, --lang [lang]                  The language setting for this content, defaults to en-US
    -m, --mapper [mapper]              You can pass in a mapper file (.js) which has to export one function which can be used to map over the imported data
    -c, --content-type <content-type>  Id for the contentful content type. You need this so that contentful knows which content type to use for these entries
    -s --space-id <space-id>           Id of the contentful space that you want to upload the entries to.
    -p, --publish                      Whether or not to publish your uploaded entries immediately
```

Here's how a config.json file would look:

```json
{
  "token": "(required) Your contentful oauth token",
  "spaceId": "(required) Your contentful space id (required)",
  "contentType": "(required) The name of your content type - like blogPost or teamMember",
  "publish": "true - publishes the entries after they are created, don't configure this if you don't want to publish, defaults to false",
  "lang": "The locale that you want to use for this content, defaults to 'en-US'",
  "mapper": "Path to mapper file. You can use this to prepare entries for upload"
}
```

### Mappers
Use a mapper if you need to modify your data before uploading it to contentful.

For example, let's say you want to use the file names to populate a field called 'slug' before you send the data to contentful. You can use a mapper to do that.

All you need to do is create a module that exports a function, this function gets used for all the entries before they get uploaded:


```js
module.exports = function(file) {
  file.content.fields.slug = {
    'en-US': file.path.replace('.md', '')
  };
  return file;
};
```

Use the mapper by specifying the mapper option like so: `mc.upload -m add-slug.js ....`.

The file object that gets passed to the mapper function looks like this:

```js
{
  path: 'blog-post.md',
  content: {
    fields: {
      title: {
        'en-US': 'Hey there this is a blo post'
      },
      body: {
        'en-US': 'And this is the blog post body'
      }
    }
  }
}
```

And when it has run through the mapper it'll look like this

```js
{
  path: 'blog-post.md',
  content: {
    fields: {
      title: {
        'en-US': 'Hey there this is a blo post'
      },
      body: {
        'en-US': 'And this is the blog post body'
      },
      slug: {
        'en-US': 'blog-post'
      }
    }
  }
}
```

### Where do I find all the contentful settings?

- __Where do I find my token?__ You can find out about getting a [contentful oauth token here](https://www.contentful.com/developers/docs/references/authentication/#getting-an-oauth-token). To get your space id, simply look at your api settings.
- __Where do I find my space id?__ You can look at the url when you're logged into contentful - it'll look something like `https://app.contentful.com/spaces/<your-space-id>`
- __What's the 

This is the simplest way to use mc.uploader
```bash
mc.uploader -t <token> -s <space-id> -c <content-type> <glob>
```
