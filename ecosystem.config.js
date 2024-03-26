module.exports = {
  apps: [
    {
      name: "cyclists_of_msn",
      script: "node",
      args: "dist/server.js",
      log_date_format: "YYYY-MM-DD HH:mm Z",
    },
  ],
};
