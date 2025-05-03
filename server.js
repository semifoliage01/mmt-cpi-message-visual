const { readFile, writeFile } = require( "node:fs/promises");
// const { downloadAllMessageDetailsBatch } = require("./modules/downloadAllMessageDetails_batch.js")
const { downloadAllMessageDetailsBatch } = require("./modules/downloadAllMessageDetails_batch.js")
const { buildOriginalJSONs } = require("./modules/downloadmove_with_predes.js")
const { buildGraphFlow } = require("./modules/buildgraphdata.js")
const { moveGraphFlow } = require("./modules/movegraphdatatosamplegraph.js")
const axios = require('axios');
const express = require('express');
const { resolve } = require('path');
const app = express();
const port = 3009;

// Enable CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});
// Middleware to parse JSON bodies
app.use(express.json());
// Serve static files from 'public' directory
app.use(express.static('public'));
// app.use(express.static('/Users/I048389/Documents/working_mass/working_sharingz/tool_sky/mmt-cpi-message-visualization_2024-07-05_KT/ui5-app-playround/uimodule/webapp'));

// Example API endpoint
app.get('/api/getData1', (req, res) => {
    res.json({ message: 'Hello from Node.js!' });
});

app.get('/api/getData', async (req, res) => {
    const hostUrlList = {
        dev:"cpi-mmt-dev.it-cpi018.cfapps.eu10-003.hana.ondemand.com",
        ci:"mmt-cpi.it-accd003.cfapps.eu12.hana.ondemand.com",
        test:"mmt-cpi-test.it-accd003.cfapps.eu12.hana.ondemand.com",
        testskr2:"mmt-test-hfc.it-cpi026-rt.cfapps.eu10-002.hana.ondemand.com",
        "test-hfc":"mmt-test-hfc.it-cpi026.cfapps.eu10-002.hana.ondemand.com",
        preprod: "CPI_PREPROD",
      };

    const { correlationId, envId } = req.query;  
    const host = hostUrlList[envId];
    // const host = "mmt-test-hfc.it-cpi026.cfapps.eu10-002.hana.ondemand.com";
    const url = `https://${host}/api/v1/MessageProcessingLogs/$count?$filter=CorrelationId eq '${correlationId}'`;
    const authorization = "Basic ZGxfNWI5MGM1NjllY2IyMTE5OGU4MDAwMDAyQGV4Y2hhbmdlLnNhcC5jb3JwOmVpRTNmbyorUDd1YWxmNj1ydl8lVlp1X1QrMWsydA==";
    const auth = "ZGxfNWI5MGM1NjllY2IyMTE5OGU4MDAwMDAyQGV4Y2hhbmdlLnNhcC5jb3JwOmVpRTNmbyorUDd1YWxmNj1ydl8lVlp1X1QrMWsydA=="

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "Authorization": authorization
            }
        });
        const data = await response.json();
        
        // fetch logs
        const fetchResult = await fetchIflowLogs(host,data,correlationId, authorization)

        const st = await downloadAllMessageDetailsBatch(host,data,correlationId, authorization)

        const st2 = await buildOriginalJSONs(host,correlationId);

        const st3 = await buildGraphFlow(correlationId);

        console.log('Message details download result:', st);

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Example POST endpoint
app.get('/api/moveData', async (req, res) => {
    try{
    const data = req.body;
    const { sampleName, sampleId } = req.query;  

    const st = await moveGraphFlow(sampleName,sampleId)
    // Process the data
    const result = {
        received: st,
        processed: true,
        timestamp: new Date().toISOString()
    };
    res.json(result);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/moveData2', async (req, res) => {
    try{
    const data = req.body;
    const { sampleName, sampleId } = req.query;  

    const st = await moveGraphFlow(sampleName,sampleId)
    // Process the data
    const result = {
        received: data,
        processed: true,
        timestamp: new Date().toISOString()
    };
    res.json(result);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 

async function fetchIflowLogs(host, count, correlationId, authorization){

    // loop download message by page
    const page = 50;
    let remain = count;
    let round = 0;
    while (remain > 0) {
    // current round
        round++;
        let batch;
        if (remain >= page) {
            batch = page;
        } else {
            batch = remain;
        }
        let start = count - remain;

        let responseLogs = await axios.request({
            url: `https://${host}/api/v1/MessageProcessingLogs?$format=json&$orderby=LogEnd desc&$top=${batch}&$skip=${start}&$filter=CorrelationId eq '${correlationId}'`,
            method: "GET",
            headers: {
            Accept: "*/*",
            "User-Agent": "Thunder Client (https://www.thunderclient.com)",
            Authorization: authorization
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
        let messageLogs = responseLogs.data.d;
        try {
            const filePath = resolve(
                __dirname,
                "MessageProcessingLogs",
                `MessageProcessingLogs_${correlationId}_${round}_${start}.json`
            );
            console.log('Writing to file:', filePath);
            await writeFile(
                filePath,
                JSON.stringify(messageLogs),
                { encoding: "utf8" }
            );
            console.log('Successfully wrote file');
        } catch (error) {
            console.error('Error writing file:', error);
            throw error;
        }

        // next round
        console.log(`round ${round} batch ${batch}`);
        remain = remain - batch;
    }
    console.log(`correlationId: ${correlationId}, all complete`);
    return "success";
}