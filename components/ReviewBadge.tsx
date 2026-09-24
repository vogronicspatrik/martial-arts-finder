import { useLanguage } from '../lib/i18n';
import { GymRatingStats } from '../hooks/useReviews';

interface ReviewBadgeProps {
  stats?: GymRatingStats;
  onClick: () => void;
  className?: string;
}

export default function ReviewBadge({ stats, onClick, className }: ReviewBadgeProps) {
  const { t } = useLanguage();

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`text-xs font-medium transition-colors ${className ?? ''}`}
      style={{ color: stats ? '#F2B632' : '#8A8480' }}
    >
      {stats ? `★ ${t.reviews.ratingSummary(stats.average, stats.count)}` : t.reviews.seeReviews(0)}
    </button>
  );
}
