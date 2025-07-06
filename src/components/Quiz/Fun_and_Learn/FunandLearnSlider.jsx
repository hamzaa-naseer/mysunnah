import { withTranslation } from 'react-i18next'
import Skeleton from 'react-loading-skeleton'
import { t } from 'i18next'
import errorimg from "src/assets/images/error.svg"
import { lazy, Suspense } from 'react'
import QuestionSkeleton from 'src/components/view/common/QuestionSkeleton'
import CatCompoSkeleton from 'src/components/view/common/CatCompoSkeleton'
const FunandLearnIntro = lazy(()=>import('./FunandLearnIntro'))

const FunandLearnSlider = data => {

  return (
    <>
      <div className='subcat__slider__context mt-5'>
        <div className='container'>
          <div className='quizplay-slider row'>
            {data.funandlearningloading ? (
              <div className='text-center'>
                <CatCompoSkeleton />
              </div>
            ) : (
              <>
                {data.data ? (
                  <>
                    {data.data?.length > 0 &&
                      data.data.map((Fundata, key) => {
                        return (
                          <div className='col-md-3 col-12' key={key}>
<Suspense fallback={<QuestionSkeleton/>}>
                            <FunandLearnIntro
                              categoryall={data.categoryall}
                              subcategoryall={data.subcategoryall}
                              data={Fundata}
                              funandlearn={Fundata.id}
                            />
                            </Suspense>
                          </div>
                        )
                      })}
                  </>
                ) : (
                  <div className='text-center mt-4 commonerror'>
                    <img src={errorimg.src} title='wrteam' className='error_img' />
                    <p>{t('no_data_found')}</p>
                  </div>
                )}
              </>
            )}

          </div>
        </div>
      </div>
    </>
  )
}
export default withTranslation()(FunandLearnSlider)
