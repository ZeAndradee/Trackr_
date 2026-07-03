import React, { useState, useEffect, useRef, useContext } from "react";
import style from "./NotificationCenter.module.css";
import { FiBell } from "react-icons/fi";
import { useAuthModal } from "../../contexts/AuthModalContext";
import useClickOutside from "../../hooks/useClickOutside";
import { useSocket } from "../../contexts/SocketContext";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../../services/Notifications/HandleNotifications";
import NotificationItem from "./NotificationItem";
import NotificationCenterSkeleton from "../Utils/Skeletons/NotificationCenterSkeleton";
import { UserLoggedContext } from "../../contexts/UserLoggedContext";
import { useNavigate } from "react-router-dom";

const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const socket = useSocket();
  const { userLogged } = useContext(UserLoggedContext);
  const { openModal } = useAuthModal();
  const navigate = useNavigate();

  const [isUserVerified, setIsUserVerified] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const notificationsRef = useRef([]);

  useClickOutside(dropdownRef, () => setIsOpen(false));

  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  const getSignature = (list) =>
    list
      .map(
        (n) =>
          `${n._id}:${n.read ? 1 : 0}:${n.sender?.isFollowing ? 1 : 0}`
      )
      .join("|");

  const fetchNotifications = async ({ silent = false } = {}) => {
    if (!userLogged) return;
    if (!silent) setIsLoading(true);
    try {
      const data = await getNotifications();
      if (data) {
        const verified = data.isVerified !== false;
        const notificationsList =
          data.notifications || (Array.isArray(data) ? data : []);
        const sorted = [...notificationsList].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        const prev = notificationsRef.current;
        const readMap = new Map(prev.map((n) => [n._id, n.read]));
        const merged = sorted.map((n) => ({
          ...n,
          read: n.read || !!readMap.get(n._id),
        }));

        if (getSignature(prev) !== getSignature(merged)) {
          setNotifications(merged);
        }

        let count = merged.filter((n) => !n.read).length;
        if (!verified) {
          count += 1;
        }
        setUnreadCount((c) => (c === count ? c : count));
        setIsUserVerified((v) => (v === verified ? v : verified));
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userLogged) {
      fetchNotifications();
    }
  }, [userLogged?.id]);

  useEffect(() => {
    if (!isOpen) return;
    if (unreadCount > 0) {
      handleMarkAllRead();
    }
    fetchNotifications({ silent: true });
  }, [isOpen]);

  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (newNotification) => {
      setNotifications((prev) => {
        const updated = [newNotification, ...prev];
        return updated;
      });
      setUnreadCount((prev) => prev + 1);
    };

    socket.on("notification", handleNewNotification);

    return () => {
      socket.off("notification", handleNewNotification);
    };
  }, [socket]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const handleNotificationClick = async (notification) => {
    if (notification.type === "Verified" || notification.type === "VERIFIED") {
      openModal("verify-email-instruction");
      return;
    }

    if (!notification.read) {
      await markAsRead(notification._id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notification._id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }

    setIsOpen(false);

    if (notification.referenceType === "Logs") {
      if (notification.type === "LIKE") {
        navigate(`/${userLogged.username}/log/${notification.referenceId._id}`);
      }
    } else if (notification.referenceType === "Comments") {
      navigate(
        `/${userLogged.username}/log/${notification.referenceId.logId?._id}`
      );
    } else if (notification.sender?.username) {
      navigate(`/${notification.sender.username}`);
    }
  };

  const handleMarkAsReadAction = async (e, notification) => {
    if (!notification.read) {
      setNotifications((prev) =>
        prev.map((n) => (n._id === notification._id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
  };

  const handleDeleteAction = async (e, notification) => {
    setNotifications((prev) => prev.filter((n) => n._id !== notification._id));
    if (!notification.read) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
    await deleteNotification(notification._id);
  };

  if (!userLogged) return null;

  const totalUnreadCount = unreadCount;

  return (
    <div className={style.container} ref={dropdownRef}>
      <button className={style.triggerButton} onClick={handleToggle}>
        <FiBell size={20} />
        {totalUnreadCount > 0 && (
          <span className={style.badge}>
            {totalUnreadCount > 99 ? "99+" : totalUnreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className={style.dropdown}>
          <div className={style.header}>
            <span className={style.title}>Notifications</span>
          </div>
          <div className={style.list}>
            {isLoading ? (
              <NotificationCenterSkeleton />
            ) : (
              <>
                {!isUserVerified && (
                  <NotificationItem
                    key="verified-action"
                    notification={{
                      _id: "verified-action",
                      type: "VERIFIED",
                      read: false,
                    }}
                    onClick={handleNotificationClick}
                  />
                )}
                {notifications.length > 0
                  ? notifications.map((notification) => (
                    <NotificationItem
                      key={notification._id}
                      notification={notification}
                      onClick={handleNotificationClick}
                      onMarkAsRead={(e) =>
                        handleMarkAsReadAction(e, notification)
                      }
                      onDelete={(e) => handleDeleteAction(e, notification)}
                    />
                  ))
                  : !isUserVerified ? null : (
                    <div className={style.emptyState}>
                      <span>
                        No notifications yet.{" "}
                        <u onClick={() => navigate("/search")}>
                          Find some friends
                        </u>
                        .
                      </span>
                    </div>
                  )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
