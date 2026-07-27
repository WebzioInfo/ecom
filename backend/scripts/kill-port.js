const { execSync } = require('child_process');

const port = process.env.PORT || 4000;

function killPort(targetPort) {
  try {
    if (process.platform === 'win32') {
      const output = execSync(`netstat -ano | findstr :${targetPort}`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
      const lines = output.trim().split('\n');
      const pids = new Set();

      lines.forEach((line) => {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && pid !== '0' && pid !== process.pid.toString()) {
          pids.add(pid);
        }
      });

      pids.forEach((pid) => {
        try {
          execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
          console.log(`[kill-port] Terminated process PID ${pid} listening on port ${targetPort}`);
        } catch {
          // Process already terminated
        }
      });
    } else {
      execSync(`fuser -k ${targetPort}/tcp`, { stdio: 'ignore' });
      console.log(`[kill-port] Cleared port ${targetPort}`);
    }
  } catch {
    // Port was not in use
  }
}

killPort(port);
