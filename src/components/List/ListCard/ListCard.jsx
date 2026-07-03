import React, { useState } from "react";
import { Link } from "react-router-dom";
import { IoGlobeOutline } from "react-icons/io5";
import { BiLockAlt } from "react-icons/bi";
import { FiMoreHorizontal } from "react-icons/fi";
import ListCovers from "../../Utils/Images/ListCovers/ListCovers";
import Image from "../../Utils/Images/Image/Image";
import ActionMenu from "../../Utils/Dropdown/ActionMenu";
import { GenreTag } from "../../Utils/Tags/Tags";
import styles from "./ListCard.module.css";

const getCovers = (list) => {
    if (list?.tracks?.length > 0) return list.tracks.slice(0, 5);
    if (list?.coverUrl) return [{ isListCover: true, coverUrl: list.coverUrl, name: list.name || "" }];
    return [];
};

const ListCard = ({
    list,
    variant = "visibility",
    showDescription = false,
    showTags = false,
    coverSize = 100,
    menuItems,
}) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

    const ownerUsername = list?.owner?.username || list?.user?.username || "user";
    const listUrl = `/${ownerUsername}/list/${list?.slug}`;
    const covers = getCovers(list);
    const trackCount = list?.trackCount ?? list?.tracks?.length ?? 0;

    const handleMenuClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const rect = e.currentTarget.getBoundingClientRect();
        setMenuPosition({ top: rect.bottom, left: rect.left - 150 });
        setMenuOpen((prev) => !prev);
    };

    const renderMeta = () => {
        if (variant === "user") {
            return (
                <div className={styles.meta}>
                    <Link
                        to={`/${ownerUsername}`}
                        className={styles.userLink}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Image
                            src={(list?.owner || list?.user)?.userimage || (list?.owner || list?.user)?.image || (list?.owner || list?.user)?.userImage}
                            name={ownerUsername}
                            size={20}
                        />
                        <span className={styles.username}>{ownerUsername}</span>
                    </Link>
                    <span className={styles.metaDivider}>·</span>
                    <span>{trackCount} tracks</span>
                </div>
            );
        }
        return (
            <div className={styles.meta}>
                <span>{trackCount} tracks</span>
                <span className={styles.metaDivider}>·</span>
                {list?.isPublic === false ? <BiLockAlt /> : <IoGlobeOutline />}
                <span>{list?.isPublic === false ? "Private" : "Public"}</span>
            </div>
        );
    };

    return (
        <div className={styles.row}>
            <Link to={listUrl} className={styles.coversLink}>
                <ListCovers
                    covers={covers}
                    size={coverSize}
                    showTooltip={true}
                    borderLength="3px"
                    className={styles.covers}
                />
            </Link>

            <div className={styles.content}>
                <div className={styles.top}>
                    <div className={styles.header}>
                        <Link to={listUrl} className={styles.name}>{list?.name}</Link>
                        {renderMeta()}
                        {showTags && list?.tags?.length > 0 && (
                            <div className={styles.tags}>
                                {list.tags.slice(0, 3).map((tag) => (
                                    <GenreTag key={tag} genre={tag} size="0.7rem" />
                                ))}
                            </div>
                        )}
                        {showDescription && list?.description && (
                            <span className={styles.description}>
                                {list.description.length > 300
                                    ? list.description.slice(0, 300) + "..."
                                    : list.description}
                            </span>
                        )}
                    </div>

                    {menuItems && menuItems.length > 0 && (
                        <div className={styles.menuWrapper}>
                            <button
                                className={styles.moreButton}
                                onMouseDown={(e) => e.stopPropagation()}
                                onClick={handleMenuClick}
                                aria-label="More options"
                            >
                                <FiMoreHorizontal size={20} />
                            </button>
                            {menuOpen && (
                                <ActionMenu
                                    items={menuItems}
                                    onClose={() => setMenuOpen(false)}
                                    position={menuPosition}
                                />
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ListCard;
