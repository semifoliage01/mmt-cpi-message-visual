/**
 * Batch download all message details
 */
// import { readFile, readdir } from "node:fs/promises";
// import { resolve } from "node:path";
const { readFile, writeFile, readdir } = require( "node:fs/promises");
const { resolve } = require('path');
const { env } = require("process")
// import { env } from "node:process";
// import "dotenv/config";
// require('dotenv').config();
const { processDownloadDetail } = require("./processDownloadDetail.js");
// const auth = await readFile(resolve("../.credentials/.basic-auth"));
const host = env[env.cpiTenant];
let identifier; // or correlation ID
if (env.useInterchangeId === "true") {
  identifier = env.interchangeId;
  console.log("used interchangeId:", identifier);
} else {
  identifier = env.correlationId;
  // console.log("used correlationId:", identifier);
}

async function downloadAllMessageDetailsBatch(host, count, correlationId, authorization) {
  try {
    // read logs
    const files = await readdir(resolve(__dirname, "..", "MessageProcessingLogs"));
    let messageLogFiles = files.filter(
      (name) =>
        name.startsWith(`MessageProcessingLogs_${correlationId}_`) &&
        name.endsWith(".json")
    );
    let logs = [];
    for (const file of messageLogFiles) {
      let content = await readFile(resolve(__dirname, "..", "MessageProcessingLogs", file), {
        encoding: "utf8"
      });
      let data = JSON.parse(content);
      logs = logs.concat(data.results);
    }

    // batch processing
    const batchSize = 5; // You can adjust this value
    let count = 0;
    let batch = [];
    for (let i = 0; i < logs.length; i++) {
      const log = logs[i];
      const messageGuid = log.MessageGuid;
      if (count < batchSize) {
        console.log("add:", i, "messageGuid:", messageGuid);
        let promise = processDownloadDetail(messageGuid, i, correlationId, host, authorization);
        batch.push(promise);
        count++;
      } else {
        await Promise.all(batch);
        console.log("batch done at i:", i);
        batch = [];
        count = 0;
        console.log("add:", i, "messageGuid:", messageGuid);
        let promise = processDownloadDetail(messageGuid, i, correlationId, host, authorization);
        batch.push(promise);
        count++;
      }
    }
    
    // Process any remaining items in the batch
    if (batch.length > 0) {
      await Promise.all(batch);
    }
    
    return "Successfully processed all message details";
  } catch (error) {
    console.error('Error in downloadAllMessageDetailsBatch:', error);
    throw error;
  }
}

module.exports = { downloadAllMessageDetailsBatch };

