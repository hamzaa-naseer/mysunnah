'use client'
import React from 'react';
import { withTranslation } from 'react-i18next';

const BookShop = ({ t }) => {
  return (
    <div className="container">
      <h1>Book Shop</h1>
      <p>Testing component loading...</p>
    </div>
  );
};

export default withTranslation()(BookShop);
