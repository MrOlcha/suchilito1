module.exports = {
  apps: [
    {
      name: 'mazuhi-web',
      script: './node_modules/.bin/next',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        NEXT_PUBLIC_API_URL: 'http://localhost:3000/pos'
      },
      cwd: '/var/www/mazuhi-web'
    }
  ]
};
