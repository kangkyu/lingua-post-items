import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bookmark as BookmarkIcon } from 'lucide-react';
import { userService } from '@/lib/api';

const Bookmarks = () => {
  const { user, sessionToken } = useAuth();
  const [bookmarkedTranslations, setBookmarkedTranslations] = useState([]);
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-slate-900">My Bookmarks</h1>
      </div>

      {loading && (
        <div className="text-center py-12">
          <p className="text-slate-500">Loading bookmarks...</p>
        </div>
      )}

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

      {!loading && !error && (
        <div className="space-y-4">
          {hasTranslations ? (
            bookmarkedTranslations.map((translation) => (
              <Card key={translation.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      {translation.sourceName && (
                        <CardTitle className="text-lg text-slate-800">{translation.sourceName}</CardTitle>
                      )}
                      <p className="text-xs text-slate-500 mt-1">
                        Bookmarked on {new Date(translation.bookmarkedAt).toLocaleDateString()}
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
                      {translation.context} • by {translation.translator?.name || translation.createdBy || 'Anonymous'} • {new Date(translation.createdAt).toLocaleDateString()}
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
    </div>
  );
};

export default Bookmarks;
