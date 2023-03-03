import React, { useState, useContext, useEffect, useRef } from "react";
import "./quiz-app.css";
import Quiz from "./Quiz";
import { nanoid } from "nanoid";
import axios from "axios";
import dataSet from "./quiz-dataset";
import quizDataset from "./quiz-dataset";
import { QuizContext } from "./helpers/context";
import Confetti from "react-confetti";
import darkIcon from "./assets/darkicon.png";
import lightIcon from "./assets/light-yellow.png";

const App = () => {
  // The first state determines whether the start screen is rendered or not
  const [start, setStart] = useState(false);

  // This state will hold the quiz object from the API call it's initial state is an empty array
  const [quiz, setQuiz] = useState([]);
  const [allQuestions, setAllQuestions] = useState([]);

  // This state checks the answer validity and activates the wrong and correct classes for clarity, the logic to the check conditions exists in the quiz component
  const [checker, setChecker] = useState(false);

  // The reset state that effectively lets the user restart the game from scratch
  const [reset, setReset] = useState(false);

  // This state serves as a conditional trigger for the submission hinderance, that is if any questions(except the last one) has not been answered
  const [allAnswered, setAllAnswered] = useState(false);

  // This state, an empty array at first, collects the selected answer from the child component
  const [currentAnswer, setCurrentAnswer] = useState("");

  // This state is supposed to be a trigger for a button that will show the final score
  const [showScore, setshowScore] = useState(false);

  // This state recieves the correct score from the child component on the basis of the correct-ness of the selected answer
  const [numberOfCorrect, setNumberOfCorrect] = useState(0);

  // This is a trigger for the warning if some answers are left unanswered— it renders a warning element
  const [warning, setWarning] = useState(false);
  const [numCorrectAnswers, setNumCorrectAnswers] = useState(0);

  /* Dark Mode state:
   **initially it is undefined because we will require localStorage to remember the previous state
   */
  const [darkMode, setDarkMode] = useState(undefined);

  /**
   * This function is the event function for the dark mode toggle
   */
  const switchMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  /**
   * A set of conditions for the localStorage operations on mode recall, useEffect is used to catch the side effects of the window element class addition and removal
   **if darkmode is true, set darkMode in localStorage to true and add the dark class to the highest parent element(The window or html element)
   **if darkmode is false, set darkMode in localStorage to false and remove the dark class from the highest parent element(The window or html element)
   **the last condition is used to get the current value of darkmode and set it to the current value
   */
  useEffect(() => {
    if (darkMode) {
      localStorage.setItem("darkMode", "true");
      window.document.documentElement.classList.add("dark");
    } else if (darkMode === false) {
      localStorage.setItem("darkMode", "false");
      window.document.documentElement.classList.remove("dark");
    } else {
      setDarkMode(localStorage.getItem("darkMode") === "true");
    }
  }, [darkMode]);

  // This is a shuffler function that will be assigned the whole answers(correct and incorrect answers as its value), it will make sure the answers don't take a specific order
  function shuffle(array) {
    let currentIndex = array.length,
      randomIndex;

    while (currentIndex != 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex],
        array[currentIndex],
      ];
    }

    return array;
  }
  const setAnswered = (value) => {
    setCurrentAnswer(value);
  };
  const prevScoreRef = useRef(null);
  const scores = (value) => {
    setNumberOfCorrect((prev) => value);
  };
  let counter = 0;
  numberOfCorrect === 1 ? counter++ : (counter = 0);
  useEffect(() => {
    prevScoreRef.current = numberOfCorrect;
  }, [numberOfCorrect]);

  //====== Online Test ======

  //This is an online version of the code, with an api call
  // The API call to OTDB, this will assign the returning array of object to the allQuestions state
    useEffect(() => {
        axios.get('https://opentdb.com/api.php?amount=5').then(response => setAllQuestions(response.data.results))
        .catch(err => console.log(err))

}, [start])

// Mapping the allquestion array containing the question objects to a variable
const quizEnter = allQuestions.map((questions) => {
    return <Quiz 
     question={questions.question}
        key={questions.id}
        answers={questions.correct_answer}
        shuffledAnswers={shuffle([
          ...questions.incorrect_answers,
          questions.correct_answer
        ])}
        setAnsweredValue={setAnswered}
        setScoreValue={scores}
     />
})  

// This function flips the initial values of it's underlying state to trigger the conditions of rendering the questions after the start screen
const handleWelcome = () => {
    setStart(prevStart => !prevStart)
    setQuiz([...quizEnter])
}

  ///====== Offline test =======

  //This is an offline version of the code where i map through an external imported js file with an array of questions object
  let styles = {
    backgroundColor: "#319ef8",
  };

  // const handleWelcome = () => {
  //   setStart((prevStart) => !prevStart);
  //   setQuiz([...quizMap]);
  // };

  const quizMap = dataSet.map((item) => {
    const newArr = shuffle([item.correct_answer, ...item.incorrect_answers]);
    return (
      <Quiz
        question={item.question}
        key={item.id}
        id={item.id}
        answers={item.correct_answer}
        /* This(commented below) is a method of rendering answers but it is not quite efficient as it does not feature the following:
         ***The correct answer is rendered seperately as it is not part of the wrong answers array
         ***The above hinderance does not make for shuffling all the answers, just the wrong answers could be shuffled
         */
        // wrongAnswers={item.incorrect_answers.map((element) => (
        //   <button onClick={} style={styles} key={element}>
        //     {element}
        //   </button>
        // ))}

        shuffledAnswers={shuffle([
          ...item.incorrect_answers,
          item.correct_answer,
        ])}
        /**
         * Shuffling the array(below) in a seperate empty array and mapping it from this component as props
         * This is quite inefficient as events will not respond willingly on state change(state change is not absolute, it is relative to a neighboring component render state)
         */
        // answerArray={newArr.map((item, index) => {
        //   return <button key={index} onClick={() => handleClick(item)} className={item === currentAnswer ? 'bg--picked' : ''}>{item}</button>
        // })}

        styles={styles}
        setAnsweredValue={setAnswered}
        setScoreValue={scores}
      />
    );
  });

  // This function handles the submission, it is not quite necessary as I have performed its underlying operations in the function below it but I just left it here so I could have another layer of conditional render option(in the submit button lies its use case)👍
  const submitQuiz = () => {
    setChecker((prev) => !prev);
    setReset((prev) => !prev);
    setAllAnswered((prev) => !prev);
  };

  /**
   * The following function handles the submission case where:
   **Case 1: Any the answers are not answered— it blocks submission and shows a warning
   **Case 2: The user wants to proceed anyway, answering any question exits this condition, and submits the quiz on the basis that the any question is answered, correct or not
   */
  const hinderSubmit = () => {
    if (currentAnswer === "") {
      setWarning(true);
      setChecker(false);
      setAllAnswered(false);
      setReset(false);
    } else {
      setWarning(false);
      setChecker((prev) => !prev);
      setReset((prev) => !prev);
      setAllAnswered((prev) => !prev);
    }
  };

  /*
   * The following function restarts the quiz(back to the start screen) as it resets all of the current running state values at the moment where it is triggered on the click of a button(below in the render part)
   */
  const restart = () => {
    setReset((prev) => !prev);
    setChecker((prev) => !prev);
    setQuiz([]);
    setStart((prev) => !prev);
    setNumCorrectAnswers(0);
    setCurrentAnswer("");
  };

  /*
   *This here is where some of the magic happens
   ***The start page is rendered conditionally if the start state is true
   ***The quiz component is mapped and rendered 5 times with the question from the array of objects recieved from the API props and the shuffled answers
   ***In this return statement, we also export the checker as a global state and some other states with the context hook
   ***Inside the quiz component also, there is a condition to render confetti if all questions are answered correctly
   ***The conditional trigger for rendering the restart state of the app lies here
   ***The conditional trigger for the dark mode toggle lies here also
   */
  // useEffect(() => {
  //   if (!allAnswered && restart) {
  //     quizMap.forEach((question) => {
  //       if (currentAnswer === question.props.answers) {
  //         setNumCorrectAnswers((prev) => prev + 1);
  //       } else {
  //         console.log("this condition failed");
  //       }
  //     });
  //   }
  // }, [currentAnswer]);

  return (
    <div className="App">

      {!darkMode ? (
        <button onClick={switchMode} className="mode--btn">
          <img className="icon" src={darkIcon} alt="icon" />
        </button>
      ) : (
        <button onClick={switchMode} className="mode--btn">
          <img className="icon" src={lightIcon} alt="icon" />
        </button>
      )}
      {numCorrectAnswers === 5 && <Confetti />}
      <QuizContext.Provider
        value={{
          darkMode,
          checker,
          setChecker,
        }}
      >
        {start ? (
          <>
            {quizEnter}
            {/* {checker && <h2>Your Score: {numCorrectAnswers}/5</h2>} */}
            {!allAnswered && warning ? (
              <>
                <h3 className="warning">
                  You have not answered any questions, cannot submit
                </h3>
                <small className="warning">
                  P.S: answer at least one question to proceed anyway
                </small>
              </>
            ) : (
              ""
            )}
            {!reset ? (
              <button
                onClick={!allAnswered ? hinderSubmit : submitQuiz}
                className="end--btn"
              >
                Submit
              </button>
            ) : (
              <button onClick={restart} className="restart--btn">
                Restart
              </button>
            )}
          </>
        ) : (
          <>
            <div className="start--div">
              <h2 className="intro">This is Quizzical</h2>
              <button onClick={handleWelcome} className="start--btn">
                Start
              </button>
              <p className="intro">Take The ultimate test!</p>
            </div>
          </>
        )}
      </QuizContext.Provider>
    </div>
  );
};

export default App;
