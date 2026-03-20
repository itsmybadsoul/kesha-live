// Inline USDT icon – no external dependency, never breaks
export function UsdtIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="USDT"
    >
      <circle cx="16" cy="16" r="16" fill="#26A17B" />
      <path
        d="M17.922 17.383v-.002c-.112.008-.687.043-1.972.043-1.024 0-1.745-.03-1.998-.043v.003c-3.888-.171-6.79-.848-6.79-1.658 0-.809 2.902-1.486 6.79-1.66v2.644c.256.018.982.061 2.014.061 1.223 0 1.838-.05 1.956-.061v-2.643c3.88.173 6.775.85 6.775 1.659 0 .81-2.895 1.485-6.775 1.657Zm0-3.59v-2.366h5.414V8h-14.67v3.427h5.414v2.365c-4.4.202-7.71 1.074-7.71 2.124 0 1.051 3.31 1.921 7.71 2.123v7.594h2.842V18.04c4.392-.201 7.695-1.072 7.695-2.123 0-1.05-3.303-1.92-7.695-2.124Z"
        fill="white"
      />
    </svg>
  );
}
