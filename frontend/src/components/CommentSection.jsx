import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { commentService } from '@/lib/api';

function timeAgo(dateString) {
  const seconds = Math.floor((Date.now() - new Date(dateString)) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateString).toLocaleDateString();
}

const CommentSection = ({ translationId, onCountChange }) => {
  const { user, sessionToken } = useAuth();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const data = await commentService.getByTranslation(translationId);
        setComments(data);
      } catch (err) {
        console.error('Failed to fetch comments:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [translationId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || submitting) return;

    setSubmitting(true);
    try {
      const comment = await commentService.create({ translationId, text: text.trim() }, sessionToken);
      setComments(prev => [...prev, comment]);
      setText('');
      onCountChange?.(1);
    } catch (err) {
      console.error('Failed to create comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await commentService.delete(commentId, sessionToken);
      setComments(prev => prev.filter(c => c.id !== commentId));
      onCountChange?.(-1);
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  if (loading) {
    return <p className="text-xs text-slate-400 py-2">Loading comments...</p>;
  }

  return (
    <div className="mt-3 pt-3 border-t border-slate-200 space-y-3">
      {comments.length === 0 && (
        <p className="text-xs text-slate-400">No comments yet.</p>
      )}

      {comments.map(comment => (
        <div key={comment.id} className="flex items-start gap-2">
          {comment.user.avatar ? (
            <img src={comment.user.avatar} alt="" className="w-6 h-6 rounded-full mt-0.5" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-slate-200 mt-0.5" />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Link
                to={`/profile/${comment.user.id}`}
                className="text-xs font-medium text-teal-600 hover:underline"
              >
                {comment.user.name || 'Anonymous'}
              </Link>
              <span className="text-xs text-slate-400">{timeAgo(comment.createdAt)}</span>
              {user && user.id === comment.user.id && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="text-slate-400 hover:text-red-500 ml-auto"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
            <p className="text-sm text-slate-700 break-words">{comment.text}</p>
          </div>
        </div>
      ))}

      {user && (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a comment..."
            className="text-sm min-h-[2.5rem] h-10 resize-none flex-1"
            rows={1}
          />
          <Button type="submit" size="sm" disabled={!text.trim() || submitting}>
            Post
          </Button>
        </form>
      )}
    </div>
  );
};

export default CommentSection;
