"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = function (_ref3) {
  var t = _ref3.types;

  return {
    visitor: {
      Program: function Program(path, state) {
        if (path.container.comments) {
          var hasStorybookAnnotation = false;
          var result = path.container.comments.find(function (comment) {
            return comment.value.match(STORYBOOK_REGEX);
          });

          if (result) {
            generateStory(result.value, this.file.opts.filename, state.opts);
          }
        }
      }
    }
  };
};

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var STORYBOOK_REGEX = /\@storybook/gm;

var fileNames = [];

function req() {
  var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "Unknown";

  throw new Error(name + " function parameter is required!");
}

var componentRegex = /\@storybook\s(.*)$/gim;

function ensureDir(filePath) {
  var dirname = _path2.default.dirname(filePath);

  if (_fs2.default.existsSync(dirname)) {
    return true;
  }

  ensureDir(dirname);
  _fs2.default.mkdirSync(dirname);
}

function getFileName() {
  var absFilename = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : req("filename");

  var filename = _path2.default.basename(absFilename);

  while (fileNames.indexOf(filename) > -1) {
    var match = filename.match(regexp);
    var extension = _path2.default.extname(filename);

    filename = match ? filename.replace(regexp, "." + (1 + parseInt(match[1])) + ".") : _path2.default.basename(filename, extension) + ".1" + extension;
  }

  fileNames.push(filename);

  return filename;
}

function generateMetadata() {
  var comment = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : req("comment");
  var absFilename = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : req("absFilename");
  var _ref = arguments[2];
  var targetDir = _ref.targetDir,
      stripFromStoryName = _ref.stripFromStoryName;

  var hasExport = comment.match(componentRegex);
  var exportName = hasExport ? hasExport[0] : "default";
  var fileName = getFileName(absFilename);
  var resolvedPath = _path2.default.relative(targetDir, absFilename);
  var componentName = _path2.default.basename(fileName, _path2.default.extname(fileName));
  var storyName = resolvedPath.replace(stripFromStoryName, "");
  var relativePath = _path2.default.relative(_path2.default.join(targetDir, _path2.default.dirname(storyName)), absFilename);

  return {
    absFilename: absFilename,
    fileName: fileName,
    exportName: exportName,
    componentName: componentName,
    resolvedPath: resolvedPath,
    relativePath: relativePath,
    targetDir: targetDir,
    storyName: storyName
  };
}

function generateScript(_ref2, config) {
  var componentName = _ref2.componentName,
      exportName = _ref2.exportName,
      relativePath = _ref2.relativePath,
      storyName = _ref2.storyName,
      metadata = _objectWithoutProperties(_ref2, ["componentName", "exportName", "relativePath", "storyName"]);

  var script = "import React from 'react';\nimport { storiesOf } from '@storybook/react';\nimport { host } from 'storybook-host';";

  if (config.withKnobs) {
    script += "\nimport { withKnobs } from '@storybook/addon-knobs';\nimport { withSmartKnobs } from 'storybook-addon-smart-knobs';";
  }

  script += "\nimport " + (exportName !== "default" ? "{ " + exportName + " as " + componentName + " } " : componentName) + " from '" + relativePath + "';\n\nconst story = storiesOf('" + storyName + "', module);";

  if (config.withKnobs) {
    script += "story.addDecorator(withSmartKnobs)\n  .addDecorator(withKnobs);";
  }

  script += "\n  story.addDecorator(host({\n    align: 'center middle',\n    height: '80%',\n    width: '80%',\n  }))\n  .add('plain', () => (<" + componentName + " />));";

  if (config.withThemeit) {
    script += "\n// handle themeit\nif(" + componentName + ".themeitOptions) {\n  Object.keys(" + componentName + ".themeitOptions.themes).forEach(key => {\n    story.add('theme: ' + key, () => (<" + componentName + " theme={key} />));\n  });\n}\n";
  }

  return script;
}

function generateStory() {
  var comment = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : req("comment");
  var filename = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : req("filename");
  var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var config = _extends({
    stripFromStoryName: /\.\.\/|src\/|client\//gmi,
    targetDir: ".storybook/stories",
    withKnobs: true,
    withThemeit: false
  }, options);

  var metadata = generateMetadata(comment, filename, config);
  var script = generateScript(metadata, config);

  try {
    _fs2.default.statSync(config.targetDir);
  } catch (err) {
    _fs2.default.mkdirSync(config.targetDir);
  }

  var targetFile = _path2.default.join(config.targetDir, metadata.storyName);

  ensureDir(targetFile);

  _fs2.default.writeFile(targetFile, script, function (err) {
    if (err) {
      throw new Error(err);
    }

    if (config.debug) {
      console.info("Generated story for " + metadata.resolvedPath);
    }
  });
}