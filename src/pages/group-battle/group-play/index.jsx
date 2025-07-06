"use client"
import React, { Suspense, useEffect, useState } from 'react'
import Breadcrumb from 'src/components/Common/Breadcrumb'
import toast from 'react-hot-toast'
import { withTranslation } from 'react-i18next'
import { QuestionsByRoomIdApi } from 'src/store/actions/campaign'
import { resultTempDataSuccess, selecttempdata } from 'src/store/reducers/tempDataSlice'
import { useDispatch, useSelector } from 'react-redux'
import { sysConfigdata } from 'src/store/reducers/settingsSlice'
import { useRouter } from 'next/router'
import { useRef } from "react";
import dynamic from 'next/dynamic'
const Layout = dynamic(() => import('src/components/Layout/Layout'), { ssr: false })
import { t } from 'i18next'
import DOMPurify from 'dompurify'
import QuestionSkeleton from 'src/components/view/common/QuestionSkeleton'
const GroupQuestions = dynamic(() => import('src/components/Quiz/GroupBattle/GroupQuestions'), {
  ssr: false
})

const GroupPlay = () => {

  const navigate = useRouter()

  const dispatch = useDispatch()

  const [questions, setQuestions] = useState([{ id: '', isBookmarked: false }])

  let getData = useSelector(selecttempdata)

  const systemconfig = useSelector(sysConfigdata)

  const TIMER_SECONDS = Number(systemconfig?.battle_mode_group_in_seconds)

  useEffect(() => {
    if (getData) {
      getNewQuestions(getData.roomCode)
    }
  }, [])

  const getNewQuestions = (match_id) => {
    QuestionsByRoomIdApi({
      room_id: match_id,
      onSuccess: (response) => {
        let questions = response.data.map((data) => {




          // Use \n to represent line breaks in the data


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
        navigate.push("/quiz-play");
        console.log(error);
      }
    });
  };

  const handleAnswerOptionClick = (questions) => {
    setQuestions(questions)
  }

  const onQuestionEnd = async () => {
    const tempData = {
      totalQuestions: questions?.length,
      question: questions,
    };
    // Dispatch the action with the data
    dispatch(resultTempDataSuccess(tempData));
    await navigate.push("/group-battle/result")
  }

  return (
    <Layout>
      <Breadcrumb title={t('Group Battle')} content={t('')} contentTwo="" />
      <div className='funandlearnplay dashboard battlerandom'>
        <div className='container'>
          <div className='row '>
            <div className='morphisam'>
              <div className='whitebackground'>
                <>
                  {(() => {
                    if (questions && questions?.length > 0 && questions[0]?.id !== '') {
                      return (
                        <Suspense fallback={<QuestionSkeleton />}>
                          <GroupQuestions
                            questions={questions}
                            timerSeconds={TIMER_SECONDS}
                            onOptionClick={handleAnswerOptionClick}
                            onQuestionEnd={onQuestionEnd}
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
                </>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
export default withTranslation()(GroupPlay)
