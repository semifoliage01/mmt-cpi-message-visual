
const sqlite3 = require("sqlite3").verbose();
const { randomUUID } = require("node:crypto");
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
    let sqlStatement = "SELECT * FROM " + tableName + " WHERE scenarioName = ?";
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
  const { sampleName, sampleId, legalversion,messageFormat,messageStatus,receiverId, senderId } = req.query;
  let sqlstatment = "INSERT INTO iflowlogs";
      sqlstatment= sqlstatment+"(Id,correlationId,interchangeId,targetsys,scenarioId,scenarioName,senderId,receiverId,iflowlogNum,techMessageId,testFixData,legalversion,messageFormat,businessStatus,processStatus,transferdatTime,ahbversion,spitterCaseScenario,autoTestcaseName,commDirection,commMethod,comment,createOn,createBy,modifiedBy,modifiedOn)",
      sqlstatment= sqlstatment+" VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";

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
  const createOn = new Date().toJSON();
  const createBy = "";
  const modifiedBy = "";
  const modifiedOn = new Date().toJSON();
  let para = [id,correlationId,interchangeId,targetsys,scenarioId,scenarioName,
              senderId,receiverId,iflowlogNum,techMessageId,testFixData,legalversion,
              messageFormat,businessStatus,processStatus,transferdatTime,ahbversion,
              spitterCaseScenario,autoTestcaseName,commDirection,commMethod,comment,createOn,createBy,modifiedBy,modifiedOn];
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
