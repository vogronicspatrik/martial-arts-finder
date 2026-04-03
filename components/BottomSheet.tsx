import { useRef, useState, ReactNode } from 'react';

const COLLAPSED_HEIGHT = 200;
const EXPANDED_VH = 0.72;

interface BottomSheetProps {
  gymCount: number;
  totalCount: number;
  children: ReactNode;
}

export default function BottomSheet({ gymCount, totalCount, children }: BottomSheetProps) {
  const [expanded, setExpanded] = useState(false);
  const touchStartY = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const delta = touchStartY.current - e.changedTouches[0].clientY;
    if (delta > 40) setExpanded(true);
    else if (delta < -40) setExpanded(false);
  };

  const height = expanded
    ? Math.floor(window.innerHeight * EXPANDED_VH)
    : COLLAPSED_HEIGHT;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-30 flex flex-col"
      style={{
        height,
        transition: 'height 0.3s cubic-bezier(0.4,0,0.2,1)',
        background: '#141414',
        borderTop: '1px solid #2A2A2A',
        borderRadius: '20px 20px 0 0',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.8)',
      }}
    >
      {/* Drag handle */}
      <div
        className="flex flex-col items-center pt-3 pb-2 shrink-0 cursor-pointer select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="w-8 h-1 rounded-full mb-2" style={{ background: '#2A2A2A' }} />
        <div className="flex items-center gap-2">
          <p className="font-display text-xs font-semibold uppercase tracking-widest text-ink-400">
            {gymCount === totalCount ? `${totalCount} gyms` : `${gymCount} / ${totalCount} gyms`}
          </p>
          <span className="text-xs" style={{ color: '#C96A3D' }}>
            {expanded ? '▼' : '▲'}
          </span>
        </div>
      </div>

      {/* Scrollable list */}
      <div className="overflow-y-auto flex-1 pb-6">
        {children}
      </div>
    </div>
  );
}
