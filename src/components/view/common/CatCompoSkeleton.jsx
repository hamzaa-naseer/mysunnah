import React from 'react'
import Skeleton from 'react-loading-skeleton'


const CatCompoSkeleton = () => {

    const count = [1, 2, 3, 4, 5,6]
    return (<>
    <div className="row gap-0">
        {count.map((a) => {
            
            return (
                    <div className="col-sm-12 col-md-6 col-lg-4 ">
                    
                            <div className='skeleton_div'>
                            
                                <div >
                                    <Skeleton count={1} className='m-3 px-2 py-4 '/>
                                </div>
                                <div className='position-absolute'>
                                    <Skeleton count={1} className='skeleton_title ' />
                                </div>
                                <div className='position-absolute'>
                                    <Skeleton count={1} className='skeleton_disc ' />
                                </div>
                                <div className='position-absolute'>
                                    <Skeleton count={1} className='skeleton_disc2 ' />
                                </div>
                                <div className='position-absolute'>
                                    <Skeleton count={1} className='skeleton_disc3 ' />
                                </div>

                            </div>
                        
                </div>)
        })}
        </div>
    </>)
}

export default CatCompoSkeleton