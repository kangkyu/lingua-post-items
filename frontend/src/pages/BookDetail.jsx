import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, Plus, Languages, Bookmark } from 'lucide-react';
import { bookService, bookmarkService } from '@/lib/api';

const BookDetail = () => {
  const { id } = useParams();
  const { user, sessionToken } = useAuth();
  const [book, setBook] = useState(null);
  const [translations, setTranslations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkId, setBookmarkId] = useState(null);
  const [bookmarkedTranslationIds, setBookmarkedTranslationIds] = useState(new Map()); // Map of translationId -> bookmarkId

  useEffect(() => {
    const fetchBookData = async () => {
      try {
        setLoading(true);
        setError(null);
        const bookData = await bookService.getBookById(id);
        if (bookData) {
          setBook(bookData);
          setTranslations(bookData.translations || []);
        } else {
          setError('Book not found');
        }
      } catch (err) {
        console.error('Failed to fetch book:', err);
        setError('Failed to load book. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBookData();
    }
  }, [id]);

  // Check if book is bookmarked and fetch translation bookmarks
  useEffect(() => {
    const fetchBookmarksData = async () => {
      if (user && sessionToken && id) {
        try {
          // Check book bookmark
          const bookData = await bookmarkService.checkBookBookmark(parseInt(id), sessionToken);
          setIsBookmarked(bookData.isBookmarked);
          setBookmarkId(bookData.bookmark?.id || null);

          // Fetch all bookmarks to get translation bookmarks
          const allBookmarks = await bookmarkService.getBookmarks(sessionToken);
          const translationMap = new Map();
          allBookmarks.translations.forEach(t => {
            translationMap.set(t.id, t.bookmarkId);
          });
          setBookmarkedTranslationIds(translationMap);
        } catch (err) {
          console.error('Failed to fetch bookmarks:', err);
        }
      }
    };

    fetchBookmarksData();
  }, [user, sessionToken, id]);

  const handleBookmarkToggle = async () => {
    if (!user || !sessionToken) return;

    try {
      if (isBookmarked && bookmarkId) {
        await bookmarkService.deleteBookmark(bookmarkId, sessionToken);
        setIsBookmarked(false);
        setBookmarkId(null);
      } else {
        const bookmark = await bookmarkService.createBookmark({ bookId: parseInt(id) }, sessionToken);
        setIsBookmarked(true);
        setBookmarkId(bookmark.id);
      }
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
    }
  };

  const handleTranslationBookmarkToggle = async (translationId) => {
    if (!user || !sessionToken) return;

    const existingBookmarkId = bookmarkedTranslationIds.get(translationId);

    try {
      if (existingBookmarkId) {
        await bookmarkService.deleteBookmark(existingBookmarkId, sessionToken);
        setBookmarkedTranslationIds(prev => {
          const newMap = new Map(prev);
          newMap.delete(translationId);
          return newMap;
        });
      } else {
        const bookmark = await bookmarkService.createBookmark({ translationId }, sessionToken);
        setBookmarkedTranslationIds(prev => {
          const newMap = new Map(prev);
          newMap.set(translationId, bookmark.id);
          return newMap;
        });
      }
    } catch (err) {
      console.error('Failed to toggle translation bookmark:', err);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500">Loading book...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <p className="text-red-500">{error}</p>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="mt-4"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="text-center py-12">
        <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500">Book not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Book Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-32 h-40 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
              {book.coverImage ? (
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <BookOpen className="w-16 h-16 text-slate-400" />
              )}
            </div>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">{book.title}</h1>
              <p className="text-lg text-slate-600 mb-3">by {book.author}</p>
              <p className="text-slate-700 mb-4">{book.description}</p>
              
              <div className="flex items-center space-x-4 text-sm text-slate-600 mb-4">
                <div className="flex items-center">
                  <Languages className="w-4 h-4 mr-1" />
                  {book.language}
                </div>
                <div className="flex items-center">
                  <BookOpen className="w-4 h-4 mr-1" />
                  {book.translations ? book.translations.length : 0} translations
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {book.bookmarksCount} bookmarks
                </div>
              </div>
              
              <div className="flex gap-2 flex-wrap mb-4">
                <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm">
                  {book.language}
                </span>
                <span className="px-3 py-1 bg-teal-100 text-teal-600 rounded-full text-sm">
                  Classic Literature
                </span>
              </div>
              
              <div className="flex gap-2">
                {user && (
                  <>
                    <Button className="bg-teal-500 hover:bg-teal-600">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Translation
                    </Button>
                    <Button
                      variant="outline"
                      className={isBookmarked ? 'text-yellow-500 border-yellow-500 hover:bg-yellow-50' : ''}
                      onClick={handleBookmarkToggle}
                    >
                      <Bookmark
                        className="w-4 h-4 mr-2"
                        fill={isBookmarked ? 'currentColor' : 'none'}
                      />
                      {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Translations List */}
      <Card>
        <CardHeader>
          <CardTitle>Translations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {translations.map((translation) => {
              const isTranslationBookmarked = bookmarkedTranslationIds.has(translation.id);
              return (
                <div key={translation.id} className="border border-slate-200 rounded-lg p-4">
                  <div className="grid md:grid-cols-2 gap-4 mb-3">
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <h4 className="font-medium text-slate-700 mb-2">Original</h4>
                      <p className="text-slate-900">{translation.originalText}</p>
                    </div>
                    <div className="p-3 bg-teal-50 rounded-lg">
                      <h4 className="font-medium text-teal-700 mb-2">Translation</h4>
                      <p className="text-teal-900">{translation.translatedText}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <span>{translation.context}</span>
                    <div className="flex items-center gap-3">
                      <span>by {translation.createdBy} • {translation.createdDate}</span>
                      {user && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-6 px-1 ${
                            isTranslationBookmarked
                              ? 'text-yellow-500 hover:text-yellow-600'
                              : 'text-slate-600 hover:text-yellow-600'
                          }`}
                          onClick={() => handleTranslationBookmarkToggle(translation.id)}
                        >
                          <Bookmark
                            className="w-4 h-4"
                            fill={isTranslationBookmarked ? 'currentColor' : 'none'}
                          />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookDetail;
