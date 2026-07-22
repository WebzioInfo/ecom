const { exec } = require('child_process');
const os = require('os');

const port = process.env.PORT || '4000';
const platform = process.platform;

function run(command) {
  return new Promise((resolve, reject) => {
    exec(command, { shell: true }, (error, stdout, stderr) => {
      if (error) {
        return reject(new Error(stderr || error.message));
      }
      resolve(stdout.trim());
    });
  });
}

async function main() {
  console.log(`Checking port ${port} on ${platform}...`);

  try {
    if (platform === 'win32') {
      const output = await run(`netstat -ano | findstr :${port}`);
      if (!output) {
        console.log(`Port ${port} is free.`);
        return;
      }

      const pids = [...new Set(output
        .split(/\r?\n/)
        .map((line) => line.trim().split(/\s+/).pop())
        .filter(Boolean))];

      for (const pid of pids) {
        const taskInfo = await run(`tasklist /FI "PID eq ${pid}" /FO CSV /NH`);
        if (taskInfo.toLowerCase().includes('node.exe') || taskInfo.toLowerCase().includes('node')) {
          console.log(`Killing stale Node process ${pid} listening on port ${port}...`);
          await run(`taskkill /PID ${pid} /F`);
          console.log(`Terminated process ${pid}.`);
        } else {
          console.warn(`Port ${port} is owned by a non-Node process: ${taskInfo}. Not terminating.`);
        }
      }
      return;
    }

    const output = await run(`lsof -i :${port} -sTCP:LISTEN -Pn 2>/dev/null || true`);
    if (!output) {
      console.log(`Port ${port} is free.`);
      return;
    }

    const lines = output.split(/\r?\n/).slice(1).filter(Boolean);
    for (const line of lines) {
      const columns = line.trim().split(/\s+/);
      const command = columns[0];
      const pid = columns[1];
      if (command.toLowerCase().includes('node')) {
        console.log(`Killing stale Node process ${pid} listening on port ${port}...`);
        await run(`kill -9 ${pid}`);
        console.log(`Terminated process ${pid}.`);
      } else {
        console.warn(`Port ${port} is owned by a non-Node process: ${command} (${pid}). Not terminating.`);
      }
    }
  } catch (error) {
    console.error(`Port check failed: ${error.message}`);
  }
}

main();
