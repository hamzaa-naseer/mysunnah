import React from 'react';

const ComingSoon = () => {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Coming Soon</h1>
        <p style={{ fontSize: '1.5rem', opacity: 0.8 }}>We're working on something amazing!</p>
      </div>
    </div>
  );
};

export default ComingSoon;
