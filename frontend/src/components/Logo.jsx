// Verity's mark: a hexagonal block with a check cut through it — one verified
// unit of content. Strokes use currentColor so it inherits the accent.
export default function Logo({ className = '' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 2.2 20.5 7v10L12 21.8 3.5 17V7z" opacity="0.45" />
      <path d="m8.2 12.1 2.7 2.7 5-5.4" />
    </svg>
  )
}
