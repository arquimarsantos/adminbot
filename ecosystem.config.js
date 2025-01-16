module.exports = {
  apps: [
    {
      name: "adminbot",
      script: "./index.js",
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: 8000,
      },
    },
  ],
};
