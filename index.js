// Import librairies
const express = require("express");
const path = require("path");
var cookieParser = require('cookie-parser');
var session = require('express-session');
const socketIo = require("socket.io");
const http = require("http");
// Import helpers
const database = require("./helpers/database")
const socketUtils = require("./helpers/socket")
// Import routes
const login = require('./routes/login')
const faq = require('./routes/faq')
const question = require('./routes/question')
// Improt Sendgrid api key


// Initialize servers
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Initialize database
const dbManager = database.getDatabaseManager();

// Sockets configurations
let socketsIntervals = {};

io.on("connection", socket => {
  console.log("New client connected");

  socket.on("Subscribe_questions",domain => {
    socketsIntervals[socket.id] = setInterval(
      () => socketUtils.getQuestionsAndEmit(dbManager,domain,socket), 1000);
  })

  socket.on("Subscribe_answers",faqId => {
    socketsIntervals[socket.id] = setInterval(
      () => socketUtils.getAnswersAndEmit(dbManager,faqId,socket), 1000);
  })

  socket.on("disconnect", socket => {
    console.log("Client disconnected");
    clearInterval(socketsIntervals[socket.id])
    delete socketsIntervals[socket.id]
  });
});

// Tables Creation
dbManager.db.run(database.sql_create, err => {
    if (err) return console.error(err.message);
    console.log("Successful creation of the 'faq' table");

    dbManager.db.run(database.answer_create, err => {
      if (err) return console.error(err.message);
      console.log("Successful creation of the 'answers' table");
    })
});

dbManager.db.run(database.user_create, err => {
  if (err) return console.error(err.message);
  console.log("Successful creation of the 'users' table");
});

dbManager.db.run(database.votes_create, err => {
  if (err) return console.error(err.message);
  console.log("Successful creation of the 'votes' table");
});



// App setting
app.set("db",dbManager)
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  key: 'user_sid',
  secret: 'somerandonstuffs',
  resave: false,
  saveUninitialized: false,
  cookie: {
      expires: 600000
  }
}));

// Routes
app.use(login)
app.use(faq)
app.use(question)

// middleware
app.use((req, res, next) => {
  if (req.cookies.user_sid && !req.session.user) {
      res.clearCookie('user_sid');        
  }
  next();
});

// index 
app.get("/", (req, res) => {
    res.render("index",{ user: req.session.user});
});

// about 
app.get("/about", (req, res) => {
    res.render("about",{ user: req.session.user});
});

// Listenning
server.listen(3000, () => { 
  console.log("Server started (http://localhost:3000/) !");
});

