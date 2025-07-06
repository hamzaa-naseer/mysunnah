"use client"
import Breadcrumb from 'src/components/Common/Breadcrumb'
import toast from 'react-hot-toast'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { withTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { settingsData } from 'src/store/reducers/settingsSlice'
import { UserCoinScoreApi } from 'src/store/actions/campaign'
import { updateUserDataInfo } from 'src/store/reducers/userSlice'
import { reviewAnswerShowData, reviewAnswerShowSuccess, selectResultTempData } from 'src/store/reducers/tempDataSlice'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
const Layout = dynamic(() => import('src/components/Layout/Layout'), { ssr: false })
import { t } from 'i18next'
import { lazy, Suspense } from 'react'
import ShowScoreSkeleton from 'src/components/view/common/ShowScoreSkeleton'
const ShowScore = lazy(() => import('src/components/Quiz/RandomBattle/ShowScore'))
const MySwal = withReactContent(Swal)

const RandomPlay = () => {

    const dispatch = useDispatch()

    const reviewAnserShow = useSelector(reviewAnswerShowData)

    const navigate = useRouter()

    const selectdata = useSelector(settingsData)

    const showScore = useSelector(selectResultTempData);

    const review_answers_deduct_coin = selectdata && selectdata.filter((item) => item.type == "review_answers_deduct_coin");

    // store data get
    const userData = useSelector(state => state.User)

    const handleReviewAnswers = () => {
        let coins = review_answers_deduct_coin && Number(review_answers_deduct_coin[0]?.message);
        if (!reviewAnserShow) {
            if (userData?.data?.coins < coins) {
                toast.error(t("no_enough_coins"));
                return false;
            }
        }


        MySwal.fire({
            title: t("are_you_sure"),
            text: !reviewAnserShow ? review_answers_deduct_coin && Number(review_answers_deduct_coin[0]?.message) + " " + t("coin_will_deduct") : null,
            icon: "warning",
            showCancelButton: true,
            customClass: {
                confirmButton: 'Swal-confirm-buttons',
                cancelButton: "Swal-cancel-buttons"
            },
            confirmButtonText: t("continue"),
            cancelButtonText: t("cancel"),
        }).then((result) => {
            if (result.isConfirmed) {
                if (!reviewAnserShow) {
                    let status = 1;
                    UserCoinScoreApi({
                        coins: "-" + coins,
                        title: `${t('random_battle')} ${t('review_answer')} `,
                        status: status,
                        onSuccess: (response) => {
                            updateUserDataInfo(response.data);
                            navigate.push("/random-battle/review-answer")
                            dispatch(reviewAnswerShowSuccess(true))
                        },
                        onError: (error) => {
                            Swal.fire(t("ops"), t('Please '), t("try_again"), "error");
                            console.log(error);
                        }
                    });
                } else {
                    navigate.push("/random-battle/review-answer")
                }
            }
        });

    };

    const goBack = () => {
        navigate.push('/random-battle')
    }

    return (
        <Layout>
            <Breadcrumb title={t('1 v/s 1 Battle')} content="" contentTwo="" />
            <div className='funandlearnplay dashboard battlerandom'>
                <div className='container'>
                    <div className='row '>
                        <div className='morphisam bg_white'>
                            <div className='whitebackground'>
                                <><Suspense fallback={ShowScoreSkeleton}>
                                    <ShowScore
                                        score={showScore.score}
                                        totalQuestions={showScore.totalQuestions}
                                        onReviewAnswersClick={handleReviewAnswers}
                                        goBack={goBack}
                                        quizScore={showScore.quizScore}
                                        reviewAnswer={false}
                                        coins={showScore.coins}
                                    />
                                </Suspense>
                                </>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    )
}
export default withTranslation()(RandomPlay)
