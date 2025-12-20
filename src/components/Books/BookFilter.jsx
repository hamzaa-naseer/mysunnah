'use client'
import React, { useState, useEffect } from 'react';
import { FaSearch, FaFilter, FaTimes, FaBook } from 'react-icons/fa';
import { withTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

const BookFilter = ({
    onFilterChange,
    onSearchChange,
    categories = [],
    loading = false,
    t
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const languages = useSelector(state => state.Languages.languages) || [];

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            onSearchChange && onSearchChange(searchTerm);
        }, 500);

        return () => clearTimeout(debounceTimer);
    }, [searchTerm, onSearchChange]);

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
        onFilterChange && onFilterChange({
            category: category || null,
            language_id: selectedLanguage || null
        });
    };

    const handleLanguageChange = (language_id) => {
        setSelectedLanguage(language_id);
        onFilterChange && onFilterChange({
            category: selectedCategory || null,
            language_id: language_id || null
        });
    };

    const clearFilters = () => {
        setSelectedCategory('');
        setSelectedLanguage('');
        setSearchTerm('');
        onFilterChange && onFilterChange({
            category: null,
            language_id: null
        });
        onSearchChange && onSearchChange('');
    };

    const hasActiveFilters = selectedCategory || selectedLanguage || searchTerm;

    return (
        <div className="book-filter-container">
            {/* Search Bar */}
            <div className="search-section">
                <div className="search-input-wrapper">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        className="form-control search-input"
                        placeholder={t('search_books')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        disabled={loading}
                    />
                    {searchTerm && (
                        <button
                            className="clear-search-btn"
                            onClick={() => setSearchTerm('')}
                        >
                            <FaTimes />
                        </button>
                    )}
                </div>

                <button
                    className={`btn filter-toggle-btn ${showFilters ? 'active' : ''}`}
                    onClick={() => setShowFilters(!showFilters)}
                    disabled={loading}
                >
                    <FaFilter className="me-1" />
                    {t('filters')}
                    {hasActiveFilters && <span className="filter-count-badge">!</span>}
                </button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
                <div className="filters-section">
                    <div className="filters-content">
                        <div className="row g-3">
                            {/* Category Filter */}
                            <div className="col-md-4">
                                <label className="form-label">
                                    <FaBook className="me-1" />
                                    {t('category')}
                                </label>
                                <select
                                    className="form-select"
                                    value={selectedCategory}
                                    onChange={(e) => handleCategoryChange(e.target.value)}
                                    disabled={loading}
                                >
                                    <option value="">{t('all_categories')}</option>
                                    {categories.map((category, index) => (
                                        <option key={index} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Language Filter */}
                            <div className="col-md-4">
                                <label className="form-label">
                                    {t('language')}
                                </label>
                                <select
                                    className="form-select"
                                    value={selectedLanguage}
                                    onChange={(e) => handleLanguageChange(e.target.value)}
                                    disabled={loading}
                                >
                                    <option value="">{t('all_languages')}</option>
                                    {languages.map((language) => (
                                        <option key={language.id} value={language.id}>
                                            {language.language}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Clear Filters */}
                            <div className="col-md-4 d-flex align-items-end">
                                <button
                                    className="btn btn-outline-secondary w-100"
                                    onClick={clearFilters}
                                    disabled={loading || !hasActiveFilters}
                                >
                                    <FaTimes className="me-1" />
                                    {t('clear_filters')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Active Filters Display */}
            {hasActiveFilters && (
                <div className="active-filters">
                    <span className="active-filters-label">{t('active_filters')}:</span>

                    {selectedCategory && (
                        <span className="filter-tag">
                            {t('category')}: {selectedCategory}
                            <button
                                className="remove-filter-btn"
                                onClick={() => handleCategoryChange('')}
                            >
                                <FaTimes />
                            </button>
                        </span>
                    )}

                    {selectedLanguage && (
                        <span className="filter-tag">
                            {t('language')}: {languages.find(l => l.id == selectedLanguage)?.language}
                            <button
                                className="remove-filter-btn"
                                onClick={() => handleLanguageChange('')}
                            >
                                <FaTimes />
                            </button>
                        </span>
                    )}

                    {searchTerm && (
                        <span className="filter-tag">
                            {t('search')}: "{searchTerm}"
                            <button
                                className="remove-filter-btn"
                                onClick={() => setSearchTerm('')}
                            >
                                <FaTimes />
                            </button>
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};

export default withTranslation()(BookFilter);
