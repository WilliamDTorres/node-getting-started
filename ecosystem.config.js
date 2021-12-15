module.exports = {
  apps: [{
    name: "app",
    script: "./index.js",
    instances: "2",
    env: {
      NODE_ENV: "development",
    },
    env_production: {
      NODE_ENV: "production",
    }
  }]
}