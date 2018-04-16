#!/usr/bin/env node

const crypto = require('crypto');
const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let password = null;
let dest = 'volume.txt';
let source = 'volume.enc';
let dir = process.cwd();

const args = process.argv.slice(2);

args.forEach((arg, idx) => {
  const parsed = arg.split('=');
  if (parsed.length < 2) {
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

if (!fs.existsSync(`${dir}/${source}`)) {
  console.log(`Could not locate source volume: ${dir}/${source}`);
  process.exit();
}

const cipher = crypto.createDecipher('aes192', password);
cipher.setAutoPadding(false);

if (fs.existsSync(`${dir}/${dest}`)) {
  rl.question('The specified output file exists. Overwrite it?\n(y or n) ', answer => {
    const lower = answer.toLowerCase();
    if (answer == 'y' || answer == 'yes') {
      const input = fs.createReadStream(`${dir}/${source}`);
      const output = fs.createWriteStream(`${dir}/${dest}`);
      input.pipe(cipher).pipe(output);

    } else {
      console.log('Did not write file');
      process.exit();
    }
    rl.close();
  });
} else {
  const input = fs.createReadStream(source);
  const output = fs.createWriteStream(dest);
  
  input.pipe(cipher).pipe(output);
}

cipher.on('end', () => {
  console.log('done');
  process.exit();
})