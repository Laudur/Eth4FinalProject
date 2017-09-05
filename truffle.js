var DefaultBuilder = require("truffle-default-builder");

module.exports = {
  build: new DefaultBuilder({
    "index.html": "index.html",
    "app.js": [
      "javascripts/app.js"
	],
    "fundingHub.js": [
      "javascripts/angular.js",
      "javascripts/utils.js",
      "javascripts/fundingHubController.js",
      "javascripts/_vendor/lightwallet.js",
      "javascripts/_vendor/hooked-web3-provider.js"
	],
    "app.css": [
      "stylesheets/app.css"
    ]
  }),
  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "13",
      gas: 2000000
    }
  }
};
