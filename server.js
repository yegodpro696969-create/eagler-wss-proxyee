const http = require("http");
const httpProxy = require("http-proxy");

const PORT = process.env.PORT || 10000;
const TARGET = "http://eu11-free.falixserver.net:25957";

const proxy = httpProxy.createProxyServer({
  target: TARGET,
  ws: true,
  changeOrigin: true,
  xfwd: true
});

proxy.on("error", (err, req, socket) => {
  console.error("Proxy error:", err.message);

  if (socket && !socket.destroyed) {
    socket.destroy();
  }
});

const server = http.createServer((req, res) => {
  console.log("HTTP request:", req.method, req.url);

  if (req.url === "/") {
    res.writeHead(200, {
      "Content-Type": "text/plain"
    });

    res.end("Eagler WSS proxy is running");
    return;
  }

  proxy.web(req, res);
});

server.on("upgrade", (req, socket, head) => {
  console.log("WebSocket connection:", req.url);
  console.log("WebSocket headers:", req.headers);

  proxy.ws(req, socket, head);
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Proxy listening on port ${PORT}`);
  console.log(`Forwarding to ${TARGET}`);
});
