export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { id, token } = req.query;
    const authToken = token || req.headers.authorization?.replace('Bearer ', '') || req.cookies.access_token;

    if (!authToken) {
        return res.status(401).json({ error: 'Unauthorized - Please login first' });
    }

    try {
        // Construct the base URL from environment variables
        const baseURL = (process.env.NEXT_PUBLIC_BASE_URL + process.env.NEXT_PUBLIC_END_POINT).replace(/"/g, '').trim();
        const fullURL = `${baseURL}get_book_by_id`.replace(/\/+/g, '/').replace(':/', '://');

        console.log('PDF Viewer - Verifying book access:', { id, fullURL });

        // First verify the user owns this book by calling the backend
        const verifyResponse = await fetch(fullURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            },
            body: JSON.stringify({ book_id: id })
        });

        if (!verifyResponse.ok) {
            console.error('PDF Viewer - Verify response not OK:', verifyResponse.status, verifyResponse.statusText);
            return res.status(verifyResponse.status).json({ error: 'Failed to verify book access' });
        }

        const bookData = await verifyResponse.json();
        
        console.log('PDF Viewer - Book Data Keys:', Object.keys(bookData.data || {}));

        if (bookData.error || !bookData.data) {
            return res.status(404).json({ error: 'Book not found' });
        }

        // Check if user has purchased the book
        if (bookData.data.is_purchased !== 1 && bookData.data.is_purchased !== "1") {
            return res.status(403).json({ error: 'Book not purchased' });
        }

        // Try to get the actual download URL from the download_book API
        const downloadURL = `${baseURL}download_book`.replace(/\/+/g, '/').replace(':/', '://');
        console.log('PDF Viewer - Fetching download URL from:', downloadURL);

        const downloadResponse = await fetch(downloadURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            },
            body: JSON.stringify({ book_id: id })
        });

        let pdfUrl = null;

        if (downloadResponse.ok) {
            const downloadData = await downloadResponse.json();
            console.log('PDF Viewer - Download Data:', JSON.stringify(downloadData));
            if (!downloadData.error && downloadData.pdf_url) {
                pdfUrl = downloadData.pdf_url;
            }
        }

        // Fallback: Try to find the PDF file path in the book data if download_book didn't work
        if (!pdfUrl) {
            const pdfFile = bookData.data.pdf_file || bookData.data.file || bookData.data.pdf || bookData.data.book_file;
            if (pdfFile) {
                pdfUrl = pdfFile;
                if (!pdfUrl.startsWith('http')) {
                    const baseHost = process.env.NEXT_PUBLIC_BASE_URL.replace(/"/g, '').trim();
                    pdfUrl = `${baseHost}/${pdfUrl}`.replace(/\/+/g, '/').replace(':/', '://');
                }
            }
        }
        
        if (pdfUrl) {
            console.log('PDF Viewer - Streaming from URL:', pdfUrl);

            const pdfResponse = await fetch(pdfUrl);
            if (!pdfResponse.ok) {
                console.error('PDF Viewer - Failed to fetch PDF file:', pdfResponse.status);
                throw new Error(`Failed to fetch PDF file: ${pdfResponse.status}`);
            }

            const contentType = pdfResponse.headers.get('content-type') || 'application/pdf';
            const contentLength = pdfResponse.headers.get('content-length');

            res.setHeader('Content-Type', contentType);
            if (contentLength) res.setHeader('Content-Length', contentLength);
            res.setHeader('X-Frame-Options', 'SAMEORIGIN');
            
            // Pipe the response body to the client
            const reader = pdfResponse.body.getReader();
            
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                res.write(value);
            }
            
            res.end();
            return;
        }

        // Fallback to demo content if no PDF file found
        console.warn('PDF Viewer - No PDF file found in data, showing demo content');
        
        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>${bookData.data.title}</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    padding: 2rem; 
                    background: #f8f9fa; 
                    margin: 0;
                }
                .book-content {
                    background: white;
                    padding: 2rem;
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    max-width: 800px;
                    margin: 0 auto;
                }
                h1 { color: #2c3e50; margin-bottom: 0.5rem; }
                .author { color: #7f8c8d; font-style: italic; margin-bottom: 1rem; }
                .category { 
                    background: #3498db; 
                    color: white; 
                    padding: 0.25rem 0.75rem; 
                    border-radius: 4px; 
                    font-size: 0.875rem; 
                    display: inline-block;
                    margin-bottom: 1.5rem;
                }
                .content { line-height: 1.6; color: #34495e; }
                .placeholder-note {
                    background: #fff3cd;
                    border: 1px solid #ffeaa7;
                    border-radius: 4px;
                    padding: 1rem;
                    margin: 2rem 0;
                    color: #856404;
                }
            </style>
        </head>
        <body>
            <div class="book-content">
                <h1>${bookData.data.title}</h1>
                <div class="author">by ${bookData.data.author}</div>
                <span class="category">${bookData.data.category}</span>
                
                <div class="content">
                    <p><strong>Description:</strong></p>
                    <p>${bookData.data.description || 'No description available.'}</p>
                    
                    <div class="placeholder-note">
                        <strong>📚 Demo Content</strong><br>
                        This is a placeholder viewer for demonstration purposes. 
                        In a real implementation, you would:
                        <ul>
                            <li>Store PDF files securely on your server or cloud storage</li>
                            <li>Serve the actual PDF content here</li>
                            <li>Implement proper access controls</li>
                            <li>Use a proper PDF viewer library</li>
                        </ul>
                    </div>
                    
                    <p><strong>Book Details:</strong></p>
                    <ul>
                        <li><strong>ID:</strong> ${id}</li>
                        <li><strong>Category:</strong> ${bookData.data.category}</li>
                        <li><strong>Price:</strong> ${bookData.data.coin_price} coins</li>
                        <li><strong>Status:</strong> Purchased ✅</li>
                    </ul>
                </div>
            </div>
        </body>
        </html>
        `;
        
        res.setHeader('Content-Type', 'text/html');
        res.setHeader('X-Frame-Options', 'SAMEORIGIN'); // Allow iframe from same origin
        res.status(200).send(htmlContent);

    } catch (error) {
        console.error('PDF Viewer - Exception:', error);
        res.status(500).json({ 
            error: 'Internal server error', 
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
        });
    }
}
