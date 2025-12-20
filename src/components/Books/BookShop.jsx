'use client'
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FaBookOpen, FaCoins, FaFilter, FaShoppingCart } from 'react-icons/fa';
import { withTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import BookGrid from './BookGrid';
import BookFilter from './BookFilter';
import { getBooksApi } from '../../utils/api';
import { apiCall, apiCallWithToken } from '../../utils/index';
import { isBookPurchased, markBookAsPurchased } from '../../utils/purchaseStatusManager';
import Meta from '../SEO/Meta';

const BookShop = ({ t }) => {
  const [books, setBooks] = useState([]);
  const [allBooks, setAllBooks] = useState([]); // Cache for all books
  const [loading, setLoading] = useState(true);
  const [booksLoaded, setBooksLoaded] = useState(false); // Track if books are loaded
  const apiCallCount = useRef(0); // Track API calls for debugging
  const [currentPage, setCurrentPage] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);
  const [categories, setCategories] = useState(['Hadith', 'Tafsir', 'Biography', 'Fiqh', 'Aqeedah']);
  const [filters, setFilters] = useState({
    category: null,
    language_id: null,
    search: ''
  });

  const booksPerPage = 12;
  const userCoins = useSelector(state => state.User.data?.coins) || 0;
  const userData = useSelector(state => state.User.data);
  const userToken = useSelector(state => state.User.token);
  const isAuthenticated = !!userToken; // Use token presence for authentication check (same as Routes)
  const userId = userData?.id;

  // Debug authentication state

  // Check if a book is purchased by this user (enhanced version)
  const checkBookPurchased = useCallback((book) => {
    return isBookPurchased(book, isAuthenticated);
  }, [isAuthenticated]);

  // Load all books once (only called once on mount)
  const loadAllBooks = useCallback(async () => {
    if (booksLoaded) return; // Prevent multiple API calls

    setLoading(true);
    try {
      apiCallCount.current += 1;
      apiCallCount.current += 1;

      // Always use authenticated API if user is logged in to get purchase status
      // This ensures we get is_purchased flag correctly
      const response = isAuthenticated
        ? await apiCallWithToken(getBooksApi(null, null, 0, 100))
        : await apiCall(getBooksApi(null, null, 0, 100));

      if (!response.error && response.data) {
        const booksData = response.data;
        setAllBooks(booksData);
        setBooksLoaded(true); // Mark as loaded

        // Extract unique categories for filter options from all data
        const uniqueCategories = [...new Set(
          booksData.map(book => book.category).filter(Boolean)
        )];
        setCategories(uniqueCategories);
      } else {
        // Handle API error gracefully

        // Provide demo data if API fails (for development/demo purposes)
        if (process.env.NEXT_PUBLIC_DEMO === 'true' || response.message?.includes('Network error')) {
          const demoBooks = [
            {
              id: 1,
              title: "Sahih Al-Bukhari",
              author: "Imam Al-Bukhari",
              description: "The most authentic collection of Hadith compiled by Imam Al-Bukhari. This comprehensive collection contains thousands of narrations from Prophet Muhammad (PBUH).",
              image: null,
              coin_price: "50",
              category: "Hadith",
              language_id: "1",
              status: "1",
              is_purchased: 1, // Mark as purchased for testing
              created_at: new Date().toISOString()
            },
            {
              id: 2,
              title: "Tafsir Ibn Kathir",
              author: "Ibn Kathir",
              description: "One of the most respected Quranic commentaries, providing deep insights into the meanings of the Quran.",
              image: null,
              coin_price: "75",
              category: "Tafsir",
              language_id: "1",
              status: "1",
              is_purchased: 0, // Not purchased by default
              created_at: new Date().toISOString()
            },
            {
              id: 3,
              title: "Riyad as-Salihin",
              author: "Imam An-Nawawi",
              description: "A collection of hadith compiled by Imam An-Nawawi. It focuses on moral and spiritual development.",
              image: null,
              coin_price: "40",
              category: "Hadith",
              language_id: "1",
              status: "1",
              is_purchased: 0, // Not purchased by default
              created_at: new Date().toISOString()
            },
            {
              id: 4,
              title: "The Sealed Nectar",
              author: "Safiur Rahman Mubarakpuri",
              description: "A comprehensive biography of Prophet Muhammad (PBUH) that won first prize in a worldwide competition.",
              image: null,
              coin_price: "60",
              category: "Biography",
              language_id: "1",
              status: "1",
              is_purchased: 0, // Not purchased by default
              created_at: new Date().toISOString()
            }
          ];

          setAllBooks(demoBooks); // Cache demo books
          setBooksLoaded(true); // Mark as loaded
          setCategories(['Hadith', 'Tafsir', 'Biography', 'Fiqh', 'Aqeedah']);
          toast.info('Demo mode: Showing sample books');
        } else {
          setBooks([]);
          setTotalBooks(0);
          toast.error(t('failed_to_load_books'));
        }
      }
    } catch (error) {
      console.error('Error loading books:', error);

      // Show user-friendly error message
      if (error.message?.includes('fetch')) {
        toast.error('Network error. Please check your connection.');
      } else {
        toast.error(t('failed_to_load_books'));
      }

      setBooks([]);
      setTotalBooks(0);
    } finally {
      setLoading(false);
    }
  }, [booksLoaded, t, isAuthenticated]);

  // Filter and paginate books from cache (no API call)
  const filterAndPaginateBooks = useCallback((currentFilters = filters, page = currentPage) => {
    if (!allBooks || allBooks.length === 0) return;

    if (!allBooks || allBooks.length === 0) return;

    setLoading(false); // Ensure loading is false since we're using cached data
    let filteredBooks = [...allBooks];

    // Apply client-side filtering for search, category, and language
    if (currentFilters.search) {
      const searchTerm = currentFilters.search.toLowerCase();
      filteredBooks = filteredBooks.filter(book =>
        book.title?.toLowerCase().includes(searchTerm) ||
        book.author?.toLowerCase().includes(searchTerm) ||
        book.description?.toLowerCase().includes(searchTerm) ||
        book.category?.toLowerCase().includes(searchTerm)
      );
    }

    if (currentFilters.category) {
      filteredBooks = filteredBooks.filter(book =>
        book.category === currentFilters.category
      );
    }

    if (currentFilters.language_id) {
      filteredBooks = filteredBooks.filter(book =>
        book.language_id === currentFilters.language_id
      );
    }

    // Apply pagination to filtered results
    const startIndex = (page - 1) * booksPerPage;
    const endIndex = startIndex + booksPerPage;
    const paginatedBooks = filteredBooks.slice(startIndex, endIndex);

    setBooks(paginatedBooks);
    setTotalBooks(filteredBooks.length);
  }, [allBooks, booksPerPage, currentPage, filters]);

  // Initial load - only load all books once
  useEffect(() => {
    loadAllBooks();
  }, [loadAllBooks]);

  // Filter books whenever filters or allBooks change
  useEffect(() => {
    if (booksLoaded) {
      filterAndPaginateBooks(filters, currentPage);
    }
  }, [filters, currentPage, booksLoaded, filterAndPaginateBooks]);

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    setCurrentPage(1);
  };

  // Handle search changes
  const handleSearchChange = (searchTerm) => {
    const updatedFilters = { ...filters, search: searchTerm };
    setFilters(updatedFilters);
    setCurrentPage(1);
  };

  // Handle successful purchase
  const handlePurchaseSuccess = (bookId, newCoins) => {

    // Mark book as purchased in our manager
    markBookAsPurchased(bookId);

    // Update the specific book's is_purchased status in allBooks
    setAllBooks(prev => prev.map(book =>
      book.id === bookId || book.id === String(bookId)
        ? { ...book, is_purchased: 1 }
        : book
    ));

    // Also update current filtered books if the purchased book is visible
    setBooks(prev => prev.map(book =>
      book.id === bookId || book.id === String(bookId)
        ? { ...book, is_purchased: 1 }
        : book
    ));

    // Show success message
    toast.success(t('book_purchased_successfully'));

    // Optionally refetch books to ensure accuracy
    // This can be enabled if you want to sync with backend after purchase
    // loadAllBooks();
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPages = Math.ceil(totalBooks / booksPerPage);

  // Debug function to manually test purchase status (development only)
  const debugMarkAsPurchased = (bookId) => {

  };

  return (
    <>
      <Meta
        title={t('islamic_books')}
        description={t('discover_and_purchase_islamic_books')}
        keywords="Islamic books, PDF books, Islamic literature, Quran, Hadith, Islamic knowledge"
      />

      <div className="book-shop-container">
        {/* Header Section */}
        <div className="book-shop-header">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-8">
                <div className="header-content">
                  <div className="header-icon">
                    <FaBookOpen />
                  </div>
                  <div className="header-text">
                    <h1 className="page-title" style={{ color: 'var(--primary-color)' }}>{t('islamic_books')}</h1>
                    <p className="page-subtitle">
                      {t('discover_purchase_islamic_books_description')}
                    </p>
                    <div className="stats-info">
                      <span className="stat-item">
                        <FaBookOpen className="me-1" />
                        {totalBooks} {t('books_available')}
                      </span>
                      {isAuthenticated && (
                        <span className="stat-item">
                          <FaCoins className="coin-icon me-1" />
                          {userCoins} {t('your_coins')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-4 text-end">
                <div className="header-actions">
                  <div className="coin-display">
                    <FaCoins className="coin-icon" />
                    <span className="coin-amount">{userCoins}</span>
                    <span className="coin-label">{t('coins')}</span>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="book-shop-content">
          <div className="container">
            {/* Filters Section */}
            <div className="filters-wrapper">
              <BookFilter
                onFilterChange={handleFilterChange}
                onSearchChange={handleSearchChange}
                categories={categories}
                loading={loading}
                t={t}
              />
            </div>

            {/* Books Grid */}
            <div className="books-section">
              <div className="books-header mb-4">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="books-count">
                    <span className="count-text">
                      {loading ? t('loading') : `${books.length} ${t('books_found')}`}
                    </span>
                  </div>

                  {!isAuthenticated && (
                    <div className="auth-notice">
                      <small className="text-muted">
                        {t('login_to_purchase_books')}
                      </small>
                    </div>
                  )}
                </div>
              </div>

              <BookGrid
                books={books}
                loading={loading}
                onPurchaseSuccess={handlePurchaseSuccess}
                showActions={isAuthenticated}
                emptyStateMessage={t('no_books_match_filter')}
                emptyStateIcon={<FaBookOpen size={48} />}
                t={t}
              />
            </div>

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="pagination-wrapper">
                <nav aria-label="Books pagination">
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
                      if (page === currentPage ||
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)) {
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
                      } else if (page === currentPage - 2 || page === currentPage + 2) {
                        return <li key={page} className="page-item disabled"><span className="page-link">...</span></li>;
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
          </div>
        </div>
      </div>
    </>
  );
};

export default withTranslation()(BookShop);
