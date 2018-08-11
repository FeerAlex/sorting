let fs = require('fs');
let path = require('path');
let base = process.argv.slice(2)[0];
let final = process.argv.slice(2)[1];
let deleted = process.argv.slice(2)[2] === 'deleted';

const readDir = (base) => {
  const files = fs.readdirSync(base);

  files.forEach(file => {
    let localBase = path.join(base, file);
    let state = fs.statSync(localBase);

    if (state.isDirectory()) {
      readDir(localBase);
    } else {
      let localFinal = path.join(final, file[0]);

      fs.readFile(localBase, (err, buffer) => {
        if (err) throw err;

        if (!fs.existsSync(localFinal)) {
          fs.mkdirSync(localFinal);
        }

        fs.writeFile(path.join(localFinal, file), buffer, err => {
          if (err) throw err;
          
          if (deleted) {
            fs.unlink(path.join(localBase), (err) => {
              if (err) throw err;
            });
          }
        });
      });
    }
  });
};

if (!fs.existsSync(final)) {
  fs.mkdirSync(final);
}

readDir(base);
