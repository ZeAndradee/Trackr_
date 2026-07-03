import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./Connections.module.css";
import { DurationTag } from "../../../../Utils/Tags/Tags";

const formatYear = (s) => (s ? String(s).split("-")[0] : null);

const formatPeriod = (begin, end, ended) => {
  const b = formatYear(begin);
  const e = formatYear(end);
  if (b && e && b === e) return b;
  if (b && e) return `${b} – ${e}`;
  if (b) return ended ? `${b} – ?` : `${b} – present`;
  if (e) return `? – ${e}`;
  return null;
};

const FAMILY_TYPES = new Set([
  "parent",
  "sibling",
  "married",
  "spouse",
  "involved with",
  "child",
  "twin",
  "godparent",
  "step-parent",
  "step-sibling",
]);

const BAND_TYPES = new Set([
  "member of band",
  "member",
  "collaboration",
  "founder",
  "supporting musician",
  "tribute",
  "voice actor",
]);

const categoryFor = (relationType) => {
  if (FAMILY_TYPES.has(relationType)) return "family";
  if (BAND_TYPES.has(relationType)) return "bands";
  return "other";
};

const CATEGORY_META = {
  bands: { label: "Bands & Collaborations", order: 0 },
  family: { label: "Family", order: 1 },
  other: { label: "Other", order: 2 },
};

const roleLabel = (rel) => {
  const { relationType, direction } = rel;
  switch (relationType) {
    case "parent":
      return direction === "forward" ? "Child" : "Parent";
    case "sibling":
      return "Sibling";
    case "married":
      return "Married";
    case "spouse":
      return "Spouse";
    case "involved with":
      return "Partner";
    case "member of band":
    case "member":
      return null;
    case "collaboration":
      return "Collaboration";
    case "founder":
      return "Founder";
    default:
      return relationType
        ? relationType.replace(/\b\w/g, (c) => c.toUpperCase())
        : "Related";
  }
};

const initials = (name = "") => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const hueFromString = (s = "") => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
  return h;
};

const Avatar = ({ name }) => {
  const hue = hueFromString(name);
  const bg = `hsl(${hue}, 38%, 28%)`;
  const fg = `hsl(${hue}, 70%, 78%)`;
  return (
    <div className={styles.avatar} style={{ background: bg, color: fg }}>
      {initials(name)}
    </div>
  );
};

const ATTR_SKIP = new Set(["original"]);

const formatAttributes = (attrs = []) => {
  const seen = new Set();
  const out = [];
  for (const a of attrs) {
    if (!a) continue;
    const key = a.toLowerCase();
    if (ATTR_SKIP.has(key)) continue;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(a.replace(/\s*\([^)]*\)/g, "").trim());
  }
  return out;
};

const minStr = (a, b) => {
  if (!a) return b;
  if (!b) return a;
  return a < b ? a : b;
};

const maxStr = (a, b) => {
  if (!a) return b;
  if (!b) return a;
  return a > b ? a : b;
};

const mergeMembers = (items) => {
  const map = new Map();
  for (const rel of items) {
    const key = rel.mbid || rel.name;
    const prev = map.get(key);
    if (!prev) {
      map.set(key, {
        ...rel,
        attributes: [...(rel.attributes || [])],
        ended: rel.ended === true,
        begin: rel.begin || null,
        end: rel.ended ? rel.end || null : null,
        _hasOngoing: rel.ended === false,
      });
      continue;
    }
    prev.attributes.push(...(rel.attributes || []));
    prev.begin = minStr(prev.begin, rel.begin);
    if (rel.ended === false) {
      prev._hasOngoing = true;
      prev.end = null;
      prev.ended = false;
    } else if (!prev._hasOngoing) {
      prev.end = maxStr(prev.end, rel.end);
      prev.ended = true;
    }
    if (!prev.artistId && rel.artistId) prev.artistId = rel.artistId;
  }
  return [...map.values()];
};

const sortByRecent = (a, b) => {
  const av = a.ended ? a.end || "0000" : "9999";
  const bv = b.ended ? b.end || "0000" : "9999";
  return bv.localeCompare(av);
};

const Row = ({ rel }) => {
  const period = formatPeriod(rel.begin, rel.end, rel.ended);
  const isMember =
    rel.relationType === "member of band" || rel.relationType === "member";
  const role = roleLabel(rel);
  const attrs = isMember ? formatAttributes(rel.attributes) : [];

  const subtitle = (
    <div className={styles.subRow}>
      {role && <span className={styles.role}>{role}</span>}
      {isMember && attrs.length > 0 && (
        <span className={styles.instruments}>{attrs.join(", ")}</span>
      )}
      {period && (
        <>
          <span className={styles.period}>{period}</span>
        </>
      )}
    </div>
  );

  const inner = (
    <>
      <Avatar name={rel.name} />
      <div className={styles.rowBody}>
        <span className={styles.name}>{rel.name}</span>
        {subtitle}
      </div>
      {rel.ended && (
        <div className={styles.endedSlot}>
          <DurationTag duration="Ended" />
        </div>
      )}
    </>
  );

  if (rel.artistId) {
    return (
      <Link to={`/artist/${rel.artistId}`} className={`${styles.row} ${styles.rowLink}`}>
        {inner}
      </Link>
    );
  }
  return <div className={styles.row}>{inner}</div>;
};

const INITIAL_LIMIT = 6;

const Section = ({ title, items }) => {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? items : items.slice(0, INITIAL_LIMIT);
  const remaining = items.length - visible.length;

  return (
    <section className={styles.section}>
      <div className={styles.sectionHead}>
        <span className={styles.sectionTitle}>{title}</span>
        <span className={styles.sectionCount}>{items.length}</span>
      </div>
      <div className={styles.grid}>
        {visible.map((rel) => (
          <Row key={rel._id || `${rel.mbid}-${rel.name}`} rel={rel} />
        ))}
      </div>
      {remaining > 0 && (
        <button className={styles.showMore} onClick={() => setExpanded(true)}>
          Show {remaining} more
        </button>
      )}
      {expanded && items.length > INITIAL_LIMIT && (
        <button className={styles.showMore} onClick={() => setExpanded(false)}>
          Show less
        </button>
      )}
    </section>
  );
};

const Connections = ({ relationships }) => {
  const grouped = useMemo(() => {
    const buckets = { bands: [], family: [], other: [] };
    for (const rel of relationships || []) {
      buckets[categoryFor(rel.relationType)].push(rel);
    }
    buckets.bands = mergeMembers(buckets.bands);
    for (const k of Object.keys(buckets)) buckets[k].sort(sortByRecent);
    return buckets;
  }, [relationships]);

  if (!relationships?.length) return null;

  const orderedCategories = Object.entries(grouped)
    .filter(([, items]) => items.length > 0)
    .sort((a, b) => CATEGORY_META[a[0]].order - CATEGORY_META[b[0]].order);

  return (
    <div className={styles.wrap}>
      <div className={styles.sections}>
        {orderedCategories.map(([key, items]) => (
          <Section key={key} title={CATEGORY_META[key].label} items={items} />
        ))}
      </div>
    </div>
  );
};

export default Connections;
