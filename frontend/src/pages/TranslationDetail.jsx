import React, { useState, useEffect } from 'react';
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bookmark, Edit, ChevronLeft } from 'lucide-react';
import { translationService, bookmarkService } from '@/lib/api';
import CommentSection from '@/components/CommentSection';

const TranslationDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, sessionToken } = useAuth();

  const [translation, setTranslation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookmarkId, setBookmarkId] = useState(null);

  // Set by the reading view so "back" returns to the book being read.
  const backTo = location.state?.from || '/feed';
  const backLabel = location.state?.from ? '책으로 돌아가기' : 'Back to feed';

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        setTranslation(await translationService.getTranslationById(id));
      } catch (err) {
        console.error('Failed to fetch translation:', err);
        setError('This translation could not be loaded.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    const checkBookmark = async () => {
      if (!user || !sessionToken) {
        setBookmarkId(null);
        return;
      }
      try {
        const result = await bookmarkService.checkTranslationBookmark(id, sessionToken);
        setBookmarkId(result.isBookmarked ? result.bookmark.id : null);
      } catch (err) {
        console.error('Failed to check bookmark:', err);
      }
    };
    checkBookmark();
  }, [id, user, sessionToken]);

  const handleBookmarkToggle = async () => {
    if (!user || !sessionToken) return;
    try {
      if (bookmarkId) {
        await bookmarkService.deleteBookmark(bookmarkId, sessionToken);
        setBookmarkId(null);
      } else {
        const bookmark = await bookmarkService.createBookmark(
          { translationId: parseInt(id, 10) },
          sessionToken
        );
        setBookmarkId(bookmark.id);
      }
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
    }
  };

  if (loading) {
    return <p className="text-center text-slate-500 py-12">Loading…</p>;
  }

  if (error || !translation) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">{error || 'Translation not found.'}</p>
        <Link to="/feed" className="text-teal-600 hover:underline text-sm mt-4 inline-block">
          Back to feed
        </Link>
      </div>
    );
  }

  const locationParts = [
    translation.chapter,
    translation.pageNumber != null ? `p. ${translation.pageNumber}` : null,
  ].filter(Boolean);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        to={backTo}
        className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        {backLabel}
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {translation.sourceName || 'Untitled source'}
        </h1>
        {locationParts.length > 0 && (
          <p className="text-sm text-slate-500 mt-1">{locationParts.join(' · ')}</p>
        )}
        {translation.context && (
          <p className="text-sm text-slate-600 mt-2">{translation.context}</p>
        )}
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="p-4 bg-slate-50 rounded-lg">
            <h2 className="font-medium text-slate-700 mb-2">
              Original ({translation.sourceLanguage})
            </h2>
            <p className="text-slate-900 leading-relaxed">{translation.originalText}</p>
          </div>

          <div className="p-4 bg-teal-50 rounded-lg">
            <h2 className="font-medium text-teal-700 mb-2">{translation.targetLanguage}</h2>
            <p className="font-reader text-teal-900 text-[1.1rem] leading-[1.9] break-keep">
              {translation.translatedText}
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200">
            <p className="text-xs text-slate-500">
              by{' '}
              <Link
                to={`/profile/${translation.translatorId}`}
                className="text-teal-600 hover:underline"
              >
                {translation.createdBy}
              </Link>{' '}
              • {translation.createdDate}
            </p>
            <div className="flex items-center gap-1">
              {user && (
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-7 px-2 ${
                    bookmarkId
                      ? 'text-yellow-500 hover:text-yellow-600'
                      : 'text-slate-600 hover:text-yellow-600'
                  }`}
                  onClick={handleBookmarkToggle}
                >
                  <Bookmark className="w-4 h-4" fill={bookmarkId ? 'currentColor' : 'none'} />
                </Button>
              )}
              {user && user.id === translation.translatorId && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-600 hover:text-teal-600 h-7 px-2"
                  onClick={() => navigate(`/share?edit=${translation.id}`)}
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <CommentSection translationId={translation.id} />
    </div>
  );
};

export default TranslationDetail;
