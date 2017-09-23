import fs from 'fs';
import path from 'path';
import { transformFileSync } from "babel-core";

const TARGET_PATH = path.join(__dirname, '.stories');
const CASES = [
  './case1.js',
  './case2.js'
];

CASES.forEach(function(test) {
  const file = path.join(__dirname, test);

  const result = transformFileSync(file, {
    comments: true,
    presets: ["env", "react"],
    plugins: [
      [
        path.join(__dirname, "../dist/index.js"),
        {
          targetDir: TARGET_PATH
        }
      ]
    ]
  });
});

test('generated story files for each case which contains a // @storybook annotation', () => {
  const files = fs.readdirSync(TARGET_PATH);
  expect(files.length).toBe(1);
});