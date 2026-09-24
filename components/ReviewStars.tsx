interface ReviewStarsProps {
  value: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (v: number) => void;
}

const SIZE_CLASS = { sm: 'text-sm', md: 'text-lg', lg: 'text-2xl' };

export default function ReviewStars({ value, size = 'md', interactive = false, onChange }: ReviewStarsProps) {
  const rounded = Math.round(value);

  return (
    <div className={`flex items-center gap-0.5 ${SIZE_CLASS[size]}`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= rounded;
        const star = (
          <span
            key={n}
            style={{ color: filled ? '#F2B632' : '#3A3733' }}
            className={interactive ? 'cursor-pointer transition-transform hover:scale-110' : undefined}
          >
            {filled ? '★' : '☆'}
          </span>
        );
        if (!interactive) return star;
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange?.(n)}
            className="leading-none"
            aria-label={`${n} star`}
          >
            {star}
          </button>
        );
      })}
    </div>
  );
}
