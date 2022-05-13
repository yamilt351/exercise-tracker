const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const { Schema } = require("mongoose");
const bodyParser = require("body-parser");
require("dotenv").config();

const mongo = process.env["MONGO_URL"];
mongoose.connect(mongo);

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  log: [
    {
      date: String,
      duration: Number,
      description: String,
    },
  ],
  count: Number,
});
const User = mongoose.model("User", userSchema);

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app
  .route("/api/users")
  .post((req, res) => {
    const username = req.body.username;
    const user = new User({ username, count: 0 });
    user.save((err, data) => {
      if (err) {
        res.json({ error: err });
      }
      res.json(data);
    });
  })
  .get((req, res) => {
    User.find((err, data) => {
      if (data) {
        res.json(data);
      }
    });
  });
// exercises
app.post("/api/users/:_id/exercises", (req, res) => {
  const { description } = req.body;
  const duration = parseInt(req.body.duration);
  const date = req.body.date ? "Mon Jan 01 1990" : "Tue May 10 2022";
  const id = req.params._id;

  const exercise = {
    date,
    duration,
    description,
  };

  User.findByIdAndUpdate(
    id,
    {
      $push: { log: exercise },
      $inc: { count: 1 },
    },
    { new: true },
    (err, user) => {
      if (user) {
        const updatedExercise = {
          _id: id,
          username: user.username,
          ...exercise,
        };
        console.log(updatedExercise);
        res.json(updatedExercise);
      }
    }
  );
});

app.get("/api/users/:_id/logs", (req, res) => {
  const { from, to, limit } = req.query;

  User.findById(req.params._id, (err, user) => {
    if (user) {
      if (from || to || limit) {
        const logs = user.log;
        console.log(logs);
        const filteredLogs = logs.filter((log) => {
          const formattedLog = new Date(log.date).toDateString().split("T")[0];
          return true;
        });
        console.log(filteredLogs);
        const slicedLogs = limit ? filteredLogs.slice(0, limit) : filteredLogs;
        user.log = slicedLogs;
        console.log(slicedLogs);
      }
      res.json(user);
    }
  });
});

//
//
//

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
