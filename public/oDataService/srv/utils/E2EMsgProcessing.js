let axios = require("axios");
const { randomUUID } = require('crypto');
const cds = require('@sap/cds')
const cors = require("cors");
const hana = require('@sap/hana-client');
const { join } = require("path");
const { compressInput, deCompressInput,deCompressInput2} = require("./GzipCompression")

async function fetchBTPdata(targetEnv, queryString, targetId, correlationId, interchangeId){
    let sqlStatement = "SELECT * FROM " + tableName ;
    return new Promise((resolve, reject) => {
        
        const regex = /\/\/(.*?):443/;
        const dbUrl = targetEnv[0].dbUrl.match(regex);
        const connectionParams = {
            host: dbUrl[1],
            port: 443, // 默认端口
            user: targetEnv[0].dbUser,
            password: targetEnv[0].dbPassword,
            useTLS: false // 如果连接需要 TLS，设置为 true
        };
        let connection;
        let sqlString = targetEnv[0].dbschemaName + ".COM_SAP_CD_MACO_E2EM_MESSAGE_E2EMESSAGES";

        try{
            connection = hana.createConnection();
            connection.connect(connectionParams, (err) => {
                if (err) {
                    console.error('Error connecting to HANA:', err);
                    return;
                }
                console.log();
                
                const query = queryString; //`SELECT * FROM ${sqlString} where correlationId = '${correlationId}'`;

                // 执行查询
                connection.exec(query, (err, rows) => {
                    if (err) {
                        console.error('Error executing query:', err);
                    } else {
                        console.log('Query results:', rows);
                    }
                    
                    connection.disconnect();
                })
                console.log('Disconnected from HANA database');
            });

        console.log('Connected to HANA database');
        }catch(error){
            console.log(error)
        }
    });
}

async function queryE2EPayload(connection, connectionParams, query, payloadId){
    return new Promise( (resolve, reject) => {

        connection.connect(connectionParams, (err) => {

            connection.exec(query, async (err, rows) => {
                let response = {};
                if (err) {
                    console.error('Error executing query:', err);
                } else {
                    console.log('Query results:', rows);
                }
                if (rows===null){

                }
                let payloadGzip = rows[0].PAYLOAD; 
                // let payload = await deCompressInput(payloadGzip)
                
                resolve(payloadGzip);
                
            })

        })
    });
}

async function queryE2EMsgPayload(targetEnv, dbUrl, correlationId, interchangeId){
    return new Promise( async (resolve, reject) => {
        
        const regex = /\/\/(.*?):443/;
        const dbUrl = targetEnv[0].dbUrl.match(regex);
        const connectionParams = {
            host: dbUrl[1],
            port: 443, // 默认端口
            user: targetEnv[0].dbUser,
            password: targetEnv[0].dbPassword,
            useTLS: false // 如果连接需要 TLS，设置为 true
        };
        let connection;
        let msgDbTableName = targetEnv[0].dbschemaName + ".COM_SAP_CD_MACO_E2EM_MESSAGE_E2EMESSAGES";
        let payloadTableName = targetEnv[0].dbschemaName + ".COM_SAP_CD_MACO_E2EM_MESSAGE_MESSAGEPAYLOADS";
        let responseData = {};


        try{
            connection = hana.createConnection();
            const query = correlationId !== null ? `SELECT * FROM ${msgDbTableName} where correlationId = '${correlationId}'` : `SELECT * FROM ${msgDbTableName} where interchangeId = '${interchangeId}'`;
            responseData = await queryE2EMMessages(connection, connectionParams, query)
            if(responseData.APERAKMessage.length >0 ){
                let APERAKPayloadId = responseData.APERAKMessage[0].PAYLOADID;
                const queryAPERAK = `SELECT payload FROM ${payloadTableName} where ID = '${APERAKPayloadId}'`;
                const APERAKPayload = await queryE2EPayload(connection,connectionParams,queryAPERAK);
                responseData.APERAKPayload = APERAKPayload
                
            }
            if(responseData.contrlMessage.length >0 ){
                let contrlPayloadId = responseData.contrlMessage[0].PAYLOADID;
                const queryContrl = `SELECT payload FROM ${payloadTableName} where ID = '${contrlPayloadId}'`;
                const contrlPayload = await queryE2EPayload(connection,connectionParams,queryContrl);
                responseData.ContrlPayload = contrlPayload;
                
            }
            console.log('Connected to HANA database is disconnected.');
            connection.disconnect();
            resolve(responseData);
            
        }catch(error){
            connection.disconnect();
            reject(error)
        }
    });
}

async function queryE2EMMessages(connection, connectionParams, query){
    return new Promise((resolve, reject) => {

        connection.connect(connectionParams, (err) => {

            connection.exec(query, (err, rows) => {
                let response = {};
                if (err) {
                    console.error('Error executing query:', err);
                } else {
                    console.log('Query results:', rows);
                }
                if (rows===null){

                }
                e2eMessageList = rows; 
                const normalMessage = e2eMessageList.filter(item => !item.TECHNICALMESSAGEID.includes( "CONTRL", "APERAK") );
                const contrlMessage = e2eMessageList.filter(item => item.TECHNICALMESSAGEID === "CONTRL");
                const APERAKMessage = e2eMessageList.filter(item => item.TECHNICALMESSAGEID === "APERAK");
                response.originalMessage = normalMessage;
                response.contrlMessage = contrlMessage;
                response.APERAKMessage = APERAKMessage;
                resolve(response);
                
            })

        })
    });
}





module.exports = { fetchBTPdata, queryE2EMsgPayload};