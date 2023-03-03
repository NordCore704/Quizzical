import React from "react";
import { useState, useContext, forwardRef, useImperativeHandle, useEffect } from "react";
import { decode } from 'html-entities'
import quizDataset from "./quiz-dataset";
import { QuizContext } from "./helpers/context";

const Quiz = forwardRef((props, ref) => {
  // Here, the first state determines the selected answer, it literally is the feature, essentially the state recieves the vaue of the selected answer✅
  const [selected, setSelected] = useState("");

  // With the use of context API hook, we import the checker global state for conditioning.... below
  const { checker, darkMode } = useContext(QuizContext);
  // This function assigns the selected value to the selected state defined above on the click of the answer(below)
  const handleClick = (clicked, currentQuestion) => {
    setSelected(clicked);
  };
  // This function is the opposite of the handleClick, it removes the selection feature
  const removeClick = () => {
    setSelected("");
  };

  /* 
    A not so clean or "best practice" metyhod used here(at least that's how I see it):
        **The selected answer value is lifted up, or sent back to the parent component,
        **The operation triggers a bad setState call warining, a side effect, which is handled with the useEffect hook
        **Do note that given the overall structure of this project, this was the best way of doing this.
    */
  // let count = 0;
  useEffect(() => {
    props.setAnsweredValue(selected);
  }, [selected]);


  /**
   * I will not set up any comments for documentation in the return statement so it stays clean so here goes:
   ** The quiz is set up here, every single question shares the same styling and all but different values
   ** The shuffled answers array are recieved as props from the parent, mapped and rendered as the answer values
   ** The global checker state and the correct anwser prop is used to decide(in conditional classing) the added classes on the buttons to clarify their validity to the user
   ** The dimmed class is also a styling idea I added to make the selected answer(correct or no) stand out after a submission while the others are blurred
   ** The removeClick function removes the click feature after submission, this is on a condition if the checker state has been triggered
   * That's basically all that happens below I guess🥷
   */
  return (
    <>
      <div className="quiz--main">
        <QuizContext.Provider value={{ selected, setSelected }}>
          {" "}
          {/* This was not necessary in the end */}
          <p className="questions">{decode(props.question)}</p>
          <div className="answers--div">
            {props.shuffledAnswers.map((answer, index) => (
              <button
                key={index}
                onClick={
                  !checker
                    ? () => handleClick(answer, props.question)
                    : removeClick
                }
                className={`answer-btn ${
                  answer === selected ? "bg--picked" : ""
                } ${checker && answer === props.answers ? "correct" : ""} ${
                  checker && answer === selected && answer !== props.answers
                    ? "wrong"
                    : ""
                } ${checker && answer !== props.answers ? "dimmed" : ""} ${
                  darkMode && checker ? "dark" : ""
                }`}
              >
                {decode(answer)}
              </button>
            ))}
          </div>
        </QuizContext.Provider>
      </div>
      {/* {checker && <button className="show--score" onClick={handleScore}>Show Score</button>}
            {numberOfCorrect !== 0 && checker ? <p>{numberOfCorrect !== 0 ? numberOfCorrect : '0'}</p> : ''} */}
    </>
  );
});

export default Quiz;
