# Mc Uploader (Markdown Contentful Uploader)

Mc Uploader in the house!

![](https://media.giphy.com/media/hxc32veg6tbqg/giphy.gif)

A tool to upload markdown files with frontmatter to contentful 

## Installation

Install like so:

```bash
npm install mc.uploader
```


## Usage

The recommended way to use mc.uploader is passing a config file
```
mc.uploader -C <my-config-file.json> <glob>
```
These are the options you can define in the config file. You can find out about getting a [contentful oauth token here](https://www.contentful.com/developers/docs/references/authentication/#getting-an-oauth-token). To get your space id, simply look at your api settings

```json
{
  "token": "Your contentful oauth token"
}
```

This is the simplest way to use mc.uploader
```bash
mc.uploader -t <token> -s <space-id> -c <content-type> <glob>
```



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

## Settings file
You can pass a settings
