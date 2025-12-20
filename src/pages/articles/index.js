import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Spinner, Alert, Form, InputGroup } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { apiCall } from 'src/utils';
import { getArticlesApi } from 'src/utils/api';
import Layout from 'src/components/Layout/Layout';
import Meta from 'src/components/SEO/Meta';
import { withTranslation } from 'react-i18next';
import { FaSearch, FaCalendarAlt } from 'react-icons/fa';
import ArticlePlaceholder from 'src/components/Articles/ArticlePlaceholder';

const ArticlesPage = ({ t }) => {
    const router = useRouter();
    const [articles, setArticles] = useState([]);
    const [filteredArticles, setFilteredArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    
    // Get base URL from environment variable or default to localhost:8080
    const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8080').replace(/\/+$/, '');

    useEffect(() => {
        fetchArticles();
    }, []);

    useEffect(() => {
        if (searchTerm) {
            const filtered = articles.filter(article =>
                article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                article.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredArticles(filtered);
        } else {
            setFilteredArticles(articles);
        }
    }, [searchTerm, articles]);

    const fetchArticles = async () => {
        setLoading(true);
        setError('');
        
        try {
            const response = await apiCall(getArticlesApi());
            if (response && (response.error === false || response.error === "false" || !response.error)) {
                setArticles(response.data || []);
            } else {
                setError(response?.message || 'Failed to load articles');
            }
        } catch (err) {
            console.error('Error fetching articles:', err);
            setError('Failed to load articles');
        } finally {
            setLoading(false);
        }
    };

    const handleArticleClick = (id) => {
        router.push(`/articles/${id}`);
    };

    return (
        <Layout>
            <Meta title={t('articles')} description={t('browse_islamic_articles')} />
            
            <section className="articles-section">
                <Container>
                    {/* Page Header */}
                    <div className="text-center mb-5">
                        <h1 className="page-title">{t('articles')}</h1>
                        <p className="lead text-muted mt-2">
                            {t('discover_islamic_knowledge')}
                        </p>
                    </div>

                    {/* Search Bar */}
                    <Row className="mb-5">
                        <Col lg={6} md={8} className="mx-auto">
                            <InputGroup className="search-group">
                                <InputGroup.Text>
                                    <FaSearch />
                                </InputGroup.Text>
                                <Form.Control
                                    type="text"
                                    placeholder={t('search_articles')}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </InputGroup>
                        </Col>
                    </Row>

                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
                            <p className="mt-4 text-muted fw-bold">{t('loading')}...</p>
                        </div>
                    ) : error ? (
                        <Alert variant="danger" className="text-center shadow-sm border-0 py-4">
                            {error}
                        </Alert>
                    ) : (
                        <Row className="g-4">
                            {filteredArticles.length === 0 ? (
                                <Col xs={12}>
                                    <div className="text-center py-5 bg-white rounded-3 shadow-sm">
                                        <p className="mb-0 text-muted">
                                            {searchTerm ? t('no_articles_found_for_search') : t('no_articles_available')}
                                        </p>
                                    </div>
                                </Col>
                            ) : (
                                filteredArticles.map((article) => (
                                    <Col lg={4} md={6} xs={12} key={article.id}>
                                        <div 
                                            className="article-card"
                                            onClick={() => handleArticleClick(article.id)}
                                        >
                                            <div className="article-image-wrapper">
                                                {article.image ? (
                                                    <img 
                                                        src={article.image.startsWith('http') ? article.image : `${baseUrl}/uploads/articles/${article.image}`}
                                                        alt={article.title}
                                                        className="article-image"
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                            if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                                                        }}
                                                    />
                                                ) : null}
                                                <div style={{ display: article.image ? 'none' : 'flex' }}>
                                                    <ArticlePlaceholder height={220} />
                                                </div>
                                            </div>
                                            
                                            <div className="article-content">
                                                <h5 className="article-title fw-bold">
                                                    {article.title}
                                                </h5>
                                                <p className="article-description mb-3">
                                                    {article.description}
                                                </p>
                                                <div className="article-footer d-flex align-items-center mt-auto pt-3 border-top">
                                                    <FaCalendarAlt className="text-primary me-2" />
                                                    <small className="text-muted fw-bold">
                                                        {article.created_at && !isNaN(new Date(article.created_at).getTime()) 
                                                            ? new Date(article.created_at).toLocaleDateString() 
                                                            : ''}
                                                    </small>
                                                </div>
                                            </div>
                                        </div>
                                    </Col>
                                ))
                            )}
                        </Row>
                    )}

                    {/* Results Count */}
                    {!loading && !error && filteredArticles.length > 0 && (
                        <div className="text-center mt-5">
                            <span className="badge rounded-pill bg-primary-light text-primary px-3 py-2 border">
                                {t('showing_articles', { 
                                    count: filteredArticles.length, 
                                    total: articles.length 
                                })}
                            </span>
                        </div>
                    )}
                </Container>
            </section>
        </Layout>
    );
};

export default withTranslation()(ArticlesPage);
