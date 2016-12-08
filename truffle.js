module.exports = {
  build: {
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
  },
  rpc: {
    host: "localhost",
    port: 8545
  }
};
