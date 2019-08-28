//use express
const express = require("express");
const server = express();
server.use(express.json());
// use helmet
const helmet = require('helmet')
server.use(helmet());
//use my middleware
server.use(logger);
//use my helpers
const db = require("./userModel");

//nice confirmation message that this is actually running
server.get("/", (req, res) => {
  res.send(`
    I bet you thought I wouldn't work: Authentication Edition
  `);
});

//the actual code for the project
//declare sessionConfig
const sessionConfig = {
  name: 'Shieda', //defaults to sid, provide name for security
  secret: 'Rhaast', // ?
  cookie: {
    maxAge: 1000 * 60, //set how long cookie is valid for in ms
    secure: false, //true in production
    httpOnly: true, //always set this to true, denies js access to cookie
  },
  resave: false, //do we want to recreate a session if the session hasnt changed
  saveUninitialized: false, //ALWAYS FALSE BY DEFAULT: GDPR Laws against setting cookies auotmatically, require user consent
};


//use session
const session = require('express-session');
server.use(session(sessionConfig));

//use bcrypt
const bcrypt = require('bcryptjs');

// register new user
server.post("/api/register", async (req, res) => {
  const userInfo = req.body;
  //generate the hash
  const hash = bcrypt.hashSync(userInfo.password, 12);
  //set the userpassword to our new hashed value
  userInfo.password = hash;
  
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
      req.session.user = user; //saves the user information to the session in a cookie
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
  //use findby method in model to get username from req.body
  if (req.session && req.session.user) {
   next();
} else {
  res.status(400).json({ message: 'Please provide valid credentials'})
}}

module.exports = server;
