var express = require("express");
var proxy = require("http-proxy-middleware");
var history = require("connect-history-api-fallback");
var compression = require("compression");
var path = require("path");

var app = express();
app.set("trust proxy", "loopback");
app.use(compression());
app.use(history());
app.use("/*-api", proxy({ target: "http://192.168.2.30/", changeOrigin: false }));
app.use("/mqtt", proxy({ target: "ws://192.168.2.30:8083", changeOrigin: false, ws: true }));

// const h5 = express.static(__dirname + "/deploy/h5");
const pc = express.static(path.resolve(__dirname, "../dist/"));
app.use("/", function(req, res, next) {
  // if (req.headers["user-agent"].match(/(iPhone|iPad|android|ios)/i)) {
  //   return h5(req, res, next);
  // }
  return pc(req, res, next);
});

app.listen(82);
