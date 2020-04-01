const express = require("express");
const router = express.Router();

const {select_questions} = require("../helpers/database")
const {sessionChecker} = require("../helpers/sessionCheckers")

// faq display
router.get("/faq",sessionChecker, (req, res) => {
    var feedback = req.session.feedback;
    req.session.feedback = undefined;
    req.app.get('db').getQuestions( (err, rows) => {
      if (err) return console.error(err.message);
      res.render("faq", {feedback, user: req.session.user, domain:"All",model: rows });
    });
});


// faq filtered display
router.get("/faq/filter/:domain",sessionChecker, (req, res) => {
  const dom = req.params.domain;
  req.app.get('db').getFilteredQuestions(dom, (err, rows) => {
    if (err) return console.error(err.message);
    res.render("faq", {  user: req.session.user, domain:dom,model: rows });
  });
});


// faq search post
router.post("/faq/search",sessionChecker, (req, res) => {
  const search = req.body.Search
  req.app.get('db').getSearchedQuestions(search, (err, rows) => {
    if (err) return console.error(err.message);
    res.render("faq", {  user: req.session.user, domain:"Results for '"+search+"'",model: rows });
  });
});


// faq post (adding)
router.post("/faq",sessionChecker, (req, res) => {
  if(req.body.Question && req.body.Answer){
    req.app.get('db').addQuestion(req.body.Question,req.session.user.name,req.body.Domain, req.body.Answer, err => {
      if (err) return console.error(err.message);
      res.redirect("/faq");     
    });
  }
  else{
    req.session.feedback = "Please fill all fields"
    res.redirect("/faq")
  }
});


// faq delete question
router.get("/faq/delete/:id",sessionChecker, (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM faq,answers WHERE faqId = ?";
  req.app.get('db').db.run(sql, id, err => {
    if (err) return console.error(err.message);
    res.redirect("/faq");
  });
});

module.exports = router;