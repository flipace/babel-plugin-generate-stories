import path from "path";
import fs from "fs";

const STORYBOOK_REGEX = /\@storybook/gm;

let fileNames = [];

function req(name = "Unknown") {
  throw new Error(`${name} function parameter is required!`);
}

const componentRegex = /\@storybook\s(.*)$/gim;

function ensureDir(filePath) {
  const dirname = path.dirname(filePath);

  if (fs.existsSync(dirname)) {
    return true;
  }

  ensureDir(dirname);
  fs.mkdirSync(dirname);
}

function getFileName(absFilename = req("filename")) {
  let filename = path.basename(absFilename);

  while (fileNames.indexOf(filename) > -1) {
    const match = filename.match(regexp);
    const extension = path.extname(filename);

    filename = match ? filename.replace(regexp, `.${1 + parseInt(match[1])}.`) : path.basename(filename, extension) + ".1" + extension;
  }

  fileNames.push(filename);

  return filename;
}

function generateMetadata(
  comment = req("comment"),
  absFilename = req("absFilename"),
  { targetDir, stripFromStoryName }
) {
  const hasExport = comment.match(componentRegex);
  const exportName = hasExport ? hasExport[0] : "default";
  const fileName = getFileName(absFilename);
  const resolvedPath = path.relative(targetDir, absFilename);
  const componentName = path.basename(fileName, path.extname(fileName));
  const storyName = resolvedPath.replace(stripFromStoryName, "");
  const relativePath = path.relative(path.join(targetDir, path.dirname(storyName)), absFilename); 

  return {
    absFilename,
    fileName,
    exportName,
    componentName,
    resolvedPath,
    relativePath,
    targetDir,
    storyName
  };
}

function generateScript({
  componentName,
  exportName,
  relativePath,
  storyName,
  ...metadata
}, config) {

  let script = `import React from 'react';
import { storiesOf } from '@storybook/react';
import { host } from 'storybook-host';`;

  if (config.withKnobs) {
    script += `
import { withKnobs } from '@storybook/addon-knobs';
import { withSmartKnobs } from 'storybook-addon-smart-knobs';`;
  }

  script += `
import ${exportName !== "default"
    ? `{ ${exportName} as ${componentName} } `
    : componentName} from '${relativePath}';

const story = storiesOf('${storyName}', module);`;

  if (config.withKnobs) {
    script += `story.addDecorator(withSmartKnobs)
  .addDecorator(withKnobs);`;
  }

  script += `
  story.addDecorator(host({
    align: 'center middle',
    height: '80%',
    width: '80%',
  }))
  .add('plain', () => (<${componentName} />));`;

  if (config.withThemeit) {
    script += `
// handle themeit
if(${componentName}.themeitOptions) {
  Object.keys(${componentName}.themeitOptions.themes).forEach(key => {
    story.add('theme: ' + key, () => (<${componentName} theme={key} />));
  });
}
`;
  }

  return script;
}

function generateStory(
  comment = req("comment"),
  filename = req("filename"),
  options = {}
) {
  const config = {
    stripFromStoryName: /\.\.\/|src\/|client\//gmi,
    targetDir: ".storybook/stories",
    withKnobs: true,
    withThemeit: false,
    ...options
  };

  const metadata = generateMetadata(comment, filename, config);
  const script = generateScript(metadata, config);

  try {
    fs.statSync(config.targetDir);
  } catch (err) {
    fs.mkdirSync(config.targetDir);
  }

  const targetFile = path.join(config.targetDir, metadata.storyName);

  ensureDir(targetFile);

  fs.writeFile(targetFile, script, err => {
    if (err) {
      throw new Error(err);
    }

    if (config.debug) {
      console.info(`Generated story for ${metadata.resolvedPath}`);
    }
  });
}

export default function({ types: t }) {
  return {
    visitor: {
      Program(path, state) {
        if (path.container.comments) {
          let hasStorybookAnnotation = false;
          const result = path.container.comments.find(comment =>
            comment.value.match(STORYBOOK_REGEX)
          );

          if (result) {
            generateStory(result.value, this.file.opts.filename, state.opts);
          }
        }
      }
    }
  };
}
