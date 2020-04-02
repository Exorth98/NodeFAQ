const express = require("express");
const router = express.Router();

const {select_questions} = require("../helpers/database")
const {sessionChecker} = require("../helpers/sessionCheckers")

// question display
router.get("/faq/question/:id",sessionChecker, (req, res) => {
  var feedback = req.session.feedback;
  req.session.feedback = undefined;
  const id = Number(req.params.id)
  // query question and answers
  req.app.get('db').getAnswers(id,(err,model) =>{
    if(err) return console.error(err.message)
    res.render("question", {feedback, user: req.session.user,model});
  }) 
});


// question post (adding)
router.post("/faq/question/:id",sessionChecker, (req, res) => {
  const id = req.params.id
  if(req.session.user.Verified){
    if(req.body.Answer){
      req.app.get('db').addAnswer(id,req.body.Answer,req.session.user.name, err => {
        if (err) return console.error(err.message)
      });
    }
    else req.session.feedback = "Cannot add empty answer"
  }
  else req.session.feedback = "Please verify your email address to post content"

  res.redirect('back')
});

// question upvote 
router.get("/faq/question/upvote/:qid/:aid/:votes",sessionChecker, (req, res) => {
    let {qid,aid,votes} = req.params
    votes = Number(votes)
    const db = req.app.get('db').db
    db.all('SELECT * FROM votes WHERE userId = ? AND questionId = ?',[req.session.user.userId,qid],(err,rows)=>{
        if (err) return console.error(err.message);
        if(rows.length == 0){
            db.run("UPDATE answers SET Upvote= ? WHERE ansId = ?",[votes+1,aid], (err) => {
                if (err) return console.error(err.message);
                db.run("INSERT INTO votes (userId,questionId,answerId) VALUES (?,?,?)",
                [req.session.user.userId,qid,aid], 
                (err => {
                    if (err) return console.error(err.message);
                    res.redirect('/faq/question/'+qid)
                }))
            })
        }
        else {
          req.session.feedback = "You already voted for this question"
          res.redirect("back");
        }
    })
});

module.exports = router;

