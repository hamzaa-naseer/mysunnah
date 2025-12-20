// Enhanced purchase status manager
import { toast } from 'react-hot-toast';

class PurchaseStatusManager {
  constructor() {
    this.purchasedBooks = new Set();
    this.loadFromStorage();
  }

  // Load purchased books from localStorage (backup method)
  loadFromStorage() {
    try {
      const stored = localStorage.getItem('purchased_books');
      if (stored) {
        const books = JSON.parse(stored);
        this.purchasedBooks = new Set(books);
      }
    } catch (error) {
      console.error('Error loading purchased books from storage:', error);
    }
  }

  // Save to localStorage (backup method)
  saveToStorage() {
    try {
      localStorage.setItem('purchased_books', JSON.stringify(Array.from(this.purchasedBooks)));
    } catch (error) {
      console.error('Error saving purchased books to storage:', error);
    }
  }

  // Mark a book as purchased
  markAsPurchased(bookId) {
    const id = String(bookId);
    this.purchasedBooks.add(id);
    this.saveToStorage();
    console.log(`Book ${id} marked as purchased`);
  }

  // Check if a book is purchased (multiple sources)
  isPurchased(book, isAuthenticated) {
    if (!book) return false;

    const bookId = String(book.id);

    // Method 1: Check API response (primary)
    if (book.is_purchased === 1 || book.is_purchased === "1" || book.is_purchased === true) {
      return true;
    }

    // Method 2: Check local storage (backup for authenticated users)
    if (isAuthenticated && this.purchasedBooks.has(bookId)) {
      return true;
    }

    return false;
  }

  // Clear all purchase data (for logout)
  clear() {
    this.purchasedBooks.clear();
    localStorage.removeItem('purchased_books');
  }

  // Get all purchased book IDs
  getPurchasedBookIds() {
    return Array.from(this.purchasedBooks);
  }

  // Debug method
  debug() {
    console.log('=== PURCHASE STATUS MANAGER DEBUG ===');
    console.log('Purchased books in memory:', Array.from(this.purchasedBooks));
    console.log('Purchased books in storage:', localStorage.getItem('purchased_books'));
    console.log('=====================================');
  }
}

// Create singleton instance
export const purchaseManager = new PurchaseStatusManager();

// Convenience functions
export const markBookAsPurchased = (bookId) => purchaseManager.markAsPurchased(bookId);
export const isBookPurchased = (book, isAuthenticated) => purchaseManager.isPurchased(book, isAuthenticated);
export const clearPurchaseData = () => purchaseManager.clear();
export const debugPurchaseStatus = () => purchaseManager.debug();
