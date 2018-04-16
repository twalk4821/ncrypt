# NCRYPT
Steam based file encryption written using the Node.js streams module

## Usage
There are some options available:
```
--password: the password to encode/decode with
--source: name of source file to encode
--dest: name of destination file
--dir: the working dir to look for files in
-a: to append rather than overwrite
```

Install globally with `npm install ncrypt-stream -g`
Then `encrypt [options]` to encrypt and `decrypt [options]`

Password is required to be the same across encryptions/decryptions in order for everything to work properly


## EXAMPLE
```
encrypt --password=secret --dir=. --source=mypasswords.txt --dest=encrypted.enc
-a
```

I am not responsible for sensitive files being overwritten using this program.