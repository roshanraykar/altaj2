import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, X } from 'lucide-react';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ReviewPopup = ({ isOpen, onClose, order, token, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const maxChars = 500;

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({ title: 'Please select a rating', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(
        `${API}/reviews`,
        {
          order_id: order.id,
          star_rating: rating,
          review_text: reviewText.trim() || null
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast({ title: 'Thank you for your feedback!', description: 'Your review has been submitted.' });
      onReviewSubmitted(order.id);
      onClose();
    } catch (error) {
      toast({ 
        title: 'Failed to submit review', 
        description: error.response?.data?.detail || 'Please try again',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleMaybeLater = () => {
    // Increment dismiss counter in localStorage
    const dismissKey = `review_dismiss_${order.id}`;
    const currentCount = parseInt(localStorage.getItem(dismissKey) || '0');
    localStorage.setItem(dismissKey, (currentCount + 1).toString());
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" data-testid="review-popup">
        <DialogHeader>
          <DialogTitle className="text-xl">How was your order?</DialogTitle>
          <DialogDescription>
            Order #{order?.order_number}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Star Rating */}
          <div className="flex justify-center gap-2 mb-6">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="transition-transform hover:scale-110"
                data-testid={`star-${star}`}
              >
                <Star
                  className={`h-10 w-10 ${
                    star <= (hoverRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Rating Label */}
          <p className="text-center text-sm text-gray-600 mb-4">
            {rating === 0 && 'Tap a star to rate'}
            {rating === 1 && 'Poor'}
            {rating === 2 && 'Fair'}
            {rating === 3 && 'Good'}
            {rating === 4 && 'Very Good'}
            {rating === 5 && 'Excellent!'}
          </p>

          {/* Review Text */}
          <div className="space-y-2">
            <Textarea
              placeholder="Tell us about your experience... (optional)"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value.slice(0, maxChars))}
              rows={4}
              className="resize-none"
              data-testid="review-text"
            />
            <p className="text-xs text-gray-500 text-right">
              {reviewText.length}/{maxChars}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={handleMaybeLater}
              className="flex-1"
              data-testid="maybe-later-btn"
            >
              Maybe Later
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={rating === 0 || submitting}
              className="flex-1 bg-red-600 hover:bg-red-700"
              data-testid="submit-review-btn"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Inline Review Card for Order History
export const OrderReviewCard = ({ order, token, onReviewSubmitted }) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isReviewed, setIsReviewed] = useState(order.isReviewed || false);
  const [existingRating, setExistingRating] = useState(order.existingRating || 0);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (rating === 0) return;
    
    setSubmitting(true);
    try {
      await axios.post(
        `${API}/reviews`,
        {
          order_id: order.id,
          star_rating: rating,
          review_text: reviewText.trim() || null
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast({ title: 'Thank you for your feedback!' });
      setIsReviewed(true);
      setExistingRating(rating);
      setShowReviewForm(false);
      if (onReviewSubmitted) onReviewSubmitted(order.id);
    } catch (error) {
      toast({ 
        title: 'Failed to submit', 
        description: error.response?.data?.detail || 'Please try again',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (isReviewed) {
    return (
      <div className="flex items-center gap-2 mt-2 text-sm text-green-600" data-testid={`reviewed-${order.id}`}>
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-4 w-4 ${star <= existingRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
            />
          ))}
        </div>
        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-medium">Reviewed</span>
      </div>
    );
  }

  if (showReviewForm) {
    return (
      <div className="mt-3 p-3 bg-gray-50 rounded-lg" data-testid={`review-form-${order.id}`}>
        <div className="flex justify-center gap-1 mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className="transition-transform hover:scale-110"
            >
              <Star className={`h-6 w-6 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
            </button>
          ))}
        </div>
        <Textarea
          placeholder="Share your experience... (optional)"
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value.slice(0, 500))}
          rows={2}
          className="resize-none text-sm mb-2"
        />
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setShowReviewForm(false)}>Cancel</Button>
          <Button 
            size="sm" 
            onClick={handleSubmit} 
            disabled={rating === 0 || submitting}
            className="bg-red-600 hover:bg-red-700"
          >
            {submitting ? '...' : 'Submit'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setShowReviewForm(true)}
      className="mt-2 text-red-600 border-red-300 hover:bg-red-50"
      data-testid={`rate-order-${order.id}`}
    >
      <Star className="h-4 w-4 mr-1" /> Rate This Order
    </Button>
  );
};

export default ReviewPopup;
