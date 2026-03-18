const http = require('http');

const request = (method, path, body = null) => {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 8080,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, res => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                let parsed = data;
                try { parsed = JSON.parse(data); } catch(e) {}
                resolve({ status: res.statusCode, data: parsed });
            });
        });

        req.on('error', e => reject(e));

        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
};

const delay = ms => new Promise(res => setTimeout(res, ms));

async function runTest() {
    try {
        console.log("1. Creating Workflow...");
        const wfRes = await request('POST', '/api/workflows', {
            name: "Automated Expense Approval",
            version: "1.0",
            isActive: true,
            inputSchema: JSON.stringify({ amount: 0 })
        });
        const wfId = wfRes.data.id;
        console.log("Workflow created:", wfId);

        console.log("2. Adding Steps...");
        const step1Res = await request('POST', `/api/workflows/${wfId}/steps`, { name: "Submit Expense", stepType: "TASK", stepOrder: 1, metadata: "{}" });
        const step2Res = await request('POST', `/api/workflows/${wfId}/steps`, { name: "Manager Review", stepType: "APPROVAL", stepOrder: 2, metadata: "{}" });
        const step3Res = await request('POST', `/api/workflows/${wfId}/steps`, { name: "Processed Note", stepType: "NOTIFICATION", stepOrder: 3, metadata: "{}" });
        const step1 = step1Res.data;
        const step2 = step2Res.data;
        const step3 = step3Res.data;
        
        console.log("3. Adding Rules...");
        await request('POST', `/api/steps/${step1.id}/rules`, { condition: "amount > 100", nextStepId: step2.id, priority: 1 });
        await request('POST', `/api/steps/${step1.id}/rules`, { condition: "DEFAULT", nextStepId: step3.id, priority: 2 });
        await request('POST', `/api/steps/${step2.id}/rules`, { condition: "DEFAULT", nextStepId: step3.id, priority: 1 });

        console.log("4. Updating Workflow Start Step...");
        await request('PUT', `/api/workflows/${wfId}`, { ...wfRes.data, startStepId: step1.id });

        console.log("5. Starting Execution...");
        let execRes = await request('POST', `/api/workflows/${wfId}/execute`, {
            data: JSON.stringify({ amount: 500 }),
            triggeredBy: "API_TEST"
        });
        
        if (execRes.status !== 200) {
            console.error("Execution start failed:", execRes);
            return;
        }
        
        const execId = execRes.data.id;
        console.log("Execution started:", execId, "Status:", execRes.data.status);

        console.log("6. Waiting for approval state...");
        for (let i = 0; i < 5; i++) {
            await delay(1000);
            execRes = await request('GET', `/api/executions/${execId}`);
            console.log("Current DB Status:", execRes.data.status);
            if (execRes.data.status === "WAITING_FOR_APPROVAL") break;
            if (execRes.data.status === "FAILED") break;
        }

        if (execRes.data.status !== "WAITING_FOR_APPROVAL") {
            const logsRes = await request('GET', `/api/executions/${execId}/logs`);
            require('fs').writeFileSync('e2e_logs.json', JSON.stringify(logsRes.data, null, 2), 'utf8');
            throw new Error("Execution did not reach WAITING_FOR_APPROVAL status it is: " + execRes.data.status);
        }

        console.log("7. Approving Execution...");
        await request('POST', `/api/executions/${execId}/approve`, { reason: "Looks good" });

        for (let i = 0; i < 5; i++) {
            await delay(1000);
            execRes = await request('GET', `/api/executions/${execId}`);
            console.log("Status after approval:", execRes.data.status);
            if (execRes.data.status === "COMPLETED") break;
        }

        if (execRes.data.status !== "COMPLETED") {
            const logsRes = await request('GET', `/api/executions/${execId}/logs`);
            console.log("LATE EXECUTION LOGS:", JSON.stringify(logsRes.data, null, 2));
            throw new Error("Execution did not reach COMPLETED status it is: " + execRes.data.status);
        }

        console.log("8. Validating Logs...");
        const logsRes = await request('GET', `/api/executions/${execId}/logs`);
        console.log("Logs obtained:", logsRes.data.length);
        logsRes.data.forEach(l => {
            console.log(` - [${l.startedAt}] Step: ${l.stepName} (${l.stepType}) -> Status: ${l.status}`);
        });

        console.log("✅ E2E Test Passed Successfully!");
    } catch (e) {
        console.error("Test Failed:", e.message);
        require('fs').writeFileSync('e2e_out.json', JSON.stringify({ error: e.message, data: e }, null, 2), 'utf8');
    }
}

runTest();
