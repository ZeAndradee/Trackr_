import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from "react";
import { io } from "socket.io-client";
import { UserLoggedContext } from "./UserLoggedContext";

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { userLogged, setUserLogged } = useContext(UserLoggedContext);
  const baseURL = import.meta.env.VITE_API_URL || "https://api.trackr.fm";

  const subscribers = useRef(new Map());

  const subscribeToUserStatus = useCallback(
    (userId, callback) => {
      if (!subscribers.current.has(userId)) {
        subscribers.current.set(userId, new Set());
      }
      subscribers.current.get(userId).add(callback);

      if (socket) {
        socket.emit("get_status", { userId });
      }

      return () => {
        const userSubs = subscribers.current.get(userId);
        if (userSubs) {
          userSubs.delete(callback);
          if (userSubs.size === 0) {
            subscribers.current.delete(userId);
          }
        }
      };
    },
    [socket]
  );

  useEffect(() => {
    if (userLogged?._id || userLogged?.id) {
      const newSocket = io(baseURL, {
        withCredentials: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
        setSocket(null);
      };
    }
  }, [userLogged?._id, userLogged?.id, baseURL]);

  useEffect(() => {
    if (!socket) return;

    const handleStatusChange = (data) => {
      const userSubs = subscribers.current.get(data.userId);
      if (userSubs) {
        userSubs.forEach((callback) => callback(data.status));
      }

      const currentUserId = userLogged?._id || userLogged?.id;
      if (data.userId === currentUserId && userLogged) {
        setUserLogged((prev) => ({ ...prev, status: data.status }));
      }
    };

    socket.on("user_status_change", handleStatusChange);

    return () => {
      socket.off("user_status_change", handleStatusChange);
    };
  }, [socket, userLogged]);

  return (
    <SocketContext.Provider value={{ socket, subscribeToUserStatus }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  return context?.socket;
};

export const useUserStatus = (userId, initialStatus = "offline") => {
  const [status, setStatus] = useState(initialStatus);
  const context = useContext(SocketContext);

  const subscribeToUserStatus = context?.subscribeToUserStatus;

  useEffect(() => {
    if (!userId || !subscribeToUserStatus) return;

    const unsubscribe = subscribeToUserStatus(userId, (newStatus) => {
      setStatus(newStatus);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [userId, subscribeToUserStatus]);

  return status;
};
