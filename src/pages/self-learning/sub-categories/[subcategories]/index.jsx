"use client"
import React, { Fragment, lazy, Suspense, useEffect, useState } from 'react'
import { withTranslation } from 'react-i18next'
import { selectCurrentLanguage } from 'src/store/reducers/languageSlice'
import { subcategoriesApi } from 'src/store/actions/campaign'
import Breadcrumb from 'src/components/Common/Breadcrumb'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
const Layout = dynamic(() => import('src/components/Layout/Layout'), { ssr: false })
import toast from 'react-hot-toast'
import { t } from 'i18next'
import { Loadtempdata } from 'src/store/reducers/tempDataSlice'
import { isValidSlug, scrollhandler } from 'src/utils'
import CatCompoSkeleton from 'src/components/view/common/CatCompoSkeleton'
const SubCategoriesComponent = lazy(() => import('src/components/view/common/SubCategoriesComponent'))
const SelfLearning = () => {

  const router = useRouter()

  const cateSlug = router.query.subcategories;

  // subcategory
  const [subcategory, setsubcategory] = useState({
    all: '',
    selected: ''
  })

  // all data
  const getAllData = () => {
    if (cateSlug) {
      subcategoriesApi({
        category_id: cateSlug,
        subcategory_id: '',
        onSuccess: response => {

          let subCategories = response.data
          const filteredSubCategories = subCategories.filter((subCategories) => {
            return subCategories.is_premium === "0";
          });
          setsubcategory({
            all: filteredSubCategories?.length > 0 ? filteredSubCategories : null,
          })


        },
        onError: error => {
          console.log(error)
        }
      })
    } else {
      toast.error(t("no_data_found"));
    }
  }

  //handle subcatgory
  const handleChangeSubCategory = subcategory_data => {
    // this is for premium subcategory only
    Loadtempdata(subcategory_data)
    const slug = subcategory_data.slug;
    if (isValidSlug(slug)) {
      router.push({
        pathname: `/self-learning/selection/${subcategory_data.slug}`,
        query: {
          catslug: cateSlug,
          subcatslug: subcategory_data.slug
        }
      })
    }
    scrollhandler(700)
  }

  useEffect(() => {
    if (!router.isReady) return;
    getAllData();
  }, [router.isReady, selectCurrentLanguage]);

  return (
    <Layout>
      <Breadcrumb
        showBreadcrumb={true}
        title={t('Self Challenge')}
        content={t('home')}
        contentTwo={subcategory?.all && subcategory.all?.length > 0 ? subcategory.all[0].category_name : ""}
      />
      <div className='quizplay quizplay mb-5'>
        <div className='container'>
          <div className='row morphisam mb-5'>
            {/* sub category middle sec */}
            <div className='col-xxl-12 col-xl-12 col-lg-12 col-md-12 col-12'>
              <div className='right-sec'>
                <div className='subcat__slider__context'>
                  <div className='quizplay-slider'>
                    <Suspense fallback={<CatCompoSkeleton />}>
                      <SubCategoriesComponent subCategory={subcategory.all} handleChangeSubCategory={handleChangeSubCategory} />
                    </Suspense>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default withTranslation()(SelfLearning)
