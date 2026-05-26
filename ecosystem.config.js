module.exports = {
  apps : [{
    name: "audit-backend",         // PM2 дээр харагдах апп-ын нэр
    script: './server.js',          // Чиний гол асаадаг файл 'server.js' тул ингэж өөрчилнө
    watch: true,                    // Код өөрчлөгдөх бүрт автоматаар рестарт хийнэ
    ignore_watch: ["node_modules", "logs"], 
    env: {
      NODE_ENV: "development",
      PORT: 3000
    }
  }],
  deploy : {
    production : {
      user : 'SSH_USERNAME',
      host : 'SSH_HOSTMACHINE',
      ref  : 'origin/master',
      repo : 'GIT_REPOSITORY',
      path : 'DESTINATION_PATH',
      'pre-deploy-local': '',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};