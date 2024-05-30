const fs = require('fs');

import {Result} from './types';
const folder = 'output'

// mock
// const data = [
//   {
//     query: 'test',
//     jobs: 1,
//     people: 2,
//     'people/jobs ratio': 0.5,
//   },
//   {
//     query: 'test2',
//     jobs: 3,
//     people: 4,
//     'people/jobs ratio': 0.75,
//   },
// ];

// (async () => {
//   const filename = generateFilename();
//   for (const result of data) {
//     await saveResult(result, filename);
//   }
// })()

async function saveResult(result: Result, filename) {
  if (!result) {
    console.warn('No result to save')
    return
  }

  if (!filename) {
    console.warn('Missing filename')
    return
  }

  const headers = Object.keys(result);

  await createFileIfNotExist(folder, filename, () => appendToFile(folder, filename, headers.join(',') + '\n'));

  const csvResult = headers.map(header => result[header]).join(',') + '\n';
  appendToFile(folder, filename, csvResult);
}


function createFolderIfNotExist(path: string) {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, { recursive: true });
  }
}

async function createFileIfNotExist(path: string, filename: string, callback?: () => void) {
  createFolderIfNotExist(path);

  const newPath = `${path}/${filename}`;
  if (!fs.existsSync(newPath)) {
    fs.writeFileSync(newPath, "");
    if (callback) {
      await callback()
    }
  }
}

async function appendToFile(
  path: string,
  filename: string,
  data: string
): Promise<void> {
  try {
    const newPath = `${path}/${filename}`;
    fs.appendFileSync(newPath, data);
  } catch (err) {
    console.error(err);
  }
}

function getTimestamp() {
  return new Date().toISOString().replace(/:/g, '-');
}

function generateFilename() {
  return `results-${getTimestamp()}.csv`;
}

export {
  generateFilename,
  saveResult
}