const fs = require("fs");
const path = require("path");
const proxy = require("http-proxy-middleware");
const yml = require('require-yml')
const axios = require("axios");
const configDebugPath = path.resolve(__dirname, "./debug/proxy.yml");
console.log(configDebugPath,'configDebugPath')
const routers = {};
const proxyRouters = {};
function addFetchProxy(app, server) {
  try {
		const proxys = yml(configDebugPath);
		console.log(proxys,'configDebugPathProxys')
    Object.keys(proxys).forEach(key => {
      proxyRouters[key] = proxy(proxys[key]);
      if (routers[key]) return;
      app.use(key, function (req, rsp) {
        return proxyRouters[key](req, rsp);
      });
    });
  } catch (e) {
    console.error("proxy config error.", e);
  }
}

/** dev-server after */
module.exports.before = function (app, server) {
  // 
  app.use("/config.js", function (req, res) {
    res.end(fs.readFileSync(path.resolve(__dirname, './debug/config.js'), { encoding: "utf8" }));
  });

  fs.watch(configDebugPath, { encoding: "utf8" }, function (event, filename) {
    addFetchProxy(app, server)
  });
  addFetchProxy(app, server);
};