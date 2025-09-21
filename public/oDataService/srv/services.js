// import { CatalogService } from "./CatalogService";

let axios = require("axios");
const { randomUUID } = require('crypto');
const cds = require('@sap/cds')
const cors = require("cors");
const hana = require('@sap/hana-client');
const { join } = require("path");
const {queryE2EMsgPayload} = require("./utils/E2EMsgProcessing")
class CatalogService extends cds.ApplicationService { init() {
  const { AutoTestcase } = cds.entities('CatalogService');
  const {autoTestCases} = cds.entities("CatalogService")
  cds.on("bootstrap", app => app.use(cors()));

  this.after("*", async (each, req) => {
    if (req.res) {
        req.res.set("Access-Control-Allow-Origin", "*");
    }
});

//   this.on('DELETE', autoTestCases, async (res, req) =>{
//     const db = await cds.connect.to('db');
//     const {autoTestCases, caseExecution} = db.model.entities("CatalogService");
//     const testcase = await db.run(SELECT.from(autoTestCases).where({'ID':res.data.ID}))//.where(whereCondition))
//     const caseExecutionLog = await db.run(SELECT.from(caseExecution).where({'autoTestcaseId':res.data.ID}))//.where(whereCondition))
//     req.interchange = testcase[0].casename;
//   })

//   this.after('DELETE', autoTestCases, async (res, req) =>{
//     const db = await cds.connect.to('db');
//     const {autoTestCases, caseExecution} = db.model.entities("CatalogService");
//     const testcase = await db.run(SELECT.from(autoTestCases).where({'ID':req.data.ID}))//.where(whereCondition))
//     const caseExecutionLog = await db.run(SELECT.from(caseExecution).where({'autoTestcaseId':req.data.ID}))//.where(whereCondition))
//     if (caseExecutionLog.length>0){
//         await db.delete(caseExecution).where({'autoTestcaseId' : req.data.ID})

//     }

//     if(testcase[0].synchStatus !== 'toBeSynchToAutoTestCase'){
//         const host= "localhost:80"
//         const urlString = `http://${host}/testcases/deleteTestCase`
//         let responseCases = await axios.request({
//                 // url: `https://${host}/api/v1/MessageProcessingLogs?$format=json&$orderby=LogEnd desc&$top=${batch}&$skip=${start}&$filter=CorrelationId eq '${correlationId}'`,
//                 url: urlString,
//                 method: "POST",
//                 headers: {
//                 Accept: "*/*",
//                 "User-Agent": "Thunder Client (https://www.thunderclient.com)",
//                 // Authorization: authorization
//                 }
//             }).catch(error => {
//                 console.error('Axios request failed:', {
//                     message: error.message,
//                     status: error.response?.status,
//                     statusText: error.response?.statusText,
//                     data: error.response?.data
//                 });
//                 throw error;
//             });
//     }

    

//     console.log(res);


//   })

  this.on ('synchTestcaseFromAutoSplitter', async req => { 
    console.log("sdf")
    
    // if (book.stock > 111) { 
    //   book.title += ` -- 11% discount!`
    // } 
    const host= "localhost:80"
    const urlString = `http://${host}/testcases/getAll/`
    const db = await cds.connect.to('db');
    const {autoTestCases} = db.model.entities("CatalogService")

    let responseCases = await axios.request({
                // url: `https://${host}/api/v1/MessageProcessingLogs?$format=json&$orderby=LogEnd desc&$top=${batch}&$skip=${start}&$filter=CorrelationId eq '${correlationId}'`,
                url: urlString,
                method: "GET",
                headers: {
                Accept: "*/*",
                "User-Agent": "Thunder Client (https://www.thunderclient.com)",
                // Authorization: authorization
                }
            }).catch(error => {
                console.error('Axios request failed:', {
                    message: error.message,
                    status: error.response?.status,
                    statusText: error.response?.statusText,
                    data: error.response?.data
                });
                throw error;
            });
    // console.log(responseCases)
    const caseData = responseCases.data;
    let newData= [];
    let existData=[];
    
    const existCaseNames = await db.run(SELECT.from(autoTestCases))//.columns("casename"))
    const toCreateCases = caseData.result.filter(
        item2 => !existCaseNames.some(item1 => item1.casename === item2.casename)
        );
    const toUpdateCases = caseData.result.filter(
        item2 => existCaseNames.some(item1 => item1.casename === item2.casename)
        );

    toCreateCases.forEach(element => {
        let data = {
            "ID": randomUUID(),
            "casename": element.casename,
            "as2_url": element.as2_url,
            "http_url": element.http_url,
            "businessstatus": element.businessstatus,
            "comments": element.comments,
            "commentsat": element.commentsat,
            "comparestatus": element.comparestatus,
            "differences": element.differences,
            "direction": element.direction,
            "encryptandsign": element.encryptandsign,
            "exchgmethod": element.exchgmethod,
            "fileid": element.fileid,
            "messagecategory": element.messagecategory,
            "newinterchangeid": element.newinterchangeid,
            "numberoftransactions": element.numberoftransactions,
            "oldinterchangeid": element.oldinterchangeid,
            "payload": element.payload,
            "privatekey": element.privatekey,
            "processingstatus": element.processingstatus,
            "processsequence": element.processsequence,
            "publickey": element.publickey,
            "receiver": element.receiver,
            "receiveraddress": element.receiveraddress,
            "same": element.same,
            "sender": element.sender,
            "senderaddress": element.senderaddress,
            "sourcedata": element.sourcedata,
            "sourceinterchangeid": element.sourceinterchangeid,
            "sourcesys": element.sourcesys,
            "splitdirection": element.splitdirection,
            "targetdata": element.targetdata,
            "targetinterchangeid": element.targetinterchangeid,
            "techmsgversion": element.techmsgversion,
            "technicalmessageid": element.technicalmessageid,
            "testenv": element.testenv,
            "webapireferenceId": element.webapireferenceId,
            "synchedToAutoTest": 'synchedFromAutoTestCase'
        }
        newData.push(data)
    });

    existCaseNames.forEach(element => {
        const caseIdentified = toUpdateCases.filter(item => item.casename === element.casename);
        if(caseIdentified.length ===0 ){
            console.log(element.casename);
            return;
        }
        
        // element.casename = caseIdentified[0].casename,
        element.as2_url = caseIdentified[0].as2_url,
        element.http_url = caseIdentified[0].http_url,
        element.businessstatus = caseIdentified[0].businessstatus,
        element.comments = caseIdentified[0].comments,
        element.commentsat = caseIdentified[0].commentsat,
        element.comparestatus = caseIdentified[0].comparestatus,
        element.differences = caseIdentified[0].differences,
        element.direction = caseIdentified[0].direction,
        element.encryptandsign = caseIdentified[0].encryptandsign,
        element.exchgmethod = caseIdentified[0].exchgmethod,
        element.fileid = caseIdentified[0].fileid,
        element.messagecategory = caseIdentified[0].messagecategory,
        element.newinterchangeid = caseIdentified[0].newinterchangeid,
        element.numberoftransactions = caseIdentified[0].numberoftransactions,
        element.oldinterchangeid = caseIdentified[0].oldinterchangeid,
        element.payload = caseIdentified[0].payload,
        element.privatekey = caseIdentified[0].privatekey,
        element.processingstatus = caseIdentified[0].processingstatus,
        element.processsequence = caseIdentified[0].processsequence,
        element.publickey = caseIdentified[0].publickey,
        element.receiver = caseIdentified[0].receiver,
        element.receiveraddress = caseIdentified[0].receiveraddress,
        element.same = caseIdentified[0].same,
        element.sender = caseIdentified[0].sender,
        element.senderaddress = caseIdentified[0].senderaddress,
        element.sourcedata = caseIdentified[0].sourcedata,
        element.sourceinterchangeid = caseIdentified[0].sourceinterchangeid,
        element.sourcesys = caseIdentified[0].sourcesys,
        element.splitdirection = caseIdentified[0].splitdirection,
        element.targetdata = caseIdentified[0].targetdata,
        element.targetinterchangeid = caseIdentified[0].targetinterchangeid,
        element.techmsgversion = caseIdentified[0].techmsgversion,
        element.technicalmessageid = caseIdentified[0].technicalmessageid,
        element.testenv = caseIdentified[0].testenv,
        element.webapireferenceId = caseIdentified[0].webapireferenceId
        element.modifiedAt = new Date().toISOString();

    });
    // console.log(toCreateCases)
    // try{
    //     await db.create(autoTestCases).entries(newData)
    // }catch(e){

    // }
    await db.create(autoTestCases).entries(newData)
    for(let i=0; i<existCaseNames.length; i++){
        await db.update(autoTestCases).with(existCaseNames[i]).where({ID: existCaseNames[i].ID})
    }
    req.notify(`Success synch NEW creating ${newData.length} testcases, UPDATE existing ${existCaseNames.length} testcases from AutoTest !`)
  }),

  this.on ('createAutoTestcase', async req => {

    const db = await cds.connect.to('db');
    const {autoTestCases} = db.model.entities("CatalogService")
    const testcaseList = req.params;
    const commentTest = req.data.comment;
    const testcaseIdList = testcaseList.map(item=>item.ID);
    const whereCondition =  { ID: { in: testcaseIdList } } 
    const tesecase = await db.run(SELECT.from(autoTestCases).where(whereCondition))
    const host= "localhost:80"
    const urlString = `http://${host}/testcases/createTestCase`;
    
    
    let response = await axios.request({
                // url: `https://${host}/api/v1/MessageProcessingLogs?$format=json&$orderby=LogEnd desc&$top=${batch}&$skip=${start}&$filter=CorrelationId eq '${correlationId}'`,
                url: urlString,
                method: "POST",
                headers: {
                Accept: "*/*",
                "User-Agent": "Thunder Client (https://www.thunderclient.com)",
                // Authorization: authorization
                },
                data:tesecase[0]
            // }).then(function (response) {
            //     // console.log(response.data);
            //     req.error({
            //         code: 200,
            //         message: JSON.stringify(response.data),
            //         target : 'CatalogService.autoTestCases'});
            //     console.log(response.status);
            //     console.log(response.statusText);
            //     console.log(response.headers);
            //     console.log(response.config);
            }).catch(error => {
                console.error('Axios request failed:', {
                    message: error.message,
                    status: error.response?.status,
                    statusText: error.response?.statusText,
                    data: error.response?.data
                });
                req.error({
                    code: 200,
                    message: error.message,
                    target : 'CatalogService.autoTestCases'});
                // throw error;
            });
        if(response.data ===null || response.data.result === null){
            req.error({
                    code: 200,
                    message: "error",
                    target : 'CatalogService.autoTestCases'});
        }
        let interchangeId = response.data.result;


        console.log("req");
        const envList = [];
        let authorization = "Basic " + "ZGxfNWI5MGM1NjllY2IyMTE5OGU4MDAwMDAyQGV4Y2hhbmdlLnNhcC5jb3JwOmVpRTNmbyorUDd1YWxmNj1ydl8lVlp1X1QrMWsydA==";
        envList.push(tesecase[0].testenv)
        const targetWhereCondition =  { configName: { in: envList } } 
        const envConfig = await db.run(SELECT.from(targetSysConfig).where(targetWhereCondition));
        const urlCPI = envConfig[0].url;
        let urlCPIString = `${urlCPI}MessageProcessingLogs?$filter=ApplicationMessageId eq '${interchangeId}'`
        let responseCPI = await axios.request({
                    // url: `https://${host}/api/v1/MessageProcessingLogs?$format=json&$orderby=LogEnd desc&$top=${batch}&$skip=${start}&$filter=CorrelationId eq '${correlationId}'`,
                    url: urlCPIString,
                    method: "GET",
                    headers: {
                    Accept: "application/json",
                    "User-Agent": "Thunder Client (https://www.thunderclient.com)",
                    Authorization: authorization
                    },
                }).catch(error => {
                    console.error('Axios request failed:', {
                        message: error.message,
                        status: error.response?.status,
                        statusText: error.response?.statusText,
                        data: error.response?.data
                    });
                    req.error({
                        code: error.response?.status,
                        message: error.message,
                        target : 'CatalogService.autoTestCases'});
                });

        let correlationId = "";
        if(responseCPI === undefined || responseCPI.data ===null || responseCPI.data.result === null){
            if (interchangeId != null){
                correlationId = "";

            }else{
                req.reject({
                    code: 200,
                    message: interchangeId != null ? interchangeId : response.data.message,
                    target : 'CatalogService.autoTestCases'});
            }
            
        }else{
            const responseCPIData = responseCPI.data.d.results;
            correlationId = responseCPIData[0].CorrelationId;

        }


        let executionResult = [];
        let executionItem = {
            "ID" : randomUUID(),
            "autoTestcaseId" : tesecase[0].ID,
            "interchangeid" : interchangeId,
            "sentStatus": "ee",
            "correlationId": correlationId,
            "businessStatus": "",
            "processingstatus": "",
            "sender":tesecase[0].sender,
            "receiver": tesecase[0].receiver,
            "testenv": tesecase[0].testenv,
            "comment": "",
            "payload": tesecase[0].payload,
            "sourceType": "PostTestcase"
        }
        executionResult.push(executionItem);

        await db.create(caseExecution).entries(executionResult);

        req.notify(JSON.stringify(response.data));
  }),

  this.on ('postTestcase', async req => {

    const db = await cds.connect.to('db');
    const {autoTestCases,caseExecution,targetSysConfig} = db.model.entities("CatalogService")
    const testcaseList = req.params;
    const testenv = req.data.testenv;
    const testcaseIdList = testcaseList.map(item=>item.ID);
    const whereCondition =  { ID: { in: testcaseIdList }};
    const tesecase = await db.run(SELECT.from(autoTestCases).where(whereCondition))
    const host= "localhost:80"
    const urlString = `http://${host}/testcases/postTestCase`

    tesecase[0].testenv = testenv;
    
    let response = await axios.request({
                // url: `https://${host}/api/v1/MessageProcessingLogs?$format=json&$orderby=LogEnd desc&$top=${batch}&$skip=${start}&$filter=CorrelationId eq '${correlationId}'`,
                url: urlString,
                method: "POST",
                headers: {
                Accept: "*/*",
                "User-Agent": "Thunder Client (https://www.thunderclient.com)",
                // Authorization: authorization
                },
                data:tesecase[0]
            // }).then(function (response) {
            //     console.log(response.data);
            //     // req.notify(JSON.stringify(response.data));
            //     req.error({
            //         code: 200,
            //         message: JSON.stringify(response.data),
            //         target : 'CatalogService.autoTestCases'});
            //     console.log(response.status);
            //     console.log(response.statusText);
            //     console.log(response.headers);
            //     console.log(response.config);
            }).catch(error => {
                console.error('Axios request failed:', {
                    message: error.message,
                    status: error.response?.status,
                    statusText: error.response?.statusText,
                    data: error.response?.data
                });
                req.error({
                    code: error.response?.status,
                    message: error.message,
                    target : 'CatalogService.autoTestCases'});
            });
    console.log("req");

    if(response.data ===null || response.data.result === null){
        req.reject({
                code: 200,
                message: response.data.message,
                target : 'CatalogService.autoTestCases'});
    }

    const interchangeId = response.data.result;

    const envList = [];
    let authorization = "Basic " + "ZGxfNWI5MGM1NjllY2IyMTE5OGU4MDAwMDAyQGV4Y2hhbmdlLnNhcC5jb3JwOmVpRTNmbyorUDd1YWxmNj1ydl8lVlp1X1QrMWsydA==";
    envList.push(tesecase[0].testenv)
    const targetWhereCondition =  { configName: { in: envList } } 
    const envConfig = await db.run(SELECT.from(targetSysConfig).where(targetWhereCondition));
    const urlCPI = envConfig[0].url;
    let urlCPIString = `${urlCPI}MessageProcessingLogs?$filter=ApplicationMessageId eq '${interchangeId}'`
    let responseCPI = await axios.request({
                // url: `https://${host}/api/v1/MessageProcessingLogs?$format=json&$orderby=LogEnd desc&$top=${batch}&$skip=${start}&$filter=CorrelationId eq '${correlationId}'`,
                url: urlCPIString,
                method: "GET",
                headers: {
                Accept: "application/json",
                "User-Agent": "Thunder Client (https://www.thunderclient.com)",
                Authorization: authorization
                },
            }).catch(error => {
                console.error('Axios request failed:', {
                    message: error.message,
                    status: error.response?.status,
                    statusText: error.response?.statusText,
                    data: error.response?.data
                });
                // req.error({
                //     code: error.response?.status,
                //     message: error.message,
                //     target : 'CatalogService.autoTestCases'});
            });
    let correlationId = "";
    if(responseCPI === undefined || responseCPI.data ===null || responseCPI.data.result === null){
        if (interchangeId != null){
            correlationId = "";

        }else{
            req.reject({
                code: 200,
                message: interchangeId != null ? interchangeId : response.data.message,
                target : 'CatalogService.autoTestCases'});
        }
        
    }else{
        const responseCPIData = responseCPI.data.d.results;
        correlationId = responseCPIData[0].CorrelationId;

    }

    let executionResult = [];
    let executionItem = {
        "ID" : randomUUID(),
        "autoTestcaseId" : tesecase[0].ID,
        "interchangeid" : interchangeId,
        "sentStatus": "ee",
        "correlationId": correlationId,
        "businessStatus": "",
        "processingstatus": "",
        "sender":tesecase[0].sender,
        "receiver": tesecase[0].receiver,
        "testenv": tesecase[0].testenv,
        "comment": "",
        "payload": tesecase[0].payload,
        "sourceType": "PostTestcase"
    }
    executionResult.push(executionItem);

    await db.create(caseExecution).entries(executionResult);

    req.notify(JSON.stringify(response.data));

  }),

  this.on ('copyAutoTestcase', async req => {
    const db = await cds.connect.to('db');
    const {autoTestCases} = db.model.entities("CatalogService")
    const testcaseList = req.params;
    const newCaseName = req.data.newcasename;
    const testcaseIdList = testcaseList.map(item=>item.ID);
    const whereCondition =  { ID: { in: testcaseIdList } } 
    const testcase = await db.run(SELECT.from(autoTestCases).where(whereCondition))
    testcase[0].casename = newCaseName;
    testcase[0].synchedToAutoTest = null;
    const response = await db.create(autoTestCases).entries(testcase)
    console.log(response)
  }),

  this.on ('synchSysConfigFromAutoSplitter', async req => {
    const db = await cds.connect.to('db');
    const {targetSysConfig} = db.model.entities("CatalogService")
    const host= "localhost:80"
    const urlString = `http://${host}/config/getAllConfig`
    
    let response = await axios.request({
                // url: `https://${host}/api/v1/MessageProcessingLogs?$format=json&$orderby=LogEnd desc&$top=${batch}&$skip=${start}&$filter=CorrelationId eq '${correlationId}'`,
                url: urlString,
                method: "GET",
                headers: {
                Accept: "*/*",
                "User-Agent": "Thunder Client (https://www.thunderclient.com)",
                // Authorization: authorization
                }
            }).catch(error => {
                console.error('Axios request failed:', {
                    message: error.message,
                    status: error.response?.status,
                    statusText: error.response?.statusText,
                    data: error.response?.data
                });
                throw error;
            });
    const data = response.data.result;
    let envConfigs = [];
    console.log("delete the exist configurations")
    await db.delete(targetSysConfig)
    for(let i=0; i<data.length; i++){
        let item= data[i];
        console.log(data[i]);
        let envConfig = {
            "configName": item.configName,
            "authType":   item.authType,
            "tokenUrl": item.tokenUrl,
            "url": item.url,
            "user": item.user,
            "password": item.password,
            "dbUser": item.dbUser,
            "dbPassword": item.dbPassword,
            "dbUrl": item.dbUrl,
            "dbschemaName": item.dbschemaName,
            "testenv": item.testenv,
            "httpurl": item.httpurl,
            "as2url": item.as2url,
            "as2user": item.as2user,
            "as2password": item.as2password,
            "subdomain": item.subdomain,
            "synchedToAutoTest": 'toBeSynchToAutoTestCase'
        }
        envConfigs.push(envConfig);
    }
    if(envConfigs.length>0){
        let dbcreate = await db.create(targetSysConfig).entries(envConfigs);
    }
    // console.log(dbcreate);
    req.notify(`Success synch ${envConfigs.length} of enviroments from AutoTest.`)

  }),

  this.on ('runSelectedTestCases', async req => {

    const db = await cds.connect.to('db');
    const {autoTestCases,targetSysConfig,caseExecution} = db.model.entities("CatalogService")
    const testcaseList = req.params;
    const targetEnv = req.data.testenv;
    const testcaseIdList = testcaseList.map(item=>item.ID);
    const whereCondition =  { ID: { in: testcaseIdList } } 
    const tesecase = await db.run(SELECT.from(autoTestCases).where(whereCondition))
    const host= "localhost:80"
    const urlString = `http://${host}/testcases/processSelectedTestCases`

    tesecase[0].targetEnv = targetEnv;
    let requestData = {
        "currPDConfig": targetEnv,
        "testCaseMultipleSelection": tesecase
    }
    
    let response = await axios.request({
                url: urlString,
                method: "POST",
                timeout: 10000 * 5,
                signal: AbortSignal.timeout(50000),
                headers: {
                Accept: "*/*",
                "User-Agent": "Thunder Client (https://www.thunderclient.com)",
                // Authorization: authorization
                },
                data:requestData
            // }).then(function (response) {
            //     console.log(response.data);
            //     req.error({
            //         code: 200,
            //         message: JSON.stringify(response.data),
            //         target : 'CatalogService.autoTestCases'});
            //     console.log(response.status);
            //     console.log(response.statusText);
            //     console.log(response.headers);
            //     console.log(response.config);
            }).catch(error => {
                console.error('Axios request failed:', {
                    message: error.message,
                    status: error.response?.status,
                    statusText: error.response?.statusText,
                    data: error.response?.data
                });
                throw error;
            });
    console.log("req")
    
    if (response.data == null || response.data.message ==null){
        req.reject("Case execution error" + JSON.stringify(response.data));
    }
    const interchangeId = response.data.message;

    const envList = [];
    let authorization = "Basic " + "ZGxfNWI5MGM1NjllY2IyMTE5OGU4MDAwMDAyQGV4Y2hhbmdlLnNhcC5jb3JwOmVpRTNmbyorUDd1YWxmNj1ydl8lVlp1X1QrMWsydA==";
    envList.push(tesecase[0].targetEnv)
    const targetWhereCondition =  { configName: { in: envList } } 
    const envConfig = await db.run(SELECT.from(targetSysConfig).where(targetWhereCondition));
    const urlCPI = envConfig[0].url;
    let urlCPIString = `${urlCPI}MessageProcessingLogs?$filter=ApplicationMessageId eq '${interchangeId}'`
    let responseCPI = await axios.request({
                // url: `https://${host}/api/v1/MessageProcessingLogs?$format=json&$orderby=LogEnd desc&$top=${batch}&$skip=${start}&$filter=CorrelationId eq '${correlationId}'`,
                url: urlCPIString,
                method: "GET",
                headers: {
                Accept: "application/json",
                "User-Agent": "Thunder Client (https://www.thunderclient.com)",
                Authorization: authorization
                },
            }).catch(error => {
                console.error('Axios request failed:', {
                    message: error.message,
                    status: error.response?.status,
                    statusText: error.response?.statusText,
                    data: error.response?.data
                });
                // req.error({
                //     code: error.response?.status,
                //     message: error.message,
                //     target : 'CatalogService.autoTestCases'});
            });
    
    let correlationId = "";
    if(responseCPI === undefined || responseCPI.data ===null || responseCPI.data.result === null){
        if (interchangeId != null){
            correlationId = "";

        }else{
            req.reject({
                code: 200,
                message: interchangeId != null ? interchangeId : response.data.message,
                target : 'CatalogService.autoTestCases'});
        }
        
    }else{
        const responseCPIData = responseCPI.data.d.results;
        correlationId = responseCPIData[0].CorrelationId;

    }


    let executionResult = [];
    let executionItem = {
        "ID" : randomUUID(),
        "autoTestcaseId" : tesecase[0].ID,
        "interchangeid" : interchangeId,
        "sentStatus": "ee",
        "correlationId": correlationId,
        "businessStatus": "",
        "processingstatus": "",
        "sender":tesecase[0].sender,
        "receiver": tesecase[0].receiver,
        "testenv": tesecase[0].targetEnv,
        "comment": "",
        "payload": tesecase[0].payload,
        "sourceType": "RunSelectTestcase"
    }
    executionResult.push(executionItem);

    await db.create(caseExecution).entries(executionResult);

    req.notify(JSON.stringify(response.data));
  }),

  this.on ('fetchMsgResult', async req => {
    console.log(req)
    const db = await cds.connect.to('db');
    const {autoTestCases,targetSysConfig,caseExecution} = db.model.entities("CatalogService")
    let caseExecutionItems=[]; 
    let executionId = req.params[1];
    caseExecutionItems.push(executionId);
    const whereCondition =  { ID: { in: caseExecutionItems } } 
    const tesecaseExceution = await db.run(SELECT.from(caseExecution).where(whereCondition))
    

    let targetEnv=[]; 
    let targetId = tesecaseExceution[0].testenv; //'StageDev'; //tesecaseExceution[0].testenv;
    targetEnv.push(targetId);
    const whereCondition2 =  { configName: { in: targetEnv } } 
    const envList = await db.run(SELECT.from(targetSysConfig).where(whereCondition2))
    if (envList[0].dbUrl === null){
        req.reject(`DB information is not configured for the env : ${targetId}. `)
    }
    const regex = /\/\/(.*?):443/;
    const dbUrl = envList[0].dbUrl.match(regex);
    const connectionParams = {
        host: dbUrl[1],
        port: 443, // 默认端口
        user: envList[0].dbUser,
        password: envList[0].dbPassword,
        useTLS: false // 如果连接需要 TLS，设置为 true
    };
    let connection;
    let sqlString = envList[0].dbschemaName + ".COM_SAP_CD_MACO_E2EM_MESSAGE_E2EMESSAGES";
    let correlationId = tesecaseExceution[0].correlationId;
    let interchangeId = tesecaseExceution[0].interchangeid;

    let result = await queryE2EMsgPayload(envList,dbUrl,correlationId,interchangeId)
    if(result.originalMessage.length<1){
        req.reject(`E2EM Message inforation is not fetched for the message : ${interchangeId} in the env ${targetId} `)
    }
    tesecaseExceution[0].businessStatus = result.originalMessage[0].BUSINESSSTATUS;
    tesecaseExceution[0].processingstatus = result.originalMessage[0].PROCESSINGSTATUS;
    tesecaseExceution[0].aperakPayload = result.APERAKPayload;
    tesecaseExceution[0].contrlPayload = result.ContrlPayload;
    tesecaseExceution[0].sentStatus = "Success";
    tesecaseExceution[0].modifiedAt =  new Date().toISOString();
    await db.update(caseExecution).with(tesecaseExceution[0]).where({ID: tesecaseExceution[0].ID})
    req.notify(`Execution ${executionId} is updated. `);
  })



  

  return super.init()
}}
module.exports = CatalogService

// module.exports = (srv) => {


 // Reply mock data for Books...
//  srv.on ('READ', 'Books', ()=>[
//    { ID:201, title:'Wuthering Heights', author_ID:101, stock:12 },
//    { ID:251, title:'The Raven', author_ID:150, stock:333 },
//    { ID:252, title:'Eleonora', author_ID:150, stock:555 },
//    { ID:271, title:'Catweazle', author_ID:170, stock:222 },
//  ])

//  // Reply mock data for Authors...
//  srv.on ('READ', 'Authors', ()=>[
//    { ID:101, name:'Emily Brontë' },
//    { ID:150, name:'Edgar Allen Poe' },
//    { ID:170, name:'Richard Carpenter' },    
//  ])

//  srv.on ('READ', 'IflowLogsTracks', ()=>[
// //    { ID:101, name:'Emily Brontë' },
// //    { ID:150, name:'Edgar Allen Poe' },
// //    { ID:170, name:'Richard Carpenter' },
//  ])
    // this.on(ActionsynchTestcaseFromAutoSplitter)

    // this.on(CatalogService.ActionsynchTestcaseFromAutoSplitter.name, async (req) => {
    //         await E2EMessageHandler.onQuerySplitMessages(req,false)
    //     });

// synchTestcaseFromAutoSplitter() {
//     console.log("st")
// }


// }

// module.exports = class Sue extends cds.Service {
//   sum(x,y) { return x+y }
//   add(x,to) { return stocks[to] += x }
//   stock(id) { return stocks[id] }
//   getStock(Foo,id) { return stocks[id] }
//   order(Foo,id,x) { return stocks[id] -= x }

//   synchTestcaseFromAutoSplitter(){
//     console.log("st")
//   }
// }
