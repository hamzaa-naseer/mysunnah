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
        // First verify the user owns this book by calling the backend
        const verifyResponse = await fetch(`http://localhost:8080/api/get_book_by_id`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            },
            body: JSON.stringify({ book_id: id })
        });

        if (!verifyResponse.ok) {
            return res.status(verifyResponse.status).json({ error: 'Failed to verify book access' });
        }

        const bookData = await verifyResponse.json();
        
        if (bookData.error || !bookData.data) {
            return res.status(404).json({ error: 'Book not found' });
        }

        // Check if user has purchased the book
        if (bookData.data.is_purchased !== 1 && bookData.data.is_purchased !== "1") {
            return res.status(403).json({ error: 'Book not purchased' });
        }

        // For now, return a placeholder PDF URL or serve a demo PDF
        // In a real implementation, you would fetch the actual PDF from your storage
        // and stream it to the user
        
        // For now, we'll create a simple HTML page that can be viewed in iframe
        // In a real implementation, you would serve the actual PDF file
        
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
        console.error('Error serving PDF:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
