/**
 *
 */

// import { readFile, writeFile } from "node:fs/promises";
// import { resolve } from "node:path";
const { readFile, writeFile ,readdir} = require( "node:fs/promises");
const { resolve } = require('path');

async function buildGraphFlow(correlationId){
  try{
    let json = await readFile(
      resolve(
        "./public/messageList/model/data",
        "data.json"
      ),
      { encoding: "utf8" }
    );
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
    let nodes = data.MessageProcessLogs.map((it, i) => {
      if (groupsKeys.indexOf(it.IntegrationArtifact.PackageId) === -1) {
        groupsKeys.push(it.IntegrationArtifact.PackageId);
        groups.push({
          key: it.IntegrationArtifact.PackageId,
          title: it.IntegrationArtifact.PackageName
        });
      }
      return {
        key: i,
        title: it.IntegrationFlowName,
        paddingIndex: it._paddingIndex,
        paddingStartIndex: it._paddingStartIndex,
        MessageGuid: it.MessageGuid,
        AlternateWebLink: it.AlternateWebLink,
        cpiDesignContentPackageLink: it._cpiDesignContentPackageLink,
        cpiRunLogLink: it._cpiRunLogLink,
        runId: it.detail.run.Id,
        icon: "sap-icon://checklist",
        status: toStatus[it.Status],
        attributes: [
          { label: "Key", value: i },
          { label: "IntegrationFlowName", value: it.IntegrationFlowName },
          { label: "MessageGuid", value: it.MessageGuid },
          { label: "ApplicationMessageType", value: it.ApplicationMessageType },
          { label: "Sender", value: it.Sender },
          { label: "Receiver", value: it.Receiver },
          { label: "detail.StartTime", value: it.detail.StartTime },
          { label: "detail.StopTime", value: it.detail.StopTime },
          { label: "detail.run.Id", value: it.detail.run.Id },
          { label: "iart.PackageId", value: it.IntegrationArtifact.PackageId },
          { label: "iart.PackageName", value: it.IntegrationArtifact.PackageName }
        ]
      };
    });

    let keys = data.MessageProcessLogs.map((it) => it.MessageGuid);

    /***
     * 		"from": 0,
          "to": 1
    */
    let lines = [];
    data.MessageProcessLogs.forEach((it, i) => {
      if (it.detail.LocalPredecessors) {
        let line = {
          from: keys.indexOf(it.detail.LocalPredecessors[0]),
          to: i
        };
        // refine lines to JMS
        if (
          it.IntegrationFlowName.startsWith("JMS_") &&
          it.IntegrationFlowName !== "JMS_Pool_and_IFLow_Version_Controller"
        ) {
          line.status = "LineBorderStatus";
        }
        lines.push(line);
      }
    });
    lines = lines.filter((it) => it.from >= 0);

    // fix 45 chars search limitation or issues
    // add start end numbers S001 > E001 9 chars
    nodes.forEach((it) => {
      if (it.title.length > 37) {
        it.title = it.title.substring(0, 37);
      }
    });

    // lines from to
    await writeFile(
      resolve("./public/messageGraph/", "graph.json"),
      JSON.stringify({
        CorrelationId: CorrelationId,
        InterchangeId: InterchangeId,
        nodes: nodes,
        lines: lines
      }),
      { encoding: "utf8" }
    );

    // refine class

    // list all class
    let flowPackages = {};
    let flowNamesLinks = {};
    nodes.forEach((it) => {
      flowPackages[it.attributes[1].value] = it.attributes[9].value;
    });
    let flowNames = nodes
      .map((it) => {
        if (!flowNamesLinks[it.attributes[1].value]) {
          flowNamesLinks[it.attributes[1].value] = it.cpiDesignContentPackageLink;
        }
        return it.attributes[1].value;
      })
      .filter(function (item, pos, array) {
        return array.indexOf(item) == pos;
      });
    console.log("nodes.length", nodes.length);
    console.log("flowNames.length", flowNames.length);

    let newNodes = flowNames.map((it, i) => {
      return {
        key: i,
        icon: "sap-icon://process",
        title: it,
        cpiDesignContentPackageLink: flowNamesLinks[it],
        group: flowPackages[it],
        attributes: []
      };
    });
    let newLines = lines.map((it) => {
      return {
        from: flowNames.indexOf(nodes[it.from].attributes[1].value),
        to: flowNames.indexOf(nodes[it.to].attributes[1].value)
      };
    });

    nodes.forEach((it) => {
      let newNode = newNodes[flowNames.indexOf(it.attributes[1].value)];
      newNode.attributes.push({
        label: it.attributes[2].value
      });
    });
    newNodes.forEach((it) => {
      it.title = `${it.title} (${it.attributes.length})`;
    });

    await writeFile(
      resolve(
        "./public/messageGraph/",
        "graph_cls.json"
      ),
      JSON.stringify({
        nodes: newNodes.map((it) => {
          return {
            key: it.key,
            icon: it.icon,
            title: it.title,
            cpiDesignContentPackageLink: it.cpiDesignContentPackageLink,
            attributes: it.attributes
          };
        }),
        lines: newLines
      }),
      { encoding: "utf8" }
    );

    // refine groups
    let groupCounts = {};
    let groupNodeCounts = {};
    groupsKeys.forEach((it) => {
      groupCounts[it] = 0;
      groupNodeCounts[it] = 0;
    });
    newNodes.forEach((it) => {
      groupCounts[it.group] += 1;
      groupNodeCounts[it.group] += it.attributes.length;
    });
    groups.forEach((it) => {
      it.title = `${it.title} (${groupCounts[it.key]}/${groupNodeCounts[it.key]})`;
    });
    // lines = newLines;
    // nodes = newNodes;

    await writeFile(
      resolve(
        "./public/messageGraph/",
        "graph_pkg.json"
      ),
      JSON.stringify({
        nodes: newNodes,
        lines: newLines,
        groups: groups
      }),
      { encoding: "utf8" }
    );

  } catch (error) {
    console.error('Error in buildGraphIflow:', error);
    throw error;
  }

};

module.exports = { buildGraphFlow };


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
