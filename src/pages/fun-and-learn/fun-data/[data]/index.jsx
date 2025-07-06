"use client"
import React, { Fragment, lazy, Suspense, useEffect, useState } from 'react'
import { withTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { getfunandlearnApi } from 'src/store/actions/campaign'
import Breadcrumb from 'src/components/Common/Breadcrumb'
import { selectCurrentLanguage } from 'src/store/reducers/languageSlice'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import QuestionSkeleton from 'src/components/view/common/QuestionSkeleton'
const Layout = dynamic(() => import('src/components/Layout/Layout'), { ssr: false })
const FunandLearnSlider = lazy(() => import('src/components/Quiz/Fun_and_Learn/FunandLearnSlider'))
const Fun_and_Learn = ({ t }) => {
  const [funandlearn, setFunandLearn] = useState({ all: '', selected: '' })


  const router = useRouter();

  const [funandlearningloading, setfunandlearnLoading] = useState(true)

  const getAllData = () => {
    setFunandLearn([])

    if (router.query.isSubcategory === "0") {
      // subcategory api
      getfunandlearnApi({
        type: 'category',
        type_id: router.query.catid,
        onSuccess: response => {
          let funandlearn_data = response.data
          setFunandLearn({
            all: funandlearn_data,
            selected: funandlearn_data[0]
          })
          // console.log(funandlearn)
          setfunandlearnLoading(false)
        },
        onError: error => {
          setfunandlearnLoading(false)
          console.log(error)
          toast.error(t('no_data_found'))
        }
      })
    } else {
      getfunandlearnApi({
        type: 'subcategory',
        type_id: router.query.catid,
        onSuccess: response => {
          let funandlearn_data = response.data
          setFunandLearn({
            all: funandlearn_data,
            selected: funandlearn_data[0]
          })
          setfunandlearnLoading(false)
          // console.log(funandlearn)
        },
        onError: error => {
          setfunandlearnLoading(false)
          console.log(error)
          setFunandLearn("")
          toast.error(t('no_data_found'))
        }
      })
    }
  }

  useEffect(() => {
    if (!router.isReady) return;
    getAllData();
  }, [router.isReady, selectCurrentLanguage]);

  return (
    <Layout>
      <Breadcrumb showBreadcrumb={true} title={t('fun_and_learn')} content={t('home')} contentTwo={funandlearn?.selected?.category_name} contentThree={funandlearn?.selected?.subcategory_name} contentFour="" />
      <div className='funandlearn mb-5'>
        <div className='container'>
          <div className='row morphisam mb-5'>
            <div className='col-12'>
              <div className='bottom_card'>
                <Suspense fallback={<QuestionSkeleton />}>
                  <FunandLearnSlider
                    data={funandlearn.all}
                    selected={funandlearn.selected}
                    funandlearningloading={funandlearningloading}
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

export default withTranslation()(Fun_and_Learn)
