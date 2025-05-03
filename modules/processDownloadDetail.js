/**
 * Download associated detail for one single message log, include MplDetail, run log.
 */
// import { writeFile, mkdir } from "node:fs/promises";
// import { resolve } from "node:path";

const { readFile, writeFile ,mkdir} = require( "node:fs/promises");
const { resolve } = require('path');
const { env } = require("process");
const { existsSync } = require("node:fs");

const axios = require('axios');
// import { existsSync } from "node:fs";
// import axios from "axios";
async function processDownloadDetail (
  messageGuid,
  i,
  interchangeId,
  host,
  auth
) {
  try {
    // console.log(`Processing message ${messageGuid} with host ${host}`);
    
    // download MplDetail
    let response = await axios.request({
      url: `https://${host}/Operations/com.sap.it.op.tmn.commands.dashboard.webui.MplDetailCommand?messageGuid=${messageGuid}`,
      method: "GET",
      headers: {
        Accept: "*/*",
        "User-Agent": "Thunder Client (https://www.thunderclient.com)",
        Authorization: auth.startsWith('Basic ') ? auth : `Basic ${auth}`
      }
    }).catch(error => {
      console.error('Error in MplDetail request:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      });
      throw error;
    });

    // parse MplDetail
    let str = response.data;
    let start = str.indexOf("<mplData>") + "<mplData>".length;
    let end = str.indexOf("\n\n</mplData>");
    let msg = str.substring(start, end);
    let detail = {};
    let body = msg.split("\n").filter((it, i) => i > 0);
    let transIdPos = -1;
    let LocalPredecessorsPos = -1;
    for (let i = 15; i < body.length; i++) {
      const line = body[i];
      if (transIdPos == -1 && line.startsWith("  TransactionId       = ")) {
        transIdPos = i;
      }
      if (
        LocalPredecessorsPos &&
        -1 &&
        line.startsWith("  LocalPredecessors [")
      ) {
        LocalPredecessorsPos = i;
      }
    }
    // assert LocalPredecessors array always have only one item
    if (LocalPredecessorsPos > -1) {
      detail["LocalPredecessors"] = [body[LocalPredecessorsPos + 1].trim()];
    }
    body
      .filter((it, i) => i <= transIdPos)
      .forEach((line, i) => {
        if (line && line.indexOf("=") > -1) {
          let parts = line.split("=");
          let k = parts[0].trim();
          let v = parts[1].trim();
          detail[k] = v;
        }
      });
    if (body.length > transIdPos + 1) {
      detail["Trace"] = body.filter((it, i) => i > transIdPos).join("\n");
    }
    // Debug setting
    if (i === -1) {
      console.log("detail:", detail);
      return;
    }

    // download Run logs
    let runs = await axios.request({
      url: `https://${host}/api/v1/MessageProcessingLogs('${messageGuid}')/Runs?$format=json&$top=100&$inlinecount=allpages`,
      method: "GET",
      headers: {
        Accept: "application/json",
        "User-Agent": "Thunder Client (https://www.thunderclient.com)",
        Authorization: auth.startsWith('Basic ') ? auth : `Basic ${auth}`
      }
    }).catch(error => {
      console.error('Error in Runs request:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      });
      throw error;
    });
    let run = runs.data.d.results[0];
    detail.run = run;

    // write result
    const exist = existsSync(
      resolve(
        ".",
        "MessageProcessingLogs",
        `MessageProcessingLogs_${interchangeId}_MD`
      )
    );
    if (!exist) {
      await mkdir(
        resolve(
          ".",
          "MessageProcessingLogs",
          `MessageProcessingLogs_${interchangeId}_MD`
        ),
        { recursive: true }
      );
    }
    await writeFile(
      resolve(
        resolve(
          ".",
          "MessageProcessingLogs",
          `MessageProcessingLogs_${interchangeId}_MD`,
          `MD_${i}_${messageGuid}.json`
        )
      ),
      JSON.stringify(detail),
      { encoding: "utf8" }
    );
  } catch (error) {
    console.error('Error in processDownloadDetail:', error);
    throw error;
  }
};

module.exports = { processDownloadDetail };
