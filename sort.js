let fs = require('fs');
let path = require('path');
let baseFolder = "./music";
let finalFolder = "./sort";
let deleted = true;

let getFiles = (folder) => {
  return new Promise((resolve, reject) => {
    fs.readdir(folder, (err, files) => {
      if (err) reject(err);
      resolve(files)
    });
  });
}

let isDirectory = (file) => {
  return new Promise((resolve, reject) => {
    fs.stat(file, (err, state) => {
      if (err) reject(err);
      resolve(state.isDirectory());
    });
  });
}

let createDir = (folder) => {
  return new Promise((resolve, reject) => {
    fs.mkdir(folder, (err) => {
      if (err) reject(err);
      resolve();
    });
  });
}

let copyFile = (from, to) => {
  return new Promise((resolve, reject) => {
    fs.link(from, to, (err) => {
      if (err) reject(err);
      resolve();
    });
  });
}

let deleteFile = (file) => {
  return new Promise((resolve, reject) => {
    fs.unlink(file, (err) => {
      if (err) reject(err);
      resolve()
    });
  });
}

let removeDir = (folder) => {
  return new Promise((resolve, reject) => {
    fs.rmdir(folder, (err) => {
      if (err) reject(err);
      resolve();
    });
  });
}

let readDir = async (folder) => {
  let files = await getFiles(folder);

  files.forEach(async file => {
    let fileName = path.join(folder, file);
    let isDir = await isDirectory(fileName);

    if (isDir) {
      await readDir(fileName);
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
      await deleteDir(fileName);
    } else {
      await deleteFile(fileName);
    }
  });

  await removeDir(folder);
};

(async () => {
  try {
    fs.existsSync(finalFolder) || await createDir(finalFolder);
    await readDir(baseFolder);
    !deleted || await deleteDir(baseFolder);
  } catch (error) {
    console.log(error);
  }
})();