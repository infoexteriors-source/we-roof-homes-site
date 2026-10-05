"use client";
import type { CSSProperties } from "react";
export function RoofArt({
  prefix = "roof",
  interactive = false,
  onSelect,
  active = 0,
}: {
  prefix?: string;
  interactive?: boolean;
  onSelect?: (i: number) => void;
  active?: number;
}) {
  const layer = (n: number) => ({
    style: { "--layer": n } as CSSProperties,
    className: `roof-layer layer-${n}`,
  });
  return (
    <svg
      className="roof-art"
      viewBox="0 -25 800 810"
      role={onSelect ? "group" : "img"}
      aria-labelledby={`${prefix}-title ${prefix}-desc`}
    >
      <title id={`${prefix}-title`}>Exploded roofing system illustration</title>
      <desc id={`${prefix}-desc`}>
        A three-quarter roof cutaway showing timber framing, pink attic
        insulation, wood decking, a water barrier, underlayment, starter
        shingles, field shingles, ventilation and ridge caps.
      </desc>
      <defs>
        <pattern
          id={`${prefix}-wood`}
          width="32"
          height="18"
          patternUnits="userSpaceOnUse"
        >
          <rect width="32" height="18" fill="#cf944d" />
          <path
            d="M0 3Q16 9 32 4M0 13Q19 7 32 14"
            fill="none"
            stroke="#b97e3f"
            strokeWidth="1"
          />
        </pattern>
        <pattern
          id={`${prefix}-shingle`}
          width="52"
          height="24"
          patternUnits="userSpaceOnUse"
        >
          <rect width="52" height="24" fill="#414443" />
          <path
            d="M0 0H52M0 12H52M26 0V12M0 12V24M52 12V24"
            fill="none"
            stroke="#222524"
            strokeWidth="2"
          />
          <path
            d="M3 4H22M29 6H48M5 18H20M29 17H46"
            stroke="#636660"
            strokeWidth="1.5"
          />
        </pattern>
        <pattern
          id={`${prefix}-membrane`}
          width="30"
          height="30"
          patternUnits="userSpaceOnUse"
        >
          <rect width="30" height="30" fill="#c2c5bd" />
          <path d="M0 0H30V30" fill="none" stroke="#a6aba1" />
          <path d="M5 15H25" stroke="#a53832" strokeWidth="2" />
        </pattern>
        <pattern
          id={`${prefix}-insulation`}
          width="30"
          height="16"
          patternUnits="userSpaceOnUse"
        >
          <rect width="30" height="16" fill="#e9a1b0" />
          <path
            d="M0 4Q9 0 16 6T30 4M0 12Q9 7 17 12T30 12"
            stroke="#d7889a"
            fill="none"
          />
        </pattern>
        <filter
          id={`${prefix}-shadow`}
          x="-30%"
          y="-30%"
          width="160%"
          height="180%"
        >
          <feDropShadow
            dx="0"
            dy="13"
            stdDeviation="12"
            floodColor="#313329"
            floodOpacity=".18"
          />
        </filter>
      </defs>
      <ellipse cx="425" cy="634" rx="290" ry="31" fill="#dbddd5" opacity=".6" />
      <g {...layer(0)}>
        <path
          d="M158 528L421 465L684 546L419 622Z"
          fill={`url(#${prefix}-insulation)`}
        />
        <path d="M158 528V548L419 643V622Z" fill="#c77e90" />
        <path d="M419 622L684 546V566L419 643Z" fill="#d58c9d" />
        {Array.from({ length: 11 }, (_, i) => (
          <path
            key={i}
            d={`M${178 + i * 23} ${535 + i * 8}L${441 + i * 23} ${472 + i * 7}`}
            stroke="#f1b6c3"
            strokeWidth="2"
          />
        ))}
      </g>
      <g {...layer(1)} filter={`url(#${prefix}-shadow)`}>
        <path d="M133 522L400 435L722 524L438 613Z" fill="#b67d3c" />
        <path d="M133 510L400 426L722 513L438 601Z" fill="#e5b66b" />
        {Array.from({ length: 8 }, (_, i) => {
          const x = 154 + i * 34,
            y = 505 - i * 10;
          return (
            <g key={i}>
              <path
                d={`M${x} ${y}L${x + 172} ${y - 197}L${x + 321} ${y + 77}`}
                fill="none"
                stroke="#9b622c"
                strokeWidth="17"
                strokeLinejoin="miter"
              />
              <path
                d={`M${x - 2} ${y - 4}L${x + 170} ${y - 201}L${x + 319} ${y + 73}`}
                fill="none"
                stroke="#e5b767"
                strokeWidth="10"
              />
              <path
                d={`M${x + 37} ${y + 9}L${x + 237} ${y + 59}M${x + 170} ${y - 192}L${x + 171} ${y + 39}`}
                stroke="#d4a257"
                strokeWidth="9"
              />
            </g>
          );
        })}
        <path d="M307 308L548 237" stroke="#f1c77f" strokeWidth="17" />
        <path
          d="M140 507L389 433M457 588L715 511"
          stroke="#eec57c"
          strokeWidth="14"
        />
      </g>
      <g {...layer(2)} filter={`url(#${prefix}-shadow)`}>
        <path
          d="M118 489L326 285L567 210L369 423Z"
          fill={`url(#${prefix}-wood)`}
          stroke="#e7b16c"
          strokeWidth="3"
        />
        <path
          d="M369 423L567 210L723 447L471 529Z"
          fill="#a46f34"
          stroke="#d39a50"
          strokeWidth="3"
        />
        <path
          d="M118 489L369 423L471 529L461 537L365 435L118 501Z"
          fill="#ae7539"
        />
        {[0, 1, 2, 3].map((i) => (
          <path
            key={i}
            d={`M${166 + i * 44} ${441 - i * 43}L${410 + i * 43} ${366 - i * 43}`}
            stroke="#ab793d"
            strokeWidth="2"
          />
        ))}
      </g>
      <g {...layer(3)}>
        <path d="M109 477L164 420L410 350L363 408Z" fill="#262b2a" />
        <path
          d="M363 408L410 350L467 430L717 436L727 451L470 533Z"
          fill="#343a37"
        />
        <path d="M128 475L365 410" stroke="#727e6d" strokeWidth="2" />
      </g>
      <g {...layer(4)} filter={`url(#${prefix}-shadow)`}>
        <path
          d="M103 474L321 263L568 192L362 406Z"
          fill={`url(#${prefix}-membrane)`}
        />
        <path d="M362 406L568 192L732 435L470 519Z" fill="#82897e" />
        <path
          d="M122 461L369 391M165 419L409 349M213 370L451 306"
          stroke="#e5e5de"
          strokeWidth="4"
          opacity=".8"
        />
      </g>
      <g {...layer(5)}>
        <path d="M93 468L114 445L365 375L348 399Z" fill="#282c29" />
        <path
          d="M348 399L372 381L475 490L741 413L748 427L470 511Z"
          fill="#414540"
        />
        <path d="M94 469L348 400" stroke="#697163" strokeWidth="3" />
      </g>
      <g {...layer(6)} filter={`url(#${prefix}-shadow)`}>
        <path
          d="M92 454L316 237L571 161L350 383Z"
          fill={`url(#${prefix}-shingle)`}
          stroke="#626660"
          strokeWidth="2"
        />
        <path
          d="M350 383L571 161L745 410L476 491Z"
          fill={`url(#${prefix}-shingle)`}
          stroke="#252b28"
          strokeWidth="2"
        />
        <path d="M92 454L350 383L476 491V501L347 393L92 464Z" fill="#292f2c" />
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <path
            key={i}
            d={`M${117 + i * 28} ${431 - i * 27}L${374 + i * 28} ${359 - i * 28}`}
            stroke="#777a73"
            opacity=".35"
          />
        ))}
      </g>
      <g {...layer(7)}>
        <path d="M300 229L566 149L579 157L310 240Z" fill="#1e2523" />
        {Array.from({ length: 29 }, (_, i) => (
          <path
            key={i}
            d={`M${310 + i * 9} ${232 - i * 2.75}l0 8`}
            stroke="#848c80"
            strokeWidth="3"
          />
        ))}
        <path d="M300 226L566 146L578 153L310 235Z" fill="#565e55" />
      </g>
      <g {...layer(8)} filter={`url(#${prefix}-shadow)`}>
        <path
          d="M290 210L562 128L582 143L310 226Z"
          fill={`url(#${prefix}-shingle)`}
        />
        <path d="M310 226L582 143L582 151L310 234Z" fill="#262c29" />
        <path d="M290 210L562 128L566 123L293 204Z" fill="#777c72" />
        {Array.from({ length: 10 }, (_, i) => (
          <path
            key={i}
            d={`M${306 + i * 27} ${205 - i * 8.1}l18 14`}
            stroke="#1d2420"
            strokeWidth="2"
          />
        ))}
      </g>
      {interactive && (
        <g
          className="roof-guide"
          fill="none"
          stroke="#849084"
          strokeWidth="1"
          strokeDasharray="3 5"
        >
          <path d="M310 280L310 99M580 221L580 78M103 487L103 379" />
        </g>
      )}
      {[
        [2, 140, 485, 67, 489],
        [0, 235, 580, 67, 603],
        [3, 172, 428, 79, 443],
        [4, 215, 365, 86, 377],
        [5, 115, 453, 66, 450],
        [6, 250, 311, 90, 305],
        [7, 391, 204, 690, 157],
        [8, 467, 159, 701, 114],
      ].map(([n, x, y, mx, my], i) => (
        <g
          key={i}
          {...layer(n)}
          className={`roof-layer roof-marker layer-${n}`}
          role={onSelect ? "button" : undefined}
          tabIndex={onSelect ? 0 : undefined}
          aria-label={`${i + 1}. ${["Framing and decking", "Attic insulation", "Water barrier", "Underlayment", "Starter shingles", "Field shingles", "Ventilation", "Ridge caps"][i]}`}
          aria-pressed={onSelect ? active === i : undefined}
          onClick={() => onSelect?.(i)}
          onKeyDown={(e) => {
            if (onSelect && (e.key === "Enter" || e.key === " ")) {
              e.preventDefault();
              onSelect(i);
            }
          }}
        >
          <path
            d={`M${x} ${y}L${mx + 27} ${my}H${mx}`}
            fill="none"
            stroke="#939d8c"
            strokeWidth="1.2"
          />
          <circle
            cx={x}
            cy={y}
            r="4"
            fill="#d72027"
            stroke="#fafaf7"
            strokeWidth="2"
          />
          <circle
            cx={mx}
            cy={my}
            r="14"
            fill={active === i ? "#ad111a" : "#d72027"}
            stroke="#fafaf7"
            strokeWidth="3"
          />
          <text
            x={mx}
            y={my + 4}
            textAnchor="middle"
            fill="#fff"
            fontFamily="Arial,sans-serif"
            fontSize="12"
            fontWeight="700"
          >
            {i + 1}
          </text>
        </g>
      ))}
    </svg>
  );
}
