'use strict';

class AnswerList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {answers:props.answers};
  }

  componentDidMount(){
    // Connect the socket
    let socket = io('http://localhost:3000');
    // Let the server know from wich domain we wants the questions
    socket.emit('Subscribe_answers',this.props.faqId)
    // Update the state with socket data
    socket.on("answers", data => {
      console.log("Socket Received")
      this.setState({ answers: data });
    })
  }

  render() {
    return (
      <div className="react-container" >
        {this.state.answers.map((ans,i)=>(

          <div className="answer-container" key={i}>
            <a href={`/faq/question/upvote/${this.props.faqId}/${ans.ansId}/${ans.Upvote}`}>
              <div className="upvote-button">
                <p className="upvote-button-text">+</p>
              </div>
            </a>
            <div className = "upvote-container">
              <p className="upvote-text">{ans.Upvote}</p>
            </div>
            <div className="answer-body">
                <p className="answer-author"> Answer from {ans.Author} :</p>
                <p className='answer'>{ans.Answer}</p>
            </div>
          </div>

        ))}
      </div>
    )
  }
}

const domContainer = document.getElementById('react-answer-list');
const answers = JSON.parse(domContainer.attributes.answers.value)
const faqId = JSON.parse(domContainer.attributes.faqId.value)

ReactDOM.render(<AnswerList answers={answers} faqId={faqId}/>, domContainer);