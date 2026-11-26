/**
 * Text that flips to a second copy on hover of its parent `group`.
 * Used for animated link labels.
 */
export default function FlipText({ children, className = "" }) {
  return (
    <span
      className={`relative inline-block h-[1.4em] overflow-hidden align-middle leading-[1.4] ${className}`}
    >
      <span className="block transition-transform duration-300 ease-[var(--ease-premium)] motion-reduce:transition-none group-hover:-translate-y-full">
        {children}
      </span>
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-full block text-primary transition-transform duration-300 ease-[var(--ease-premium)] motion-reduce:transition-none group-hover:-translate-y-full"
      >
        {children}
      </span>
    </span>
  );
}
