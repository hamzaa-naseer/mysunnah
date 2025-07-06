"use client"
import React, { lazy, Suspense, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { withTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { selfQuestionsApi } from 'src/store/actions/campaign'
import Breadcrumb from 'src/components/Common/Breadcrumb'
import { selecttempdata } from 'src/store/reducers/tempDataSlice'
import dynamic from 'next/dynamic'
const Layout = dynamic(() => import('src/components/Layout/Layout'), { ssr: false })
import { t } from 'i18next'
import QuestionSkeleton from 'src/components/view/common/QuestionSkeleton'
const SelfLearningQuestions = lazy(() => import('src/components/Quiz/SelfLearning/SelfLearningQuestions'))
const SelfLearningplay = () => {

  let getData = useSelector(selecttempdata)

  const TIMER_SECONDS = getData.timer * 60

  const [questions, setQuestions] = useState([{ id: '', isBookmarked: false }])

  useEffect(() => {
    if (getData) {
      getNewQuestions(getData.category_id, getData.subcategory_id, getData.limit)
    }
  }, [])

  const getNewQuestions = (category_id, subcategory_id, limit) => {
    selfQuestionsApi({
      category: category_id,
      subcategory: subcategory_id,
      limit: limit,
      onSuccess: (response) => {

        let questions = response.data.map((data) => {

          let question = data.question
          let note = data?.note

          return {
            ...data,

            note: note,
            question: question,
            selected_answer: "",
            isAnswered: false,
          };
        });
        // console.log("que",questions)
        setQuestions(questions);

      },
      onError: (error) => {
        toast.error(t("no_que_found"));
        // navigate.push("/quiz-play");
        console.log(error);
      }
    });
  };

  const handleAnswerOptionClick = (questions) => {
    setQuestions(questions)
  }


  return (
    <Layout>
      <Breadcrumb title={t('Self Challenge')} content="" contentTwo="" />
      <div className='dashboard selflearnig-play'>
        <div className='container'>
          <div className='row '>
            <div className='morphisam'>
              <div className='whitebackground'>
                {(() => {
                  if (questions && questions?.length >= 0) {
                    return (
                      <Suspense fallback={<QuestionSkeleton />}>
                        <SelfLearningQuestions
                          questions={questions}
                          timerSeconds={TIMER_SECONDS}
                          onOptionClick={handleAnswerOptionClick}
                          showQuestions={true}
                          showBookmark={false}
                        />
                      </Suspense>
                    )
                  } else {
                    return (
                      <div className='text-center text-white'>
                        <p>{t('no_que_found')}</p>
                      </div>
                    )
                  }
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
export default withTranslation()(SelfLearningplay)
