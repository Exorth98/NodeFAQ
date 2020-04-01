'use strict';

class QuestionList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {questions:props.questions};
  }

  componentDidMount(){
    // Connect the socket
    let socket = io('http://localhost:3000');
    // Let the server know from wich domain we wants the questions
    socket.emit('Subscribe_questions',this.props.domain)
    // Update the state with socket data
    socket.on("questions", data => {
      console.log("Socket Received")
      this.setState({ questions: data });
    })
  }

  render() {
    return (
      <div className="react-container" >
        {this.state.questions.map((qu,i)=>(

        <a href={`/faq/question/${qu.faqId}`} key={i}>
          <div className="question-container">

            <div className="question-header">
              <p className="question-domain">{qu.Domain}</p>
              <p className="question-content">{qu.Question}</p>
              <p className="question-author"> Posted by {qu.questionAuthor}</p>
            </div>

            <div className="question-body">
              <div className = "upvote-container">
                <p className="upvote-text">{qu.Upvote}</p>
              </div>
              <div className="answer-body">
                  <p className="answer-author"> Best answer (from {qu.answerAuthor}) :</p>
                  <p className='answer'>{qu.Answer}</p>
              </div>
            </div>

          </div>
        </a>

        ))}
      </div>
    )
  }
}

const domContainer = document.getElementById('react-question-list');
const questions = JSON.parse(domContainer.attributes.questions.value)
const domain = JSON.parse(domContainer.attributes.domain.value)

ReactDOM.render(<QuestionList questions={questions} domain={domain}/>, domContainer);