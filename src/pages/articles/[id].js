import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { apiCall } from 'src/utils';
import { getArticleByIdApi } from 'src/utils/api';
import Layout from 'src/components/Layout/Layout';
import Meta from 'src/components/SEO/Meta';
import { withTranslation } from 'react-i18next';
import { FaArrowLeft, FaCalendarAlt, FaUser } from 'react-icons/fa';
import ArticlePlaceholder from 'src/components/Articles/ArticlePlaceholder';

const ArticleDetails = ({ t }) => {
    const router = useRouter();
    const { id } = router.query;
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Get base URL from environment variable
    const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:8080').replace(/\/+$/, '');

    useEffect(() => {
        if (id) {
            fetchArticle();
        }
    }, [id]);

    const fetchArticle = async () => {
        setLoading(true);
        setError('');
        
        try {
            const response = await apiCall(getArticleByIdApi(id));
            if (response && (response.error === false || response.error === "false" || !response.error) && response.data) {
                setArticle(response.data);
            } else {
                setError(response?.message || 'Article not found');
            }
        } catch (err) {
            console.error('Error fetching article:', err);
            setError('Failed to load article');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Layout>
                <Container className="py-5 text-center">
                    <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
                    <p className="mt-4 text-muted fw-bold">{t('loading')}...</p>
                </Container>
            </Layout>
        );
    }

    if (error || !article) {
        return (
            <Layout>
                <Container className="py-5">
                    <Alert variant="danger" className="text-center shadow-sm border-0 py-4">
                        {error || t('article_not_found')}
                    </Alert>
                    <div className="text-center mt-3">
                        <button className="btn btn-primary rounded-pill px-4" onClick={() => router.push('/articles')}>
                            {t('all_articles')}
                        </button>
                    </div>
                </Container>
            </Layout>
        );
    }

    return (
        <Layout>
            <Meta 
                title={article.title}
                description={article.description}
                image={article.image ? `${baseUrl}/uploads/articles/${article.image}` : null}
            />
            
            <section className="articles-section py-5">
                <Container>
                    <Row>
                        <Col lg={10} className="mx-auto">
                            {/* Breadcrumb / Back Button */}
                            <nav aria-label="breadcrumb" className="mb-4">
                                <ol className="breadcrumb">
                                    <li className="breadcrumb-item cursor-pointer text-primary" onClick={() => router.push('/')}>{t('home')}</li>
                                    <li className="breadcrumb-item cursor-pointer text-primary" onClick={() => router.push('/articles')}>{t('articles')}</li>
                                    <li className="breadcrumb-item active" aria-current="page text-truncate" style={{ maxWidth: '200px' }}>{article.title}</li>
                                </ol>
                            </nav>

                            {/* Back Button for Mobile */}
                            <button 
                                className="btn btn-link p-0 mb-4 d-flex align-items-center text-decoration-none d-md-none"
                                onClick={() => router.back()}
                            >
                                <FaArrowLeft className="me-2" />
                                {t('back')}
                            </button>

                            <article className="article-details bg-white p-4 p-md-5 rounded-4 shadow-sm">
                                {/* Article Header */}
                                <header className="article-header mb-5">
                                    <h1 className="article-title display-4 mb-4">{article.title}</h1>
                                    
                                    <div className="article-meta d-flex flex-wrap align-items-center text-muted mb-4 pb-4 border-bottom">
                                        <div className="d-flex align-items-center me-4 mb-2">
                                            <div className="bg-primary-light rounded-circle p-2 me-2">
                                                <FaCalendarAlt className="text-primary" />
                                            </div>
                                            <span className="small fw-bold">
                                                {(article.created_at || article.date_created) && !isNaN(new Date(article.created_at || article.date_created).getTime()) 
                                                    ? new Date(article.created_at || article.date_created).toLocaleDateString() 
                                                    : ''}
                                            </span>
                                        </div>
                                        {article.author && (
                                            <div className="d-flex align-items-center mb-2">
                                                <div className="bg-primary-light rounded-circle p-2 me-2">
                                                    <FaUser className="text-primary" />
                                                </div>
                                                <span className="small fw-bold">{article.author}</span>
                                            </div>
                                        )}
                                    </div>

                                    {article.description && (
                                        <p className="article-description lead text-secondary mb-0">
                                            {article.description}
                                        </p>
                                    )}
                                </header>

                                {/* Article Featured Image */}
                                {/* Featured Image */}
                        <div className="article-detail-image-wrapper mb-5 rounded-4 overflow-hidden shadow">
                            {article.image ? (
                                <img 
                                    src={article.image.startsWith('http') ? article.image : `${baseUrl}/uploads/articles/${article.image}`}
                                    alt={article.title}
                                    className="article-detail-image img-fluid w-100"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                                    }}
                                />
                            ) : null}
                            <div style={{ display: article.image ? 'none' : 'flex' }}>
                                <ArticlePlaceholder height={450} size="large" />
                            </div>
                        </div>
                                {/* Article Content Body */}
                                <div className="article-content">
                                    <div 
                                        className="content-body"
                                        dangerouslySetInnerHTML={{ __html: article.content }}
                                    />
                                </div>
                                
                                <footer className="pt-5 mt-5 border-top">
                                    <div className="d-flex justify-content-between align-items-center flex-wrap">
                                        <button 
                                            className="btn btn-outline-primary rounded-pill px-4 mb-3"
                                            onClick={() => router.push('/articles')}
                                        >
                                            <FaArrowLeft className="me-2" />
                                            {t('all_articles')}
                                        </button>
                                        
                                        {/* Share functionality could go here */}
                                    </div>
                                </footer>
                            </article>
                        </Col>
                    </Row>
                </Container>
            </section>
        </Layout>
    );
};

export default withTranslation()(ArticleDetails);
