const { Client } = require('ssh2');
const conn = new Client();

const localPath = process.argv[2];
const remotePath = process.argv[3];
if (!localPath || !remotePath) {
  console.error("Usage: node ssh_upload.js <localPath> <remotePath>");
  process.exit(1);
}

conn.on('ready', () => {
  conn.sftp((err, sftp) => {
    if (err) {
      console.error(err);
      conn.end();
      process.exit(1);
    }
    
    sftp.fastPut(localPath, remotePath, (err) => {
      if (err) {
        console.error(err);
        conn.end();
        process.exit(1);
      }
      console.log(`Uploaded ${localPath} to ${remotePath}`);
      conn.end();
      process.exit(0);
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
