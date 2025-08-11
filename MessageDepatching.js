let axios = require("axios");
let url = require("url");
let bodyParser = require("body-parser");
// const { response } = require('express');
const path = require("path");
const { getDestination } = require("@sap-cloud-sdk/connectivity");
const passport = require("passport");
const { JWTStrategy } = require("@sap/xssec");
const xsenv = require("@sap/xsenv");
const { randomUUID } = require('crypto');
const {as2Process} = require("./modules/as2Process")
const {webApiProcess} = require("./modules/webApiProcess")
const {as4Process} = require("./modules/as4Process")


if (!process.env.VCAP_SERVICES) {
  //xsenv load env variables
  const filePath = path.join(__dirname, "default-env.json");
  xsenv.loadEnv(filePath);
}

// XSUAA Middleware
let uaaService = xsenv.getServices({ uaa: { tag: "xsuaa" } }).uaa; //get uaa service
//console.log(uaaService);

passport.use(new JWTStrategy(uaaService));

if (!process.env.VCAP_SERVICES) {
  //skip authcheck if the local default.env exist for local testing
  app.use(passport.initialize());
  app.use(passport.authenticate("JWT", { session: false }));
}


async function msgSendPreparingGeneral(req, res){
        console.log("Send Payload--------")
        if(process.env && process.env.MMTDEBUG == "true"){
          //print req in MMTDEBUG mode
          let cache = [];
          let reqJson = JSON.stringify(req, function (key, value) {
            if (typeof value === "object" && value !== null) {
              if (cache.indexOf(value) !== -1) {
                return "[Circular]";
              }
              cache.push(value);
            }
            return value;
          }, 2); // Added '2' for pretty printing
          cache = null; // Enable garbage collection
          
          console.log('Full Request Details:', reqJson);
        }
        // Get input data
        let payload = req.body.payload;
        // if(!process.env.VCAP_SERVICES){
        //   req.body.systemId = req.body.systemId.split("/")[1];
        // }
        // req.body.systemId = req.body.systemId.split("/")[1] //comment this when local testing
        const systemId = req.body.systemId;
        const generateId = req.body.regenerateId;
        const communicationMethod = req.body.commMethod;
    
        // get the destination to fetch the user credentials etc.
        const desNameSystemIdDic = {
          dev: "CPI_DEV",
          ci: "CPI_CI",
          test: "CPI_TEST",
          "hotfix-ser": "CPI_HOTFIX",
          "test_skr": "CPI_TEST_HFC",
          "test-hfc": "CPI_TEST_HFC",
          preprod: "CPI_PREPROD",
        };
    
        const destinationName = desNameSystemIdDic[systemId];
        //get destination services
        let serviceDest;
        try{
          serviceDest = await getDestination({
          destinationName,
        });
        }catch(err){
          res.end(err.message, "utf-8");
          return;
        }
        //add authorization
    
        //check destination
        if(!serviceDest || !serviceDest.username || !serviceDest.password || !serviceDest.url){
          let error = "Incorrect destination configuration or destination service down";
          let userName = serviceDest?.username == null? "" : serviceDest.username;
          let usedUrl = serviceDest?.url == null ? "": serviceDest.url;
          console.log(error);
          res.send(error + " \n userName: "+ userName + "\n usedUrl: " + usedUrl);
          return;
        }
        const desUsername = serviceDest.username;
        const desPassword = serviceDest.password;
        let Authorization =
          "Basic" +
          " " +
          Buffer.from(desUsername + ":" + desPassword).toString("base64");
        // res.end(JSON.stringify(serviceDest))
    
        let sender, receiver, originalInterchangeId,  newPayload, newInterchangeId,noError;
        let headers;
        let host_url = serviceDest.url;
        let host_url_test, host_url_as2;
    
        console.log(host_url);
    
        switch (communicationMethod) {
          case "as2":
            //rebuild payload
            ({newPayload, sender, receiver, newInterchangeId, originalInterchangeId,noError} = as2Process.rebuildPayload(req.body, res))
            //retrun if errors in rebuildPayload
            if(!noError) return;
    
            if (generateId != "yes") {
              newInterchangeId = originalInterchangeId;
              newPayload = payload;
            }
            //build test url
            ({host_url_test, host_url_as2}= as2Process.buildPostUrl(req.body,host_url));
    
            //build http header
            headers = as2Process.buildHeaders(sender, receiver, host_url, host_url_as2, newInterchangeId, Authorization);
            break;
    
          case "webApi":
            {
              // check mandatory fields according to different webapi message format category
              let mandatoryFields = webApiProcess.checkMandatoryField(req.body,systemId);
    
              if (!mandatoryFields.isValid){
                res.status(200).json(mandatoryFields.missingFields);
                console.log(JSON.stringify(mandatoryFields.missingFields));
                return;
              }
              
              //rebuild payload for sending
              ({newPayload, noError}= webApiProcess.rebuildPayload(req.body, res));
              //retrun if errors in rebuildPayload
              if(!noError) return;
              
              //build http header
              headers = webApiProcess.buildHeaders(req.body, Authorization,host_url);
              //build test url
              ({ host_url_test} = webApiProcess.buildPostUrl(req.body,host_url));
            }
            break;
          case "as4":
            //rebuild payload
            ({newPayload, sender, receiver, newInterchangeId, originalInterchangeId,noError} = as4Process.rebuildPayload(req.body, res))
            //retrun if errors in rebuildPayload
            if(!noError) return;
    
            if (generateId != "yes") {
              newInterchangeId = originalInterchangeId;
              newPayload = payload;
            }
            //build test url
            ({host_url_test, host_url_as2}= as4Process.buildPostUrl(req.body,host_url));
    
            //build http header
            headers = as4Process.buildHeaders(sender, receiver, host_url, host_url_as2, newInterchangeId, Authorization);
            break;
        }
    
        axios({
          method: "post",
          url: host_url_test,
          headers: headers,
          data: newPayload,
          withCredentials: true,
        })
          .then((resp) => {
            // output JSON result
            let response = {
              "Test System": systemId,
              "Sending Status": resp.status,
              InterchangeId: newInterchangeId,
              regenerate: generateId,
            };
            console.log(response);
    
            let output;
            let path = resp.request.path;
            switch(path){
              case "/http/webapi":
                output = webApiProcess.buildProcessResponse(resp,systemId,newInterchangeId, newPayload);
                break;
              case "/http/test/msg-via-as2":
                output = as2Process.buildProcessResponse(systemId,newInterchangeId,resp,newPayload);
                break;
              default:
                output = as2Process.buildProcessResponse(systemId,newInterchangeId,resp,newPayload);
                break;
            }
    
            // res.end(JSON.stringify(response));
            res.setHeader('Content-Type', 'text/plain; charset=utf-8');
            res.end(output, "utf-8");
            // response = JSON.stringify(req.body)
            // res.end(JSON.stringify(response));
          })
          .catch((error) => {
            // output JSON result
            let response = {
              "Test System": systemId,
              "Sending Status": "Fail",
              target_url_test: host_url_test,
              InterchangeId: newInterchangeId,
              "Error Info": error.message,
              "Error" : error
            };
            console.log(response);
    
            let correlationIdString = "";
            if (error?.response?.headers?.sap_mplcorrelationid) correlationIdString = error.response.headers.sap_mplcorrelationid;
    
            let output = "Test System   : " + systemId + '\n';
            output = output + "InterchangeId : " + newInterchangeId + '\n';
            output = output + "Sending Status: " + 'Fail' + '\n';
            output = output + "Error Info    : " + JSON.stringify(error.response.data) + '\n';
            output = output + "Error     : " + JSON.stringify(error.message) + '\n';
            output = output + "CorrelationId :" + correlationIdString;
    
            res.end(output, "utf-8");
          });
    
        function circularJsonParser(req) {
          //use the code below to Converte circular structure to JSON if you want to see what request holds
          let cache = []; //
          let reqJson = JSON.stringify(req, function (key, value) {
            if (typeof value === "object" && value !== null) {
              if (cache.indexOf(value) !== -1) {
                // Circular reference found, discard key
                return;
              }
              // Store value in our collection
              cache.push(value);
            }
            return value;
          });
          cache = null; // Enable garbage collection
          res.end(reqJson, "utf-8");
        }
    
}



module.exports = { msgSendPreparingGeneral };