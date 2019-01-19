module.exports = {
  apps : [{
    name: 'API',
    script: './index.js',

    // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
    args: '',
    instances: 'max',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }],

  deploy : {
    production : {
      user : 'root',  // SSH user
      host : '120.25.205.187',
      ref  : 'origin/master',
      repo : 'git@github.com:yewenhua/koa2_frame.git', // Github上的仓库地址
      path : '/home/cat/koa2',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production'
    }
  }
};
