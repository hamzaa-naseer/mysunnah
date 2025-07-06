"use client"
import React, { useState } from "react";
import { FaExclamationTriangle } from "react-icons/fa";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import PropTypes from "prop-types";
import { withTranslation } from "react-i18next";
import { RenderHtmlContent, decryptAnswer, imgError, reportQuestion } from "src/utils";
import { useSelector } from "react-redux";
import { sysConfigdata } from "src/store/reducers/settingsSlice";
import { ReportQuestionApi } from "src/store/actions/campaign";
import { RiArrowLeftDoubleLine, RiArrowRightDoubleLine } from "react-icons/ri";
import { t } from "i18next";


const MySwal = withReactContent(Swal);

const ReviewAnswer = ({ questions, goBack, reportquestions, showLevel, latex }) => {

    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [disablePrev, setDisablePrev] = useState(true);
    const [disableNext, setDisableNext] = useState(false);

    const systemconfig = useSelector(sysConfigdata);

    // store data get
    const userData = useSelector((state) => state.User);


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

    const setAnswerStatusClass = (option) => {
        let decryptedAnswer = decryptAnswer(questions[currentQuestion]?.answer, userData?.data?.firebase_id);
        if (decryptedAnswer === option) {
            return "bg-success";
        } else if (questions[currentQuestion].selected_answer === option) {
            return "bg-danger";
        }
    };


    return (
        <>
            <div className="reviewUpperDiv">
                {showLevel ?
                    <div className="leftSec">
                        <div className="level">
                            <span>
                                {t("Level")} : {questions[currentQuestion]?.level}
                            </span>
                        </div>
                    </div> :
                    null}


                <div className="centerSec">
                    <div className="text-center reviewHeadline">
                        <h4 className="">{t("review_answers")}</h4>
                    </div>
                </div>

                <div className="rightSec">
                    <div className="totalOutLevel">
                        <span>
                            {currentQuestion + 1} - {questions?.length}
                        </span>
                    </div>

                    {reportquestions ? (
                        <div className="bookmark_area">
                            <button title="Report Question" className="btn bookmark_btn  " onClick={() => reportQuestion(questions[currentQuestion]?.id)}>
                                <FaExclamationTriangle className="fa-2x" />
                            </button>
                        </div>
                    ) : (
                        false
                    )}
                </div>

            </div>

            <div className="content__text">
                <p className="question-text">
                    {systemconfig.latex_mode === "1" ?
                        <RenderHtmlContent htmlContent={questions[currentQuestion]?.question} />
                        :
                        questions[currentQuestion]?.question
                    }
                </p>
            </div>

            {questions[currentQuestion]?.image ? (
                <div className="imagedash">
                    <img src={questions[currentQuestion]?.image} onError={imgError} alt="" />
                </div>
            ) : (
                ""
            )}

            <div className="row optionsWrapper">
                {questions[currentQuestion]?.optiona ? (
                    <div className="col-md-6 col-12">
                        <div className="inner__questions">
                            <button className={`btn button__ui w-100 ${setAnswerStatusClass("a")}`}>
                                {systemconfig.latex_mode === "1" ?
                                    <RenderHtmlContent htmlContent={questions[currentQuestion]?.optiona} />
                                    :
                                    questions[currentQuestion]?.optiona
                                }
                            </button>
                        </div>
                    </div>
                ) : (
                    ""
                )}
                {questions[currentQuestion]?.optionb ? (
                    <div className="col-md-6 col-12">
                        <div className="inner__questions">
                            <button className={`btn button__ui w-100 ${setAnswerStatusClass("b")}`}>
                                {systemconfig.latex_mode === "1" ?
                                    <RenderHtmlContent htmlContent={questions[currentQuestion]?.optionb} />
                                    :
                                    questions[currentQuestion]?.optionb
                                }
                            </button>
                        </div>
                    </div>
                ) : (
                    ""
                )}
                {questions[currentQuestion]?.question_type === "1" ? (
                    <>
                        {questions[currentQuestion]?.optionc ? (
                            <div className="col-md-6 col-12">
                                <div className="inner__questions">
                                    <button className={`btn button__ui w-100 ${setAnswerStatusClass("c")}`}>
                                        {systemconfig.latex_mode === "1" ?
                                            <RenderHtmlContent htmlContent={questions[currentQuestion]?.optionc} />
                                            :
                                            questions[currentQuestion]?.optionc
                                        }
                                    </button>
                                </div>
                            </div>
                        ) : (
                            ""
                        )}
                        {questions[currentQuestion]?.optiond ? (
                            <div className="col-md-6 col-12">
                                <div className="inner__questions">
                                    <button className={`btn button__ui w-100 ${setAnswerStatusClass("d")}`}>
                                        {systemconfig.latex_mode === "1" ?
                                            <RenderHtmlContent htmlContent={questions[currentQuestion]?.optiond} />
                                            :
                                            questions[currentQuestion]?.optiond
                                        }
                                    </button>
                                </div>
                            </div>
                        ) : (
                            ""
                        )}
                        {questions[currentQuestion]?.optione !== "" ? (
                            <div className="row d-flex justify-content-center">
                                <div className="col-md-6 col-12">
                                    <div className="inner__questions">
                                        <button className={`btn button__ui w-100 ${setAnswerStatusClass("e")}`}>
                                            <div className="row">
                                                <div className="col">
                                                    {systemconfig.latex_mode === "1" ?
                                                        <RenderHtmlContent htmlContent={questions[currentQuestion]?.optione} />
                                                        :
                                                        questions[currentQuestion]?.optione
                                                    }
                                                </div>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            ""
                        )}
                    </>
                ) : (
                    ""
                )}
                {!questions[currentQuestion]?.selected_answer ? (
                    <div className="text-end">
                        <span className="">*{t("not_att")}</span>
                    </div>
                ) : (
                    ""
                )}
            </div>

            <div className='divider'>
                <hr style={{ width: '112%', backgroundColor: 'gray', height: '2px' }} />
            </div>

            <div className="dashoptions reviewDashoption">
                <div className="fifty__fifty">
                    <button className="btn btn-primary" onClick={previousQuestion} disabled={disablePrev}>
                        <RiArrowLeftDoubleLine size={25} />
                    </button>
                </div>
                <div className="resettimer">
                    <button className="btn btn-primary" onClick={goBack}>
                        {t("back")}
                    </button>
                </div>
                <div className="skip__questions">
                    <button className="btn btn-primary" onClick={nextQuestion} disabled={disableNext}>
                        <RiArrowRightDoubleLine size={25} />
                    </button>
                </div>
            </div>
            <div className="text-center review-answer-data">
                <small className="review-latext-note">
                    {questions[currentQuestion]?.note ?
                        <>{t("note")} :- {systemconfig.latex_mode === "1" ? <p><RenderHtmlContent htmlContent={questions[currentQuestion]?.note} /></p> : <p dangerouslySetInnerHTML={{ __html: questions[currentQuestion]?.note }}></p>}</>
                        :
                        ""
                    }
                </small>
            </div>
        </>
    );
}

ReviewAnswer.propTypes = {
    questions: PropTypes.array.isRequired,
    goBack: PropTypes.func,
};

export default withTranslation()(ReviewAnswer);
