/** The site's arrow (the Back to home pill's, turned either way), for the
 *  Archive carousel and its larger view. */
export default function Arrow({ dir }: { dir: -1 | 1 }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d={dir === 1 ? "M5 12h14M12.5 5.5 19 12l-6.5 6.5" : "M19 12H5M11.5 5.5 5 12l6.5 6.5"}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
