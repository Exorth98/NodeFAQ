const express = require("express");
const router = express.Router();

const bcrypt = require('bcrypt')
const saltRounds = 10;

const {sessionChecker,sessionCheckerOut} = require("../helpers/sessionCheckers")


// Logout
router.get("/logout", sessionChecker, (req, res) => {
    res.clearCookie('user_sid');
    res.redirect("login");
});
  
// Login
router.get("/login", sessionCheckerOut, (req, res) => {
    var feedback = req.session.loginMessage;
    res.render("login",{feedback});
});


router.post("/login",sessionCheckerOut, (req, res) => {
    const db = req.app.get('db').db
    const {Email,Password} = req.body
    const sql = "SELECT * FROM users WHERE Email = ?";
    if(Email && Password){
      db.all(sql, [Email] , (err,rows) => {
        if (err) return console.error(err.message);
        if(rows.length>0){
          const name = rows[0].Nickname
          const db_pass = rows[0].Password
          const userId = rows[0].userId
          if(bcrypt.compareSync(Password, db_pass)){
            req.session.user = {name,Email,userId}
            req.session.loginMessage = ""
          }
          else req.session.loginMessage = "Wrong password"
        }
        else req.session.loginMessage = "Email not found"

        res.redirect("/faq")
      });
    }
    else {
      // console.log("Please fill all fields")
      req.session.loginMessage = 'Please fill all fields';
      res.redirect("/login")
    }
});
  
  
// Register
router.get("/register",sessionCheckerOut, (req, res) => {
  var feedback = req.session.registerMessage;
  res.render("register",{feedback});
});

router.post("/register",sessionCheckerOut, (req, res) => {
    const db = req.app.get('db').db
    const {Email,Nickname} = req.body
    const Hash = bcrypt.hashSync(req.body.Password, saltRounds);
    const verifiySql = "SELECT * FROM users WHERE Email = ? or Nickname = ?";
    const insertSql = "INSERT INTO users (Email, Nickname, Password) VALUES (?, ?, ?)";
    const user = [Email, Nickname,Hash];
    if(Email && Nickname && Hash){
      db.all(verifiySql,[Email,Nickname], (err,rows) => {
        if(rows.length==0){
          db.run(insertSql, user, err => {
            if (err) return console.error(err.message);
            db.all("SELECT userId FROM users WHERE Nickname = ?",[Nickname], (err,rows)=>{
              if (err) return console.error(err.message);
              const userId = rows[0].userId
              req.session.user = {name:Nickname,Email,userId}
              req.session.registerMessage = ""
              res.redirect("/faq")
            })

          });
        }
        else{
          const feedback = rows[0].Nickname == Nickname 
          ?"Nickname already used" 
          :"Email already used"
          req.session.registerMessage = feedback
          res.redirect("/register")
        }
      })
    }
    else{
      req.session.registerMessage = "Please fill all fields"
      res.redirect("/register")
    }
  
});

module.exports = router;