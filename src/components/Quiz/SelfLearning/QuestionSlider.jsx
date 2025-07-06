import React, { Fragment, useState } from "react";
import { withTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { sysConfigdata } from "src/store/reducers/settingsSlice";

const QuestionSlider = ({ t, onClick, activeIndex }) => {

  const [showAllQuestions, setShowAllQuestions] = useState(false);

  const toggleShowAllQuestions = () => {
    setShowAllQuestions(!showAllQuestions);
  };

  const systemconfig = useSelector(sysConfigdata);

  const self_challange_max_questions = Number(systemconfig.self_challenge_max_questions);

  const limit = self_challange_max_questions;

  let arr = [];
  if (limit >= 5) {

    for (let i = 0; i <= limit; i++) {
      if (i % 5 == 0) {
        if (i != 0) {
          arr.push(i)
        }
      }
    }
  } else {
    arr.push(limit)
  }

  return (
    <Fragment>
      <div className="subcat__slider__context">
        <div className="container">
          <div className="row">
            {/* Select number of questions */}
            <div className="cat__Box">
              <div className="sub_cat_title">
                <p className="text-capitalize font-weight-bold font-smaller subcat__p">
                  {t("select_num_of_que")}
                </p>
              </div>
              <div className="sub_cat_title1">
                <p
                  className="text-capitalize font-weight-bold font-smaller subcat__p"
                  onClick={toggleShowAllQuestions}
                  style={{ cursor: "pointer" }}
                >
                  {arr.length >= 8 ? <>
                    {showAllQuestions ? t("see_less") : t("see_more")}
                  </>
                    : null}
                </p>
              </div>
            </div>

            <div className="quizplay-slider">
              {showAllQuestions ? (
                <div className="row">
                  {arr.map((data, key) => (
                    <div className="col-sm-12 c col-md-6 col-lg-3" key={key} >

                      <div onClick={() => onClick(data)} className={`subcatintro__sec selfLearnNumWrapper ${activeIndex === data ? "activeEle" : "unactiveEle"}`}>
                        <div className={`card spandiv `}>
                          <div className="card__name m-auto">
                            <p className="text-center m-auto d-block number">
                              {data}
                            </p>
                            <p className="text-center m-auto d-block numText">
                              {t("number")}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

              ) : (
                <div className="row">
                  {arr.slice(0, 8).map((data, key) => (
                    <div className="col-sm-12 c col-md-6 col-lg-3" key={key}>

                      <div onClick={() => onClick(data)} className={`subcatintro__sec selfLearnNumWrapper ${activeIndex === data ? "activeEle" : "unactiveEle"}`}>
                        <div className={`card spandiv `}>
                          <div className="card__name m-auto">
                            <p className="text-center m-auto d-block number">
                              {data}
                            </p>
                            <p className="text-center m-auto d-block numText">
                              {t("number")}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default withTranslation()(QuestionSlider);
