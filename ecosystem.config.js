module.exports = {
  apps: [
    {
      name: "cyclists_of_msn",
      script: "node_modules/.bin/ts-node",
      args: "src/server.ts",
      log_date_format: "YYYY-MM-DD HH:mm Z"
    },
  ],
};