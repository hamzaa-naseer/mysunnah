'use client'
import React from 'react';
import Skeleton from 'react-loading-skeleton';

const BookCardSkeleton = () => {
    return (
        <div className="book-card">
            <div className="book-card-header">
                <Skeleton width={80} height={20} />
            </div>

            <div className="book-image-container">
                <Skeleton
                    width={200}
                    height={280}
                    className="book-image-skeleton"
                />
            </div>

            <div className="book-card-body">
                <Skeleton
                    height={20}
                    width="90%"
                    className="mb-2"
                />
                <Skeleton
                    height={16}
                    width="70%"
                    className="mb-2"
                />
                <Skeleton
                    height={14}
                    count={2}
                    className="mb-2"
                />

                <div className="d-flex align-items-center justify-content-between">
                    <Skeleton width={80} height={16} />
                    <Skeleton width={100} height={32} />
                </div>
            </div>
        </div>
    );
};

export default BookCardSkeleton;
