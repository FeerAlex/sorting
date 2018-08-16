let fs = require('fs');
let path = require('path');
let baseFolder = "./music";
let finalFolder = "./sort";
let deleted = true;

let getFiles = (folder) => {
  return new Promise(resolve => {
    fs.readdir(folder, (err, files) => resolve(files));
  });
}

let isDirectory = (file) => {
  return new Promise(resolve => {
    fs.stat(file, (err, state) => resolve(state.isDirectory()));
  });
}

let createDir = (folder) => {
  return new Promise(resolve => {
    fs.mkdir(folder, (err) => resolve());
  });
}

let copyFile = (from, to) => {
  return new Promise(resolve => {
    fs.link(from, to, (err) => resolve());
  });
}

let deleteFile = (file) => {
  return new Promise(resolve => {
    fs.unlink(file, (err) => resolve());
  });
}

let readDir = async (folder) => {
  let files = await getFiles(folder);

  files.forEach(async file => {
    let fileName = path.join(folder, file);
    let isDir = await isDirectory(fileName);

    if (isDir) {
      readDir(fileName);
    } else {
      let newFolder = path.join(finalFolder, file[0]);
      let newFile = path.join(newFolder, file);

      fs.existsSync(newFolder) || await createDir(newFolder);
      fs.existsSync(newFile) || await copyFile(fileName, newFile);
    }
  });
}

let deleteDir = async (folder) => {
  let files = await getFiles(folder);

  files.forEach(async file => {
    let fileName = path.join(folder, file);
    let isDir = await isDirectory(fileName);

    if (isDir) {
      deleteDir(fileName);
    } else {
      await deleteFile(fileName);
    }
  });
};

(async () => {
  fs.existsSync(finalFolder) || await createDir(finalFolder);
  await readDir(baseFolder);
  deleted || await deleteDir(baseFolder);
})();