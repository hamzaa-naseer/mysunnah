"use client"
import Breadcrumb from 'src/components/Common/Breadcrumb'
import toast from 'react-hot-toast'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { withTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { sysConfigdata } from 'src/store/reducers/settingsSlice'
import { getQuizEndData, reviewAnswerShowData, reviewAnswerShowSuccess, selectPercentage, selectResultTempData, selecttempdata } from 'src/store/reducers/tempDataSlice'
import { UserCoinScoreApi } from 'src/store/actions/campaign'
import { updateUserDataInfo } from 'src/store/reducers/userSlice'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
const Layout = dynamic(() => import('src/components/Layout/Layout'), { ssr: false })
import { t } from 'i18next'
import { lazy, Suspense } from 'react'
import ShowScoreSkeleton from 'src/components/view/common/ShowScoreSkeleton'
const ShowScore = lazy(() => import('src/components/Common/ShowScore'))
const MySwal = withReactContent(Swal)

const ContestPlayBoard = () => {

    const dispatch = useDispatch()

    const reviewAnserShow = useSelector(reviewAnswerShowData)

    const systemconfig = useSelector(sysConfigdata)

    const review_answers_deduct_coin = Number(systemconfig?.review_answers_deduct_coin)

    const navigate = useRouter()

    const percentageScore = useSelector(selectPercentage)

    const resultScore = useSelector(getQuizEndData)

    const showScore = useSelector(selectResultTempData);

    // store data get
    const userData = useSelector(state => state.User)

    const handleReviewAnswers = () => {
        let coins = review_answers_deduct_coin;
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
                        title: `${t('contestPlay')} ${t('review_answer')} `,
                        status: status, onSuccess: (response) => {
                            updateUserDataInfo(response.data)
                            navigate.push("/contest-play/review-answer")
                            dispatch(reviewAnswerShowSuccess(true))
                        }, onError: (error) => {
                            Swal.fire(t("ops"), t('Please '), t("try_again"), "error");
                            console.log(error);
                        }
                    })
                } else {
                    navigate.push("/contest-play/review-answer")
                }
            }
        });

    };

    const goBack = () => {
        navigate.push('/contest-play')
    }



    return (
        <Layout>
            <Breadcrumb title={t('contest_playBoard')} content="" contentTwo="" />
            <div className='funandlearnplay dashboard'>
                <div className='container'>
                    <div className='row '>
                        <div className='morphisam bg_white'>
                            <div className='whitebackground'>
                                <>
                                    <Suspense fallback={<ShowScoreSkeleton />}>
                                        <ShowScore
                                            showCoinandScore={true}
                                            score={percentageScore}
                                            totalQuestions={showScore.totalQuestions}
                                            onReviewAnswersClick={handleReviewAnswers}
                                            goBack={goBack}
                                            quizScore={showScore.quizScore}
                                            showQuestions={true}
                                            reviewAnswer={false}
                                            playAgain={false}
                                            coins={showScore.coins}
                                            corrAns={resultScore.Correctanswer}
                                            inCorrAns={resultScore.InCorrectanswer}
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
export default withTranslation()(ContestPlayBoard)
