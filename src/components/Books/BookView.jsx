'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
    FaArrowLeft,
    FaDownload,
    FaSpinner,
    FaExclamationTriangle,
    FaExpand,
    FaCompress,
    FaSearch,
    FaSearchPlus,
    FaSearchMinus
} from 'react-icons/fa';
import { withTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { getBookByIdApi } from '../../utils/api';
import { apiCallWithToken } from '../../utils/index';
import Meta from '../SEO/Meta';

const BookView = ({ t }) => {
    const router = useRouter();
    const { id } = router.query;

    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [zoom, setZoom] = useState(100);

    const userToken = useSelector(state => state.User.token);
    const isAuthenticated = !!userToken;
    const userData = useSelector(state => state.User.data);

    useEffect(() => {
        if (id) {
            loadBookForViewing();
        }
    }, [id, isAuthenticated]);

    const loadBookForViewing = async () => {
        if (!isAuthenticated) {
            toast.error(t('please_login_first'));
            router.push('/auth/login');
            return;
        }

        setLoading(true);
        try {
            const response = await apiCallWithToken(getBookByIdApi(id));

            if (!response.error && response.data) {
                const bookData = response.data;

                // Check if user has purchased this book
                if (bookData.is_purchased !== 1 && bookData.is_purchased !== "1") {
                    toast.error(t('book_not_purchased'));
                    router.push(`/books/${id}`);
                    return;
                }

                setBook(bookData);

                // Set PDF URL with authentication
                setPdfUrl(`/api/books/pdf/${id}?token=${userToken}`);

            } else {
                toast.error(response.message || t('book_not_found'));
                router.push('/books');
            }
        } catch (error) {
            console.error('Error loading book for viewing:', error);
            toast.error(t('failed_to_load_book'));
            router.push('/books');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        router.push(`/books/download/${id}`);
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const handleZoomIn = () => {
        setZoom(prev => Math.min(prev + 25, 200));
    };

    const handleZoomOut = () => {
        setZoom(prev => Math.max(prev - 25, 50));
    };

    const resetZoom = () => {
        setZoom(100);
    };

    if (loading) {
        return (
            <div className="book-view-loading">
                <div className="container">
                    <div className="loading-content text-center py-5">
                        <FaSpinner className="spin loading-icon" />
                        <h4>{t('loading_book')}</h4>
                    </div>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="book-view-unauthorized">
                <div className="container">
                    <div className="unauthorized-content text-center py-5">
                        <FaExclamationTriangle className="warning-icon" />
                        <h4>{t('book_viewer_login_required')}</h4>
                        <p>{t('please_login_to_view_books')}</p>
                        <Link href="/auth/login">
                            <button className="btn btn-primary">
                                {t('login_to_purchase')}
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <Meta
                title={`${t('view')} - ${book?.title || t('book')}`}
                description={book?.description}
                keywords="PDF viewer, Islamic books, book reading"
            />

            <div className="book-view-container">
                {/* Header */}
                <div className="book-view-header">
                    <div className="container-fluid">
                        <div className="row align-items-center py-3">
                            <div className="col-md-6">
                                <div className="d-flex align-items-center">
                                    <button
                                        className="btn btn-outline-secondary me-3"
                                        onClick={() => router.back()}
                                    >
                                        <FaArrowLeft className="me-1" />
                                        {t('back')}
                                    </button>
                                    <div>
                                        <h5 className="mb-0">{book?.title}</h5>
                                        <small className="text-muted">{t('by')} {book?.author}</small>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6 text-end">
                                <div className="viewer-controls">
                                    <button
                                        className="btn btn-outline-secondary me-2"
                                        onClick={handleZoomOut}
                                        title={t('zoom_out')}
                                    >
                                        <FaSearchMinus />
                                    </button>
                                    <span className="zoom-indicator me-2">{zoom}%</span>
                                    <button
                                        className="btn btn-outline-secondary me-2"
                                        onClick={handleZoomIn}
                                        title={t('zoom_in')}
                                    >
                                        <FaSearchPlus />
                                    </button>
                                    <button
                                        className="btn btn-outline-secondary me-2"
                                        onClick={resetZoom}
                                        title={t('reset_zoom')}
                                    >
                                        100%
                                    </button>
                                    <button
                                        className="btn btn-outline-secondary me-2"
                                        onClick={toggleFullscreen}
                                        title={isFullscreen ? t('exit_fullscreen') : t('fullscreen')}
                                    >
                                        {isFullscreen ? <FaCompress /> : <FaExpand />}
                                    </button>
                                    <button
                                        className="btn btn-success"
                                        onClick={handleDownload}
                                        title={t('download')}
                                    >
                                        <FaDownload className="me-1" />
                                        {t('download')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* PDF Viewer */}
                <div className="book-view-content">
                    <div className="pdf-viewer-container" style={{ height: 'calc(100vh - 120px)' }}>
                        {pdfUrl ? (
                            <iframe
                                src={`${pdfUrl}#zoom=${zoom}&view=FitH`}
                                width="100%"
                                height="100%"
                                style={{ border: 'none' }}
                                title={book?.title}
                            />
                        ) : (
                            <div className="pdf-placeholder text-center p-5">
                                <FaExclamationTriangle className="text-warning mb-3" size={48} />
                                <h5>{t('pdf_not_available')}</h5>
                                <p className="text-muted">{t('pdf_loading_error')}</p>
                                <button
                                    className="btn btn-primary"
                                    onClick={loadBookForViewing}
                                >
                                    {t('retry_pdf_load')}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .book-view-container {
                    background: #f8f9fa;
                    min-height: 100vh;
                }
                
                .book-view-header {
                    background: white;
                    border-bottom: 1px solid #dee2e6;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                
                .viewer-controls {
                    display: flex;
                    align-items: center;
                }
                
                .zoom-indicator {
                    min-width: 50px;
                    text-align: center;
                    font-weight: 500;
                }
                
                .pdf-viewer-container {
                    background: white;
                    margin: 0;
                    padding: 0;
                }
                
                .loading-icon, .warning-icon {
                    font-size: 2rem;
                    margin-bottom: 1rem;
                    color: var(--theme-color, #007bff);
                }
                
                .spin {
                    animation: spin 1s linear infinite;
                }
                
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                
                @media (max-width: 768px) {
                    .viewer-controls {
                        flex-wrap: wrap;
                        gap: 0.5rem;
                    }
                    
                    .book-view-header .row > div {
                        margin-bottom: 1rem;
                    }
                    
                    .book-view-header .col-md-6:last-child {
                        text-align: left !important;
                    }
                }
            `}</style>
        </>
    );
};

export default withTranslation()(BookView);
