import React, { useMemo } from "react";
import Flags from "country-flag-icons/react/3x2";
import { countries, hasFlag } from "country-flag-icons";
import { Tooltip } from "../Tooltip/Tooltip";
import styles from "./Flag.module.css";

const regionNames =
  typeof Intl !== "undefined" && Intl.DisplayNames
    ? new Intl.DisplayNames(["en"], { type: "region" })
    : null;

const ALIASES = {
  usa: "US",
  us: "US",
  america: "US",
  uk: "GB",
  england: "GB",
  britain: "GB",
  "great britain": "GB",
  "united kingdom": "GB",
  korea: "KR",
  "south korea": "KR",
  "korea, republic of": "KR",
  "republic of korea": "KR",
  "north korea": "KP",
  "korea, democratic people's republic of": "KP",
  russia: "RU",
  vietnam: "VN",
  taiwan: "TW",
  iran: "IR",
  syria: "SY",
  bolivia: "BO",
  venezuela: "VE",
  laos: "LA",
  moldova: "MD",
  tanzania: "TZ",
  brunei: "BN",
  "czech republic": "CZ",
  czechia: "CZ",
  "ivory coast": "CI",
  "cote d'ivoire": "CI",
  "cape verde": "CV",
  "east timor": "TL",
  "timor leste": "TL",
  swaziland: "SZ",
  macedonia: "MK",
  palestine: "PS",
  vatican: "VA",
  "holy see": "VA",
};

const nameToCode = (() => {
  const map = {};
  if (regionNames && Array.isArray(countries)) {
    for (const code of countries) {
      try {
        const name = regionNames.of(code);
        if (name) map[name.toLowerCase()] = code;
      } catch {}
    }
  }
  Object.assign(map, ALIASES);
  return map;
})();

export const resolveCountryCode = (input) => {
  if (!input) return null;
  const trimmed = String(input).trim();
  if (!trimmed) return null;
  if (/^[a-zA-Z]{2}$/.test(trimmed)) {
    const code = trimmed.toUpperCase();
    return hasFlag(code) ? code : null;
  }
  return nameToCode[trimmed.toLowerCase()] || null;
};

export const getCountryName = (input) => {
  const code = resolveCountryCode(input);
  if (!code) return null;
  try {
    return regionNames?.of(code) || code;
  } catch {
    return code;
  }
};

const Flag = ({
  country,
  size = 20,
  className = "",
  showTooltip = true,
  tooltipPosition = "top",
  rounded = true,
  style: styleProp,
}) => {
  const code = useMemo(() => resolveCountryCode(country), [country]);
  if (!code) return null;
  const Component = Flags[code];
  if (!Component) return null;

  const width = typeof size === "number" ? `${size}px` : size;
  const name = getCountryName(code) || code;

  const flagEl = (
    <Component
      className={`${styles.flag} ${className}`}
      style={{
        width,
        borderRadius: rounded ? "2px" : 0,
        ...styleProp,
      }}
    />
  );

  if (!showTooltip) return flagEl;

  return (
    <Tooltip text={name} position={tooltipPosition} className={styles.flagTooltip}>
      {flagEl}
    </Tooltip>
  );
};

export default Flag;
