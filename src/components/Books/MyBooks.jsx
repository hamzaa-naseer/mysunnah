'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    FaBookOpen,
    FaDownload,
    FaShoppingCart,
    FaCalendarAlt,
    FaSpinner
} from 'react-icons/fa';
import { withTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import BookGrid from './BookGrid';
import { getPurchasedBooksApi } from '../../utils/api';
import { apiCallWithToken } from '../../utils/index';
import Meta from '../SEO/Meta';

const MyBooks = ({ t }) => {
    const [purchasedBooks, setPurchasedBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalBooks, setTotalBooks] = useState(0);

    const router = useRouter();
    const isAuthenticated = useSelector(state => state.User.isLogin); // Fixed: use isLogin instead of isAuthenticated
    const booksPerPage = 12;

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/auth/login');
            return;
        }
        loadPurchasedBooks();
    }, [isAuthenticated]); // Removed router dependency to prevent re-renders

    const loadPurchasedBooks = async (page = 1) => {
        setLoading(true);
        try {
            const offset = (page - 1) * booksPerPage;
            const response = await apiCallWithToken(getPurchasedBooksApi(offset, booksPerPage));

            if (!response.error && response.data) {
                setPurchasedBooks(response.data);
                setTotalBooks(response.data.length);
            } else {
                setPurchasedBooks([]);
                setTotalBooks(0);
                if (response.message) {
                    toast.error(response.message);
                }
            }
        } catch (error) {
            console.error('Error loading purchased books:', error);
            toast.error(t('failed_to_load_books'));
            setPurchasedBooks([]);
            setTotalBooks(0);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        loadPurchasedBooks(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const totalPages = Math.ceil(totalBooks / booksPerPage);

    if (!isAuthenticated) {
        return null; // Will redirect in useEffect
    }

    return (
        <>
            <Meta
                title={t('my_books')}
                description={t('view_and_download_purchased_books')}
                keywords="my books, purchased books, Islamic books, downloads"
            />

            <div className="my-books-container">
                {/* Header Section */}
                <div className="my-books-header">
                    <div className="container">
                        <div className="row align-items-center">
                            <div className="col-lg-8">
                                <div className="header-content">
                                    <div className="header-icon">
                                        <FaBookOpen />
                                    </div>
                                    <div className="header-text">
                                        <h1 className="page-title">{t('my_books')}</h1>
                                        <p className="page-subtitle">
                                            {t('access_download_purchased_books')}
                                        </p>
                                        <div className="stats-info">
                                            <span className="stat-item">
                                                <FaBookOpen className="me-1" />
                                                {loading ? t('loading') : `${totalBooks} ${t('books_owned')}`}
                                            </span>
                                            <span className="stat-item">
                                                <FaDownload className="me-1" />
                                                {t('unlimited_downloads')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-4 text-end">
                                <div className="header-actions">
                                    <Link href="/books">
                                        <button className="btn btn-primary">
                                            <FaShoppingCart className="me-2" />
                                            {t('browse_more_books')}
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="my-books-content">
                    <div className="container">
                        {loading ? (
                            <div className="loading-section">
                                <div className="text-center">
                                    <FaSpinner className="spin loading-icon" />
                                    <h4>{t('loading_your_books')}</h4>
                                </div>
                            </div>
                        ) : purchasedBooks.length === 0 ? (
                            <div className="empty-library">
                                <div className="empty-state-content">
                                    <div className="empty-state-icon">
                                        <FaBookOpen size={64} />
                                    </div>
                                    <h3 className="empty-state-title">{t('no_books_purchased_yet')}</h3>
                                    <p className="empty-state-description">
                                        {t('start_building_library_description')}
                                    </p>
                                    <div className="empty-state-actions">
                                        <Link href="/books">
                                            <button className="btn btn-primary btn-lg">
                                                <FaShoppingCart className="me-2" />
                                                {t('browse_books')}
                                            </button>
                                        </Link>
                                    </div>

                                    {/* Benefits of purchasing */}
                                    <div className="purchase-benefits mt-4">
                                        <h5>{t('benefits_of_purchasing')}:</h5>
                                        <div className="benefits-grid">
                                            <div className="benefit-item">
                                                <FaDownload className="benefit-icon" />
                                                <span>{t('instant_downloads')}</span>
                                            </div>
                                            <div className="benefit-item">
                                                <FaBookOpen className="benefit-icon" />
                                                <span>{t('lifetime_access')}</span>
                                            </div>
                                            <div className="benefit-item">
                                                <FaCalendarAlt className="benefit-icon" />
                                                <span>{t('read_anytime')}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Books Count */}
                                <div className="books-header mb-4">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div className="books-count">
                                            <h4>{t('your_library')}</h4>
                                            <span className="count-text">
                                                {totalBooks} {totalBooks === 1 ? t('book') : t('books')} {t('purchased')}
                                            </span>
                                        </div>
                                        <div className="view-options">
                                            <small className="text-muted">
                                                {t('click_any_book_to_download')}
                                            </small>
                                        </div>
                                    </div>
                                </div>

                                {/* Books Grid */}
                                <BookGrid
                                    books={purchasedBooks}
                                    loading={false}
                                    isPurchasedBooks={true}
                                    showActions={true}
                                    t={t}
                                />

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="pagination-wrapper">
                                        <nav aria-label="My books pagination">
                                            <ul className="pagination justify-content-center">
                                                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                    <button
                                                        className="page-link"
                                                        onClick={() => handlePageChange(currentPage - 1)}
                                                        disabled={currentPage === 1}
                                                    >
                                                        {t('previous')}
                                                    </button>
                                                </li>

                                                {[...Array(totalPages)].map((_, index) => {
                                                    const page = index + 1;
                                                    if (
                                                        page === 1 ||
                                                        page === totalPages ||
                                                        (page >= currentPage - 2 && page <= currentPage + 2)
                                                    ) {
                                                        return (
                                                            <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                                                                <button
                                                                    className="page-link"
                                                                    onClick={() => handlePageChange(page)}
                                                                >
                                                                    {page}
                                                                </button>
                                                            </li>
                                                        );
                                                    } else if (
                                                        page === currentPage - 3 ||
                                                        page === currentPage + 3
                                                    ) {
                                                        return (
                                                            <li key={page} className="page-item disabled">
                                                                <span className="page-link">...</span>
                                                            </li>
                                                        );
                                                    }
                                                    return null;
                                                })}

                                                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                                    <button
                                                        className="page-link"
                                                        onClick={() => handlePageChange(currentPage + 1)}
                                                        disabled={currentPage === totalPages}
                                                    >
                                                        {t('next')}
                                                    </button>
                                                </li>
                                            </ul>
                                        </nav>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default withTranslation()(MyBooks);
