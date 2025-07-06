import React from 'react'
import excla from 'src/assets/images/exclamation.svg'
import { FiChevronRight } from 'react-icons/fi'
import { t } from 'i18next'
import c1 from "src/assets/images/c1.svg"

const CategoriesComponent = ({ category, handleChangeCategory }) => {
    //truncate text
    const truncate = txtlength => (txtlength?.length > 17 ? `${txtlength.substring(0, 17)}...` : txtlength)

    return (<>
        <div className='category_title_line_header'>
            <div className='category_title_line'></div>
            <h5 className='category_title_heading'>{t("Categories")}</h5>
            <div className='category_title_line'></div>
            <div></div>
        </div>
        <div className="row">
            {category.all ? (
                category.all.map((data, key) => {
                    const imageToShow = data.has_unlocked === '0' && data.is_premium === '1'
                    return (
                        <>
                            <div className="col-sm-12 col-md-6 col-lg-4" >
                                {/* <Link href={`/quiz-zone/${data.slug}`} > */}
                                <li className='d-flex' key={key} onClick={e => handleChangeCategory(data)}>
                                    <div
                                        className={`w-100 button ${category.selected && category.selected.id === data.id
                                            ? 'active-one'
                                            : 'unactive-one'
                                            }`}
                                    >
                                        <div className="box_innerData">
                                            <span className='Box__icon'>
                                                <img src={data.image ? data.image : `${excla.src}`} alt='image' />
                                            </span>
                                            <div className="boxDetails">
                                                <p className='Box__text '>{truncate(data.category_name)}</p>
                                                {data?.no_of !== '0' && data?.no_of !== "" ? (
                                                    <p className='box_totQues'>{t('SubCategories')} : {data?.no_of}</p>
                                                ) : null}
                                            </div>
                                            <span className='rightArrow'>
                                                <FiChevronRight />
                                            </span>
                                        </div>
                                        <div className="boxFooterData">
                                            {data.maxlevel !== '0' && <span className='footerText'>{t('total') + " " + t('level') + ": "}{data.maxlevel}</span>}
                                            <span className='footerText'>
                                                {
                                                    data.no_of_que <= 1 ? t("Question") : t("questions")
                                                } : {data.no_of_que}
                                            </span>
                                            {imageToShow ? (
                                                <img className='ms-2' src={c1.src} alt='premium' width={30} height={30} />
                                            ) : (
                                                ''
                                            )}
                                        </div>

                                    </div>
                                </li>
                                {/* </Link> */}
                            </div>
                        </>
                    )
                })
            ) : (
                <div className='text-center'>
                    <p className='text-dark'>{t('no_cat_data_found')}</p>
                </div>
            )}
        </div>
    </>)
}

export default CategoriesComponent