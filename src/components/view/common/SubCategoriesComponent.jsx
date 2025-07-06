import React from 'react'
import excla from 'src/assets/images/exclamation.svg'
import { FiChevronRight } from 'react-icons/fi'
import { t } from 'i18next'

const SubCategoriesComponent = ({ subCategory, handleChangeSubCategory }) => {
    return (<div className="row flex-row">
        <div className="quizplay-slider">

                <div className='category_title_line_header'>
                    <div className='category_title_line'></div>
                    <h5 className='category_title_heading'>{t("SubCategories")}</h5>
                    <div className='category_title_line'></div>
                    <div></div>
                </div>
                <div className="row">
                    <>
                        {subCategory ? (
                            subCategory?.length > 0 &&
                            subCategory.map((elem, key) => {
                                return (
                                    <div
                                        key={elem.id}
                                        className="col-sm-12 col-md-6 col-lg-4"
                                        onClick={(e) => {
                                            handleChangeSubCategory(elem);
                                        }}
                                    >
                                        <div className="subcatintro__sec">
                                            <div className={`card spandiv`}>
                                                <div className="cardInnerData">
                                                    <span className="Box__icon">
                                                        <img src={elem.image ? elem.image : `${excla.src}`} alt='image' />
                                                    </span>
                                                    <div className="cardDetails">
                                                        <p className="cardText ">{elem.subcategory_name}</p>

                                                        <div className="cardSubDetails">
                                                            {elem.maxlevel !== '0' && <p className="CardQues">
                                                                {" "}
                                                                {t("levels")} : {elem.maxlevel}
                                                            </p>}
                                                            <p className="CardQues">
                                                                {" "}
                                                                {
                                                                    elem.no_of_que <= 1 ? t("Question") : t("questions")
                                                                } : {elem.no_of_que}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <span className="rightArrow">
                                                        <FiChevronRight />
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center mt-4 commonerror">
                                {/* <img src={errorimg.src} title="wrteam" className="error_img" /> */}
                                <p>{t("no_subcat_data_found")}</p>
                            </div>
                        )}
                    </>
                </div>
        </div>
    </div>)
}

export default SubCategoriesComponent