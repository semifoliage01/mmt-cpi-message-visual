const  zlib  = require ("zlib");

async function compressInput (longString){
    return new Promise((resolve, reject) => {
        zlib.gzip(longString, (err, compressed) => {
        if (err) {
            console.error("Error during compression:", err);
            reject(err);
            return;
        }

        console.log("Compressed (Base64):", compressed.toString('base64')); // Optional: Convert to Base64 for easier representation
        resolve(compressed.toString());
    });
  });

}

async function deCompressInput (longString){
    return new Promise((resolve, reject) => {
        const gzippedBuffer = Buffer.from(longString, 'base64')
        zlib.gunzip(gzippedBuffer, (err, decompressed) => {
        if (err) {
            console.error("Error during compression:", err);
            reject(err);
            return;
        }

        console.log("Compressed (Base64):", decompressed.toString('base64')); // Optional: Convert to Base64 for easier representation
        resolve(decompressed.toString());
    });
  });

}


function deCompressInput2 (longString){
        zlib.gunzip(longString, (err, decompressed) => {
        if (err) {
            console.error("Error during compression:", err);
            reject(err);
            return;
        }

        console.log("Compressed (Base64):", decompressed.toString('base64')); // Optional: Convert to Base64 for easier representation
       return decompressed.toString();
    
  });

}

module.exports = { compressInput,deCompressInput, deCompressInput2 };