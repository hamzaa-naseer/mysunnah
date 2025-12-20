'use client'
import React from 'react';
import { FaBook } from 'react-icons/fa';

const BookPlaceholder = ({ width = 200, height = 280, size = 'small' }) => {
    const iconSize = size === 'large' ? 48 : 32;

    return (
        <div className={`book-placeholder ${size}`} style={{ width: `${width}px`, height: `${height}px` }}>
            <FaBook size={iconSize} />
            <span>No Cover</span>
        </div>
    );
};

export default BookPlaceholder;
