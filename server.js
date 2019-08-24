//use express
const express = require("express");
const server = express();
server.use(express.json());

// use helmet
const helmet = require('helmet')
server.use(helmet());
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

//--
// register new user
server.post("/api/register", async (req, res) => {
  const userInfo = req.body;
  // console.log(userInfo);

  //generate the hash
  const hash = bcrypt.hashSync(userInfo.password, 2);

  //set the userpassword to our new hashed value
  userInfo.password = hash;
  console.log(hash)
  
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
//--
// server.post("/api/register", async (req, res) => {
//   const userInfo = req.body;
//   // console.log(userInfo);
//   const hash = bcrypt.hashSync(userInfo.password, 13);

//   userInfo.password = hash;
//   console.log(userInfo);
//   try {
//     if(userInfo){
//       const newUser = await db.addUser(userInfo);

//       if(newUser){
//         res.status(201).json(newUser)
//       } else {
//         res.status(400).json({
//           message: "Error Adding the User to the database"
//         });
//       }
//     }
//   } catch (err) {
//     res.status(500).json({
//       message: "Error"
//     });
// }})
//--

//authenticate and log in existing user
server.post("/api/login", (req, res) => {
  //destructure username and password
  let { username, password } = req.body;

  //use findby method in model to username from req.body
  db.findBy({ username })
  .first()
  .then(user => {
    //compare the hashed password in the database against the incoming password
    if (user && bcrypt.compareSync(password, user.password)) {
      res.status(200).json({ message: `Welcome ${user.username}!` })
    } else {
      res.status(401).json({ message: `new phone who this` })
    }
  })
  .catch(error => {
    res.status(500).json(error)
  })
})


//get all users
server.get("/api/users", verify, async (req,res) => {
  const users = await db.getUsers();

  if (users){
    res.status(200).json(users);
  } else {
    res.status(400).json({message: "Error retrieving list of users"})
  }
  
})

//logger middleware
function logger(req, res, next) {
  console.log(
    `Method: ${req.method}, url: ${
      req.url
    }, timestamp: [${new Date().toISOString()}]`
  );
  next();
}

//verification middleware
//note: verification middleware should be in its own folder in ./auth/ directory

function verify(req, res, next){
  //get user information from headers
  const { username,  password} = req.headers
  //use findby method in model to username from req.body
  if (username && password) {
    db.findBy({ username })
    .first()
    .then(user => {
      //compare the hashed password in the database against the incoming password
      if (user && bcrypt.compareSync(password, user.password)) {
        next(); //if condition is met call next function in stack
      } else {
        res.status(401).json({ message: `Invalid Credentials` })
      }
    })
    .catch(error => {
      res.status(500).json(error)
})} else {
  res.status(400).json({ message: 'Please provide valid credentials'})
}}

module.exports = server;
