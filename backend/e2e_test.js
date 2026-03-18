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
                if (data) {
                    try { resolve(JSON.parse(data)); } catch(e) { resolve(data); }
                } else {
                    resolve(null);
                }
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
        const wf = await request('POST', '/api/workflows', {
            name: "Automated Expense Approval",
            version: "1.0",
            isActive: true,
            inputSchema: JSON.stringify({ amount: 0 })
        });
        const wfId = wf.id;
        console.log("Workflow created:", wfId);

        console.log("2. Adding Steps...");
        const step1 = await request('POST', `/api/steps/${wfId}`, { name: "Submit Expense", stepType: "TASK", stepOrder: 1, metadata: "{}" });
        const step2 = await request('POST', `/api/steps/${wfId}`, { name: "Manager Review", stepType: "APPROVAL", stepOrder: 2, metadata: "{}" });
        const step3 = await request('POST', `/api/steps/${wfId}`, { name: "Processed Note", stepType: "NOTIFICATION", stepOrder: 3, metadata: "{}" });
        
        console.log("3. Adding Rules...");
        await request('POST', `/api/rules/${step1.id}`, { condition: "amount > 100", nextStepId: step2.id, priority: 1 });
        await request('POST', `/api/rules/${step1.id}`, { condition: "DEFAULT", nextStepId: step3.id, priority: 2 });
        await request('POST', `/api/rules/${step2.id}`, { condition: "DEFAULT", nextStepId: step3.id, priority: 1 });

        console.log("4. Updating Workflow Start Step...");
        await request('PUT', `/api/workflows/${wfId}`, { ...wf, startStepId: step1.id });
        const updatedWf = await request('GET', `/api/workflows/${wfId}`);
        console.log("Workflow startStepId is:", updatedWf.startStepId);

        console.log("5. Starting Execution...");
        let exec = await request('POST', `/api/workflows/${wfId}/execute`, {
            data: JSON.stringify({ amount: 500 }),
            triggeredBy: "API_TEST"
        });
        const execId = exec.id;
        console.log("Execution started:", execId, "Status:", exec.status);

        console.log("6. Waiting for approval state...");
        for (let i = 0; i < 5; i++) {
            await delay(1000);
            exec = await request('GET', `/api/executions/${execId}`);
            console.log("Status:", exec.status);
            if (exec.status === "WAITING_FOR_APPROVAL") break;
        }

        if (exec.status !== "WAITING_FOR_APPROVAL") {
            const logs = await request('GET', `/api/executions/${execId}/logs`);
            console.log("EXECUTION FAILED LOGS:", JSON.stringify(logs, null, 2));
            throw new Error("Execution did not reach WAITING_FOR_APPROVAL status");
        }

        console.log("7. Approving Execution...");
        await request('POST', `/api/executions/${execId}/approve`, { reason: "Looks good" });

        for (let i = 0; i < 5; i++) {
            await delay(1000);
            exec = await request('GET', `/api/executions/${execId}`);
            console.log("Status after approval:", exec.status);
            if (exec.status === "COMPLETED") break;
        }

        if (exec.status !== "COMPLETED") {
            throw new Error("Execution did not reach COMPLETED status");
        }

        console.log("8. Validating Logs...");
        const logs = await request('GET', `/api/executions/${execId}/logs`);
        console.log("Logs obtained:", logs.length);
        logs.forEach(l => {
            console.log(` - [${l.startedAt}] Step: ${l.stepName} (${l.stepType}) -> Status: ${l.status}`);
        });

        console.log("✅ E2E Test Passed Successfully!");
    } catch (e) {
        console.error("Test Failed:", e);
    }
}

runTest();
