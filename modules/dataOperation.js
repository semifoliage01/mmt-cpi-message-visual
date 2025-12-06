
const sqlite3 = require("sqlite3").verbose();
const { readFile, writeFile ,readdir} = require( "node:fs/promises");
const { resolve } = require('path');
const { randomUUID } = require("node:crypto");
const { compressInput, deCompressInput } = require("./gzipCompression.js")
let db = new sqlite3.Database("./mmtdatabase.db", (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log("Connected to the mmtdatabase database.");
});

db.run(`CREATE TABLE IF NOT EXISTS iflowLogs (
  Id TEXT PRIMARY KEY,
  correlationId TEXT,
  interchangeId TEXT,
  targetsys TEXT,
  scenarioId TEXT,
  scenarioName Text,
  senderId TEXT,
  receiverId TEXT,
  iflowlogNum TEXT,
  techMessageId TEXT,
  testFixData TEXT,
  legalversion TEXT,
  messageFormat TEXT,
  businessStatus TEXT,
  processStatus TEXT,
  transferdatTime TEXT,
  ahbversion TEXT,
  spitterCaseScenario TEXT,
  autoTestcaseName TEXT,
  direction TEXT,
  commDirection TEXT,
  commMethod TEXT,
  comment TEXT,
  createOn TEXT,
  createBy TEXT,
  modifiedBy TEXT,
  modifiedOn TEXT
);`);

async function queryDataAll (tableName){
  let sqlStatement = "SELECT * FROM " + tableName ;
  return new Promise((resolve, reject) => {
    db.all(sqlStatement, [],  (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  });
}

async function queryDataById (tableName, id){
    let sqlStatement = "SELECT * FROM " + tableName + " WHERE scenarioName = ?";
    db.all(sqlStatement, [id], (err, rows) => {
    if (err) {
    throw err;
    }
    res.json(rows);
    });

}

async function queryIflowLogByScenarioName (tableName, scenarioName){
    let sqlStatement = "SELECT * FROM " + tableName + " WHERE scenarioId = ?";
    return new Promise((resolve, reject) => {
    db.all(sqlStatement, [scenarioName],  (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  });

}

async function updateDataById (tableName, rowData, res){
    let sqlStatement = "SELECT * FROM " + tableName + " WHERE ID = " + id;
    db.all(sqlStatement, [], (err, rows) => {
    if (err) {
    throw err;
    }
    res.json(rows);
    });

}

async function insertIlfowLogsRecord(req, res){
  const data = req.query;
  const tableName = "mmtdata_iflow_IflowLogsTracks"; //"iflowlogs"
  const { sampleName, sampleId, legalversion,messageFormat,messageStatus,receiverId, senderId } = req.query;
  let sqlstatment = `INSERT INTO ${tableName}`;
      sqlstatment= sqlstatment+"(Id,correlationId,interchangeId,targetsys,scenarioId,scenarioName,senderId,receiverId,iflowlogNum,techMessageId,testFixData,legalversion,messageFormat,businessStatus,processStatus,transferdatTime,ahbversion,spitterCaseScenario,autoTestcaseName,commDirection,commMethod,comment,createdAt,createdBy,modifiedBy,modifiedAt,logTrackData)",
      sqlstatment= sqlstatment+" VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
  let dataIflow  = "";
  let dataIflow2 = "";

  try{
    let json = await readFile(
          resolve(
            "./public/messageGraph/",
            "graph.json"
          ),
          { encoding: "utf8" }
        );
    console.log("generate sample: get the original datas");
    dataIflow = JSON.parse(json);
    dataIflow2 = dataIflow;
    //skip compressino now and to be added in the future
    dataIflow = await compressInput(json);
  }catch (err){
    throw err;
  }

  const id = randomUUID();
  const correlationId = data.correlationId;
  const interchangeId = data.correlationId;
  const targetsys = data.targetsys;
  const scenarioId = data.sampleId;
  const scenarioName = data.sampleName;
  const iflowlogNum = "40";
  const techMessageId = data.techMessageId;
  const testFixData = "data";
  const businessStatus = data.businessStatus;
  const processStatus = data.processStatus;
  const transferdatTime = "";
  const ahbversion = data.ahbversion;
  const spitterCaseScenario = data.spitterCaseScenario;
  const autoTestcaseName = data.autoTestcaseName;
  const commDirection = data.commDirection;
  const commMethod = data.commMethod;
  const comment = "";
  const createdAt = new Date().toJSON();
  const createBy = "sys";
  const modifiedBy = "sys";
  const modifiedAt =new Date().toJSON();
  const logTrackData = JSON.stringify(dataIflow2);
  let para = [id,correlationId,interchangeId,targetsys,scenarioId,scenarioName,
              senderId,receiverId,iflowlogNum,techMessageId,testFixData,legalversion,
              messageFormat,businessStatus,processStatus,transferdatTime,ahbversion,
              spitterCaseScenario,autoTestcaseName,commDirection,commMethod,comment,createdAt,createBy,modifiedBy,modifiedAt,logTrackData];
  // insert(sqlstatment,para)
  return new Promise(async (resolve, reject) => {
    try{
      await insert(sqlstatment,para)
      resolve(true);
    }catch(e){
      reject(e.message)
      res.json({error: e.message})
    }
  });

}

async function insertData (tableName, rowData, res){
    console.log("try to create in DB");
  db.run(
    `INSERT INTO TestCases(Id, testCaseName, constraints, testVersion, testGroup, techMessageId, testFixData) VALUES(?,?,?,?,?,?,?)`,
    [
      req.body.Id,
      req.body.testCaseName,
      req.body.constraints,
      req.body.testVersion,
      req.body.testGroup,
      req.body.techMessageId,
      atob(req.body.testFixData),
    ],
    function (err) {
      if (err) {
        res.status(500).send(err.message);
        return console.log(err.message);
      }
      res.json({ success: true });
    }
  );

}

async function fetchAll(db, sql, params) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      resolve(rows);
    });
  });
};

async function fetchFirst(db, sql, params) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      resolve(row);
    });
  });
};

async function insert (sql, params= []) {
   
  if (params && params.length > 0) {
    return new Promise((resolve, reject) => {
      db.run(sql, params, (err) => {
        if (err) {
          reject(err);
        }else{
          resolve();
        }
        
      });
    });
  }
  return new Promise((resolve, reject) => {
    db.exec(sql, (err) => {
      if (err) reject(err);
      resolve();
    });
  });
};

async function singleInsert (db, sql, params = []) {
  if (params && params.length > 0) {
    return new Promise((resolve, reject) => {
      db.run(sql, params, (err) => {
        if (err) reject(err);
        resolve();
      });
    });
  }
  return new Promise((resolve, reject) => {
    db.exec(sql, (err) => {
      if (err) reject(err);
      resolve();
    });
  });
};

async function massInsert (db, sql, params = []) {
  if (params && params.length > 0) {
    return new Promise((resolve, reject) => {
      db.run(sql, params, (err) => {
        if (err) reject(err);
        resolve();
      });
    });
  }
  return new Promise((resolve, reject) => {
    db.exec(sql, (err) => {
      if (err) reject(err);
      resolve();
    });
  });
};

async function update (sql, params= []) {
   
  if (params && params.length > 0) {
    return new Promise((resolve, reject) => {
      db.run(sql, params, (err) => {
        if (err) reject(err);
        resolve();
      });
    });
  }
  return new Promise((resolve, reject) => {
    db.exec(sql, (err) => {
      if (err) reject(err);
      resolve();
    });
  });
};

module.exports = { queryDataAll,queryDataById,updateDataById,insertData,queryIflowLogByScenarioName,
  insertIlfowLogsRecord,
  insert, update

};
