const fs = require("fs");
const server = require("http").createServer();

server.on("request", (req, res) => {
  // Solution 1: Using fs.readFile() (Callback-based)

  // `fs.readFile()` reads the entire file into memory before sending the response.
  // This can be inefficient if the file is large as it blocks the event loop until the entire file is read.
  // After reading the entire file, it is sent to the client as a whole.

  // fs.readFile("test-file.txt", (err, data) => {
  //   if (err) {
  //     console.log(err);
  //   }
  //   res.end(data);  // This sends the entire file content as a response after it's fully read.
  // });

  // Solution 2: Using Streams (Streaming Data)

  // Streams allow us to read the file in chunks, instead of reading the entire file into memory.
  // This makes it much more memory-efficient, especially for large files, because only small chunks are loaded into memory at a time.
  // The data is sent as it is read, without blocking the event loop.

  //   const readable = fs.createReadStream("test213-file.txt");

  //   // `data` event is triggered whenever a chunk of data is available from the stream.
  //   // Here, we are sending chunks of the file to the client immediately as they are read.
  //   // This prevents the server from waiting until the entire file is read before sending the response.

  //   readable.on("data", (chunk) => {
  //     res.write(chunk); // Sends each chunk to the client as it is read.
  //   });
  //   readable.on("end", () => {
  //     res.end();
  //   });
  //   readable.on("error", (err) => {
  //     res.statusCode = 500;
  //     res.end("File not found !");
  //   });

  // Solution 3
  // We need readable source and then we pipe it to writable destination
  // This approach handles backpressure automatically for you.
  // The `pipe()` method is a convenient way to connect a readable stream to a writable stream
  // without manually managing the 'data', 'end', and 'error' events.
  // It also manages backpressure internally, so the readable stream will be paused
  // if the writable stream (`res`) cannot handle the data quickly enough.
  const readable = fs.createReadStream("test-file.txt");
  readable.pipe(res);

  // Note: The use of streams means the event loop is not blocked, and the server can handle other requests concurrently.
});

server.listen(8000, "127.0.0.1", () => {
  console.log("Listening...");
});
