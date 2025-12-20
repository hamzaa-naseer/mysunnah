'use client'
import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { apiCall, apiCallWithToken } from '../../utils';
import { getBooksApi } from '../../utils/api';
import { withTranslation } from 'react-i18next';
import BookCard from '../Books/BookCard';
import { isBookPurchased } from '../../utils/purchaseStatusManager';

const BooksSection = ({ t }) => {
    const router = useRouter();
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const userToken = useSelector(state => state.User.token);
    const isAuthenticated = !!userToken;

    useEffect(() => {
        fetchBooks();
    }, [isAuthenticated]);

    const fetchBooks = async () => {
        setLoading(true);
        try {
            // Fetch first 8 books for the homepage
            // Use authenticated API if logged in to get purchase status
            const response = isAuthenticated
                ? await apiCallWithToken(getBooksApi(null, null, 0, 8))
                : await apiCall(getBooksApi(null, null, 0, 8));

            if (response && (response.error === false || response.error === "false" || !response.error)) {
                setBooks(response.data || []);
            }
        } catch (error) {
            console.error('Error fetching books for homepage:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePurchaseSuccess = (bookId, newCoins) => {
        // Update the specific book's status in local state for immediate feedback
        setBooks(prev => prev.map(book =>
            book.id === bookId || book.id === String(bookId)
                ? { ...book, is_purchased: 1 }
                : book
        ));
    };

    const handleViewAll = () => {
        router.push('/books');
    };

    // Don't render if no books (unless loading)
    if (!loading && books.length === 0) {
        return null;
    }

    return (
        <section className="books-home-section py-5" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)' }}>
            <Container>
                <div className="text-center mb-5">
                    <h2 className="section-title mb-3" style={{
                        fontSize: '2.5rem',
                        fontWeight: '800',
                        color: 'var(--secondary-color)',
                        position: 'relative',
                        display: 'inline-block'
                    }}>
                        {t('featured_books')}
                        <div style={{
                            content: '""',
                            position: 'absolute',
                            bottom: '-10px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '60px',
                            height: '4px',
                            background: 'var(--primary-color)',
                            borderRadius: '2px'
                        }}></div>
                    </h2>
                    <p className="section-subtitle text-muted mt-3" style={{ fontSize: '1.1rem' }}>
                        {t('discover_our_collection_of_islamic_books')}
                    </p>
                </div>

                {loading ? (
                    <div className="text-center py-5">
                        <Spinner animation="border" variant="primary" />
                    </div>
                ) : (
                    <>
                        <Row className="g-4">
                            {books.map((book) => {
                                const purchased = isBookPurchased(book, isAuthenticated);
                                return (
                                    <Col lg={3} md={4} sm={6} xs={12} key={book.id}>
                                        <BookCard
                                            book={book}
                                            t={t}
                                            showActions={true}
                                            isPurchased={purchased}
                                            onPurchaseSuccess={handlePurchaseSuccess}
                                        />
                                    </Col>
                                );
                            })}
                        </Row>

                        <div className="text-center mt-5">
                            <button
                                className="btn btn-primary btn-lg rounded-pill px-5 shadow-sm"
                                onClick={handleViewAll}
                                style={{
                                    transition: 'all 0.3s ease',
                                    fontWeight: '600'
                                }}
                            >
                                {t('view_all_books')}
                            </button>
                        </div>
                    </>
                )}
            </Container>

            <style jsx>{`
                .books-home-section :global(.book-card) {
                    height: 100%;
                    border: 1px solid rgba(var(--primary-rgb), 0.05);
                    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
                }
                .books-home-section :global(.book-card:hover) {
                    box-shadow: 0 15px 35px rgba(var(--primary-rgb), 0.15);
                    border-color: rgba(var(--primary-rgb), 0.2);
                }
            `}</style>
        </section>
    );
};

export default withTranslation()(BooksSection);
