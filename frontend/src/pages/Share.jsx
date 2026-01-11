import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { translationService, bookService } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Languages, Send, Sparkles } from 'lucide-react';

const Share = () => {
  const { user, sessionToken } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const isEditMode = !!editId;

  const [formData, setFormData] = useState({
    bookId: '',
    originalText: '',
    translatedText: '',
    sourceLanguage: 'en', // Default source language
    targetLanguage: 'ko', // Default target language
    context: '',
    tags: []
  });
  const [books, setBooks] = useState([]);
  const [isLoadingBooks, setIsLoadingBooks] = useState(true);
  const [isLoadingTranslation, setIsLoadingTranslation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suggestion, setSuggestion] = useState('');
  const [isFetchingSuggestion, setIsFetchingSuggestion] = useState(false);
  const [showCreateBook, setShowCreateBook] = useState(false);
  const [newBookData, setNewBookData] = useState({
    title: '',
    author: '',
    description: ''
  });

  // Fetch books on component mount
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const booksData = await bookService.getAllBooks();
        setBooks(booksData);
      } catch (error) {
        console.error('Failed to fetch books:', error);
      } finally {
        setIsLoadingBooks(false);
      }
    };

    fetchBooks();
  }, []);

  // Load translation if in edit mode
  useEffect(() => {
    if (isEditMode && editId) {
      const loadTranslation = async () => {
        try {
          setIsLoadingTranslation(true);
          const translation = await translationService.getTranslationById(editId);
          setFormData({
            bookId: translation.bookId.toString(),
            originalText: translation.originalText,
            translatedText: translation.translatedText,
            sourceLanguage: translation.sourceLanguage,
            targetLanguage: translation.targetLanguage,
            context: translation.context || '',
            tags: []
          });
        } catch (error) {
          console.error('Failed to load translation:', error);
          alert('Failed to load translation. Please try again.');
        } finally {
          setIsLoadingTranslation(false);
        }
      };

      loadTranslation();
    }
  }, [isEditMode, editId]);

  // Debounced translation suggestion
  useEffect(() => {
    if (!formData.originalText || !formData.targetLanguage) {
      setSuggestion('');
      return;
    }

    const timer = setTimeout(async () => {
      setIsFetchingSuggestion(true);
      try {
        const response = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: formData.originalText,
            targetLanguage: formData.targetLanguage
          })
        });

        if (response.ok) {
          const data = await response.json();
          setSuggestion(data.translatedText);
        }
      } catch (error) {
        console.error('Suggestion fetch error:', error);
      } finally {
        setIsFetchingSuggestion(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.originalText, formData.targetLanguage]);

  if (!user) {
    return (
      <div className="text-center py-12">
        <Languages className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-slate-700 mb-2">Sign in to Share Translations</h2>
        <p className="text-slate-500">You need to be signed in to create and share translations.</p>
      </div>
    );
  }

  const handleCreateBook = async () => {
    if (!newBookData.title || !newBookData.author) {
      alert('Please enter both title and author for the book.');
      return;
    }

    try {
      const bookData = {
        title: newBookData.title,
        author: newBookData.author,
        description: newBookData.description || '',
        language: formData.targetLanguage
      };

      const result = await bookService.createBook(bookData, sessionToken);

      // Add the new book to the list
      setBooks([...books, result]);

      // Select the new book
      setFormData({ ...formData, bookId: result.id.toString() });

      // Reset and hide the form
      setNewBookData({ title: '', author: '', description: '' });
      setShowCreateBook(false);

      alert('Book created successfully!');
    } catch (error) {
      console.error('Failed to create book:', error);
      alert('Failed to create book. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.bookId) {
      alert('Please select a book for this translation.');
      return;
    }

    if (!sessionToken) {
      alert('You must be signed in to create a translation.');
      return;
    }

    setIsSubmitting(true);
    try {
      const translationData = {
        originalText: formData.originalText,
        translatedText: formData.translatedText,
        sourceLanguage: formData.sourceLanguage,
        targetLanguage: formData.targetLanguage,
        bookId: formData.bookId,
        context: formData.context || null
      };

      if (isEditMode) {
        await translationService.updateTranslation(editId, translationData, sessionToken);
        alert('Translation updated successfully!');
      } else {
        await translationService.createTranslation(translationData, sessionToken);
        alert('Translation created successfully!');
      }

      // Navigate to the feed
      navigate('/feed');
    } catch (error) {
      console.error(`Failed to ${isEditMode ? 'update' : 'create'} translation:`, error);
      alert(`Failed to ${isEditMode ? 'update' : 'create'} translation. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingTranslation) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Loading translation...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          {isEditMode ? 'Edit Translation' : 'Share a Translation'}
        </h1>
        <p className="text-slate-600">
          {isEditMode ? 'Update your translation details.' : 'Add a new translation to help others learn.'}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isEditMode ? 'Edit Translation' : 'Create Translation'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-slate-700">
                  Select Book
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCreateBook(!showCreateBook)}
                  className="text-teal-600 hover:text-teal-700"
                >
                  {showCreateBook ? 'Cancel' : '+ Create New Book'}
                </Button>
              </div>

              {showCreateBook ? (
                <div className="space-y-3 p-4 bg-slate-50 rounded-md">
                  <Input
                    value={newBookData.title}
                    onChange={(e) => setNewBookData({ ...newBookData, title: e.target.value })}
                    placeholder="Book title"
                  />
                  <Input
                    value={newBookData.author}
                    onChange={(e) => setNewBookData({ ...newBookData, author: e.target.value })}
                    placeholder="Author name"
                  />
                  <Textarea
                    rows={2}
                    value={newBookData.description}
                    onChange={(e) => setNewBookData({ ...newBookData, description: e.target.value })}
                    placeholder="Description (optional)"
                  />
                  <Button
                    type="button"
                    onClick={handleCreateBook}
                    className="w-full bg-teal-500 hover:bg-teal-600"
                  >
                    Create Book
                  </Button>
                </div>
              ) : (
                <select
                  value={formData.bookId}
                  onChange={(e) => setFormData({ ...formData, bookId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                  disabled={isLoadingBooks}
                >
                  <option value="">
                    {isLoadingBooks ? 'Loading books...' : 'Choose a book...'}
                  </option>
                  {books.map((book) => (
                    <option key={book.id} value={book.id}>
                      {book.title} - {book.author}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Source Language
                </label>
                <Input
                  value={formData.sourceLanguage}
                  onChange={(e) => setFormData({ ...formData, sourceLanguage: e.target.value })}
                  placeholder="e.g., en"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Target Language
                </label>
                <Input
                  value={formData.targetLanguage}
                  onChange={(e) => setFormData({ ...formData, targetLanguage: e.target.value })}
                  placeholder="e.g., es"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Original Text
              </label>
              <Textarea
                rows={3}
                value={formData.originalText}
                onChange={(e) => setFormData({ ...formData, originalText: e.target.value })}
                placeholder="Enter the original text..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Your Translation
              </label>

              {/* Machine translation suggestion */}
              {(suggestion || isFetchingSuggestion) && (
                <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-700">Suggestion</span>
                  </div>
                  {isFetchingSuggestion ? (
                    <p className="text-sm text-amber-600 italic">Translating...</p>
                  ) : (
                    <p className="text-sm text-slate-700">{suggestion}</p>
                  )}
                </div>
              )}

              <Textarea
                rows={3}
                value={formData.translatedText}
                onChange={(e) => setFormData({ ...formData, translatedText: e.target.value })}
                placeholder="Enter your translation..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Context (Optional)
              </label>
              <Input
                value={formData.context}
                onChange={(e) => setFormData({ ...formData, context: e.target.value })}
                placeholder="e.g., Chapter 3, Page 45"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-teal-500 hover:bg-teal-600"
              disabled={isSubmitting}
            >
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting
                ? (isEditMode ? 'Updating...' : 'Creating...')
                : (isEditMode ? 'Update Translation' : 'Share Translation')
              }
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Share;
