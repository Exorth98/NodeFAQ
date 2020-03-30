// Query the answers of a given question and emit a socket
const getAnswersAndEmit = async (dbManager, faqId, socket) => {
    try {
      dbManager.getAnswers(faqId, (err,model) => {
        if(err) return console.error(err.message)
        socket.emit("answers",model.answers)
      })
    }
    catch (error) {console.error(`Error: ${error.code}`)};
}

// Query the questions of a given domain (all/coding/.. or research term) and emit a socket
const getQuestionsAndEmit = async  (dbManager, domain, socket) => {
    try {
      switch(domain){
        case "All":
          dbManager.getQuestions((err,rows)=>{
            if(err) return console.error(err.message)
            socket.emit("questions",rows)
          })
          break;
        case "General":
        case "Maths":
        case "Coding":
        case "Other":
          dbManager.getFilteredQuestions(domain,(err,rows)=>{
            if(err) return console.error(err.message)
            socket.emit("questions",rows)
          })
          break;
        default:
          let search = domain.split("'")[1]
          dbManager.getSearchedQuestions(search,(err,rows)=>{
            if(err) return console.error(err.message)
            socket.emit("questions",rows)
          })
          break;
      }
    }
    catch (error) {console.error(`Error: ${error.code}`)};
};

module.exports= {getQuestionsAndEmit, getAnswersAndEmit}