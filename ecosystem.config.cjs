module.exports = {
  apps: [
    {
      name: 'wfa-partners',
      cwd: '/var/www/fwa-partners', 
      script: './dist/server/entry.mjs',
      env: {
        NODE_ENV: 'production',
        HOST: '127.0.0.1',
        PORT: '3000',
      },
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '512M',
      error_file: '/home/deploiment/wfa-partners/logs/error.log',
      out_file: '/home/deploiment/wfa-partners/logs/output.log',
    },
  ],
};
