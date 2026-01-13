import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bookmark as BookmarkIcon, BookOpen, Heart, MessageCircle } from 'lucide-react';
import { userService } from '@/lib/api';

const Bookmarks = () => {
  const { user, sessionToken } = useAuth();
  const [bookmarkedTranslations, setBookmarkedTranslations] = useState([]);
  const [bookmarkedBooks, setBookmarkedBooks] = useState([]);
  const [activeTab, setActiveTab] = useState('translations');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookmarks = async () => {
      if (!user || !sessionToken) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await userService.getUserBookmarks(sessionToken);
        setBookmarkedTranslations(data.translations);
        setBookmarkedBooks(data.books);
      } catch (err) {
        console.error('Failed to fetch bookmarks:', err);
        setError('Failed to load bookmarks. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, [user, sessionToken]);

  if (!user) {
    return (
      <div className="text-center py-12">
        <BookmarkIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-slate-700 mb-2">Sign in to View Bookmarks</h2>
        <p className="text-slate-500">You need to be signed in to view your saved translations.</p>
      </div>
    );
  }

  const hasTranslations = bookmarkedTranslations.length > 0;
  const hasBooks = bookmarkedBooks.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-slate-900">My Bookmarks</h1>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <p className="text-slate-500">Loading bookmarks...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <p className="text-red-500">{error}</p>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Content */}
      {!loading && !error && (
        <>
          {/* Tabs */}
          <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg w-fit">
            <Button
              variant={activeTab === 'translations' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('translations')}
              className="text-sm"
            >
              Translations ({bookmarkedTranslations.length})
            </Button>
            <Button
              variant={activeTab === 'books' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('books')}
              className="text-sm"
            >
              Books ({bookmarkedBooks.length})
            </Button>
          </div>

          {/* Translations Tab */}
          {activeTab === 'translations' && (
            <div className="space-y-4">
              {hasTranslations ? (
                bookmarkedTranslations.map((translation) => (
                  <Card key={translation.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg text-slate-800">{translation.bookTitle}</CardTitle>
                          <p className="text-sm text-slate-600">by {translation.author}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            Bookmarked on {translation.bookmarkedAt}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-3 bg-slate-50 rounded-lg">
                          <h4 className="font-medium text-slate-700 mb-2">Original ({translation.sourceLanguage})</h4>
                          <p className="text-slate-900 text-sm">{translation.originalText}</p>
                        </div>
                        <div className="p-3 bg-teal-50 rounded-lg">
                          <h4 className="font-medium text-teal-700 mb-2">Translation ({translation.targetLanguage})</h4>
                          <p className="text-teal-900 text-sm">{translation.translatedText}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                        <div className="text-xs text-slate-500">
                          {translation.context} • by {translation.createdBy} • {translation.createdDate}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12">
                  <BookmarkIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">You haven't bookmarked any translations yet.</p>
                  <p className="text-sm text-slate-400 mt-2">
                    <Link to="/feed" className="text-teal-600 hover:text-teal-700">
                      Visit the feed
                    </Link> to discover and bookmark translations.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Books Tab */}
          {activeTab === 'books' && (
            <div className="space-y-4">
              {hasBooks ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {bookmarkedBooks.map((book) => (
                    <Link key={book.id} to={`/books/${book.id}`}>
                      <Card className="hover:shadow-md transition-shadow h-full">
                        <CardHeader>
                          <div className="w-full h-48 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
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
                          <CardTitle className="text-lg">{book.title}</CardTitle>
                          <p className="text-sm text-slate-600">by {book.author}</p>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <p className="text-sm text-slate-700 line-clamp-2">
                            {book.description}
                          </p>
                          <div className="text-xs text-slate-500">
                            Language: {book.language}
                          </div>
                          <div className="text-xs text-slate-500">
                            Bookmarked on {book.bookmarkedAt}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">You haven't bookmarked any books yet.</p>
                  <p className="text-sm text-slate-400 mt-2">
                    <Link to="/books" className="text-teal-600 hover:text-teal-700">
                      Browse books
                    </Link> to discover and bookmark your favorites.
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Bookmarks;
