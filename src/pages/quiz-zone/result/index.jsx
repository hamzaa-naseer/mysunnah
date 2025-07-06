"use client"
import { t } from "i18next";
import { Breadcrumb } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { getQuizEndData, reviewAnswerShowData, reviewAnswerShowSuccess, selectPercentage, selectQuizZonePercentage, selectResultTempData, selecttempdata, updateTempdata } from "src/store/reducers/tempDataSlice";
import toast from 'react-hot-toast'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import { sysConfigdata } from "src/store/reducers/settingsSlice";
import { updateUserDataInfo } from "src/store/reducers/userSlice";
import { UserCoinScoreApi } from "src/store/actions/campaign";
import { useRouter } from "next/router";
import dynamic from 'next/dynamic'
import { lazy, Suspense } from "react";
import ShowScoreSkeleton from "src/components/view/common/ShowScoreSkeleton";
const ShowScore = lazy(() => import('src/components/Common/ShowScore'))
const Layout = dynamic(() => import('src/components/Layout/Layout'), { ssr: false })


const MySwal = withReactContent(Swal)

const Index = () => {

    const navigate = useRouter()

    const dispatch = useDispatch()

    const reviewAnserShow = useSelector(reviewAnswerShowData)

    const showscreenornot = useSelector(selectQuizZonePercentage)

    const percentageScore = useSelector(selectPercentage)

    const showScore = useSelector(selectResultTempData);

    const resultScore = useSelector(getQuizEndData)

    const systemconfig = useSelector(sysConfigdata)

    const review_answers_deduct_coin = Number(systemconfig?.review_answers_deduct_coin)

    const userData = useSelector(state => state.User)

    let getData = useSelector(selecttempdata)

    const playAgain = () => {
        navigate.push(`/quiz-zone/level/${showScore.querylevel}/dashboard-play`)
    }

    const nextLevel = () => {
        let temp_level = getData.level + 1
        updateTempdata(temp_level)
        navigate.push(`/quiz-zone/level/${showScore.querylevel}/dashboard-play`)
    }

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
                        title: `${t('Quiz Zone')} ${t('review_answer')} `,
                        status: status,
                        onSuccess: (response) => {
                            updateUserDataInfo(response.data);
                            navigate.push("/quiz-zone/review-answer")
                            dispatch(reviewAnswerShowSuccess(true))
                        },
                        onError: (error) => {
                            Swal.fire(t("ops"), t('Please '), t("try_again"), "error");
                            console.log(error);
                        }
                    });
                } else {
                    navigate.push("/quiz-zone/review-answer")
                }
            }
        });
    };

    const goBack = () => {
        navigate.push('/quiz-zone')
    }

    return (
        <Layout>
            <Breadcrumb title={`${t('quiz')} ${t('play')}`} content="" contentTwo="" />
            <div className='dashboard'>
                <div className='container'>
                    <div className='row '>
                        <div className='morphisam bg_white'>
                            <div className='whitebackground'>
                                <Suspense fallback={<ShowScoreSkeleton />}>
                                    <ShowScore
                                        showCoinandScore={showscreenornot}
                                        score={percentageScore}
                                        totalQuestions={showScore.totalQuestions}
                                        onPlayAgainClick={playAgain}
                                        onReviewAnswersClick={handleReviewAnswers}
                                        onNextLevelClick={nextLevel}
                                        goBack={goBack}
                                        coins={showScore.coins}
                                        quizScore={showScore.quizScore}
                                        currentLevel={showScore.currentLevel}
                                        maxLevel={showScore.maxLevel}
                                        showQuestions={showScore.showQuestions}
                                        reviewAnswer={showScore.reviewAnswer}
                                        playAgain={showScore.playAgain}
                                        nextlevel={showScore.nextlevel}
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

export default Index