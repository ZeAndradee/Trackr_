import { Link } from "react-router-dom";
import styles from "./FriendsFacePile.module.css";
import Image from "../Images/Image/Image";
import { Tooltip } from "../../Utils/Tooltip/Tooltip";

const FriendsFacePile = ({
  users,
  onOpenModal,
  activityText = "Listened by",
  limit = 3,
}) => {
  if (!users || users.length === 0) return null;

  const displayUsers = users.slice(0, limit);
  const remainingCount = users.length - limit;
  const firstUserName = users[0].username;

  return (
    <div className={styles.container}>
      <div className={styles.facepile}>
        {displayUsers.map((user, index) => (
          <div key={index} className={styles.imageWrapper}>
            <Tooltip text={user.username}>
              <Image
                src={user.userimage || user.userImage}
                name={user.username}
                alt={user.username}
                size={32}
                className={styles.image}
                to={user.username ? `/${user.username}` : undefined}
              />
            </Tooltip>
          </div>
        ))}
      </div>
      <span className={styles.text}>
        {activityText}{" "}
        <Link to={`/${firstUserName || ""}`}>
          <strong>
            {firstUserName}
          </strong>
        </Link>
        {users.length > 1 && (
          <>
            {" "}
            and{" "}
            <strong onClick={() => onOpenModal && onOpenModal()}>
              {remainingCount > 0
                ? `${remainingCount + limit - 1} other friends`
                : `${users.length - 1} other friend${users.length - 1 > 1 ? "s" : ""
                }`}
            </strong>
          </>
        )}
      </span>
    </div>
  );
};

export default FriendsFacePile;
