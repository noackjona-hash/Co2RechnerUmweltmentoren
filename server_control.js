const http = require('http');
const { exec } = require('child_process');
const os = require('os');
const fs = require('fs');

const PORT = 9000;
const HOST = '0.0.0.0';

// Global state for CPU cache
let cpuUsagePercent = 0;

// Helper to calculate CPU usage over a short interval
function getCpuUsageTicks() {
  const cpus = os.cpus();
  let totalIdle = 0, totalTick = 0;
  cpus.forEach(cpu => {
    for (const type in cpu.times) {
      totalTick += cpu.times[type];
    }
    totalIdle += cpu.times.idle;
  });
  return { idle: totalIdle, total: totalTick };
}

let lastCpuTicks = getCpuUsageTicks();

setInterval(() => {
  const currentCpuTicks = getCpuUsageTicks();
  const idleDiff = currentCpuTicks.idle - lastCpuTicks.idle;
  const totalDiff = currentCpuTicks.total - lastCpuTicks.total;
  
  if (totalDiff > 0) {
    cpuUsagePercent = 100 - Math.round((100 * idleDiff) / totalDiff);
  }
  lastCpuTicks = currentCpuTicks;
}, 2000);

// Helper to run shell commands safely and return promise
function runCommand(cmd) {
  return new Promise((resolve) => {
    exec(cmd, { timeout: 8000 }, (err, stdout, stderr) => {
      resolve({
        success: !err,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        error: err ? err.message : null
      });
    });
  });
}

// Helper to get active ngrok public URL
async function getNgrokUrl() {
  const result = await runCommand("curl -s http://127.0.0.1:4040/api/tunnels");
  if (result.success) {
    try {
      const data = JSON.parse(result.stdout);
      if (data.tunnels && data.tunnels.length > 0) {
        return data.tunnels[0].public_url;
      }
    } catch (e) {
      // ignore
    }
  }
  return 'Inaktiv';
}

// Request Handler
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  
  // Allow requests from localhost and local network subnets
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // 1. API: Get Status Metrics
  if (url.pathname === '/api/status' && req.method === 'GET') {
    // Disk info
    const diskResult = await runCommand("df -h / | tail -n 1");
    let diskSize = 'N/A', diskUsed = 'N/A', diskAvail = 'N/A', diskPercent = '0%';
    if (diskResult.success) {
      const parts = diskResult.stdout.split(/\s+/);
      if (parts.length >= 5) {
        diskSize = parts[1];
        diskUsed = parts[2];
        diskAvail = parts[3];
        diskPercent = parts[4];
      }
    }

    // Check service active statuses
    const nginxActive = await runCommand("systemctl is-active nginx");
    const pgActive = await runCommand("systemctl is-active postgresql");
    const fail2banActive = await runCommand("systemctl is-active fail2ban");
    const pm2List = await runCommand("pm2 jlist");

    let pm2Active = false;
    let pm2Mem = 'N/A';
    let pm2Cpu = 'N/A';
    let ngrokActive = false;
    let ngrokMem = 'N/A';
    let ngrokCpu = 'N/A';
    if (pm2List.success) {
      try {
        const list = JSON.parse(pm2List.stdout);
        const app = list.find(item => item.name === 'co2-rechner');
        if (app) {
          pm2Active = app.pm2_env.status === 'online';
          pm2Mem = (app.monit.memory / 1024 / 1024).toFixed(1) + ' MB';
          pm2Cpu = app.monit.cpu + '%';
        }
        const ngrokApp = list.find(item => item.name === 'ngrok-tunnel');
        if (ngrokApp) {
          ngrokActive = ngrokApp.pm2_env.status === 'online';
          ngrokMem = (ngrokApp.monit.memory / 1024 / 1024).toFixed(1) + ' MB';
          ngrokCpu = ngrokApp.monit.cpu + '%';
        }
      } catch (e) {
        // ignore JSON parse errors
      }
    }

    // RAM Metrics
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const ramPercent = Math.round((usedMem / totalMem) * 100);

    const metrics = {
      cpu: cpuUsagePercent,
      ram: {
        total: (totalMem / 1024 / 1024 / 1024).toFixed(1) + ' GB',
        used: (usedMem / 1024 / 1024 / 1024).toFixed(1) + ' GB',
        percent: ramPercent
      },
      disk: {
        size: diskSize,
        used: diskUsed,
        avail: diskAvail,
        percent: parseInt(diskPercent) || 0
      },
      uptime: Math.round(os.uptime()),
      services: {
        nginx: nginxActive.stdout === 'active',
        postgresql: pgActive.stdout === 'active',
        fail2ban: fail2banActive.stdout === 'active',
        co2rechner: pm2Active,
        co2rechnerMonit: { mem: pm2Mem, cpu: pm2Cpu },
        ngrok: ngrokActive,
        ngrokMonit: { mem: ngrokMem, cpu: ngrokCpu },
        ngrokUrl: await getNgrokUrl()
      }
    };

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(metrics));
    return;
  }

  // 2. API: Control Services
  if (url.pathname === '/api/service' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const { service, action } = JSON.parse(body);
        
        if (!['nginx', 'postgresql', 'fail2ban', 'co2-rechner', 'ngrok-tunnel'].includes(service) || 
            !['start', 'stop', 'restart'].includes(action)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Ung├╝ltiger Service oder Aktion' }));
          return;
        }

        let cmd = '';
        if (service === 'co2-rechner' || service === 'ngrok-tunnel') {
          cmd = `pm2 ${action} ${service}`;
        } else {
          cmd = `sudo systemctl ${action} ${service}`;
        }

        const result = await runCommand(cmd);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Ung├╝ltiges JSON Payload' }));
      }
    });
    return;
  }

  // 3. API: Run System Commands
  if (url.pathname === '/api/command' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const { command } = JSON.parse(body);
        if (!command) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Befehl fehlt' }));
          return;
        }

        const result = await runCommand(command);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Ung├╝ltiges JSON Payload' }));
      }
    });
    return;
  }

  // 4. API: Get logs
  if (url.pathname === '/api/logs' && req.method === 'GET') {
    const logResult = await runCommand("pm2 logs co2-rechner --lines 50 --raw --no-colors");
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ logs: logResult.stdout }));
    return;
  }

  // 5. GUI HTML Frontend (Default Route)
  if (url.pathname === '/' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(htmlTemplate);
    return;
  }

  // Route not found
  res.writeHead(404);
  res.end('Not Found');
});

server.listen(PORT, HOST, () => {
  console.log(`Server Control Panel running at http://${HOST}:${PORT}/`);
});

// HTML Template containing CSS and JS
const htmlTemplate = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Server Control Panel - COÔéé Rechner</title>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-gradient: linear-gradient(135deg, #0b0f19 0%, #111827 100%);
      --card-bg: rgba(17, 24, 39, 0.7);
      --border-color: rgba(255, 255, 255, 0.08);
      --text-main: #f3f4f6;
      --text-muted: #9ca3af;
      --primary: #10b981;
      --primary-glow: rgba(16, 185, 129, 0.15);
      --secondary: #06b6d4;
    }
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: 'Outfit', sans-serif;
      background: var(--bg-gradient);
      color: var(--text-main);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow-x: hidden;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1.5rem;
      width: 100%;
    }
    
    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 2.5rem;
      padding-bottom: 1.5rem;
      border-b: 1px solid var(--border-color);
    }
    
    .logo-container {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    
    .logo-icon {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 0.75rem;
      background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 15px rgba(16, 185, 129, 0.25);
      font-size: 1.25rem;
    }
    
    .logo-text h1 {
      font-size: 1.25rem;
      font-weight: 700;
      letter-spacing: -0.025em;
    }
    
    .logo-text span {
      font-size: 0.75rem;
      color: var(--primary);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      display: block;
      margin-top: -2px;
    }
    
    .grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }
    
    @media (min-width: 768px) {
      .grid-3 {
        grid-template-columns: repeat(3, 1fr);
      }
      .grid-2 {
        grid-template-columns: 1fr 1fr;
      }
    }
    
    .card {
      background: var(--card-bg);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid var(--border-color);
      border-radius: 1.25rem;
      padding: 1.5rem;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .card:hover {
      border-color: rgba(16, 185, 129, 0.2);
      box-shadow: 0 12px 40px rgba(16, 185, 129, 0.05);
    }
    
    .card-title {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 1.25rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    
    /* Stats visualization */
    .metric-value {
      font-size: 2.25rem;
      font-weight: 800;
      background: linear-gradient(135deg, #ffffff 0%, #d1d5db 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 0.75rem;
    }
    
    .progress-bar-container {
      height: 0.5rem;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 999px;
      overflow: hidden;
      margin-bottom: 0.5rem;
    }
    
    .progress-bar {
      height: 100%;
      background: linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%);
      border-radius: 999px;
      width: 0%;
      transition: width 1s ease;
    }
    
    .progress-label {
      font-size: 0.75rem;
      color: var(--text-muted);
      display: flex;
      justify-content: space-between;
    }
    
    /* Services grid */
    .service-card {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 1rem;
      padding: 1.25rem;
      border: 1px solid var(--border-color);
      background: rgba(255, 255, 255, 0.02);
      border-radius: 1rem;
    }
    
    .service-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    
    .service-name {
      font-weight: 600;
      font-size: 0.95rem;
    }
    
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 0.25rem 0.625rem;
      border-radius: 999px;
      font-size: 0.675rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    
    .status-active {
      background: rgba(16, 185, 129, 0.1);
      color: #34d399;
    }
    
    .status-inactive {
      background: rgba(239, 68, 68, 0.1);
      color: #f87171;
    }
    
    .status-dot {
      width: 0.375rem;
      height: 0.375rem;
      border-radius: 50%;
      background: currentColor;
    }
    
    .btn-group {
      display: flex;
      gap: 0.5rem;
    }
    
    button {
      flex: 1;
      padding: 0.5rem 0.75rem;
      font-size: 0.75rem;
      font-weight: 600;
      border-radius: 0.625rem;
      border: 1px solid var(--border-color);
      background: rgba(255, 255, 255, 0.03);
      color: var(--text-main);
      cursor: pointer;
      transition: all 0.2s ease;
      font-family: inherit;
    }
    
    button:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.15);
    }
    
    button:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
    
    button.btn-restart {
      color: var(--secondary);
    }
    button.btn-restart:hover:not(:disabled) {
      background: rgba(6, 182, 212, 0.1);
      border-color: rgba(6, 182, 212, 0.3);
    }
    
    button.btn-stop {
      color: #f87171;
    }
    button.btn-stop:hover:not(:disabled) {
      background: rgba(239, 68, 68, 0.1);
      border-color: rgba(239, 68, 68, 0.3);
    }
    
    button.btn-start {
      color: var(--primary);
    }
    button.btn-start:hover:not(:disabled) {
      background: rgba(16, 185, 129, 0.1);
      border-color: rgba(16, 185, 129, 0.3);
    }
    
    /* Terminal Console */
    .console-input-container {
      display: flex;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }
    
    .console-input {
      flex: 1;
      background: rgba(0, 0, 0, 0.2);
      border: 1px solid var(--border-color);
      border-radius: 0.75rem;
      padding: 0.75rem 1rem;
      color: var(--text-main);
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.825rem;
      transition: all 0.2s ease;
    }
    
    .console-input:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 10px var(--primary-glow);
    }
    
    .btn-run {
      background: var(--primary);
      color: #0b0f19;
      font-weight: 700;
      padding: 0.75rem 1.5rem;
      border-radius: 0.75rem;
      font-size: 0.825rem;
      flex: 0 0 auto;
      border: none;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
    }
    
    .btn-run:hover {
      background: #34d399;
      transform: translateY(-1px);
    }
    
    .console-output {
      background: #05070c;
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 0.75rem;
      padding: 1rem;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.75rem;
      height: 200px;
      overflow-y: auto;
      white-space: pre-wrap;
      color: #a7f3d0;
    }
    
    /* Logs view */
    .logs-output {
      background: #05070c;
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 0.75rem;
      padding: 1rem;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.75rem;
      height: 300px;
      overflow-y: auto;
      white-space: pre-wrap;
      color: #d1d5db;
    }
    
    .btn-refresh {
      margin-bottom: 1rem;
      padding: 0.5rem 1rem;
      flex: 0 0 auto;
      width: auto;
    }
    
    footer {
      text-align: center;
      font-size: 0.75rem;
      color: var(--text-muted);
      padding: 2rem 0;
      border-t: 1px solid var(--border-color);
      margin-top: 2rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="logo-container">
        <div class="logo-icon">­ƒÆ╗</div>
        <div class="logo-text">
          <h1>Server-Verwaltung</h1>
          <span>Lokale Leitstelle</span>
        </div>
      </div>
      <div style="font-size: 0.825rem; font-weight: 500; color: var(--primary);">
        ­ƒƒó Verbunden mit 192.168.178.52
      </div>
    </header>

    <main>
      <!-- Row 1: Metrics -->
      <div class="grid grid-3">
        <!-- CPU Card -->
        <div class="card">
          <div class="card-title">
            <span>Prozessor (CPU)</span>
            <span>ÔÜí</span>
          </div>
          <div class="metric-value" id="cpu-val">0%</div>
          <div class="progress-bar-container">
            <div class="progress-bar" id="cpu-bar"></div>
          </div>
          <div class="progress-label">
            <span>Auslastung</span>
            <span>100%</span>
          </div>
        </div>

        <!-- RAM Card -->
        <div class="card">
          <div class="card-title">
            <span>Arbeitsspeicher (RAM)</span>
            <span>­ƒÆ¥</span>
          </div>
          <div class="metric-value" id="ram-val">0 / 0 GB</div>
          <div class="progress-bar-container">
            <div class="progress-bar" id="ram-bar"></div>
          </div>
          <div class="progress-label">
            <span>Verwendet</span>
            <span id="ram-percent">0%</span>
          </div>
        </div>

        <!-- Disk Card -->
        <div class="card">
          <div class="card-title">
            <span>Festplattenspeicher</span>
            <span>­ƒÆ¢</span>
          </div>
          <div class="metric-value" id="disk-val">0 / 0 GB</div>
          <div class="progress-bar-container">
            <div class="progress-bar" id="disk-bar"></div>
          </div>
          <div class="progress-label">
            <span>Verf├╝gbar: <span id="disk-avail" style="font-weight: 600;">0 GB</span></span>
            <span id="disk-percent">0%</span>
          </div>
        </div>
      </div>

      <!-- Row 2: Services & Commands -->
      <div class="grid grid-2">
        <!-- Services Controls -->
        <div class="card" style="display: flex; flex-direction: column; gap: 1rem;">
          <div class="card-title" style="margin-bottom: 0;">
            <span>System-Dienste</span>
            <span id="uptime-label" style="text-transform: none; font-size: 0.75rem; font-weight: 500; font-family: monospace;">Uptime: -</span>
          </div>
          
          <!-- PM2 Server app -->
          <div class="service-card">
            <div class="service-header">
              <span class="service-name">CO₂-Rechner Next.js App (PM2)</span>
              <span class="status-badge" id="co2-status"><span class="status-dot"></span>Laden</span>
            </div>
            <div style="font-size: 0.7rem; color: var(--text-muted); display: flex; gap: 1rem;" id="co2-monit">
              <span>RAM: -</span>
              <span>CPU: -</span>
            </div>
            <div class="btn-group">
              <button class="btn-restart" onclick="controlService('co2-rechner', 'restart')">Neustart</button>
              <button class="btn-stop" onclick="controlService('co2-rechner', 'stop')">Stoppen</button>
              <button class="btn-start" onclick="controlService('co2-rechner', 'start')">Starten</button>
            </div>
          </div>

          <!-- ngrok Internet-Tunnel -->
          <div class="service-card">
            <div class="service-header">
              <span class="service-name">ngrok Internet-Tunnel (PM2)</span>
              <span class="status-badge" id="ngrok-status"><span class="status-dot"></span>Laden</span>
            </div>
            <div style="font-size: 0.7rem; color: var(--text-muted); display: flex; flex-direction: column; gap: 0.25rem;">
              <div style="display: flex; gap: 1rem;" id="ngrok-monit">
                <span>RAM: -</span>
                <span>CPU: -</span>
              </div>
              <div>🔗 URL: <a id="ngrok-url" href="#" target="_blank" style="color: var(--secondary); text-decoration: underline; font-family: monospace;">Laden...</a></div>
            </div>
            <div class="btn-group">
              <button class="btn-restart" onclick="controlService('ngrok-tunnel', 'restart')">Neustart</button>
              <button class="btn-stop" onclick="controlService('ngrok-tunnel', 'stop')">Stoppen</button>
              <button class="btn-start" onclick="controlService('ngrok-tunnel', 'start')">Starten</button>
            </div>
          </div>

          <!-- Nginx webserver -->
          <div class="service-card">
            <div class="service-header">
              <span class="service-name">Nginx Webserver & Proxy</span>
              <span class="status-badge" id="nginx-status"><span class="status-dot"></span>Laden</span>
            </div>
            <div class="btn-group">
              <button class="btn-restart" onclick="controlService('nginx', 'restart')">Neustart</button>
              <button class="btn-stop" onclick="controlService('nginx', 'stop')">Stoppen</button>
              <button class="btn-start" onclick="controlService('nginx', 'start')">Starten</button>
            </div>
          </div>

          <!-- PostgreSQL database -->
          <div class="service-card">
            <div class="service-header">
              <span class="service-name">PostgreSQL Datenbank</span>
              <span class="status-badge" id="postgresql-status"><span class="status-dot"></span>Laden</span>
            </div>
            <div class="btn-group">
              <button class="btn-restart" onclick="controlService('postgresql', 'restart')">Neustart</button>
              <button class="btn-stop" onclick="controlService('postgresql', 'stop')">Stoppen</button>
              <button class="btn-start" onclick="controlService('postgresql', 'start')">Starten</button>
            </div>
          </div>

          <!-- Fail2ban service -->
          <div class="service-card">
            <div class="service-header">
              <span class="service-name">Fail2ban Brute-Force Schutz</span>
              <span class="status-badge" id="fail2ban-status"><span class="status-dot"></span>Laden</span>
            </div>
            <div class="btn-group">
              <button class="btn-restart" onclick="controlService('fail2ban', 'restart')">Neustart</button>
              <button class="btn-stop" onclick="controlService('fail2ban', 'stop')">Stoppen</button>
              <button class="btn-start" onclick="controlService('fail2ban', 'start')">Starten</button>
            </div>
          </div>
        </div>

        <!-- Terminal Terminal Console -->
        <div class="card" style="display: flex; flex-direction: column;">
          <div class="card-title">
            <span>Terminal Konsole</span>
            <span>­ƒÉÜ</span>
          </div>
          <form onsubmit="runShellCommand(event)" class="console-input-container">
            <input type="text" id="cmd-input" class="console-input" placeholder="z. B. pm2 list, free -m, ufw status..." autocomplete="off">
            <button type="submit" class="btn-run" id="btn-run-cmd">Ausf├╝hren</button>
          </form>
          <div class="console-output" id="cmd-output">Terminal bereit. Geben Sie einen Befehl oben ein...</div>
        </div>
      </div>

      <!-- PM2 Logs -->
      <div class="card" style="margin-top: 0;">
        <div class="card-title" style="margin-bottom: 0.5rem;">
          <span>PM2 Anwendungsprotokolle (COÔéé-Rechner Logs)</span>
          <span>­ƒôä</span>
        </div>
        <button class="btn-refresh" onclick="fetchLogs()" id="btn-refresh-logs">Logs aktualisieren</button>
        <div class="logs-output" id="logs-output">Lade Logs...</div>
      </div>
    </main>

    <footer>
      <p>Server Control Panel &bull; Umweltmentoren Projekt &bull; Lokaler Netzwerkbetrieb</p>
    </footer>
  </div>

  <script>
    // Format Uptime (seconds to DD:HH:MM:SS)
    function formatUptime(sec) {
      const days = Math.floor(sec / (3600*24));
      const hours = Math.floor((sec % (3600*24)) / 3600);
      const minutes = Math.floor((sec % 3600) / 60);
      const seconds = sec % 60;
      
      let res = '';
      if (days > 0) res += days + 'd ';
      res += String(hours).padStart(2, '0') + ':' + 
             String(minutes).padStart(2, '0') + ':' + 
             String(seconds).padStart(2, '0');
      return res;
    }

    // Fetch metrics
    async function updateStatus() {
      try {
        const res = await fetch('/api/status');
        if (!res.ok) throw new Error('Network error');
        const data = await res.json();
        
        // Update metrics
        document.getElementById('cpu-val').innerText = data.cpu + '%';
        document.getElementById('cpu-bar').style.width = data.cpu + '%';
        
        document.getElementById('ram-val').innerText = data.ram.used + ' / ' + data.ram.total;
        document.getElementById('ram-bar').style.width = data.ram.percent + '%';
        document.getElementById('ram-percent').innerText = data.ram.percent + '%';
        
        document.getElementById('disk-val').innerText = data.disk.used + ' / ' + data.disk.size;
        document.getElementById('disk-bar').style.width = data.disk.percent + '%';
        document.getElementById('disk-avail').innerText = data.disk.avail;
        document.getElementById('disk-percent').innerText = data.disk.percent + '%';
        
        document.getElementById('uptime-label').innerText = 'Uptime: ' + formatUptime(data.uptime);
        
        // Update Services Badge
        updateServiceBadge('nginx', data.services.nginx);
        updateServiceBadge('postgresql', data.services.postgresql);
        updateServiceBadge('fail2ban', data.services.fail2ban);
        updateServiceBadge('co2', data.services.co2rechner);
        updateServiceBadge('ngrok', data.services.ngrok);
        
        // PM2 App metrics
        if (data.services.co2rechner) {
          document.getElementById('co2-monit').innerText = 'RAM: ' + data.services.co2rechnerMonit.mem + ' | CPU: ' + data.services.co2rechnerMonit.cpu;
        } else {
          document.getElementById('co2-monit').innerText = 'Dienst ist inaktiv';
        }

        // ngrok metrics
        if (data.services.ngrok) {
          document.getElementById('ngrok-monit').innerText = 'RAM: ' + data.services.ngrokMonit.mem + ' | CPU: ' + data.services.ngrokMonit.cpu;
        } else {
          document.getElementById('ngrok-monit').innerText = 'Dienst ist inaktiv';
        }

        // ngrok URL
        const urlLink = document.getElementById('ngrok-url');
        if (data.services.ngrokUrl && data.services.ngrokUrl !== 'Inaktiv') {
          urlLink.href = data.services.ngrokUrl;
          urlLink.innerText = data.services.ngrokUrl;
        } else {
          urlLink.href = '#';
          urlLink.innerText = 'Inaktiv';
        }
      } catch (err) {
        console.error('Failed to update stats', err);
      }
    }

    function updateServiceBadge(id, isActive) {
      const badge = document.getElementById(id + '-status');
      if (isActive) {
        badge.className = 'status-badge status-active';
        badge.innerHTML = '<span class="status-dot"></span>Aktiv';
      } else {
        badge.className = 'status-badge status-inactive';
        badge.innerHTML = '<span class="status-dot"></span>Inaktiv';
      }
    }

    // Control Services
    async function controlService(service, action) {
      const confirmAction = confirm('M├Âchten Sie den Dienst "' + service + '" wirklich ' + (action === 'start' ? 'starten' : action === 'stop' ? 'stoppen' : 'neu starten') + '?');
      if (!confirmAction) return;

      try {
        const res = await fetch('/api/service', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ service, action })
        });
        const data = await res.json();
        
        if (data.success) {
          alert('Aktion erfolgreich ausgef├╝hrt.');
        } else {
          alert('Fehler: ' + (data.error || data.stderr));
        }
        await updateStatus();
      } catch (err) {
        alert('Verbindungsfehler.');
      }
    }

    // Run Command Console
    async function runShellCommand(e) {
      e.preventDefault();
      const input = document.getElementById('cmd-input');
      const output = document.getElementById('cmd-output');
      const btn = document.getElementById('btn-run-cmd');
      const command = input.value.trim();
      
      if (!command) return;
      
      btn.disabled = true;
      output.innerText = '$ ' + command + '\\nRunning...';
      
      try {
        const res = await fetch('/api/command', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ command })
        });
        const data = await res.json();
        
        let display = '$ ' + command + '\\n';
        if (data.stdout) display += data.stdout + '\\n';
        if (data.stderr) display += '[Fehlerausgabe]:\\n' + data.stderr + '\\n';
        if (data.error) display += '[Fehlermeldung]:\\n' + data.error;
        
        output.innerText = display;
      } catch (err) {
        output.innerText = '$ ' + command + '\\nVerbindungsfehler.';
      } finally {
        btn.disabled = false;
        output.scrollTop = output.scrollHeight;
      }
    }

    // Fetch Logs
    async function fetchLogs() {
      const output = document.getElementById('logs-output');
      const btn = document.getElementById('btn-refresh-logs');
      btn.disabled = true;
      output.innerText = 'Lade Protokolle...';
      
      try {
        const res = await fetch('/api/logs');
        const data = await res.json();
        output.innerText = data.logs || 'Keine Logs vorhanden.';
      } catch (err) {
        output.innerText = 'Verbindungsfehler beim Laden der Logs.';
      } finally {
        btn.disabled = false;
        output.scrollTop = output.scrollHeight;
      }
    }

    // Initial updates & loop
    updateStatus();
    fetchLogs();
    setInterval(updateStatus, 3000);
  </script>
</body>
</html>
`;
