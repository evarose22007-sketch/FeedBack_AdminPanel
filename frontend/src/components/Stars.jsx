//Display for stars (1-5) //
export default function Stars({ value = 0, size = 16 }) {
  return (
    <span className="stars" role="img" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const fill = Math.max(0, Math.min(1, value - (n - 1)));
        return (
          <svg key={n} width={size} height={size} viewBox="0 0 20 20" aria-hidden="true">
            <defs>
              <linearGradient id={`star-${n}-${Math.round(fill * 100)}`}>
                <stop offset={`${fill * 100}%`} stopColor="var(--star)" />
                <stop offset={`${fill * 100}%`} stopColor="var(--star-empty)" />
              </linearGradient>
            </defs>
            <path
              d="M10 1.8l2.5 5.2 5.6.8-4.1 3.9 1 5.6L10 14.6l-5 2.7 1-5.6-4.1-3.9 5.6-.8z"
              fill={`url(#star-${n}-${Math.round(fill * 100)})`}
            />
          </svg>
        );
      })}
    </span>
  );
}
