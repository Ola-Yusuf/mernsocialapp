const express = require("express");
const mongoose = require("mongoose");

const users = require("./routes/api/user");
const profile = require("./routes/api/profile");
const posts = require("./routes/api/post");

const app = express();

//DB Config
const db = require("./config/keys").mongoURL;

//connect to mongoDb
mongoose
  .connect(db, { useNewUrlParser: true })
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

app.get("/", (req, res) => res.send("hello me you guys"));

//Use Routers
app.use("api/users", users);
app.use("api/profile", profile);
app.use("api/posts", posts);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server runing on port ${port}`));
