const express = require("express");
const app = express();
const COnnectToDB = require("./config/COnnectToDB");
const registerRouter = require("./routes/authRout");
const usersRouter = require("./routes/usersRoute");
const postsRouter = require("./routes/postsRoute");
const commentsRouter = require("./routes/commentRoute");
const categoryRoute = require("./routes/categoryRoute");
const { errorHandler, notFound } = require("./middlewares/error");

require("dotenv").config();
COnnectToDB();

app.use(express.json());

app.use("/api/auth", registerRouter);
app.use("/api/users", usersRouter);
app.use("/api/posts", postsRouter);
app.use("/api/comments", commentsRouter);
app.use("/api/category", categoryRoute);

// Error Handler Middleware
app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(
    `http://localhost:${port}`,
    `Running Server in ${process.env.NODE_ENV}`
  );
});
