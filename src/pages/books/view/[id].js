import React from 'react';
import dynamic from 'next/dynamic';
import Layout from '../../../components/Layout/Layout';

// Dynamically import BookView component with SSR disabled
const BookView = dynamic(() => import('../../../components/Books/BookView'), {
    ssr: false,
    loading: () => (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    )
});

const BookViewPage = () => {
    return (
        <Layout>
            <BookView />
        </Layout>
    );
};

export default BookViewPage;
