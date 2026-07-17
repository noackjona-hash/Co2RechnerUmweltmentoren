const { Client } = require('ssh2');
const conn = new Client();

const command = process.argv.slice(2).join(' ');
if (!command) {
  console.error("Usage: node ssh_run.js <command>");
  process.exit(1);
}

conn.on('ready', () => {
  conn.exec(command, { pty: true }, (err, stream) => {
    if (err) {
      console.error(err);
      conn.end();
      process.exit(1);
    }
    
    stream.on('close', (code, signal) => {
      conn.end();
      process.exit(code || 0);
    });
    
    stream.on('data', (data) => {
      const output = data.toString();
      process.stdout.write(output);
      
      // Auto-respond to sudo password prompts
      if (output.includes('[sudo] password for') || output.toLowerCase().includes('password')) {
        stream.write('jonajona\n');
      }
    });
    
    stream.stderr.on('data', (data) => {
      const output = data.toString();
      process.stderr.write(output);
      
      // Auto-respond to sudo password prompts
      if (output.includes('[sudo] password for') || output.toLowerCase().includes('password')) {
        stream.write('jonajona\n');
      }
    });
  });
}).on('error', (err) => {
  console.error('SSH Connection error:', err);
  process.exit(1);
}).connect({
  host: '192.168.178.52',
  port: 22,
  username: 'jona',
  password: 'jonajona'
});
