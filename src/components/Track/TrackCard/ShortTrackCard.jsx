import { useNavigate, Link } from "react-router-dom";
import Image from "../../Utils/Images/Image/Image";
import { getTrackCover } from "../../Utils/Formater/Track";
import ArtistList from "../../Utils/ArtistList/ArtistList";
import TrackAlbumTitle from "../../Utils/TrackAlbumTitle/TrackAlbumTitle";
import styles from "./ShortTrackCard.module.css";
import { createTrackSlug } from "../../../utils/formatters/textFormatters";

const ShortTrackCard = ({ track, userInfo, className = "" }) => {
  const navigate = useNavigate();

  const artistItems = Array.isArray(track?.artists) ? track.artists : [];

  const handleUserProfileClick = (e) => {
    e.stopPropagation();
    if (track?.user?.username) {
      navigate(`/${track.user.username}`);
    }
  };

  return (
    <Link
      to={createTrackSlug(track.name, artistItems, track.id)}
      state={{ trackId: track.id }}
      className={`${styles.shortCardContainer} ${className}`}
    >
      <div className={styles.trackInfo}>
        <div className={styles.trackCover}>
          <Image src={getTrackCover(track)} alt={track?.name} fallbackVariant="cover" width="100%" height="100%" className={styles.coverImage} />
        </div>

        <div className={styles.trackDetails}>
          <TrackAlbumTitle
            title={track?.name}
            fontSize="14px"
            ellipsis
            className={styles.trackTitle}
          />
          <div className={styles.trackArtist}>
            <ArtistList artists={artistItems} />
          </div>
        </div>

        {userInfo && track?.user && (
          <div className={styles.userImageContainer}>
            <Image
              src={track.user?.userimage || track.user?.image || track.user?.userImage}
              name={track.user?.username}
              userId={track.user?._id || track.user?.id}
              status={track.user?.status}
              size={50}
            />
          </div>
        )}
      </div>
    </Link>
  );
};

export default ShortTrackCard;
