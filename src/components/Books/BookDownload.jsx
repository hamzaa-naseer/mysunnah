'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
    FaDownload,
    FaSpinner,
    FaCheckCircle,
    FaExclamationTriangle,
    FaArrowLeft,
    FaBookOpen,
    FaFilePdf
} from 'react-icons/fa';
import { withTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { downloadBookApi, getBookByIdApi } from '../../utils/api';
import { apiCallWithToken, apiCall } from '../../utils/index';
import Meta from '../SEO/Meta';

const BookDownload = ({ t }) => {
    const router = useRouter();
    const { id } = router.query;

    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState(null);
    const [error, setError] = useState(null);

    const isAuthenticated = useSelector(state => state.User.isLogin); // Fixed: use isLogin instead of isAuthenticated

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/auth/login');
            return;
        }

        if (id) {
            loadBookAndDownload();
        }
    }, [id, isAuthenticated, router]);

    const loadBookAndDownload = async () => {
        setLoading(true);
        setError(null);

        try {
            // First, get book details
            const bookResponse = await apiCall(getBookByIdApi(id));

            if (!bookResponse.error && bookResponse.data) {
                setBook(bookResponse.data);

                // Then attempt to get download URL
                await getDownloadUrl();
            } else {
                setError(t('book_not_found'));
            }
        } catch (error) {
            console.error('Error loading book:', error);
            setError(t('failed_to_load_book'));
        } finally {
            setLoading(false);
        }
    };

    const getDownloadUrl = async () => {
        setDownloading(true);

        try {
            const response = await apiCallWithToken(downloadBookApi(id));

            if (!response.error && response.pdf_url) {
                setDownloadUrl(response.pdf_url);

                // Auto-start download
                const link = document.createElement('a');
                link.href = response.pdf_url;
                link.download = `${book?.title || 'book'}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                toast.success(t('download_started'));
            } else {
                setError(response.message || t('download_failed'));
            }
        } catch (error) {
            console.error('Error downloading book:', error);
            setError(t('download_failed'));
        } finally {
            setDownloading(false);
        }
    };

    const handleRetryDownload = () => {
        getDownloadUrl();
    };

    if (!isAuthenticated) {
        return null; // Will redirect in useEffect
    }

    return (
        <>
            <Meta
                title={`${t('download')} - ${book?.title || t('book')}`}
                description={t('download_your_purchased_book')}
            />

            <div className="book-download-container">
                <div className="container">
                    <div className="download-content">

                        {/* Header */}
                        <div className="download-header">
                            <Link href="/books/my-books" className="back-link">
                                <FaArrowLeft className="me-1" />
                                {t('back_to_my_books')}
                            </Link>

                            <h1 className="page-title">
                                <FaDownload className="me-2" />
                                {t('download_book')}
                            </h1>
                        </div>

                        {/* Download Card */}
                        <div className="download-card">
                            {loading ? (
                                <div className="download-state loading">
                                    <FaSpinner className="spin state-icon" />
                                    <h3>{t('preparing_download')}</h3>
                                    <p>{t('please_wait_while_preparing')}</p>
                                </div>
                            ) : error ? (
                                <div className="download-state error">
                                    <FaExclamationTriangle className="state-icon" />
                                    <h3>{t('download_error')}</h3>
                                    <p>{error}</p>

                                    <div className="error-actions">
                                        <button
                                            className="btn btn-primary me-2"
                                            onClick={handleRetryDownload}
                                            disabled={downloading}
                                        >
                                            {downloading ? (
                                                <>
                                                    <FaSpinner className="spin me-1" />
                                                    {t('retrying')}...
                                                </>
                                            ) : (
                                                <>
                                                    <FaDownload className="me-1" />
                                                    {t('retry_download')}
                                                </>
                                            )}
                                        </button>

                                        <Link href="/books/my-books">
                                            <button className="btn btn-outline-secondary">
                                                {t('back_to_my_books')}
                                            </button>
                                        </Link>
                                    </div>

                                    <div className="help-text mt-3">
                                        <small className="text-muted">
                                            {t('download_help_text')}
                                        </small>
                                    </div>
                                </div>
                            ) : downloading ? (
                                <div className="download-state downloading">
                                    <FaSpinner className="spin state-icon" />
                                    <h3>{t('downloading')}</h3>
                                    <p>{t('download_in_progress')}</p>

                                    {book && (
                                        <div className="book-info">
                                            <h5>{book.title}</h5>
                                            <p className="text-muted">{t('by')} {book.author}</p>
                                        </div>
                                    )}
                                </div>
                            ) : downloadUrl ? (
                                <div className="download-state success">
                                    <FaCheckCircle className="state-icon" />
                                    <h3>{t('download_ready')}</h3>
                                    <p>{t('download_should_start_automatically')}</p>

                                    {book && (
                                        <div className="book-info">
                                            <h5>{book.title}</h5>
                                            <p className="text-muted">{t('by')} {book.author}</p>
                                            <div className="file-info">
                                                <FaFilePdf className="file-icon" />
                                                <span>PDF Format</span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="download-actions">
                                        <a
                                            href={downloadUrl}
                                            download={`${book?.title || 'book'}.pdf`}
                                            className="btn btn-success btn-lg me-2"
                                        >
                                            <FaDownload className="me-2" />
                                            {t('download_again')}
                                        </a>

                                        <Link href="/books/my-books">
                                            <button className="btn btn-outline-primary">
                                                {t('back_to_library')}
                                            </button>
                                        </Link>
                                    </div>

                                    <div className="download-tips mt-4">
                                        <h6>{t('download_tips')}:</h6>
                                        <ul className="tips-list">
                                            <li>{t('tip_save_to_device')}</li>
                                            <li>{t('tip_unlimited_downloads')}</li>
                                            <li>{t('tip_works_offline')}</li>
                                            <li>{t('tip_share_responsibly')}</li>
                                        </ul>
                                    </div>
                                </div>
                            ) : null}
                        </div>

                        {/* Additional Actions */}
                        <div className="additional-actions">
                            <div className="row text-center">
                                <div className="col-md-4">
                                    <Link href="/books">
                                        <button className="btn btn-outline-primary w-100">
                                            <FaBookOpen className="me-2" />
                                            {t('browse_more_books')}
                                        </button>
                                    </Link>
                                </div>
                                <div className="col-md-4">
                                    <Link href="/books/my-books">
                                        <button className="btn btn-outline-primary w-100">
                                            <FaBookOpen className="me-2" />
                                            {t('my_library')}
                                        </button>
                                    </Link>
                                </div>
                                <div className="col-md-4">
                                    <Link href="/profile">
                                        <button className="btn btn-outline-primary w-100">
                                            {t('my_profile')}
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default withTranslation()(BookDownload);
