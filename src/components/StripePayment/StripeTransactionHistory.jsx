"use client"
import React, { useState, useEffect } from 'react'
import { t } from 'i18next'
import { Modal, Table, Tag, Spin } from 'antd'
import { getStripeTransactionHistory } from 'src/store/actions/campaign'
import moment from 'moment'

const StripeTransactionHistory = ({ isOpen, onClose }) => {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadTransactionHistory()
    }
  }, [isOpen])

  const loadTransactionHistory = () => {
    setLoading(true)
    getStripeTransactionHistory({
      onSuccess: (response) => {
        if (!response.error) {
          setTransactions(response.data)
        }
        setLoading(false)
      },
      onError: (error) => {
        console.error('Failed to load transaction history:', error)
        setLoading(false)
      }
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success'
      case 'pending':
        return 'processing'
      case 'failed':
        return 'error'
      case 'cancelled':
        return 'default'
      default:
        return 'default'
    }
  }

  const columns = [
    {
      title: t('date'),
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => moment(date).format('DD/MM/YYYY HH:mm'),
      sorter: (a, b) => moment(a.created_at).unix() - moment(b.created_at).unix(),
    },
    {
      title: t('coins'),
      dataIndex: 'coins',
      key: 'coins',
      render: (coins) => (
        <span style={{ color: '#f39c12', fontWeight: 'bold' }}>
          {coins} {t('coins')}
        </span>
      ),
      sorter: (a, b) => a.coins - b.coins,
    },
    {
      title: t('amount'),
      dataIndex: 'amount',
      key: 'amount',
      render: (amount, record) => (
        <span style={{ fontWeight: 'bold' }}>
          £{parseFloat(amount).toFixed(2)}
        </span>
      ),
      sorter: (a, b) => parseFloat(a.amount) - parseFloat(b.amount),
    },
    {
      title: t('status'),
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {t(status)}
        </Tag>
      ),
      filters: [
        { text: t('completed'), value: 'completed' },
        { text: t('pending'), value: 'pending' },
        { text: t('failed'), value: 'failed' },
        { text: t('cancelled'), value: 'cancelled' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: t('payment_id'),
      dataIndex: 'payment_intent_id',
      key: 'payment_intent_id',
      render: (id) => (
        <span style={{ fontFamily: 'monospace', fontSize: '0.85em' }}>
          {id.substring(0, 20)}...
        </span>
      ),
    },
  ]

  return (
    <Modal
      title={t('stripe_transaction_history')}
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={800}
      className="stripe-transaction-history-modal"
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
          <p style={{ marginTop: '16px' }}>{t('loading_transaction_history')}</p>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '16px' }}>
            <p style={{ color: '#666' }}>
              {t('stripe_transaction_history_description')}
            </p>
          </div>

          <Table
            columns={columns}
            dataSource={transactions}
            rowKey="id"
            size="small"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} ${t('of')} ${total} ${t('transactions')}`,
            }}
            locale={{
              emptyText: t('no_transactions_found'),
            }}
            scroll={{ x: 600 }}
          />

          {transactions.length > 0 && (
            <div style={{ marginTop: '16px', padding: '12px', background: '#f0f2f5', borderRadius: '6px' }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '14px' }}>{t('transaction_summary')}</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', fontSize: '13px' }}>
                <div>
                  <strong>{t('total_transactions')}:</strong> {transactions.length}
                </div>
                <div>
                  <strong>{t('completed')}:</strong> {transactions.filter(t => t.status === 'completed').length}
                </div>
                <div>
                  <strong>{t('total_spent')}:</strong> £{transactions
                    .filter(t => t.status === 'completed')
                    .reduce((sum, t) => sum + parseFloat(t.amount), 0)
                    .toFixed(2)}
                </div>
                <div>
                  <strong>{t('total_coins_purchased')}:</strong> {transactions
                    .filter(t => t.status === 'completed')
                    .reduce((sum, t) => sum + parseInt(t.coins), 0)}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </Modal>
  )
}

export default StripeTransactionHistory
