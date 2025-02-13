const express = require("express");
const path = require("path");
const app = express();
const taskRouter = require("./routes/taskRoutes");
const errorController = require("./controllers/errorController");
const xss = require("xss-clean");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");

// middleware
app.use(express.json());

const baseUrl = "/api/v1";
// Static file middleware
app.use(express.static(path.join(__dirname, "public")));

app.use(`${baseUrl}/tasks`, taskRouter);

// Parses data from cookies
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization aginst XSS .
app.use(xss());

// Prevent param polutions
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsQuantity",
      "ratingsAverage",
      "maxGroupSize",
      "difficulty",
      "price",
    ],
  })
);

app.use(compression());

// Limit requests
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP , please try again in an hour !",
});

app.use("/api", limiter);
app.use(errorController);
module.exports = app;
