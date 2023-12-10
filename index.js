const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const cors = require('cors');

//setting app
const app = express();
app.use(express.static(path.join(__dirname,"public")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
//end of seting app

//routing start
app.get("/RegistrationForm", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/RegistrationForm/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public/login.html"));
});
//routing end

//connecting to mongodb
const connect = mongoose.connect("mongodb://127.0.0.1:27017/SignUp");

//checking the database connection
connect
  .then(() => {
    console.log("Connected to the Database");
  })
  .catch(() => {
    console.log("Database Connection Failed");
  });

//Creating the Schema
const SignIn = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

//creating a model
const model = new mongoose.model("Users", SignIn, "Users");

//User Register
app.post("/RegistrationForm/signup", async (req, res) => {
  try {
    const user = await model.findOne({ email: req.body.email });

    if (user) {
      return res.send("User Exists");
    }
    const data = {
      name: req.body.name,
      email: req.body.email,
      password: await bcrypt.hash(req.body.password, 10),
    };

    await model.insertMany(data);

    res.sendFile(path.join(__dirname, "public/login.html"));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//User Login
app.post("/RegistrationForm/login", async (req, res) => {
  try {
    const user = await model.findOne({ email: req.body.email });

    if (!user) {
      return res.status(401).send(`<h1>No User Found</h1>`);
    }

    const passwordMatch = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (passwordMatch) {
      return res.status(200).send(`<h1>Login Successfull</h1>`);
    } else {
      return res.status(401).send(`<h1>Invalid Email or Password</h1>`);
    }
  } catch (error) {
    res.status(404).send("Servor Error", error);
  }
});

app.listen(5000, () => {
  console.log("Server Listening on PORT 5000...");
});
