let fs = require('fs');
let path = require('path');
let baseFolder = process.argv.slice(2)[0] || './';
let finalFolder = process.argv.slice(2)[1] || './sort';
let deleted = process.argv.slice(2)[2] === 'deleted';

let getFiles = (folder) => {
  return new Promise((resolve, reject) => {
    fs.readdir(folder, (err, files) => {
      if (err) reject(err);
      resolve(files);
    });
  });
};

let isDirectory = (file) => {
  return new Promise((resolve, reject) => {
    fs.stat(file, (err, state) => {
      if (err) reject(err);
      resolve(state.isDirectory());
    });
  });
};

let createDir = (folder) => {
  return new Promise((resolve, reject) => {
    fs.mkdir(folder, (err) => {
      if (err) reject(err);
      resolve();
    });
  });
};

let copyFile = (from, to) => {
  return new Promise((resolve, reject) => {
    fs.link(from, to, (err) => {
      if (err) reject(err);
      resolve();
    });
  });
};

let deleteFile = (file) => {
  return new Promise((resolve, reject) => {
    fs.unlink(file, (err) => {
      if (err) reject(err);
      resolve();
    });
  });
};

let removeDir = (folder) => {
  return new Promise((resolve, reject) => {
    fs.rmdir(folder, (err) => {
      if (err) reject(err);
      resolve();
    });
  });
};

let readDir = async (folder, to) => {
  let files = await getFiles(folder);

  for (let i = 0; i < files.length; ++i) {
    let fileName = path.join(folder, files[i]);
    let isDir = await isDirectory(fileName);

    if (isDir) {
      await readDir(fileName, to);
    } else {
      let newFolder = path.join(to, files[i][0]);
      let newFile = path.join(newFolder, files[i]);

      fs.existsSync(newFolder) || await createDir(newFolder);
      fs.existsSync(newFile) || await copyFile(fileName, newFile);
    }
  }
};

let deleteDir = async (folder) => {
  let files = await getFiles(folder);

  for (let i = 0; i < files.length; ++i) {
    let fileName = path.join(folder, files[i]);
    let isDir = await isDirectory(fileName);

    if (isDir) {
      await deleteDir(fileName);
    } else {
      await deleteFile(fileName);
    }
  }

  await removeDir(folder);
};

let copyFiles = async (from, to, deleted) => {
  if (from === to) {
    console.error('Новая папка не должна иметь тот же путь, что и исходная!');
    return;
  }

  try {
    fs.existsSync(to) || await createDir(to);
    await readDir(from, to);
    !deleted || await deleteDir(from);
  } catch (err) {
    console.log(err);
  }
};

copyFiles(baseFolder, finalFolder, deleted).then(() => {
  console.log('Success!');
});