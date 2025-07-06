// 'use client'
// import React, { useState, useCallback } from 'react';

// const ErrorBoundary = ({ children }) => {
//   const [hasError, setHasError] = useState(false);

//   // Define a function to handle errors
//   const handleError = useCallback((error, errorInfo) => {
//     // Log error details here
//     console.log({ error, errorInfo });
//   }, []);

//   // Custom error boundary HOC
//   const ErrorBoundaryWrapper = (props) => {
//     try {
//       setHasError(false);
//       // Render children if no error
//       return children;
      
//     } catch (error) {
//       handleError(error, null);
//       setHasError(true);
//       return null;
//     }
//   };

//   if (hasError) {
//     return (
//       <div>
//         <h2>Oops, there is an error!</h2>
//         <button type="button" onClick={() => setHasError(false)}>
//           Try again?
//         </button>
//       </div>
//     );
//   }

//   return <ErrorBoundaryWrapper>{children}</ErrorBoundaryWrapper>;
// };

// export default ErrorBoundary;
