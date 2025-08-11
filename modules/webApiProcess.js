const { randomUUID } = require('crypto');
exports.webApiProcess = {
  rebuildPayload : function(data, res){
      let newPayload = data.payload;
      try {
        JSON.parse(newPayload);
        return { newPayload: newPayload , noError: true}
      } catch (error) {
        let errorString = "Incorrect JSON Payload, please check your input.";
        console.log(errorString);
        res.send(errorString);
        return { newPayload: newPayload , noError: false}
      }
  },

  buildHeaders : function(data, Authorization, host_url) {
    const maco_timeStampNow = data.macoTimestamp != '' ? new Date(data.macoTimestamp).getTime() : Date.now();
    const maco_creationDateTime = data.createDatetime != '' ? new Date(data.createDatetime).toISOString() : new Date().toISOString();
    const maco_gMsgUUID = randomUUID();
    const maco_initialTransactionId = randomUUID();
    const maco_senderId =data.sender;
    const maco_receiverId = data.receiver;
    const maco_apiId = "API00001";
    const maco_transactionId = data.transactionld != '' ? data.transactionld : randomUUID();
    const maco_referenceId = data.referenceld;
    let headers = {
      "Content-Type": "application/json",
      maco_serviceId: "",
      maco_senderId: maco_senderId,
      maco_receiverId: maco_receiverId,
      maco_timeStamp: maco_timeStampNow,
      maco_gMsgId: maco_gMsgUUID,
      maco_apiId: maco_apiId,
      transactionId: maco_transactionId,
      creationDateTime: maco_creationDateTime,
      initialTransactionId: maco_initialTransactionId,
      Authorization,
      Accept: "*/*",
      Host: host_url.substring(8), //delete the https:// head
      // "Accept-Encoding": "gzip, deflate, br",
      // Connection: "keep-alive",
    };
    switch(data.msgFormat){
      case "/maloid/request":
        headers.maco_serviceId = "/maloId/request/v1";
        break;
      
      case "/maloid/postive":
        headers.maco_serviceId = "/maloId/dataForMarketLocationPositive/v1";
        headers.referenceId = maco_referenceId;
        break;

      case "/maloid/negative":
        headers.maco_serviceId =  "/maloId/dataForMarketLocationNegative/v1";
        headers.referenceId = maco_referenceId;
        break;
    }

    return headers;
  },

  buildPostUrl: function(data, host_url){

    let host_url_suffix = "/http/webapi";
    let resultData = {
      host_url_test: host_url+ host_url_suffix
    }
    return resultData;

  },

  checkMandatoryField: function(data,systemId){
    let requiredValues;
    let missingFields = [];
    switch (data.msgFormat){
      case "/maloid/request":
        requiredValues= ["sender","receiver","payload"];
        break;
      
      case "/maloid/postive":
        requiredValues= ["sender","receiver", "payload", "referenceld"];
        break;

      case "/maloid/negative":
        requiredValues= ["sender","receiver", "payload", "referenceld"];
        break;
      default:
        requiredValues= ["sender","receiver", "payload"];
    }

    requiredValues.forEach(field => {
        if (!data[field]) {
            missingFields.push(field);
        }
    });

    if (missingFields.length > 0) {
      let result = {
        "Test System": systemId,
        "Sending Status": "Fail",
        "Error Info": "Mandatory Fields Missing.",
        "MissingFields": missingFields.toLocaleString()
      };

        return { isValid: false, missingFields: result };
    }
    return { isValid: true };
  }, 

  buildProcessResponse : function(resp, systemId, newInterchangeId, newPayload){
    let payload = JSON.parse(newPayload);
    let respHeads = resp.config.headers;
    let headers = {}
    if(respHeads){
      const headerFields = [
        'creationDateTime',
        'initialTransactionId',
        'maco_apiId',
        'maco_gMsgId',
        'maco_receiverId',
        'maco_senderId',
        'maco_serviceId',
        'maco_timeStamp',
        'transactionId',
        'referenceId'
      ];
      
      // headers object with only the required fields
      headers = headerFields.reduce((acc, field) => {
        if (respHeads[field] !== undefined) {
          acc[field] = respHeads[field];
        }
        return acc;
      }, {});
    }
    let output = "Test System   : " + systemId + '\n' +
                 "InterchangeId : " + headers.transactionId + '\n' +
                 "gMsGid        : " + resp.data.gMsgId + '\n' +
                 "correlationId : " + resp.data.correlationId + '\n' +
                 "Sending Status: " + resp.status + '\n' +
                 "Request Params: " + JSON.stringify(headers, null, 4) + '\n' +
                 "Payload Sent  : " + JSON.stringify(payload, null, 4);
    
    return output;
  }


}
// module.exports = { rebuildPayload ,buildHeaders};
