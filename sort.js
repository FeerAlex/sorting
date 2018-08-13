let fs = require('fs');
let path = require('path');
let baseFolder = process.argv.slice(2)[0] || "./";
let finalFolder = process.argv.slice(2)[1] || "./sort";
let deleted = process.argv.slice(2)[2] === 'deleted';

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
  fs.readdir(folder, (err, files) => {
    if (err) {
      console.error('Произошла ошибка при чтении папки!');

      return;
    }

    files.forEach(file => {
      let fileName = path.join(folder, file);

      fs.stat(fileName, (err, state) => {
        if (err) {
          console.error('Произошла ошибка при чтении папки!');
    
          return;
        }

        if (state.isDirectory()) {
          readDir(fileName);
        } else {
          let newFolder = path.join(finalFolder, file[0]);
    
          if (!fs.existsSync(newFolder)) {
            fs.mkdir(newFolder, (err) => {
              if (err) {
                console.error('Произошла ошибка при создании подпапки!');
              }
            });
          }
    
          if (!fs.existsSync(path.join(newFolder, file))) {
            fs.link(fileName, path.join(newFolder, file), (err) => {
              if (err) {
                console.error('Произошла ошибка при копировании файла!');

                return;
              }
            });
          }
        }
      });
    });
  });
};

if (!fs.existsSync(finalFolder)) {
  fs.mkdir(finalFolder, (err) => {
    if (err) {
      console.log('Произошла ошибка при создании новой папки!')
    }

    readDir(baseFolder);
  });
}

if (deleted) {
  deleteDir(baseFolder);
}
