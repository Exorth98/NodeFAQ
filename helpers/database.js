const path = require("path");
const sqlite3 = require("sqlite3").verbose();


/*
* Long queries
*/

// Create table faq
const sql_create = `CREATE TABLE IF NOT EXISTS faq (
  faqId INTEGER PRIMARY KEY AUTOINCREMENT,
  Question VARCHAR(100) NOT NULL,
  Author VARCHAR(100) NOT NULL,
  Domain VARCHAR(100) NOT NULL
);`;

// Create table answers
const answer_create = `CREATE TABLE IF NOT EXISTS answers (
  ansId INTEGER PRIMARY KEY AUTOINCREMENT,
  faqId VARCHAR(100) NOT NULL,
  Answer VARCHAR(100) NOT NULL,
  Author VARCHAR(100) NOT NULL,
  Upvote INTEGER NOT NULL
);`;

// create table users
const user_create = `CREATE TABLE IF NOT EXISTS users (
  userId INTEGER PRIMARY KEY AUTOINCREMENT,
  Email VARCHAR(100) NOT NULL,
  Nickname VARCHAR(100) NOT NULL,
  Password VARCHAR(100) NOT NULL
);`;

// create table users
const votes_create = `CREATE TABLE IF NOT EXISTS votes (
  voteId INTEGER PRIMARY KEY AUTOINCREMENT,
  userId INTEGER NOT NULL,
  questionId INTEGER NOT NULL,
  answerId INTEGER NOT NULL
);`;

// Select answers and their best answer
const select_questions = `
SELECT 
faq.faqId,
faq.Question,
faq.Domain,
faq.Author AS questionAuthor,
answers.Answer,
answers.Upvote,
answers.Author AS answerAuthor

FROM faq
INNER JOIN answers 
ON faq.faqId = answers.faqId

WHERE answers.Upvote = (
  SELECT Max(Upvote) FROM answers
  WHERE faqId = faq.faqId
)`;

/****************************
**  Database manager Class **
*****************************/
class DbManager {

  constructor(db_name){
    this.db = new sqlite3.Database(db_name, err => {
      if (err) return console.error(err.message);
      console.log("Successful connection to the database 'faq.db'");
    });
  }

  /*
  * Add a question for a giving id
  */
  addStaticQuestion(id,question,author,domain, answer, cb){
    const sql_insert = `INSERT INTO faq(faqId, Question, Author, Domain) VALUES (?,?,?,?);`;
    this.db.run(sql_insert,[id,question,author,domain], err => {
      if (err) return console.error(err.message);
      this.addAnswer(id,answer,author, err => {
        cb(err)
      })
    });
  }
    /*
  * Add a question
  */
  addQuestion(question,author,domain, answer, cb){
    const sql_insert = `INSERT INTO faq(Question, Author, Domain) VALUES (?,?,?);`;
    this.db.run(sql_insert,[question,author,domain], err => {
      if (err) return console.error(err.message);
      this.db.all('SELECT last_insert_rowid();',(error, rows)=>{
        if (err) return console.error(error.message);
        const autoId = rows[0]['last_insert_rowid()']
        this.addAnswer(autoId,answer,author, err => {
          cb(err)
        })
      })
    });
  }
  
  /*
  * Add a answer for a giving question id
  */
  addAnswer(questionId,answer,author, cb){
    const query = `INSERT INTO answers(faqId,Answer,Author,Upvote) VALUES (?,?,?,0);`
    this.db.run(query,[questionId,answer,author], err => {
      cb(err)
    })
  }

  /*
  * Get all questions
  */
  getQuestions(cb){
    this.db.all(select_questions, [], (err, rows) => {
      cb(err,rows)
    });
  }

  /*
  * Get all questions with domain filter
  */
  getFilteredQuestions(domain,cb){
    const sql = select_questions + " AND domain = ?;"
    this.db.all(sql, [domain], (err, rows) => {
      cb(err,rows)
    });
  }

  /*
  * Get all questions with search value
  */
  getSearchedQuestions(search,cb){
    const like = "%"+search+"%"
    const sql = select_questions + " AND faq.Question LIKE ? OR answers.Answer LIKE ? OR questionAuthor LIKE ?;"
    this.db.all(sql, [like,like,like], (err, rows) => {
      cb(err,rows)
    });
  }

  getAnswers(faqId, cb){
    this.db.all("SELECT * FROM faq WHERE faqId = ?",[faqId], (err,rows) => {
      if (err) return cb(err,null)
      let model = rows[0]
      this.db.all("SELECT * FROM answers WHERE faqId = ? ORDER BY Upvote DESC",[faqId],(err,rows)=>{
        if (err) return cb(err,model)
        model.answers = rows
        cb(err,model)
      })
  })
  }
  

}


// Return the Database manager
const getDatabaseManager = () => {
  const db_name = path.join(__dirname, "../data", "faq.db");
  return new DbManager(db_name)
}


module.exports = {
  getDatabaseManager,
  sql_create,user_create,
  answer_create,
  votes_create,
  select_questions
}