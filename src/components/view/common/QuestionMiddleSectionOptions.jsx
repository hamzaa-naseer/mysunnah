import ProgressBar from 'react-bootstrap/ProgressBar';
import { useSelector } from 'react-redux';
import { sysConfigdata } from 'src/store/reducers/settingsSlice';
import { RenderHtmlContent, imgError, useOverflowRefs } from "src/utils"


const QuestionMiddleSectionOptions = ({ questions, currentQuestion, setAnswerStatusClass, handleAnswerOptionClick, probability, latex, math, exam_latex }) => {
    const { buttonRefA, buttonRefB, buttonRefC, buttonRefD, buttonRefE } = useOverflowRefs(questions, currentQuestion);

    // condition for latex and exam latex 
    const systemconfig = useSelector(sysConfigdata)
    const Latex = systemconfig.latex_mode === "1" ? true : false
    const condition = exam_latex == undefined ? (Latex || math) : exam_latex


    return (
        <>
            <div className='content__text'>
                <p className='question-text'>{condition ? <RenderHtmlContent htmlContent={questions[currentQuestion]?.question} />
                    : questions[currentQuestion]?.question}</p>
            </div>

            {questions[currentQuestion]?.image ? (
                <div className='imagedash'>
                    <img src={questions[currentQuestion].image} onError={imgError} alt='' />
                </div>
            ) : (
                ''
            )}

            {/* options */}
            <div className='row optionsWrapper'>
                {questions[currentQuestion].optiona ? (
                    <div className='col-md-6 col-12'>
                        <div className='inner__questions'>
                            <button
                                ref={buttonRefA}
                                className={`btn button__ui w-100 ${setAnswerStatusClass('a')}`}
                                onClick={e => handleAnswerOptionClick('a')}
                            >
                                <div className='row'>
                                    <div className='col'>
                                        {condition ?
                                            <RenderHtmlContent htmlContent={questions[currentQuestion]?.optiona} />
                                            :
                                            questions[currentQuestion].optiona
                                        }
                                    </div>
                                </div>
                            </button>
                        </div>
                        {probability ?
                            <>
                                {questions[currentQuestion].probability_a ? (
                                    <div className='col text-end audiencePollDiv'>{questions[currentQuestion].probability_a}
                                        <div className="progressBarWrapper">
                                            <ProgressBar now={questions[currentQuestion].probability_a.replace('%', '')} visuallyHidden />;
                                        </div></div>
                                ) : (
                                    ''
                                )}
                            </>
                            : null}
                    </div>
                ) : (
                    ''
                )}
                {questions[currentQuestion].optionb ? (
                    <div className='col-md-6 col-12'>
                        <div className='inner__questions'>
                            <button
                                ref={buttonRefB}
                                className={`btn button__ui w-100 ${setAnswerStatusClass('b')}`}
                                onClick={e => handleAnswerOptionClick('b')}
                            >
                                <div className='row'>
                                    <div className='col'>
                                        {condition ?
                                            <RenderHtmlContent htmlContent={questions[currentQuestion]?.optionb} />
                                            :
                                            questions[currentQuestion].optionb
                                        }
                                    </div>

                                </div>
                            </button>

                        </div>
                        {probability ?
                            <>
                                {questions[currentQuestion].probability_b ? (
                                    <div className='col text-end audiencePollDiv'>{questions[currentQuestion].probability_b}
                                        <div className="progressBarWrapper">
                                            <ProgressBar now={questions[currentQuestion].probability_b.replace('%', '')} visuallyHidden />;
                                        </div>
                                    </div>
                                ) : (
                                    ''
                                )}
                            </>
                            : null}
                    </div>
                ) : (
                    ''
                )}
                {questions[currentQuestion].question_type === '1' ? (
                    <>
                        {questions[currentQuestion].optionc ? (
                            <div className='col-md-6 col-12'>
                                <div className='inner__questions'>
                                    <button
                                        ref={buttonRefC}
                                        className={`btn button__ui w-100 ${setAnswerStatusClass('c')}`}
                                        onClick={e => handleAnswerOptionClick('c')}
                                    >
                                        <div className='row'>
                                            <div className='col'>
                                                {condition ?
                                                    <RenderHtmlContent htmlContent={questions[currentQuestion]?.optionc} />
                                                    :
                                                    questions[currentQuestion].optionc
                                                }
                                            </div>

                                        </div>
                                    </button>
                                </div>
                                {probability ?
                                    <>
                                        {questions[currentQuestion].probability_c ? (
                                            <div className='col text-end audiencePollDiv'>{questions[currentQuestion].probability_c}
                                                <div className="progressBarWrapper">
                                                    <ProgressBar now={questions[currentQuestion].probability_c.replace('%', '')} visuallyHidden />;
                                                </div></div>
                                        ) : (
                                            ''
                                        )}
                                    </>
                                    : null}
                            </div>
                        ) : (
                            ''
                        )}
                        {questions[currentQuestion].optiond ? (
                            <div className='col-md-6 col-12'>
                                <div className='inner__questions'>
                                    <button
                                        ref={buttonRefD}
                                        className={`btn button__ui w-100 ${setAnswerStatusClass('d')}`}
                                        onClick={e => handleAnswerOptionClick('d')}
                                    >
                                        <div className='row'>
                                            <div className='col'>
                                                {condition ?
                                                    <RenderHtmlContent htmlContent={questions[currentQuestion]?.optiond} />
                                                    :
                                                    questions[currentQuestion].optiond
                                                }
                                            </div>

                                        </div>
                                    </button>

                                </div>
                                {probability ?
                                    <>
                                        {questions[currentQuestion].probability_d ? (
                                            <div className='col text-end audiencePollDiv'>{questions[currentQuestion].probability_d}
                                                <div className="progressBarWrapper">
                                                    <ProgressBar now={questions[currentQuestion].probability_d.replace('%', '')} visuallyHidden />
                                                </div>
                                            </div>
                                        ) : (
                                            ''
                                        )}
                                    </>
                                    : null}
                            </div>
                        ) : (
                            ''
                        )}

                        {questions[currentQuestion].optione !== "" ? (
                            <div className='row d-flex justify-content-center mob_resp_e'>
                                <div className='col-md-6 col-12'>
                                    <div className='inner__questions'>
                                        <button
                                            ref={buttonRefE}
                                            className={`btn button__ui w-100 ${setAnswerStatusClass('e')}`}
                                            onClick={e => handleAnswerOptionClick('e')}
                                        >
                                            <div className='row'>
                                                <div className='col'>
                                                    {condition ?
                                                        <RenderHtmlContent htmlContent={questions[currentQuestion]?.optione} />
                                                        :
                                                        questions[currentQuestion].optione
                                                    }
                                                </div>

                                            </div>
                                        </button>
                                    </div>
                                    {probability ?
                                        <>
                                            {questions[currentQuestion].probability_e ? (
                                                <div className='col text-end audiencePollDiv'>{questions[currentQuestion].probability_e}
                                                    <div className="progressBarWrapper">
                                                        <ProgressBar now={questions[currentQuestion].probability_e.replace('%', '')} visuallyHidden />
                                                    </div>
                                                </div>
                                            ) : (
                                                ''
                                            )}
                                        </>
                                        : null}
                                </div>
                            </div>
                        ) : (
                            ''
                        )}
                    </>
                ) : (
                    ''
                )}
            </div>
        </>
    )
}

export default QuestionMiddleSectionOptions