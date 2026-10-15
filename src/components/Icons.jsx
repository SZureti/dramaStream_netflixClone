import { useId } from 'react';

/* Inline SVG icons. All are decorative (aria-hidden); controls carry their own labels. */

function Svg({ children, size = 24, ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const PlayIcon = (p) => (
  <Svg {...p} stroke="none" fill="currentColor">
    <path d="M7 4.5v15a1 1 0 0 0 1.52.85l12-7.5a1 1 0 0 0 0-1.7l-12-7.5A1 1 0 0 0 7 4.5z" />
  </Svg>
);

export const PauseIcon = (p) => (
  <Svg {...p} stroke="none" fill="currentColor">
    <rect x="5.5" y="4" width="4.5" height="16" rx="1" />
    <rect x="14" y="4" width="4.5" height="16" rx="1" />
  </Svg>
);

export const PlusIcon = (p) => (
  <Svg {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);

export const CheckIcon = (p) => (
  <Svg {...p}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </Svg>
);

export const InfoIcon = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9.5" />
    <path d="M12 11v6M12 7.5v.01" />
  </Svg>
);

export const ChevronLeftIcon = (p) => (
  <Svg {...p}>
    <path d="M15 18l-6-6 6-6" />
  </Svg>
);

export const ChevronRightIcon = (p) => (
  <Svg {...p}>
    <path d="M9 18l6-6-6-6" />
  </Svg>
);

export const ChevronDownIcon = (p) => (
  <Svg {...p}>
    <path d="M6 9l6 6 6-6" />
  </Svg>
);

export const ArrowLeftIcon = (p) => (
  <Svg {...p}>
    <path d="M19 12H5M11 18l-6-6 6-6" />
  </Svg>
);

export const SearchIcon = (p) => (
  <Svg {...p}>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="M20 20l-4.8-4.8" />
  </Svg>
);

export const CloseIcon = (p) => (
  <Svg {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Svg>
);

export const HomeIcon = (p) => (
  <Svg {...p}>
    <path d="M3.5 10.5L12 3.5l8.5 7V20a1 1 0 0 1-1 1H15v-6.5H9V21H4.5a1 1 0 0 1-1-1z" />
  </Svg>
);

export const ListIcon = (p) => (
  <Svg {...p}>
    <path d="M4 6h11M4 12h11M4 18h7M18 15v6M15 18h6" />
  </Svg>
);

export const Back10Icon = (p) => (
  <Svg {...p}>
    <path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3" />
    <path d="M4 3.5v4h4" />
    <text x="12" y="15.5" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="currentColor" stroke="none" fontFamily="inherit">
      10
    </text>
  </Svg>
);

export const Forward10Icon = (p) => (
  <Svg {...p}>
    <path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3" />
    <path d="M20 3.5v4h-4" />
    <text x="12" y="15.5" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="currentColor" stroke="none" fontFamily="inherit">
      10
    </text>
  </Svg>
);

export const ReplayIcon = (p) => (
  <Svg {...p}>
    <path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3" />
    <path d="M4 3.5v4h4" />
  </Svg>
);

export const FilmIcon = (p) => (
  <Svg {...p}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4" />
  </Svg>
);

export const TvIcon = (p) => (
  <Svg {...p}>
    <rect x="2.5" y="5" width="19" height="13" rx="2" />
    <path d="M8 21h8M12 18v3" />
  </Svg>
);

export const DocIcon = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 8.5v7l6-3.5z" fill="currentColor" stroke="none" />
  </Svg>
);

const STAR_PATH = 'M12 2.8l2.84 5.76 6.36.92-4.6 4.49 1.09 6.33L12 17.31l-5.69 2.99 1.09-6.33-4.6-4.49 6.36-.92z';

export const StarIcon = ({ filled = false, half = false, ...p }) => {
  const id = `half${useId().replace(/:/g, '')}`;
  return (
    <Svg {...p} strokeWidth="1.6">
      {half && (
        <defs>
          <linearGradient id={id}>
            <stop offset="50%" stopColor="currentColor" />
            <stop offset="50%" stopColor="transparent" />
          </linearGradient>
        </defs>
      )}
      <path d={STAR_PATH} fill={half ? `url(#${id})` : filled ? 'currentColor' : 'none'} />
    </Svg>
  );
};

export const ShareIcon = (p) => (
  <Svg {...p}>
    <path d="M12 15V3.5M7.5 8L12 3.5 16.5 8" />
    <path d="M5 12.5V19a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 19v-6.5" />
  </Svg>
);

export const LinkIcon = (p) => (
  <Svg {...p}>
    <path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1" />
    <path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1" />
  </Svg>
);

export const MailIcon = (p) => (
  <Svg {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3.5 6.5L12 13l8.5-6.5" />
  </Svg>
);

export const TrashIcon = (p) => (
  <Svg {...p}>
    <path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13" />
  </Svg>
);

export const ThumbUpIcon = (p) => (
  <Svg {...p}>
    <path d="M7 10v11H4V10h3zM7 10l4-7c1.4 0 2.3 1.1 2 2.5L12.3 9H19a2 2 0 0 1 2 2.3l-1.2 7.6A2.5 2.5 0 0 1 17.3 21H7" />
  </Svg>
);

export const ThumbDownIcon = (p) => (
  <Svg {...p}>
    <path d="M17 14V3h3v11h-3zM17 14l-4 7c-1.4 0-2.3-1.1-2-2.5l.7-3.5H5a2 2 0 0 1-2-2.3l1.2-7.6A2.5 2.5 0 0 1 6.7 3H17" />
  </Svg>
);

export const DoubleThumbIcon = (p) => (
  <Svg {...p}>
    <path d="M5 11v10H2.5V11H5zM5 11l3.4-6c1.2 0 2 1 1.7 2.2L9.5 10H15a1.8 1.8 0 0 1 1.8 2l-1 6.6A2.2 2.2 0 0 1 13.6 21H5" />
    <path d="M12.2 7.4 14 4c1.2 0 2 1 1.7 2.2L15.1 9h4.7a1.8 1.8 0 0 1 1.8 2l-1 6.6a2.2 2.2 0 0 1-1.6 1.8" />
  </Svg>
);

export const VolumeIcon = (p) => (
  <Svg {...p}>
    <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" />
    <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" />
  </Svg>
);

export const MuteIcon = (p) => (
  <Svg {...p}>
    <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" />
    <path d="M16 9.5l5 5M21 9.5l-5 5" />
  </Svg>
);

export const FullscreenIcon = (p) => (
  <Svg {...p}>
    <path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5" />
  </Svg>
);

export const ExitFullscreenIcon = (p) => (
  <Svg {...p}>
    <path d="M9 4v5H4M20 9h-5V4M15 20v-5h5M4 15h5v5" />
  </Svg>
);

export const NextEpisodeIcon = (p) => (
  <Svg {...p}>
    <path d="M5 5l10 7-10 7z" />
    <path d="M19 5v14" />
  </Svg>
);
