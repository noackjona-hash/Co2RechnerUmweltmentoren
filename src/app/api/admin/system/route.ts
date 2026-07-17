import { NextResponse } from 'next/server';
import os from 'os';
import { execSync } from 'child_process';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'super-admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    // RAM details
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    // CPU details
    const cpus = os.cpus();
    const cpuModel = cpus.length > 0 ? cpus[0].model : 'Unknown';
    const cpuCores = cpus.length;
    const loadAvg = os.loadavg();

    // Server Uptime
    const uptimeSeconds = os.uptime();
    const uptimeDays = Math.floor(uptimeSeconds / (3600 * 24));
    const uptimeHours = Math.floor((uptimeSeconds % (3600 * 24)) / 3600);
    const uptimeMins = Math.floor((uptimeSeconds % 3600) / 60);
    const uptimeStr = `${uptimeDays}d ${uptimeHours}h ${uptimeMins}m`;

    // Disk details (Linux only, fallback for safety)
    let diskUsage = { total: 'N/A', used: 'N/A', free: 'N/A', percent: '0%' };
    try {
      const dfOutput = execSync('df -h /').toString().trim().split('\n');
      if (dfOutput.length > 1) {
        const parts = dfOutput[1].split(/\s+/);
        diskUsage = {
          total: parts[1],
          used: parts[2],
          free: parts[3],
          percent: parts[4],
        };
      }
    } catch {
      // fallback
    }

    return NextResponse.json({
      uptime: uptimeStr,
      ram: {
        total: (totalMem / (1024 * 1024 * 1024)).toFixed(1) + ' GB',
        used: (usedMem / (1024 * 1024 * 1024)).toFixed(1) + ' GB',
        free: (freeMem / (1024 * 1024 * 1024)).toFixed(1) + ' GB',
        percent: ((usedMem / totalMem) * 100).toFixed(0) + '%',
      },
      cpu: {
        model: cpuModel,
        cores: cpuCores,
        load1m: loadAvg[0].toFixed(2),
        load5m: loadAvg[1].toFixed(2),
        load15m: loadAvg[2].toFixed(2),
      },
      disk: diskUsage,
      platform: os.platform(),
      arch: os.arch(),
    });
  } catch (error) {
    console.error('System stats error:', error);
    return NextResponse.json({ error: 'Fehler beim Abrufen der Systemdaten.' }, { status: 500 });
  }
}
