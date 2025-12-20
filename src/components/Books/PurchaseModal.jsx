'use client'
import React, { useState } from 'react';
import { FaCoins, FaTimes, FaBook, FaSpinner } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import { purchaseBookApi } from '../../utils/api';
import { updateUserDatainfo } from '../../store/reducers/userSlice';
import { apiCallWithToken } from '../../utils/index';

const PurchaseModal = ({ book, userCoins, onClose, onPurchaseSuccess, t }) => {
    const [isPurchasing, setIsPurchasing] = useState(false);
    const dispatch = useDispatch();

    const handlePurchase = async () => {
        if (isPurchasing) return;

        setIsPurchasing(true);

        try {
            const response = await apiCallWithToken(purchaseBookApi(book.id));

            if (!response.error) {
                // Update user coins in store
                dispatch(updateUserDatainfo({ data: { coins: response.coins } }));

                // Show success message
                toast.success(t('book_purchased_successfully'));

                // Call success callback
                onPurchaseSuccess(response.coins);
            } else {
                toast.error(response.message || t('purchase_failed'));
            }
        } catch (error) {
            console.error('Purchase error:', error);
            toast.error(t('something_went_wrong'));
        } finally {
            setIsPurchasing(false);
        }
    };

    const remainingCoins = userCoins - parseInt(book.coin_price);

    return (
        <div className="modal-overlay">
            <div className="modal-container purchase-modal">
                <div className="modal-header">
                    <h4 className="modal-title">
                        <FaBook className="me-2" />
                        {t('confirm_purchase')}
                    </h4>
                    <button
                        className="btn-close"
                        onClick={onClose}
                        disabled={isPurchasing}
                    >
                        <FaTimes />
                    </button>
                </div>

                <div className="modal-body">
                    <div className="book-purchase-info">
                        <div className="book-info">
                            <h5 className="book-title">{book.title}</h5>
                            <p className="book-author text-muted">{t('by')} {book.author}</p>
                            <p className="book-category">
                                <span className="badge bg-secondary">{book.category}</span>
                            </p>
                        </div>

                        <div className="purchase-calculation">
                            <div className="calculation-row">
                                <span className="label">{t('your_coins')}:</span>
                                <span className="value">
                                    <FaCoins className="coin-icon me-1" />
                                    {userCoins}
                                </span>
                            </div>

                            <div className="calculation-row">
                                <span className="label">{t('book_price')}:</span>
                                <span className="value price">
                                    <FaCoins className="coin-icon me-1" />
                                    -{book.coin_price}
                                </span>
                            </div>

                            <hr className="calculation-divider" />

                            <div className="calculation-row total">
                                <span className="label">{t('remaining_coins')}:</span>
                                <span className={`value ${remainingCoins >= 0 ? 'positive' : 'negative'}`}>
                                    <FaCoins className="coin-icon me-1" />
                                    {remainingCoins}
                                </span>
                            </div>
                        </div>

                        {remainingCoins < 0 && (
                            <div className="alert alert-danger">
                                <strong>{t('insufficient_coins')}</strong>
                                <br />
                                {t('need_more_coins_detail', {
                                    needed: Math.abs(remainingCoins),
                                    current: userCoins,
                                    required: book.coin_price
                                })}
                            </div>
                        )}

                        <div className="purchase-benefits mt-3">
                            <h6>{t('after_purchase_you_will')}:</h6>
                            <ul className="benefits-list">
                                <li>✓ {t('get_instant_access')}</li>
                                <li>✓ {t('download_pdf_anytime')}</li>
                                <li>✓ {t('lifetime_access')}</li>
                                <li>✓ {t('high_quality_content')}</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button
                        className="btn btn-secondary me-2"
                        onClick={onClose}
                        disabled={isPurchasing}
                    >
                        {t('cancel')}
                    </button>

                    <button
                        className={`btn btn-primary purchase-confirm-btn ${isPurchasing ? 'loading' : ''}`}
                        onClick={handlePurchase}
                        disabled={remainingCoins < 0 || isPurchasing}
                    >
                        {isPurchasing ? (
                            <>
                                <FaSpinner className="spin me-2" />
                                {t('purchasing')}...
                            </>
                        ) : (
                            <>
                                <FaCoins className="me-2" />
                                {t('confirm_purchase')}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PurchaseModal;
