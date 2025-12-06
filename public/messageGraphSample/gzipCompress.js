sap.ui.define([], function () {
    const compressData = function (data) {
        return new Promise((resolve, reject) => {
            try {
                const compressedData = btoa(data); // Example compression using Base64
                resolve(compressedData);
            } catch (err) {
                reject(err);
            }
        });
    };

    const deCompressInput = function (longString){
        // Convert compressed data to Base64 for easier transmission
        const compressedBase64 = longString.toString("base64");
        // Decode Base64 to binary
        const compressedBinary = Uint8Array.from(atob(compressedBase64), (c) => c.charCodeAt(0));

        // Decompress using pako
        try {
            const decompressed = pako.ungzip(compressedBinary, { to: "string" });
            console.log("Decompressed Data:", decompressed);
        } catch (err) {
            console.error("Error during decompression:", err);
        }
    };

    const compressInput = async function (longString){
        return new Promise((resolve, reject) => {
            try {
                const compressed = pako.gzip(longString, { to: "string" });
                console.log("Compressed (Base64):", btoa(compressed));
                resolve(btoa(compressed)); // Convert to Base64 for easier representation
            } catch (err) {
                console.error("Error during compression:", err);
                reject(err);
            }
        });
    }

    return {
        compressData,deCompressInput,compressInput
    };
});