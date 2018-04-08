# NCRYPT
Steam based file encryption written using the Node.js streams module

## Usage
There are some options available:
```
--password: the password to encode/decode with
--source: name of source file to encode
--dest: name of destination file
--dir: the working dir to look for files in
```

You run `node encrypt.js [options]` to encrypt and `node decrypt.js [options]` to decrypt

Password is required to be the same across encryptions/decryptions in order for everything to work properly

## EXAMPLE
```
node encrypt.js --password=secret --dir=. --source=mypasswords.txt --dest=encrypted.enc
```

I am not responsible for sensitive files being overwritten using this program.