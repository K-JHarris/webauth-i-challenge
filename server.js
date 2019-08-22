//use express
const express = require("express");
const server = express();
server.use(express.json());
//use my middleware
server.use(logger);
//use my routes

//use my helpers
const db = require("./userModel");

//nice confirmation message that this is actually running
server.get("/", (req, res) => {
  res.send(`
    I bet you thought I wouldn't work: Authentication Edition
  `);
});

//the actual code for the project
//use bcrypt
const bcrypt = require('bcryptjs');

//register new user
server.post("/api/register", async (req, res) => {
  const userInfo = req.body;
  // console.log(userInfo);
  const hash = bcrypt.hashSync(userInfo.password, 13);

  userInfo.password = hash;
  console.log(userInfo);
  try {
    if(userInfo){
      const newUser = await db.addUser(userInfo);

      if(newUser){
        res.status(201).json(newUser)
      } else {
        res.status(400).json({
          message: "Error Adding the User to the database"
        });
      }
    }
  } catch (err) {
    res.status(500).json({
      message: "Error"
    });
}})

//custom middleware
function logger(req, res, next) {
  console.log(
    `Method: ${req.method}, url: ${
      req.url
    }, timestamp: [${new Date().toISOString()}]`
  );
  next();
}

module.exports = server;
