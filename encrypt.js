const crypto = require('crypto');
const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let password = null;
let source = null;
let dest ='volume.enc';
let dir = process.cwd();
let flags = 'w+'

const args = process.argv.slice(2);

args.forEach((arg, idx) => {
  const parsed = arg.split('=');
  if (arg === '-a') {
    flags = 'a';
  } else if (parsed.length < 2) {
    console.log('Invalid argument: ', arg);
    process.exit();
  }

  const flag = parsed[0];
  const value = parsed[1];
  if (flag === '--password') {
    password = value;
  } else if (flag === '--source') {
    source = value;
  } else if (flag === '--dest') {
    dest = value;
  } else if (flag === '--dir') {
    dir = value;
  }
});

if (!password) {
  console.log('You must provide an encryption password. Please use the --password flag to specify it');
  process.exit();
}

if (!source) {
  console.log('You must specify a source file. Please use the --source flag to specify it');
  process.exit();
}

if (!fs.existsSync(`${dir}/${source}`)) {
  console.log('Could not find the specified source file.');
  process.exit();
}

const cipher = crypto.createCipher('aes192', password);
const decipher = crypto.createDecipher('aes192', password);

let input, output;
if (!fs.existsSync(`${dir}/${dest}`)) {
  rl.question('Volume does not exist yet. Would you like to create it now?\n(y or n)', answer => {
    const lower = answer.toLowerCase();
    if (answer == 'y' || answer == 'yes') {
      
      input = fs.createReadStream(`${dir}/${source}`);
      output = fs.createWriteStream(`${dir}/${dest}`, { flags: 'w+' });

      output.once('open', () => {
        input.pipe(cipher).pipe(output);
      });

    } else if (answer == 'n' || answer == 'no') {
      process.exit();
    } else {
      console.log('Unrecognized response. Please answer y or n')
    }
  rl.close();
  });
} else {
  if (flags === 'a') {
    rl.question(`Volume exists. This will append to the file at location ${dir}/${dest}. OK?\n (y or n)`, answer => {
      const lower = answer.toLowerCase();
      if (answer == 'y' || answer == 'yes') {
        const encrypted = fs.createReadStream(`${dir}/${dest}`);
        let temp = fs.createWriteStream(`${dir}/temp`);
        encrypted.pipe(decipher).pipe(temp);
        
        temp.once('close', () => {
          fs.writeFileSync(`${dir}/temp`, '\n', { flag: 'a+'});
          input = fs.createReadStream(`${dir}/${source}`);
          temp = fs.createWriteStream(`${dir}/temp`, { flags: 'a+' });
          input.pipe(temp);

          temp.once('close', () => {
            temp = fs.createReadStream(`${dir}/temp`);        
            output = fs.createWriteStream(`${dir}/${dest}`);
            temp.pipe(cipher).pipe(output);

          });
        });
      } else {
        console.log('Did not write file');
        process.exit();
      }
      rl.close();    
    });
  } else {
    rl.question(`Volume exists. This will overwrite the file at location ${dir}/${dest}. OK?\n (y or n)`, answer => {
      const lower = answer.toLowerCase();
      if (answer == 'y' || answer == 'yes') {

        input = fs.createReadStream(`${dir}/${source}`);
        output = fs.createWriteStream(`${dir}/${dest}`, { flags });
        
        output.once('open', () => {
          input.pipe(cipher).pipe(output);
        });

      } else {
        console.log('Did not write file');
        process.exit();
      }
      rl.close();
    });
  }
}

cipher.on('end', () => {
  if (fs.existsSync(`${dir}/temp`)) {
    fs.unlinkSync(`${dir}/temp`);
  }
  
  console.log('done');
  process.exit();
});