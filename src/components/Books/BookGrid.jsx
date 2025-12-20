'use client'
import React from 'react';
import { withTranslation } from 'react-i18next';
import BookCard from './BookCard';
import BookCardSkeleton from './BookCardSkeleton';

const BookGrid = ({
    books = [],
    loading = false,
    t,
    isPurchasedBooks = false,
    onPurchaseSuccess,
    showActions = true,
    emptyStateMessage,
    emptyStateIcon
}) => {

    if (loading) {
        return (
            <div className="book-grid">
                {[...Array(8)].map((_, index) => (
                    <BookCardSkeleton key={index} />
                ))}
            </div>
        );
    }

    if (!books || books.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-state-content">
                    {emptyStateIcon && (
                        <div className="empty-state-icon">
                            {emptyStateIcon}
                        </div>
                    )}
                    <h4 className="empty-state-title">
                        {emptyStateMessage ||
                            (isPurchasedBooks ? t('no_purchased_books') : t('no_books_available'))
                        }
                    </h4>
                    <p className="empty-state-description">
                        {isPurchasedBooks
                            ? t('purchase_books_to_see_them_here')
                            : t('check_back_later_for_new_books')
                        }
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="book-grid">
            {books.map((book, index) => {
                // Use is_purchased flag from API response (1 = purchased, 0 = not purchased)
                const isBookPurchased = isPurchasedBooks || (book.is_purchased === 1 || book.is_purchased === '1');

                return (
                    <BookCard
                        key={book.id || index}
                        book={book}
                        isPurchased={isBookPurchased}
                        onPurchaseSuccess={(newCoins) => onPurchaseSuccess && onPurchaseSuccess(book.id, newCoins)}
                        showActions={showActions}
                        t={t}
                    />
                );
            })}
        </div>
    );
};

export default withTranslation()(BookGrid);
