import React, { useState, useEffect, useMemo } from "react";
import styles from "./AboutTab.module.css";
import profileStyles from "../ArtistProfile.module.css";
import ArtistCard from "../ArtistCard/ArtistCard";
import { fetchArtistInfo, fetchArtistRelationships } from "../../../../services/FetchArtist";
import { mockArtistAbout } from "../../../../mockData/artistProfileMock";
import { GenreTag } from "../../../Utils/Tags/Tags";
import Image from "../../../Utils/Images/Image/Image";
import { getAverageColor } from "../../../../utils/color/getAverageColor";
import { useTheme } from "../../../../contexts/ThemeContext";
import Connections from "./Connections/Connections";



const AboutTab = ({ artist, artistImage, stats }) => {
  const [about, setAbout] = useState(null);
  const [relationships, setRelationships] = useState([]);
  const [loading, setLoading] = useState(false);
  const INITIAL_PARAGRAPHS = 3;
  const STEP_PARAGRAPHS = 5;
  const [visibleCount, setVisibleCount] = useState(INITIAL_PARAGRAPHS);
  const [artistColor, setArtistColor] = useState(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (artistImage) {
      getAverageColor(artistImage, theme).then((color) => {
        if (color) setArtistColor(`rgb(${color.r}, ${color.g}, ${color.b})`);
      });
    }
  }, [artistImage, theme]);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      if (!artist?.id) return;
      setLoading(true);
      try {
        const res = await fetchArtistInfo(artist.id);
        if (alive && res) setAbout(res);
      } catch (e) {
        if (alive) setAbout(null);
      } finally {
        if (alive) setLoading(false);
      }
    };
    load();
    return () => {
      alive = false;
    };
  }, [artist?.id]);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      if (!artist?.id) return;
      try {
        const res = await fetchArtistRelationships(artist.id);
        if (!alive) return;
        const list = Array.isArray(res) ? res : res?.relationships || [];
        setRelationships(list);
      } catch (e) {
        if (alive) setRelationships([]);
      }
    };
    load();
    return () => {
      alive = false;
    };
  }, [artist?.id]);

  const sidebarInfo = useMemo(() => {
    if (!about) return null;
    const place = [about.birthPlace, about.country].filter(Boolean).join(", ");
    return {
      type: about.type,
      bornName: about.realName || undefined,
      bornDate: about.birthDate || undefined,
      bornPlace: place || undefined,
      bornCity: about.birthPlace || undefined,
      bornCountry: about.country || undefined,
    };
  }, [about]);

  const collaborators = mockArtistAbout.collaborators || [];
  const awards = mockArtistAbout.awards || [];
  const labels = mockArtistAbout.facts?.labels || [];

  const cleanedBiography = (about?.biography || "")
    .split(/\n\s*(?:Studio albums|Discography|Albums|Filmography|Bibliography|See also|References|External links)\s*\n[\s\S]*$/i)[0]
    .trim();
  const paragraphs = cleanedBiography.split(/\n+/).filter(Boolean);
  const canExpand = visibleCount < paragraphs.length;
  const visibleParagraphs = paragraphs.slice(0, visibleCount);

  return (
    <div className={styles.about}>
      {loading && !about && (
        <div className={styles.loadingHint}>Loading…</div>
      )}

      <div className={profileStyles.contentContainer}>
        <div className={profileStyles.mainColumn}>
          {paragraphs.length > 0 && (
            <section className={styles.bioSection}>
              <h2 className={styles.bioHeadline} style={artistColor ? { color: artistColor } : {}}>
                The story of{" "}
                <span
                  className={styles.bioHeadlineAccent}
                  style={artistColor ? { color: artistColor } : {}}
                >
                  {artist?.name}
                </span>
              </h2>

              <div className={styles.bioBody}>
                {visibleParagraphs.map((p, i) => (
                  <p key={i} className={styles.bioParagraph}>
                    {p}
                  </p>
                ))}

                {about?.mbid && !canExpand && visibleCount > INITIAL_PARAGRAPHS && (
                  <div className={styles.bioSource}>
                    <a
                      href={`https://musicbrainz.org/artist/${about.mbid}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      MusicBrainz
                    </a>
                  </div>
                )}

                {paragraphs.length > INITIAL_PARAGRAPHS && (
                  <button
                    type="button"
                    className={styles.bioReadMore}
                    onClick={() =>
                      setVisibleCount((c) =>
                        c < paragraphs.length
                          ? Math.min(c + STEP_PARAGRAPHS, paragraphs.length)
                          : INITIAL_PARAGRAPHS
                      )
                    }
                  >
                    {canExpand ? "Read more" : "Read less"}
                  </button>
                )}
              </div>
            </section>
          )}

          {awards.length > 0 && (
            <section className={styles.awardsSection}>
              <div className={profileStyles.sectionHeading} style={{ marginBottom: "1.5rem" }}>
                <h2>Recognition</h2>
              </div>

              <div className={styles.awardsGrid}>
                {awards.map((a, i) => (
                  <div key={i} className={styles.awardBadge}>
                    <div className={styles.awardBadgeIconWrap}>
                      <div className={styles.noiseOverlay}></div>
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Grammy_Award_icon.svg"
                        alt="Award"
                        className={styles.awardBadgeIcon}
                      />
                    </div>
                    <div className={styles.awardBadgeContent}>
                      <span className={styles.awardBadgeTitle}>{a.title}</span>
                      {a.note && (
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                          <GenreTag genre={a.note} size="0.75rem" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {false && collaborators.length > 0 && (
            <section className={styles.collabSection}>
              <div className={styles.sectionHead}>
                <div className={profileStyles.sectionHeading} style={{ marginBottom: "1.5rem" }}>
                  <h2>Frequent Collaborators</h2>
                </div>
              </div>

              <div className={styles.collabRow}>
                {collaborators.map((c) => (
                  <div key={c.name} className={styles.collabCard}>
                    <div className={styles.collabAvatarWrap}>
                      <Image
                        src={c.image}
                        name={c.name}
                        size={84}
                        showBadge={false}
                      />
                    </div>
                    <span className={styles.collabName}>{c.name}</span>
                    <span className={styles.collabRole}>{c.role}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {relationships.length > 0 && (
            <section className={styles.connectionsSection}>
              <Connections
                relationships={relationships}
                artist={artist}
                artistImage={artistImage}
              />
            </section>
          )}

          {labels.length > 0 && (
            <section className={styles.labelsSection}>
              <div className={profileStyles.sectionHeading} style={{ marginBottom: "1.5rem" }}>
                <h2>Labels</h2>
              </div>
              <div className={styles.labelsGrid}>
                {labels.map((label) => (
                  <div key={label} className={styles.labelItem}>
                    <div className={styles.labelImageFallback}>{label.charAt(0)}</div>
                    <div className={styles.labelInfo}>
                      <span className={styles.labelName}>{label}</span>
                      <span className={styles.labelStatus}>Current</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className={profileStyles.sidebar}>
          <ArtistCard
            artistName={artist?.name}
            artistImage={artistImage}
            stats={stats}
            genres={artist?.genres}
            hideBio={true}
            artistInfo={sidebarInfo || undefined}
          />
        </div>
      </div>
    </div>
  );
};

export default AboutTab;
