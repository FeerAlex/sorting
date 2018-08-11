let fs = require('fs');
let path = require('path');
let baseFolder = process.argv.slice(2)[0];
let finalFolder = process.argv.slice(2)[1];
let deleted = process.argv.slice(2)[2] === 'deleted';

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
}

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

      fs.readFileSync(fileName, (err, buffer) => {
        if (err) throw err;

        fs.writeFileSync(path.join(newFolder, file), buffer, err => {
          if (err) throw err;
        });
      });
    }
  });
};

readDir(baseFolder);

if (deleted) {
  deleteDir(baseFolder);
}