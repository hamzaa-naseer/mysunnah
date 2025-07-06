import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { withTranslation } from "react-i18next";
import Timer from "src/components/Common/Timer";
import { Modal, Button } from "antd";
import { decryptAnswer } from "src/utils";
import { FaArrowsAlt } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { sysConfigdata } from "src/store/reducers/settingsSlice";
import { RiArrowLeftDoubleLine, RiArrowRightDoubleLine } from "react-icons/ri";
import { LoadQuizZoneCompletedata, percentageSuccess, questionsDataSuceess, resultTempDataSuccess } from "src/store/reducers/tempDataSlice";
import { useRouter } from "next/router";
import QuestionTopSection from "src/components/view/common/QuestionTopSection";
import QuestionMiddleSectionOptions from "src/components/view/common/QuestionMiddleSectionOptions";
import { setSecondSnap, setTotalSecond } from "src/store/reducers/showRemainingSeconds";


function SelfLearningQuestions({ t, questions: data, timerSeconds, onOptionClick, showBookmark }) {

    const [questions, setQuestions] = useState(data);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [corrAns, setCorrAns] = useState(0)
    const [inCorrAns, setInCorrAns] = useState(0)
    const child = useRef(null);
    const scroll = useRef(null);
    const [disablePrev, setDisablePrev] = useState(true);
    const [disableNext, setDisableNext] = useState(false);
    const [update_questions, setUpdate_questions] = useState(data);
    const [notificationmodal, setNotificationModal] = useState(false);
    const [score, setScore] = useState(0);
    const systemconfig = useSelector(sysConfigdata);

    const dispatch = useDispatch()

    const navigate = useRouter()

    // store data get
    const userData = useSelector((state) => state.User);

    setTimeout(() => {
        setQuestions(data);
    }, 500);

    // button option answer check
    const handleAnswerOptionClick = (selected_option) => {
        let { id } = questions[currentQuestion];
        let update_questions = questions.map((data) => {
            return data.id === id ? { ...data, selected_answer: selected_option, isAnswered: true } : data;
        });
        setUpdate_questions(update_questions);

        if (questions[currentQuestion].selected_answer) setQuestions(update_questions);

        onOptionClick(update_questions);
        dispatch(questionsDataSuceess(update_questions));
    };

    // option answer status check
    const setAnswerStatusClass = (option) => {
        if (questions[currentQuestion].isAnswered) {
            if (systemconfig && systemconfig.answer_mode === "1") {
            }
            if (questions[currentQuestion].selected_answer === option) {
                return "bg-theme";
            } else {
                return false;
            }
        } else {
            return false;
        }
    };

    const onSubmit = async () => {
        let seconds = child.current.getMinuteandSeconds()

        dispatch(setTotalSecond(timerSeconds))
        dispatch(setSecondSnap(seconds))


        // let result_score = Score.current;
        let result_score = score;
        update_questions.map((data) => {
            let selectedAnswer = data.selected_answer;
            let decryptedAnswer = decryptAnswer(data.answer, userData?.data?.firebase_id);
            if (decryptedAnswer === selectedAnswer) {
                result_score++;
                setScore(result_score);
                setCorrAns(result_score)
                setInCorrAns(update_questions.length - result_score)

                // LoadQuizZoneCompletedata(result_score, update_questions.length - result_score)
                LoadQuizZoneCompletedata(result_score, update_questions.length - result_score)
            }
        });
        dispatch(percentageSuccess(result_score))
        onOptionClick(questions, result_score);

        await onQuestionEnd()

    };



    const onQuestionEnd = async () => {
        const tempData = {
            totalQuestions: update_questions?.length,
            showQuestions: true,
            reviewAnswer: false,
        };
        // Dispatch the action with the data
        dispatch(resultTempDataSuccess(tempData));
        await navigate.push("/self-learning/result")
    }

    const onTimerExpire = () => {
        onSubmit();
        setInCorrAns(inCorrAns + 1)

    };

    const previousQuestion = () => {
        const prevQuestion = currentQuestion - 1;
        if (prevQuestion >= 0) {
            if (prevQuestion > 0) {
                setDisablePrev(false);
            } else {
                setDisablePrev(true);
            }
            setDisableNext(false);
            setCurrentQuestion(prevQuestion);
        }
    };

    const nextQuestion = () => {
        const nextQuestion = currentQuestion + 1;
        if (nextQuestion < questions?.length) {
            if (nextQuestion + 1 === questions?.length) {
                setDisableNext(true);
            } else {
                setDisableNext(false);
            }
            setDisablePrev(false);
            setCurrentQuestion(nextQuestion);
        }
    };

    // pagination
    const handlePagination = (index) => {
        setCurrentQuestion(index);
    };



    return (
        <React.Fragment>
            <div className='dashboardPlayUppDiv funLearnQuestionsUpperDiv selfLearnQuestionsUpperDiv text-end p-2 pb-0'>
                <QuestionTopSection currentQuestion={currentQuestion} questions={questions} showAnswers={false} />
            </div>

            <div className="questions selflearnigque" ref={scroll}>
                <div className="timerWrapper">
                    <div className="inner__headerdash ">
                        {questions && questions[0]["id"] !== "" ? <Timer ref={child} timerSeconds={timerSeconds} onTimerExpire={onTimerExpire} /> : ""}
                    </div>
                </div>


                <QuestionMiddleSectionOptions questions={questions} currentQuestion={currentQuestion} setAnswerStatusClass={setAnswerStatusClass} handleAnswerOptionClick={handleAnswerOptionClick} probability={false} latex={true} />

                <div className='divider'>
                    <hr style={{ width: '112%', backgroundColor: 'gray', height: '2px' }} />
                </div>

                <div className="dashoptions selfLearnLifelines">
                    <div className="fifty__fifty">
                        <button className="btn btn-primary" onClick={previousQuestion} disabled={disablePrev}>
                            {/* <span className='lifelineText'>{t("Previous Question")}</span> */}
                            <span className='lifelineIcon'> <RiArrowLeftDoubleLine size={25} /></span>
                            <span className='lifelineHoverIcon'>{t("previous_question")}</span>
                        </button>
                    </div>
                    {/* {/ pagination /} */}

                    <div className="notification self-learning-pagination">
                        <Button className="notify_btn btn-primary" onClick={() => setNotificationModal(true)}>
                            {/* <span className='lifelineText'>{t("view_question_dashboard")}</span> */}
                            <span className='lifelineIcon'> <FaArrowsAlt /></span>
                            <span className='lifelineHoverIcon'>{t("view_question_dashboard")}</span>
                        </Button>

                        <Modal centered open={notificationmodal} onOk={() => setNotificationModal(false)} onCancel={() => setNotificationModal(false)} footer={null} className="custom_modal_notify self-modal">
                            <h4 className="self_learn_attempt_question_popup">{t("q_att")}</h4>
                            <div className={`que_pagination ${questions?.length > 50 ? 'questions-scrollbar' : ''}`}>
                                {questions?.map((que_data, index) => {
                                    return (
                                        <div className="que_content" key={index}>
                                            <p className="d-none">{que_data.id}</p>

                                            <p className={`que_box ${update_questions && update_questions[index]?.isAnswered ? "bg-green" : "bg-dark"}`} onClick={() => handlePagination(index)}>
                                                {index + 1}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="selfAttemptModal">

                                {/* <div className='divider'>
                                    <span className='dividerlines'><img src={questionIcon.src} alt="" /></span>
                                </div> */}
                            </div>
                            <hr />
                            {/* {/ check and unchecked /} */}
                            <div className="self_learn_attempt_question_popup_checkbox">
                                <div className="d-flex"> <input type="radio" name="" className="tick me-2" checked readOnly /> <h5>{t('att')}</h5></div>
                                <div className="d-flex"><input type="radio" name="" className="untick ms-3 me-2" disabled readOnly /> <h5>{t('un_att')}</h5></div>
                            </div>
                        </Modal>
                    </div>
                    <div className="skip__questions">
                        <button className="btn btn-primary" onClick={nextQuestion} disabled={disableNext}>
                            {/* <span className='lifelineText'>{t("Next Question")}</span> */}
                            <span className='lifelineIcon'> <RiArrowRightDoubleLine size={25} /></span>
                            <span className='lifelineHoverIcon'>{`${t('next')} ${t('questions')} `}</span>
                        </button>
                    </div>

                    <div className="resettimer">
                        <button className="btn btn-primary" onClick={onSubmit}>
                            {t("submit")}
                        </button>
                    </div>

                </div>
            </div>
        </React.Fragment>
    );
}

SelfLearningQuestions.propTypes = {
    questions: PropTypes.array.isRequired,
    onOptionClick: PropTypes.func.isRequired,
};

SelfLearningQuestions.defaultProps = {
    showBookmark: true,
};

export default withTranslation()(SelfLearningQuestions);
