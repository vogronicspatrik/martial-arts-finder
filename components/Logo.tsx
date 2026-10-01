// Stands in for the real HUN wannaBunyó logo until the final artwork file
// is supplied — swap this one component (e.g. for an <img src="/logo.png">)
// once it exists, instead of hunting through every page that shows the brand mark.
export default function Logo({ className }: { className?: string }) {
  return (
    <span className={className} role="img" aria-label="HUN wannaBunyó">
      🥋
    </span>
  );
}
