const express = require("express");
const app = express();
const taskRouter = require("./routes/taskRoutes");

// middleware
app.use(express.json());

const baseUrl = "/api/v1";

app.use(`${baseUrl}/tasks`, taskRouter);

module.exports = app;
