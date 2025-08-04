
    let systemId = window.location.pathname.replace("/", "");
    if (systemId) {
        alert("Message will be send to default system!" + systemId);
        // systemId = "test";
    }
    
    // Set systemId for all forms
    document.getElementsByName('systemId').forEach(item => { item.value = systemId });
    
    // Set commMethod for all forms
    document.getElementsByName('commMethod').forEach((item, index) => {
        if (index === 0) item.value = "as2";
        else if (index === 1) item.value = "webApi";
        else item.value = "as4";
    });

    // Load AS2 payload
    var payload = localStorage.getItem("payload")
    if (payload == null || payload == '') {
        payload = "UNA:+.? 'UNB+UNOC:3+SP_MMT_NB_E1:500+SP_MMT_MSB_E1:ZZZ+191018:1242+350301124223'UNH+350301124223+ORDERS:D:09B:UN:1.1j'BGM+Z31+1234'DTM+137:201901010101:203'DTM+203:20190101:102'RFF+Z13:17112'NAD+MS+SP_MMT_NB_E1::9'NAD+MR+SP_MMT_MSB_E1::332'NAD+DP'LOC+172+AB01234567893ABDEadgerwf12345jkld'LIN+1'PIA+5+1-0?:1.8.0:SRW'CCI+Z10++Z60'UNS+S'UNT+14+350301124223'UNZ+1+350301124223'";
        localStorage.setItem("payload", payload.toString())
    }

    // Load WebAPI payload
    var webapipayload = localStorage.getItem("webApiPayload")
    if (webapipayload) {
        try {
            let webapiploadObject = JSON.parse(webapipayload);
            if (document.getElementById("msgFormat")) {
                document.getElementById("msgFormat").value = webapiploadObject.msgFormat || "";
            }
            if (document.getElementById("webapiSender")) {
                document.getElementById("webapiSender").value = webapiploadObject.sender || "";
            }
            if (document.getElementById("webapiReceiver")) {
                document.getElementById("webapiReceiver").value = webapiploadObject.receiver || "";
            }
            if (document.getElementById("webapiTransactionld")) {
                document.getElementById("webapiTransactionld").value = webapiploadObject.transactionId || "";
            }
            if (document.getElementById("webapiReferenceld")) {
                document.getElementById("webapiReferenceld").value = webapiploadObject.referenceld || "";
            }
            if (document.getElementById("webapiCreateDatetime")) {
                document.getElementById("webapiCreateDatetime").value = webapiploadObject.createdatetime || "";
            }
            if (document.getElementById("webapiMacoTimetamp")) {
                document.getElementById("webapiMacoTimetamp").value = webapiploadObject.webapiMacoTimetamp || "";
            }
            if (document.getElementById("payloadWebapi")) {
                document.getElementById("payloadWebapi").value = webapiploadObject.payload || "";
            }
        } catch (error) {
            console.error("Error parsing webApiPayload:", error);
        }
    }

    // Load AS4 payload
    var as4payload = localStorage.getItem("as4Payload")
    if (as4payload && document.getElementById("payloadAs4")) {
        document.getElementById("payloadAs4").value = as4payload;
    }

    // Set AS2 payload
    if (document.getElementById("payloadAs2")) {
        document.getElementById("payloadAs2").value = payload.toString();
    }

    //set fields when navigate back 
    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'visible') {
            generateUUID();
        }
    });
    
    //set fields when initially load the page
    window.onload = function() {
        generateUUID();
    };  

    
    function generateUUID() {
        document.getElementById("webapiTransactionld").value = crypto.randomUUID()
    }

    function formSendEDISubmitMulti(formId) {
        // Store payload first before submission
        storePayloadMulti(formId);
        
        // Set axios defaults
        axios.defaults.withCredentials = true;
        
        // Set systemId based on form type
        const form = document.getElementById(formId);
        let systemIdField, envIdField;
        
        switch(formId) {
            case "as2form":
                systemIdField = form.querySelector('#systemIdAs2');
                envIdField = form.querySelector("#envIdAs2");
                break;
            case "webapiform":
                systemIdField = form.querySelector('#systemIdWebapi');
                envIdField = form.querySelector("#envIdWebapi");
                break;
            case "as4inboundform":
                systemIdField = form.querySelector('#systemIdAs4');
                envIdField = form.querySelector("#envIdAs4");
                break;
            default:
                console.error('Unknown form ID:', formId);
                return false;
        }
        
        if (systemIdField && envIdField) {
            systemIdField.value = envIdField.value;
        }
        
        // Get the form element
        const formElement = form.querySelector("form");
        const formData = new FormData(formElement);
        
        // Get the form action URL
        const actionUrl = formElement.action;
        
        // Submit using fetch to ensure proper data transmission
        fetch(actionUrl, {
            method: 'POST',
            body: formData,
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            console.log('Form submission successful:', data);
            // You can add success handling here
        })
        .catch(error => {
            console.error('Form submission failed:', error);
            // You can add error handling here
        });
        
        // Return false to prevent default form submission
        return false;
    }

    function switchForm(formId) {
        // Hide all forms
        document.getElementById('as2form').style.display = 'none';
        document.getElementById('webapiform').style.display = 'none';
        document.getElementById('as4inboundform').style.display = 'none';
        
        // Show selected form
        document.getElementById(formId).style.display = 'block';
        
        // Update button styles
        document.getElementById('tab1').classList.remove('active');
        document.getElementById('tab2').classList.remove('active');
        document.getElementById('tab3').classList.remove('active');
        
        // Set active tab based on form
        switch(formId) {
            case 'as2form':
                document.getElementById('tab1').classList.add('active');
                break;
            case 'webapiform':
                document.getElementById('tab2').classList.add('active');
                break;
            case 'as4inboundform':
                document.getElementById('tab3').classList.add('active');
                break;
        }
    }
    function formatEDIMulti(formId) {
        const newform = document.getElementById(formId);
        let newPayloadArea;
        
        // Get the correct textarea based on form type
        switch(formId) {
            case "as2form":
                newPayloadArea = newform.querySelector("#payloadAs2");
                let newPayload = newPayloadArea.value.replaceAll("\n", "");
                newPayloadArea.value = newPayload.toString().split("'").join("'\n");
                break;
            case "webapiform":
                newPayloadArea = newform.querySelector("#payloadWebapi");
                const inputText = newPayloadArea.value;
                try {
                    const jsonObject = JSON.parse(inputText);
                    const formattedJSON = JSON.stringify(jsonObject, null, 4);
                    newPayloadArea.value = formattedJSON;
                } catch (error) {
                    alert('Invalid JSON: ' + error.message);
                }
                break;
            case "as4inboundform":
                newPayloadArea = newform.querySelector("#payloadAs4");
                let as4Payload = newPayloadArea.value.replaceAll("\n", "");
                newPayloadArea.value = as4Payload.toString().split("'").join("'\n");
                break;
            default:
                console.error('Unknown form ID for formatting:', formId);
                break;
        }
    }

    function revertbackMulti(formId) {
        const newform = document.getElementById(formId);
        let newPayloadArea;
        
        // Get the correct textarea based on form type
        switch(formId) {
            case "as2form":
                newPayloadArea = newform.querySelector("#payloadAs2");
                let newPayload = newPayloadArea.value.toString().split("'\n").join("'");
                newPayloadArea.value = newPayload.toString();
                break;
            case "webapiform":
                newPayloadArea = newform.querySelector("#payloadWebapi");
                const inputText = newPayloadArea.value;
                try {
                    const jsonObject = JSON.parse(inputText);
                    const formattedJSON = JSON.stringify(jsonObject);
                    newPayloadArea.value = formattedJSON;
                } catch (error) {
                    alert('Invalid JSON: ' + error.message);
                }
                break;
            case "as4inboundform":
                newPayloadArea = newform.querySelector("#payloadAs4");
                let as4Payload = newPayloadArea.value.toString().split("'\n").join("'");
                newPayloadArea.value = as4Payload.toString();
                break;
            default:
                console.error('Unknown form ID for revert:', formId);
                break;
        }
    }

    function storePayloadMulti(formId) {
        const newform = document.getElementById(formId);
        let newPayload;
        
        // Get payload based on form type
        switch(formId) {
            case "as2form":
                newPayload = newform.querySelector("#payloadAs2").value;
                localStorage.setItem("payload", newPayload.toString());
                break;
            case "webapiform":
                newPayload = newform.querySelector("#payloadWebapi").value;
                let msgFormat = document.getElementById("msgFormat")?.value || "";
                let senderValue = document.getElementById("webapiSender").value;
                let receiverValue = document.getElementById("webapiReceiver").value;
                let transactionId = document.getElementById("webapiTransactionld").value;
                let referenceld = document.getElementById("webapiReferenceld").value;
                let createdatetime = document.getElementById("webapiCreateDatetime")?.value || "";
                let webapiMacoTimetamp = document.getElementById("webapiMacoTimetamp")?.value || "";
                let dataToStore = {
                    msgFormat: msgFormat,
                    sender: senderValue,
                    receiver: receiverValue,
                    transactionId: transactionId,
                    referenceld: referenceld,
                    createdatetime: createdatetime,
                    webapiMacoTimetamp: webapiMacoTimetamp,
                    payload: newPayload
                };
                localStorage.setItem("webApiPayload", JSON.stringify(dataToStore).toString());
                break;
            case "as4inboundform":
                newPayload = newform.querySelector("#payloadAs4").value;
                localStorage.setItem("as4Payload", newPayload.toString());
                break;
            default:
                console.error('Unknown form ID for payload storage:', formId);
                break;
        }
    }

    function showToast(message, type = 'default') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        container.appendChild(toast);
        
        // Remove toast after 3 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                container.removeChild(toast);
            }, 300);
        }, 3000);
    }
