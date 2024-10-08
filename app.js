var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

// var indexRouter = require("./routes/index");
// var usersRouter = require("./routes/users");
var saveRouter = require("./routes/save");

var app = express();
// const bodyParser = require("body-parser");
const cors = require("cors");

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(
  cors({
    origin: [
      "*",
      "http://localhost:3000/",
      "http://192.168.0.137:3000",
      "http://43.201.46.209",
      "http://192.168.0.161:3000"
    ],
    methods: "GET, POST, PUT, DELETE",
    credentials: true
  })
);

// app.use("/", indexRouter);
// app.use("/users", usersRouter);
app.use("/save", saveRouter);
// app.use("/images", express.static("C:/aaa/images"));
// app.use("/images", express.static("/home/ec2-user/selectedimg"));

app.get("/", function (req, res) {
  res.send("test server on");
});

app.listen(8081, () => {
  console.log("Server is listening...");
});

// // catch 404 and forward to error handler
// app.use(function (req, res, next) {
//   next(createError(404));
// });

// // error handler
// app.use(function (err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get("env") === "development" ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render("error");
// });

module.exports = app;
