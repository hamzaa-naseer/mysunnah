"use client"
import Breadcrumb from 'src/components/Common/Breadcrumb'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { withTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import { t } from 'i18next'
import { getQuizEndData, reviewAnswerShowData, reviewAnswerShowSuccess, selectPercentage, selectResultTempData } from 'src/store/reducers/tempDataSlice'
import dynamic from 'next/dynamic'
import { UserCoinScoreApi } from 'src/store/actions/campaign'
import { updateUserDataInfo } from 'src/store/reducers/userSlice'
import { sysConfigdata } from 'src/store/reducers/settingsSlice'
import toast from 'react-hot-toast'
import { lazy, Suspense } from 'react'
import ShowScoreSkeleton from 'src/components/view/common/ShowScoreSkeleton'
const Layout = dynamic(() => import('src/components/Layout/Layout'), { ssr: false })
const ShowScore = lazy(() => import('src/components/Common/ShowScore'))

const DailyQuizDashboard = () => {

    const navigate = useRouter()

    const dispatch = useDispatch()

    const showScore = useSelector(selectResultTempData);

    const percentageScore = useSelector(selectPercentage)

    const resultScore = useSelector(getQuizEndData)

    const reviewAnserShow = useSelector(reviewAnswerShowData)

    const systemconfig = useSelector(sysConfigdata)

    const review_answers_deduct_coin = Number(systemconfig?.review_answers_deduct_coin)

    const userData = useSelector(state => state.User)

    const MySwal = withReactContent(Swal)

    const handleReviewAnswers = () => {
        let coins = review_answers_deduct_coin
        if (!reviewAnserShow) {
            if (userData?.data?.coins < coins) {
                toast.error(t("no_enough_coins"));
                return false;
            }
        }

        MySwal.fire({
            title: t("are_you_sure"),
            text: !reviewAnserShow ? review_answers_deduct_coin + " " + t("coin_will_deduct") : null,
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
                        title: t("Daily Quiz") + " " + t("review_answer"),
                        status: status,
                        onSuccess: (response) => {
                            updateUserDataInfo(response.data);
                            navigate.push("/quiz-play/daily-quiz-dashboard/review-answer")
                            dispatch(reviewAnswerShowSuccess(true))
                        },
                        onError: (error) => {
                            Swal.fire(t("ops"), t('Please '), t("try_again"), "error");
                            console.log(error);
                        }
                    });
                } else {
                    navigate.push("/quiz-play/daily-quiz-dashboard/review-answer")
                }
            }
        });
    };

    const goBack = () => {
        navigate.push('/quiz-play')
    }

    return (
        <Layout>
            <Breadcrumb title={`${t('daily')} ${t('quiz')}`} content="" contentTwo="" />
            <div className='dashboard'>
                <div className='container'>
                    <div className='row'>
                        <div className='morphisam bg_white'>
                            <div className='whitebackground'>
                                <Suspense fallback={<ShowScoreSkeleton />}>
                                    <ShowScore
                                        score={percentageScore}
                                        totalQuestions={showScore.totalQuestions}
                                        onReviewAnswersClick={handleReviewAnswers}
                                        goBack={goBack}
                                        showQuestions={showScore.showQuestions}
                                        corrAns={resultScore.Correctanswer}
                                        inCorrAns={resultScore.InCorrectanswer}
                                        reviewAnswer={true}
                                    />
                                </Suspense>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </Layout>
    )
}

export default withTranslation()(DailyQuizDashboard)
