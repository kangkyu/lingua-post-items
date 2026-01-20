import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { profileService } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User as UserIcon, Calendar, BookOpen, Bookmark } from 'lucide-react';

const Profile = () => {
  const { user, sessionToken } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!sessionToken) {
        setLoading(false);
        return;
      }

      try {
        const data = await profileService.getProfile(sessionToken);
        setProfileData(data);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [sessionToken]);

  if (!user) {
    return (
      <div className="text-center py-12">
        <UserIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-slate-700 mb-2">Sign in to View Profile</h2>
        <p className="text-slate-500">You need to be signed in to view your profile.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
        <p className="text-slate-500 mt-4">Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'today';
    if (diffInDays === 1) return 'yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  const stats = profileData?.stats || { translationsCount: 0, booksCount: 0, bookmarksCount: 0 };
  const recentTranslations = profileData?.recentTranslations || [];
  const createdAt = profileData?.user?.createdAt;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-6">
        <div className="w-20 h-20 bg-slate-700 text-white rounded-full flex items-center justify-center text-2xl font-bold">
          {user.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{user.name}</h1>
          <p className="text-slate-600">{user.email}</p>
          <div className="flex items-center text-sm text-slate-500 mt-1">
            <Calendar className="w-4 h-4 mr-1" />
            Joined {formatDate(createdAt)}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Translations Created</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-teal-600">{stats.translationsCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <BookOpen className="w-5 h-5 mr-2" />
              Books Created
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-500">{stats.booksCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Bookmark className="w-5 h-5 mr-2" />
              Bookmarks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-500">{stats.bookmarksCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Translations</CardTitle>
        </CardHeader>
        <CardContent>
          {recentTranslations.length === 0 ? (
            <p className="text-slate-500 text-center py-4">No translations yet</p>
          ) : (
            <div className="space-y-4">
              {recentTranslations.map((translation) => (
                <div key={translation.id} className="border-b border-slate-200 pb-4 last:border-b-0">
                  <p className="font-medium text-slate-800">
                    "{translation.originalText}" → "{translation.translatedText}"
                  </p>
                  <p className="text-sm text-slate-600">
                    from {translation.book?.title || 'Unknown book'} • {formatRelativeTime(translation.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;