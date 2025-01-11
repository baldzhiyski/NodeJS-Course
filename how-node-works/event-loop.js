const fs = require("fs");
const crypto = require("crypto");
const start = Date.now();

// Schedule a timer with a delay of 0 milliseconds
setTimeout(() => console.log("Timer 1 finished"), 0);
// This timer will be queued in the timers phase and will execute after the I/O callbacks and immediate callbacks.

// Schedule an immediate callback to be executed after the I/O events phase
setImmediate(() => console.log("Immediate 1 finished"));
// setImmediate is executed in the check phase of the event loop, after I/O callbacks but before timers with a 0ms delay.

// Asynchronously read a file, simulating an I/O operation
fs.readFile("test-file.txt", () => {
  console.log("I/O finished"); // This logs when the I/O operation finishes, entering the I/O callbacks phase.

  // Schedule another timer with a delay of 0 milliseconds
  setTimeout(() => console.log("Timer 2 finished"), 0);
  // This will execute in the next timers phase, after I/O callbacks.

  // Schedule a timer with a delay of 3000 milliseconds
  setTimeout(() => console.log("Timer 3 finished"), 3000);
  // This timer is scheduled for a much later time (3 seconds later).

  // Schedule another immediate callback
  setImmediate(() => console.log("Immediate 2 finished"));
  // This will execute in the same check phase, after all I/O callbacks have been processed.

  // Perform a CPU-intensive password encryption using crypto
  crypto.pbkdf2("password", "salt", 10000, 1024, "sha512", () => {
    console.log(Date.now() - start, "Password encrypted");
    // This callback will be executed once the password encryption is complete.
    // This task is CPU-intensive and handled by the thread pool, not directly by the event loop.
  });
});

// Log a message from the top-level code
console.log("Hello from the top-level code !");
// This is logged first, as it is part of the synchronous code executed immediately.
