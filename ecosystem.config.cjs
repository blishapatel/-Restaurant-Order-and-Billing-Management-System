module.exports = {
  apps: [{
    name: 'grand-table-server',
    cwd: './backend',
    script: 'server.js',
    env: {
      NODE_ENV: 'production',
    },
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
  }]
};
