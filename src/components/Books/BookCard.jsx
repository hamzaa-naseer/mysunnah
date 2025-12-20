'use client'
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaBook, FaCoins, FaStar, FaDownload, FaEye } from 'react-icons/fa';
import { BsBookmarkFill } from 'react-icons/bs';
import { withTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import PurchaseModal from './PurchaseModal';
import BookPlaceholder from './BookPlaceholder';

const BookCard = ({ book, t, isPurchased = false, onPurchaseSuccess, showActions = true }) => {
    const [showPurchaseModal, setShowPurchaseModal] = useState(false);
    const [imageError, setImageError] = useState(false);
    const userCoins = useSelector(state => state.User.data?.coins) || 0;
    const userToken = useSelector(state => state.User.token);
    const isAuthenticated = !!userToken; // Use token presence for authentication check (same as Routes)


    const {
        id,
        title,
        author,
        description,
        image,
        coin_price,
        category,
        created_at
    } = book;

    const canAfford = userCoins >= parseInt(coin_price);

    const truncateText = (text, limit = 100) => {
        if (!text) return '';
        return text.length > limit ? text.substring(0, limit) + '...' : text;
    };

    const handlePurchaseClick = () => {
        if (canAfford) {
            setShowPurchaseModal(true);
        }
    };

    const handlePurchaseSuccess = (newCoins) => {
        setShowPurchaseModal(false);
        if (onPurchaseSuccess) {
            onPurchaseSuccess(newCoins);
        }
    };

    return (
        <>
            <div className="book-card">
                <div className="book-card-header">
                    {category && (
                        <span className="book-category-badge">
                            <FaBook className="me-1" />
                            {category}
                        </span>
                    )}
                    {isPurchased && (
                        <span className="purchased-badge">
                            <BsBookmarkFill className="me-1" />
                            {t('owned')}
                        </span>
                    )}
                </div>

                <div className="book-image-container">
                    {!imageError && image ? (
                        <Image
                            src={image}
                            alt={title}
                            width={200}
                            height={280}
                            className="book-image"
                            priority={false}
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <BookPlaceholder width={200} height={280} size="small" />
                    )}
                    <div className="book-image-overlay">
                        <Link href={`/books/${id}`}>
                            <button className="btn btn-light btn-sm">
                                <FaEye className="me-1" />
                                {t('view_details')}
                            </button>
                        </Link>
                    </div>
                </div>

                <div className="book-card-body">
                    <h5 className="book-title">{title}</h5>
                    <p className="book-author">
                        <i>{t('by')} {author}</i>
                    </p>
                    <p className="book-description">
                        {truncateText(description, 80)}
                    </p>

                    <div className="book-price-section">
                        <div className="d-flex align-items-center justify-content-between">
                            <div className="book-price">
                                <FaCoins className="coin-icon me-1" />
                                <span className="coin-amount">{coin_price}</span>
                                <span className="coin-text ms-1">{t('coins')}</span>
                            </div>

                            {/* Show different buttons based on authentication and purchase status */}
                            {isPurchased && showActions && (
                                <div className="book-actions d-flex gap-2">
                                    <Link href={`/books/view/${id}`}>
                                        <button
                                            className="btn btn-primary btn-sm"
                                            title={t('view_document')}
                                        >
                                            <FaEye />
                                        </button>
                                    </Link>
                                    <Link href={`/books/download/${id}`}>
                                        <button
                                            className="btn btn-success btn-sm"
                                            title={t('download')}
                                        >
                                            <FaDownload />
                                        </button>
                                    </Link>
                                </div>
                            )}

                            {!isPurchased && isAuthenticated && showActions && (
                                <div className="book-actions">
                                    <button
                                        className={`btn purchase-btn ${canAfford ? 'btn-primary' : 'btn-secondary'}`}
                                        onClick={handlePurchaseClick}
                                        disabled={!canAfford}
                                        title={!canAfford ? t('insufficient_coins') : t('purchase_book')}
                                    >
                                        {canAfford ? (
                                            <>
                                                <FaCoins className="me-1" />
                                                {t('purchase')}
                                            </>
                                        ) : (
                                            <>
                                                <FaCoins className="me-1" />
                                                {t('insufficient_coins')}
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}

                            {!isPurchased && !isAuthenticated && showActions && (
                                <div className="book-actions">
                                    <Link href="/auth/login">
                                        <button className="btn btn-primary btn-sm">
                                            {t('login_to_purchase')}
                                        </button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {!canAfford && !isPurchased && showActions && (
                        <div className="insufficient-coins-notice mt-2">
                            <small className="text-muted">
                                {t('need_more_coins', { needed: parseInt(coin_price) - userCoins })}
                            </small>
                        </div>
                    )}
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

export default withTranslation()(BookCard);
