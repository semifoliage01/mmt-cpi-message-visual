/**
 *
 */

// import { readFile, writeFile } from "node:fs/promises";
// import { resolve } from "node:path";
const { readFile, writeFile ,readdir} = require( "node:fs/promises");
const { resolve } = require('path');

async function moveGraphFlow(sampleName, sampleId){
  try{
    let json = await readFile(
      resolve(
        "./public/messageGraph/",
        "graph.json"
      ),
      { encoding: "utf8" }
    );
    console.log("generate sample: get the original datas");
    let groupsKeys = [];
    let groups = [];
    let data = JSON.parse(json);
    // corr int chg
    let CorrelationId = "";
    let InterchangeId = "";
    if (data?.MessageProcessLogs && data.MessageProcessLogs.length > 0) {
      InterchangeId = data.MessageProcessLogs[0].ApplicationMessageId;
      console.log("InterchangeId:", InterchangeId);
      CorrelationId = data.MessageProcessLogs[0].CorrelationId;
      console.log("CorrelationId:", CorrelationId);
    }
    // nodes
    /**
     * 	  "key": 0,
          "title": "Amber",
          "icon": "sap-icon://checklist",
          "status": "Error",
          "group": "T",
          "attributes": [
            {
              "label": "Comfort",
              "value": "-10° C"
          }]
    */
    const toStatus = {
      FAILED: "Error",
      RETRY: "Warning",
      COMPLETED: "Success"
    };

    const sampleIdFileName = sampleId+ ".json"

    // lines from to
    await writeFile(
      resolve("./public/messageGraphSample/iflows", sampleIdFileName),
      json,
      { encoding: "utf8" }
    );

    console.log("generate sample: general graph data from the original datas");

    let commboxJson = await readFile(
      resolve(
        "./public/messageGraphSample/",
        "data.json"
      ),
      { encoding: "utf8" }
    );
    console.log("generate sample: add new items to the category list json");

    let jsonData = JSON.parse(commboxJson);
    jsonData.items.push({"key" : sampleId, "text" : sampleName});

    const updatedJsonData = JSON.stringify(jsonData, null, 2);

    await writeFile(
      resolve("./public/messageGraphSample", "data.json"),
      updatedJsonData,
      { encoding: "utf8" }
    );

    console.log("generate sample: done successfully");

    // refine class
    return "success";

  } catch (error) {
    console.error('Error in copyIflowFailed:', error);
    throw error;
  }

};

module.exports = { moveGraphFlow };


// post refine

// refine -> hide Cross_Prepare_HTTP_OAuth2_Token_V4
// nodes = nodes.filter((node) => {
//   return node.title !== "Cross_Prepare_HTTP_OAuth2_Token_V4";
// });
// lines = lines.filter((it) => {
//   let node = nodes[it.to];
//   if (node && node.title === "Cross_Prepare_HTTP_OAuth2_Token_V4") {
//     return false;
//   }
//   return true;
// });

// await writeFile(
//   resolve(
//     "../ui5-app-playround/uimodule/webapp/messageGraph/",
//     `${InterchangeId}_graph.json`
//   ),
//   JSON.stringify({
//     CorrelationId: CorrelationId,
//     InterchangeId: InterchangeId,
//     nodes: nodes,
//     lines: lines
//   }),
//   { encoding: "utf8" }
// );
