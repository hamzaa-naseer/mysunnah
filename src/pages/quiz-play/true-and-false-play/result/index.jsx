"use client"
import { withTranslation } from 'react-i18next'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import toast from 'react-hot-toast'
import { sysConfigdata } from 'src/store/reducers/settingsSlice'
import { useDispatch, useSelector } from 'react-redux'
import { UserCoinScoreApi } from 'src/store/actions/campaign'
import Breadcrumb from 'src/components/Common/Breadcrumb'
import { updateUserDataInfo } from 'src/store/reducers/userSlice'
import { useRouter } from 'next/navigation'
import { getQuizEndData, reviewAnswerShowData, reviewAnswerShowSuccess, selectPercentage, selectResultTempData } from 'src/store/reducers/tempDataSlice'
import ShowScore from 'src/components/Common/ShowScore'
import { t } from 'i18next'
import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import ShowScoreSkeleton from 'src/components/view/common/ShowScoreSkeleton'
const Layout = dynamic(() => import('src/components/Layout/Layout'), { ssr: false })

const MySwal = withReactContent(Swal)

const TrueandFalsePlay = () => {

    const dispatch = useDispatch()

    const reviewAnserShow = useSelector(reviewAnswerShowData)

    const showScore = useSelector(selectResultTempData);

    const percentageScore = useSelector(selectPercentage)

    const resultScore = useSelector(getQuizEndData)

    //location
    const navigate = useRouter()

    const systemconfig = useSelector(sysConfigdata)

    const review_answers_deduct_coin = Number(systemconfig?.review_answers_deduct_coin)

    const userData = useSelector(state => state.User)

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
                        title: t("True & False") + " " + t("review_answer"),
                        status: status,
                        onSuccess: (response) => {
                            updateUserDataInfo(response.data);
                            navigate.push("/quiz-play/true-and-false-play/review-answer")
                            dispatch(reviewAnswerShowSuccess(true))
                        },
                        onError: (error) => {
                            Swal.fire(t("ops"), t('Please '), t("try_again"), "error");
                            console.log(error);
                        }
                    });
                } else {
                    navigate.push("/quiz-play/true-and-false-play/review-answer")
                }
            }
        });
    };

    const goBack = () => {
        navigate.push('/quiz-play')
    }

    return (
        <Layout>
            <Breadcrumb title={t('True & False')} content="" contentTwo="" />
            <div className='true_and_false dashboard'>
                <div className='container'>
                    <div className='row '>
                        <div className='morphisam bg_white'>
                            <div className='whitebackground'>
                                <Suspense fallback={<ShowScoreSkeleton />}>
                                    <ShowScore
                                        showCoinandScore={true}
                                        score={percentageScore}
                                        totalQuestions={showScore.totalQuestions}
                                        onReviewAnswersClick={handleReviewAnswers}
                                        goBack={goBack}
                                        coins={showScore.coins}
                                        quizScore={showScore.quizScore}
                                        showQuestions={showScore.showQuestions}
                                        reviewAnswer={showScore.reviewAnswer}
                                        corrAns={resultScore.Correctanswer}
                                        inCorrAns={resultScore.InCorrectanswer}
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

export default withTranslation()(TrueandFalsePlay)
