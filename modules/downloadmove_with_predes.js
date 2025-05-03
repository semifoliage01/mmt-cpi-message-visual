// import { readFile, writeFile, readdir } from "node:fs/promises";
// import { resolve } from "node:path";
// import { env } from "node:process";
// import "dotenv/config";

const { readFile, writeFile ,readdir} = require( "node:fs/promises");
const { resolve } = require('path');
const { env } = require("process");
const { existsSync } = require("node:fs");
const host1 = env[env.cpiTenant];
let identifier; // or correlation ID
if (env.useInterchangeId === "true") {
  identifier = env.interchangeId;
  console.log("used identifier:", identifier);
} else {
  identifier = env.correlationId;
  console.log("used correlationId:", identifier);
}

async function buildOriginalJSONs(host,identifier){
  try {
    // read source logs
    const files = await readdir(resolve(".", "MessageProcessingLogs"));
    let messageLogFiles = files.filter(
      (name) =>
        name.startsWith(`MessageProcessingLogs_${identifier}_`) &&
        name.endsWith(".json")
    );
    let logs = [];
    for (const file of messageLogFiles) {
      let content = await readFile(resolve(".", "MessageProcessingLogs", file), {
        encoding: "utf8"
      });
      let data = JSON.parse(content);
      logs = logs.concat(data.results);
    }

    // build target logs
    for (let i = 0; i < logs.length; i++) {
      const log = logs[i];
      const detailStr = await readFile(
        resolve(
          ".",
          "MessageProcessingLogs",
          `MessageProcessingLogs_${identifier}_MD`,
          `MD_${i}_${log.MessageGuid}.json`
        )
      );
      let detail = JSON.parse(detailStr);
      log.detail = detail;
    }
    logs.forEach((it, i) => {
      it._index = logs.length - i; // asc: i + 1, desc: logs.length - i
      it._paddingIndex = `E${it._index.toString().padStart(3, "0")}`;
      it._cpiMonitorMessageLogLink = `https://${host}/itspaces/shell/monitoring/Messages/{"identifier":"${it.MessageGuid}"}`;
      it._cpiDesignContentPackageLink = `https://${host}/itspaces/shell/design/contentpackage/${it.IntegrationArtifact.PackageId}/integrationflows/${it.IntegrationFlowName}`;
      it._cpiRunLogLink = `https://${host}/itspaces/shell/monitoring/MessageProcessingRun/{"parentContext":{"MessageMonitor":{"artifactName":"","identifier":"${it.MessageGuid}","artifactDisplayText":"All Integration Flows"}},"messageProcessingLog":"${it.MessageGuid}","RunId":"${it.detail.run.Id}"}`;
    });
    // patch span
    const reg = /\/Date\((?<ms>\d{13})\)\//;
    logs.forEach((it, i) => {
      let s = it.LogStart.match(reg).groups.ms;
      let e = it.LogEnd.match(reg).groups.ms;
      it._LogStartMs = s;
      it._LogEndMs = e;
      it._spanMs = e - s;
    });
    const logsMapByStartDate = {};
    const logsByStartDate = logs.map((it) => {
      return {
        MessageGuid: it.MessageGuid,
        _LogStartMs: it._LogStartMs
      };
    });
    logsByStartDate.sort((a, b) => {
      return a._LogStartMs - b._LogStartMs;
    });
    logsByStartDate.forEach((it, i) => {
      it._paddingStartIndex = `S${i.toString().padStart(3, "0")}`;
      logsMapByStartDate[it.MessageGuid] = it._paddingStartIndex;
    });
    logs.forEach((it, i) => {
      it._paddingStartIndex = logsMapByStartDate[it.MessageGuid];
    });
    // console.log("logsByStartDate", logsByStartDate);
    // patch links
    let modelData = {
      identifier: identifier,
      monitorLink: `https://${host}/itspaces/shell/monitoring/Messages/%7B%22identifier%22%3A%22${identifier}%22%7D`,
      MessageProcessLogs: logs
    };
    await writeFile(
      resolve(
        "./publicZ/messageList/model/data",
        "data.json"
      ),
      JSON.stringify(modelData),
      { encoding: "utf8" }
    );
  } catch (error) {
    console.error('Error in ParseDonwloadedJsonFiles:', error);
    throw error;
  }
};

module.exports = { buildOriginalJSONs };
