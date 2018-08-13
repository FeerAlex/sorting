let fs = require('fs');
let path = require('path');
let baseFolder = process.argv.slice(2)[0];
let finalFolder = process.argv.slice(2)[1];
let deleted = process.argv.slice(2)[2] === 'deleted';

if (!baseFolder) {
  console.error('Не указана исходная папка!');

  return;
}

if (!finalFolder) {
  console.error('Не указана новая папка!');

  return;
}

if (baseFolder === finalFolder) {
  console.error('Новая папка не должна иметь тот же путь, что и исходная!');

  return;
}

const deleteDir = (folder) => {
  const files = fs.readdirSync(folder);

  files.forEach(file => {
    let fileName = path.join(folder, file);
    let state = fs.statSync(fileName);

    if (state.isDirectory()) {
      deleteDir(fileName);
    } else {
      fs.unlinkSync(fileName, (err) => {
        if (err) throw err;
      });
    }
  });

  fs.rmdirSync(folder, (err) => {
    if (err) throw err;
  });
};

const readDir = (folder) => {
  const files = fs.readdirSync(folder);

  files.forEach(file => {
    let fileName = path.join(folder, file);
    let state = fs.statSync(fileName);

    if (state.isDirectory()) {
      readDir(fileName);
    } else {
      let newFolder = path.join(finalFolder, file[0]);

      if (!fs.existsSync(newFolder)) {
        fs.mkdirSync(newFolder);
      }

      if (!fs.existsSync(path.join(newFolder, file))) {
        fs.linkSync(fileName, path.join(newFolder, file));
      }
    }
  });
};

if (!fs.existsSync(finalFolder)) {
  fs.mkdirSync(finalFolder);
}

readDir(baseFolder);

if (deleted) {
  deleteDir(baseFolder);
}
