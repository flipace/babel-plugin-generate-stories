# babel-plugin-generate-stories
[![NPM Version](https://img.shields.io/npm/v/babel-plugin-generate-stories.svg)](https://npmjs.com/package/babel-plugin-generate-stories)
[![Build Status](https://travis-ci.org/flipace/babel-plugin-generate-stories.svg?branch=master)](https://travis-ci.org/flipace/babel-plugin-generate-stories)
[![License](https://img.shields.io/npm/l/babel-plugin-generate-stories.svg)](https://npmjs.com/package/babel-plugin-generate-stories)

Automatically generate storybook stories for your react components without writing a single line of additional code.

## Installation

```Shell
# with yarn
yarn add -D babel-plugin-generate-stories

# with npm
npm i -D babel-plugin-generate-stories
```

In your .babelrc

```json
{
  "plugins": [
    [
      "generate-stories",
      {
        "targetDir": ".stories",
        "withThemeit": true,
        "withKnobs": true,
        "debug": true
      }
    ]
  ]
}
```

|  option  |  description   |  default   |
| --- | --- | --- |
| targetDir | the target directory for the stories, in most cases you'll want to set this to a .storybook/stories directory | ```".storybook/stories"```
|   withThemeit  | automatically generate a story for each [react-themeit](https://github.com/flipace/react-themeit) theme of a component. | ```false``` |
|   withKnobs  | add the [@storybook/addon-knobs](https://github.com/storybooks/storybook/tree/master/addons/knobs) and [storybook-addon-smart-knobs](https://github.com/storybooks/addon-smart-knobs) decorators to your stories to display editable component props in the storybook where possible - to use this feature you must install both packages! |   ```true```  |
| debug | will log debug messages (e.g. "Generated story for ...") | ```false``` |

### Usage

Whenever you have a component which you would like to automatically generate stories for, include a comment like this:

```js
// @storybook
```

preferrably at the top of the file. The will be picked up by this plugin
and trigger the generation of the story.

By default the ```default``` export will be used for the stories.
If you want to create a story for something that is not exported as the ```default``` export, you may use the syntax below to let the plugin know which export it should use for the story.

```js
// @storybook MyComponent
```

### Maintainers

[flipace](http://github.com/flipace)

Contributions are very welcome!

### License
[MIT License](LICENSE)
