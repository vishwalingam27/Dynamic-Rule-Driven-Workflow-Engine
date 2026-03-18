const params = {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
};

async function test() {
  const res = await fetch('http://localhost:8080/api/executions');
  const executions = await res.json();
  const logs = await Promise.all(executions.map(async e => {
    const l = await fetch(`http://localhost:8080/api/executions/${e.id}/logs`);
    return await l.json();
  }));
  require('fs').writeFileSync('out_executions.json', JSON.stringify({ executions, logs }, null, 2));
}
test().catch(console.error);
