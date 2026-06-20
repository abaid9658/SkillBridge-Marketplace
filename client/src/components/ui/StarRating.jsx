import React from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ rating = 0, onRatingChange, size = 18, max = 5, readOnly = true }) => {
  const [hoverRating, setHoverRating] = React.useState(0);

  const handleClick = (value) => {
    if (!readOnly && onRatingChange) {
      onRatingChange(value);
    }
  };

  const handleMouseEnter = (value) => {
    if (!readOnly) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (!readOnly) {
      setHoverRating(0);
    }
  };

  const currentRating = hoverRating || rating;

  return (
    <div style={{ display: 'inline-flex', gap: '4px' }}>
      {[...Array(max)].map((_, index) => {
        const starValue = index + 1;
        const filled = starValue <= currentRating;

        return (
          <span
            key={index}
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => handleMouseEnter(starValue)}
            onMouseLeave={handleMouseLeave}
            style={{
              cursor: readOnly ? 'default' : 'pointer',
              transition: 'transform 0.15s ease',
              display: 'flex',
            }}
            className={!readOnly ? 'hover:scale-110' : ''}
          >
            <Star
              size={size}
              fill={filled ? '#f59e0b' : 'transparent'}
              color={filled ? '#f59e0b' : '#94a3b8'}
            />
          </span>
        );
      })}
    </div>
  );
};

export default StarRating;
