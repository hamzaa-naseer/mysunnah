import { lazy, Suspense } from "react";
import { withTranslation } from "react-i18next";
import CatCompoSkeleton from "src/components/view/common/CatCompoSkeleton";
const SubCategoriesComponent = lazy(() => import('src/components/view/common/SubCategoriesComponent'));

// import SubCategoriesComponent from "src/components/view/common/SubCategoriesComponent";


const FunandLearnSubCatSlider = (data) => {
    const handleChangeSubCategory = (subcat) => {
        data.onClick(subcat)
    }
    return (
        <>
            <div className="quizplay subcat__slider__context subCatWrapper">
                <div className="container">
                    <div className="row">
                        <Suspense fallback={<CatCompoSkeleton />}>
                            <SubCategoriesComponent subloading={data.subloading} handleChangeSubCategory={handleChangeSubCategory} />
                        </Suspense>
                    </div>
                </div>
            </div>
        </>
    );
};
export default withTranslation()(FunandLearnSubCatSlider);
