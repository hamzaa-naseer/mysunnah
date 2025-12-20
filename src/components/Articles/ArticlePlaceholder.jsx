'use client'
import React from 'react';
import { FaRegNewspaper } from 'react-icons/fa';

const ArticlePlaceholder = ({ width = '100%', height = '100%', size = 'medium' }) => {
    const iconSize = size === 'large' ? 48 : size === 'medium' ? 32 : 24;

    return (
        <div
            className={`article-placeholder ${size}`}
            style={{
                width: typeof width === 'number' ? `${width}px` : width,
                height: typeof height === 'number' ? `${height}px` : height,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(var(--primary-rgb), 0.05)',
                color: 'var(--primary-color)',
                borderRadius: '12px',
                border: '1px dashed var(--primary-color)',
                opacity: 0.6
            }}
        >
            <FaRegNewspaper size={iconSize} />
            <span style={{ marginTop: '8px', fontSize: '0.8rem', fontWeight: '500' }}>No Image</span>
        </div>
    );
};

export default ArticlePlaceholder;
