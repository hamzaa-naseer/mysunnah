'use client'
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import {
    FaBookOpen,
    FaCoins,
    FaDownload,
    FaArrowLeft,
    FaUser,
    FaCalendarAlt,
    FaTag,
    FaSpinner,
    FaCheckCircle,
    FaShoppingCart,
    FaEye
} from 'react-icons/fa';
import { withTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import PurchaseModal from './PurchaseModal';
import BookPlaceholder from './BookPlaceholder';
import { getBookByIdApi } from '../../utils/api';
import { apiCall, apiCallWithToken } from '../../utils/index';
import Meta from '../SEO/Meta';

const BookDetails = ({ t }) => {
    const router = useRouter();
    const { id } = router.query;

    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isPurchased, setIsPurchased] = useState(false);
    const [showPurchaseModal, setShowPurchaseModal] = useState(false);
    const [imageError, setImageError] = useState(false);

    const userCoins = useSelector(state => state.User.data?.coins) || 0;
    const userToken = useSelector(state => state.User.token);
    const isAuthenticated = !!userToken; // Use token presence for authentication check (same as Routes)

    // Load book details
    useEffect(() => {
        if (id) {
            loadBookDetails();
        }
    }, [id, isAuthenticated]);

    const loadBookDetails = async () => {
        setLoading(true);
        try {
            console.log('Loading book details for ID:', id);
            console.log('User authenticated?', isAuthenticated);

            // Use authenticated API call if user is logged in to get purchase status
            const response = isAuthenticated
                ? await apiCallWithToken(getBookByIdApi(id))
                : await apiCall(getBookByIdApi(id));

            console.log('API Method used:', isAuthenticated ? 'apiCallWithToken' : 'apiCall');

            if (!response.error && response.data) {
                const bookData = response.data;
                console.log('Book Details API Response:', bookData);
                console.log('Authentication status:', isAuthenticated);
                console.log('Book is_purchased value:', bookData.is_purchased);

                setBook(bookData);
                // Set purchase status from backend response
                if (bookData.is_purchased !== undefined) {
                    const purchased = bookData.is_purchased === 1 || bookData.is_purchased === "1";
                    setIsPurchased(purchased);
                    console.log('Setting isPurchased to:', purchased);
                }
            } else {
                toast.error(response.message || t('book_not_found'));
                router.push('/books');
            }
        } catch (error) {
            console.error('Error loading book details:', error);
            toast.error(t('failed_to_load_book'));
            router.push('/books');
        } finally {
            setLoading(false);
        }
    };

    const handlePurchaseSuccess = (newCoins) => {
        setShowPurchaseModal(false);
        setIsPurchased(true);
        // Update book object with purchase status
        if (book) {
            setBook({ ...book, is_purchased: 1 });
        }
        toast.success(t('book_purchased_successfully'));
    };

    const handleViewDocument = () => {
        // Redirect to view page
        router.push(`/books/view/${id}`);
    };

    const handleDownload = () => {
        // Redirect to download page
        router.push(`/books/download/${id}`);
    };

    const canAfford = book && userCoins >= parseInt(book.coin_price);

    if (loading) {
        return (
            <div className="book-details-loading">
                <div className="container">
                    <div className="loading-content">
                        <FaSpinner className="spin loading-icon" />
                        <h4>{t('loading_book_details')}</h4>
                    </div>
                </div>
            </div>
        );
    }

    if (!book) {
        return (
            <div className="book-not-found">
                <div className="container">
                    <div className="not-found-content">
                        <FaBookOpen className="not-found-icon" />
                        <h4>{t('book_not_found')}</h4>
                        <p>{t('book_not_found_description')}</p>
                        <Link href="/books">
                            <button className="btn btn-primary">
                                <FaArrowLeft className="me-1" />
                                {t('back_to_books')}
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
                title={`${book.title} - ${t('islamic_books')}`}
                description={book.description || t('discover_islamic_books')}
                keywords={`${book.title}, ${book.author}, ${book.category}, Islamic books`}
            />

            <div className="book-details-container">
                <div className="container">
                    {/* Breadcrumb */}
                    <div className="breadcrumb-section">
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item">
                                    <Link href="/books">{t('books')}</Link>
                                </li>
                                <li className="breadcrumb-item active" aria-current="page">
                                    {book.title}
                                </li>
                            </ol>
                        </nav>
                        <Link href="/books" className="back-link">
                            <FaArrowLeft className="me-1" />
                            {t('back_to_books')}
                        </Link>
                    </div>

                    {/* Book Details */}
                    <div className="book-details-content">
                        <div className="row">
                            {/* Book Image */}
                            <div className="col-lg-4 col-md-5">
                                <div className="book-image-section">
                                    <div className="book-image-container">
                                        {!imageError && book.image ? (
                                            <Image
                                                src={book.image}
                                                alt={book.title}
                                                width={400}
                                                height={560}
                                                className="book-cover-image"
                                                priority
                                                onError={() => setImageError(true)}
                                            />
                                        ) : (
                                            <BookPlaceholder width={400} height={560} size="large" />
                                        )}
                                        {isPurchased && (
                                            <div className="purchased-overlay">
                                                <FaCheckCircle className="purchased-icon" />
                                                <span>{t('owned')}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Mobile Actions */}
                                    <div className="mobile-actions d-md-none mt-3">
                                        {isPurchased ? (
                                            <div className="d-flex flex-column gap-2">
                                                <button
                                                    className="btn btn-primary btn-lg w-100"
                                                    onClick={handleViewDocument}
                                                >
                                                    <FaEye className="me-2" />
                                                    {t('view_document')}
                                                </button>
                                                <button
                                                    className="btn btn-success btn-lg w-100"
                                                    onClick={handleDownload}
                                                >
                                                    <FaDownload className="me-2" />
                                                    {t('download_book')}
                                                </button>
                                            </div>
                                        ) : isAuthenticated ? (
                                            <button
                                                className={`btn btn-lg w-100 ${canAfford ? 'btn-primary' : 'btn-secondary'}`}
                                                onClick={() => setShowPurchaseModal(true)}
                                                disabled={!canAfford}
                                            >
                                                <FaCoins className="me-2" />
                                                {canAfford ? t('purchase_for_coins', { coins: book.coin_price }) : t('insufficient_coins')}
                                            </button>
                                        ) : (
                                            <Link href="/auth/login">
                                                <button className="btn btn-primary btn-lg w-100">
                                                    {t('login_to_purchase')}
                                                </button>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Book Information */}
                            <div className="col-lg-8 col-md-7">
                                <div className="book-info-section">
                                    {/* Title and Category */}
                                    <div className="book-header">
                                        <h1 className="book-title">{book.title}</h1>
                                        <div className="book-meta">
                                            <span className="book-author">
                                                <FaUser className="me-1" />
                                                {t('by')} <strong>{book.author}</strong>
                                            </span>
                                            <span className="book-category">
                                                <FaTag className="me-1" />
                                                {book.category}
                                            </span>
                                            <span className="book-date">
                                                <FaCalendarAlt className="me-1" />
                                                {new Date(book.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="book-description">
                                        <h3>{t('description')}</h3>
                                        <p className="description-text">
                                            {book.description || t('no_description_available')}
                                        </p>
                                    </div>

                                    {/* Pricing and Purchase */}
                                    <div className="book-pricing">
                                        <div className="price-info">
                                            <div className="price-display">
                                                <FaCoins className="coin-icon" />
                                                <span className="price-amount">{book.coin_price}</span>
                                                <span className="price-label">{t('coins')}</span>
                                            </div>

                                            {isAuthenticated && (
                                                <div className="user-coins">
                                                    <small className="text-muted">
                                                        {t('your_balance')}: {userCoins} {t('coins')}
                                                    </small>
                                                </div>
                                            )}
                                        </div>

                                        {/* Desktop Actions */}
                                        <div className="book-actions d-none d-md-block">
                                            {isPurchased ? (
                                                <div className="d-flex gap-3">
                                                    <button
                                                        className="btn btn-primary btn-lg"
                                                        onClick={handleViewDocument}
                                                    >
                                                        <FaEye className="me-2" />
                                                        {t('view_document')}
                                                    </button>
                                                    <button
                                                        className="btn btn-success btn-lg"
                                                        onClick={handleDownload}
                                                    >
                                                        <FaDownload className="me-2" />
                                                        {t('download_book')}
                                                    </button>
                                                </div>
                                            ) : isAuthenticated ? (
                                                <button
                                                    className={`btn btn-lg ${canAfford ? 'btn-primary purchase-btn' : 'btn-secondary'}`}
                                                    onClick={() => setShowPurchaseModal(true)}
                                                    disabled={!canAfford}
                                                >
                                                    {canAfford ? (
                                                        <>
                                                            <FaShoppingCart className="me-2" />
                                                            {t('purchase_now')}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FaCoins className="me-2" />
                                                            {t('insufficient_coins')}
                                                        </>
                                                    )}
                                                </button>
                                            ) : (
                                                <Link href="/auth/login">
                                                    <button className="btn btn-primary btn-lg">
                                                        {t('login_to_purchase')}
                                                    </button>
                                                </Link>
                                            )}
                                        </div>
                                    </div>

                                    {/* Additional Info */}
                                    <div className="book-additional-info">
                                        <div className="info-grid">
                                            <div className="info-item">
                                                <span className="info-label">{t('format')}:</span>
                                                <span className="info-value">PDF</span>
                                            </div>
                                            <div className="info-item">
                                                <span className="info-label">{t('language')}:</span>
                                                <span className="info-value">
                                                    {book.language_name || t('arabic')}
                                                </span>
                                            </div>
                                            <div className="info-item">
                                                <span className="info-label">{t('access')}:</span>
                                                <span className="info-value">{t('lifetime')}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Benefits */}
                                    <div className="book-benefits">
                                        <h4>{t('what_you_get')}:</h4>
                                        <ul className="benefits-list">
                                            <li>✓ {t('instant_download_access')}</li>
                                            <li>✓ {t('high_quality_pdf_format')}</li>
                                            <li>✓ {t('lifetime_access')}</li>
                                            <li>✓ {t('read_anywhere_anytime')}</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Purchase Modal */}
            {showPurchaseModal && (
                <PurchaseModal
                    book={book}
                    userCoins={userCoins}
                    onClose={() => setShowPurchaseModal(false)}
                    onPurchaseSuccess={handlePurchaseSuccess}
                    t={t}
                />
            )}
        </>
    );
};

export default withTranslation()(BookDetails);
