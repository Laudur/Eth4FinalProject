module.exports = {
  build: {
    "index.html": "index.html",
    "app.js": [
      "javascripts/app.js"
    ],
    "fundingHub.js": [
      "javascripts/angular.js",
      "javascripts/utils.js",
      "javascripts/fundingHubController.js"
	],
    "app.css": [
      "stylesheets/app.css"
    ],
    "images/": "images/"
  },
  rpc: {
    host: "localhost",
    port: 8545
  }
};
