import React, { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { apiCall } from '../../utils';
import { getArticlesApi } from '../../utils/api';
import { withTranslation } from 'react-i18next';
import ArticlePlaceholder from '../Articles/ArticlePlaceholder';

const ArticlesSection = ({ t }) => {
    const router = useRouter();
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);

    // Get base URL from environment variable
    const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8080').replace(/\/+$/, '');

    useEffect(() => {
        fetchArticles();
    }, []);

    const fetchArticles = async () => {
        setLoading(true);
        try {
            const response = await apiCall(getArticlesApi());
            if (response && (response.error === false || response.error === "false" || !response.error)) {
                setArticles(response.data || []);
            }
        } catch (error) {
            console.error('Error fetching articles:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleArticleClick = (id) => {
        router.push(`/articles/${id}`);
    };

    const handleViewAll = () => {
        router.push('/articles');
    };

    // Don't render if still loading or no articles
    if (loading || articles.length === 0) {
        return null;
    }

    return (
        <section className="articles-section py-5">
            <Container>
                <div className="text-center mb-5">
                    <h2 className="section-title mb-3">
                        {t('articles')}
                    </h2>
                    <p className="section-subtitle text-muted">
                        {t('discover_islamic_articles')}
                    </p>
                </div>

                <Row className="g-4">
                    {articles.slice(0, 6).map((article) => (
                        <Col
                            lg={4}
                            md={6}
                            xs={12}
                            key={article.id}
                            className="article-card-col"
                        >
                            <div
                                className="article-card h-100 shadow-sm rounded-3 overflow-hidden cursor-pointer"
                                onClick={() => handleArticleClick(article.id)}
                            >
                                <div className="article-image-wrapper">
                                    {article.image ? (
                                        <img
                                            src={article.image.startsWith('http') ? article.image : `${baseUrl}/uploads/articles/${article.image}`}
                                            alt={article.title}
                                            className="article-image w-100"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'flex';
                                            }}
                                        />
                                    ) : null}
                                    <div style={{ display: article.image ? 'none' : 'flex', width: '100%', height: '200px' }}>
                                        <ArticlePlaceholder height={200} />
                                    </div>
                                </div>

                                <div className="article-content p-3">
                                    <h5 className="article-title mb-2 fw-bold text-dark">
                                        {article.title}
                                    </h5>

                                    <p className="article-description text-muted mb-3 line-clamp-3">
                                        {article.description}
                                    </p>

                                    <div className="d-flex justify-content-between align-items-center">
                                        <small className="text-muted">
                                            {article.created_at && !isNaN(new Date(article.created_at).getTime())
                                                ? new Date(article.created_at).toLocaleDateString()
                                                : ''}
                                        </small>
                                        <button
                                            className="btn btn-primary btn-sm rounded-pill px-3"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleArticleClick(article.id);
                                            }}
                                        >
                                            {t('read_more')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </Col>
                    ))}
                </Row>

                {articles.length > 6 && (
                    <div className="text-center mt-4">
                        <button
                            className="btn btn-outline-primary btn-lg rounded-pill px-4"
                            onClick={handleViewAll}
                        >
                            {t('view_all_articles')}
                        </button>
                    </div>
                )}
            </Container>


        </section>
    );
};

export default withTranslation()(ArticlesSection);
