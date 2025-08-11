const { randomUUID } = require('crypto');
exports.as4Process = {

    rebuildPayload: function(data, res){
      let payload = data.payload;
      payload = payload.toString().split("'\r").join("'");
      payload = payload.toString().split("'\n").join("'");
      // payload = payload.replace(/\s*/g, "");  // please do not remove space from the input payload
      // res.end(payload.toString(),"utf-8");

      let sender, receiver, originalInterchangeId, originalMessageId;
      let indexUNB, indexUNH;
      let UNBbody;
      let newPayload = payload;
      let resultData = {}

      let newInterchangeId = "T" + Date.now().toString().substring(2, 14);
      let newMessageId = "H" + Date.now().toString().substring(2, 14);

      

      // check if the input payload contains the UNA/UNB segement
      // "UNA:+.? 'UNB+UNOC:3+SP_MMT_NB_E1:500+SP_MMT_MSB_E1:ZZZ  --> use regext to get sender and receiver
      if (payload.startsWith("UNA")) {
        indexUNB = payload.indexOf("'UNB");
        if(indexUNB === -1){
          let error = "Incorrect EDIFACT Payload, please check your input.";
          console.log(error);
          res.send(error);
          resultData.noError = false;
          return resultData;
        }
        UNBbody = payload.substring(indexUNB + 1).split("'")[0];
      } else if (payload.startsWith("UNB")) {
        UNBbody = payload.split("'")[0];
      } else {
        let error = "Incorrect EDIFACT Payload, please check your input.";
        console.log(error);
        res.send(error);
        resultData.noError = false;
        return resultData;
      }

      // console.log(UNBbody);

      // get sender, receiver, and original interchange Id
      sender = UNBbody.split("+")[2].toString().split(":")[0];
      receiver = UNBbody.split("+")[3].toString().split(":")[0];
      originalInterchangeId = UNBbody.split("+")[5]; //IPP_{{Year}}{{Month}}{{Date}}{{MessgeSufixID}}

      // get the UNH message Id
      indexUNH = payload.indexOf("'UNH");
      originalMessageId = payload.substring(indexUNH + 1).split("+")[1]; //

      // regenerate interchange Id and message Id
      newPayload = newPayload
        .toString()
        .split(originalInterchangeId)
        .join(newInterchangeId); //IPP_{{Year}}{{Month}}{{Date}}{{MessgeSufixID}}

      // console.log(originalInterchangeId.toString(),"utf-8");
      // console.log(newInterchangeId.toString(),"utf-8");
      // console.log(newPayload.toString(),"utf-8");

      // newPayload = newPayload.toString().split(originalMessageId).join(newMessageId)
      // const regUNH = /^(UNH\+).*\+$/ ; //没有修改原字符串
      const strUNH = "UNH+" + newMessageId;
      newPayload = newPayload
        .toString()
        .replace("UNH+" + originalMessageId, strUNH);

      const indexUNT = payload.indexOf("'UNT");
      const UNTnum = payload.substring(indexUNT + 1).split("+")[1];
      const originStrUNT = "UNT+" + UNTnum + "+" + originalMessageId;
      const strUNT = "UNT+" + UNTnum + "+" + newMessageId;
      newPayload = newPayload.toString().replace(originStrUNT, strUNT);

      const currentTimestamp = Date.now();
      const gMsgIdValue = randomUUID();
      const compressedPayload = btoa(newPayload);
      let as4NewPayload = {
          senderId: sender,
          receiverId: receiver,
          timeStamp: currentTimestamp,
          gMsgId:randomUUID(),
          fileName: newInterchangeId,
          payload:compressedPayload
      };

      resultData = {
          newPayload: as4NewPayload,
          sender: sender,
          receiver: receiver,
          newInterchangeId: newInterchangeId,
          originalInterchangeId: originalInterchangeId,
          noError: true
      }
      return resultData;
  },

  buildHeaders : function(sender, receiver, host_url, host_url_as2, newInterchangeId, Authorization){
    let headers = {
      "Content-Type": "text/plain",
      "sender": sender,
      "receiver": receiver,
      "FileID": newInterchangeId,
      Authorization,
      Accept: "*/*",
      Host: host_url.substring(8), //delete the https:// head
      "Accept-Encoding": "gzip, deflate, br",
      Connection: "keep-alive",
    };
    return headers;
  },

  buildPostUrl: function(data, host_url){
    let host_url_test, host_url_as2;
    let systemId = data.systemId;
    let url_test_sufix = "/http/as4";
    let url_as2_sufix = "/as2/as2";

    if (systemId == "test-skr") {
      url_as2_sufix = url_as2_sufix + "/c1";
    }

    if (systemId == "test_skr") {
      url_as2_sufix = url_as2_sufix + "/c1";
    }

    if(systemId == 'hotfix-skr'){
      url_as2_sufix = url_as2_sufix + '/mt1'
    }
    if (systemId == "hotfix-ser") {
      url_as2_sufix = url_as2_sufix + "/mt2";
    }
    if (systemId == "dev") {
      url_as2_sufix = url_as2_sufix + "/mt";
    }

    if (systemId == "test") {
      url_as2_sufix = url_as2_sufix + "/mt2";
    }

    // if (systemId == "test-ve3") {
    //   url_as2_sufix = url_as2_sufix + "/mt";
    // }

    if (systemId == "preprod") {
      url_as2_sufix = url_as2_sufix + "/mrn1";
    }

    host_url_test = host_url + url_test_sufix;
    host_url_as2 = host_url + url_as2_sufix;



  // target_url_test = jsonParser(url_cpi_runtime, systemId) + url_test_sufix;
  // target_url_as2 = jsonParser(url_cpi_runtime, systemId) + url_as2_sufix;

    let resultData = {
      host_url_test: host_url_test,
      host_url_as2: host_url_as2
    }
    
    return resultData;
  },

  buildProcessResponse : function(systemId,newInterchangeId,resp, newPayload){
    let output;
    output = "Test System   : " + systemId + '\n';
    output = output + "InterchangeId : " + newInterchangeId + '\n';
    output = output + "Sending Status: " + resp.status + '\n';
    output = output + "Payload Sent: \n" + newPayload.toString().split("'").join("'\n"); + '\n';
    return output;
  },

  jsonParser : function jsonParser(stringValue, key) {
    let string = JSON.stringify(stringValue);
    let objectValue = JSON.parse(string);
    return objectValue[key];
  }

}
// module.exports = { rebuildPayload4AS2 ,rebuildPayload4WebAPI};
