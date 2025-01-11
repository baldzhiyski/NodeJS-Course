const EventEmitter = require("events");
const http = require("http");

class Sales extends EventEmitter {
  constructor() {
    super();
  }
}

const myEmitter = new Sales();

myEmitter.on("newSale", (num) => {
  console.log(`There was a new sale with the following number - ${num}`);
});

myEmitter.emit("newSale", 9); // Trigger the event

// HTTP server setup
const server = http.createServer();

server.on("request", (req, res) => {
  console.log("Request received!");
  res.end("Request received"); // Only end the response once.
});

server.on("close", () => {
  console.log("Server closed");
});

server.listen(8000, "127.0.0.1", () => {
  console.log("Server started");
});
