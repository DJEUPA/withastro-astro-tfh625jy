module.exports = {
  apps: [
    {
      name: 'wfa-partners',
      script: './dist/server/entry.mjs',
      cwd: '/var/www/wfa-partners',
      env: {
        NODE_ENV: 'production',
        HOST: '127.0.0.1',
        PORT: '4321',
      },
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '512M',
      error_file: '/var/www/wfa-partners/logs/error.log',
      out_file: '/var/www/wfa-partners/logs/output.log',
    },
  ],
};
