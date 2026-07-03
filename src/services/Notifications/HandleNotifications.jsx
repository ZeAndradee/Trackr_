import useApi from "../../hooks/Api";

const api = useApi();

export const getNotifications = async () => {
  try {
    const { data } = await api.get("/notifications");
    return data;
  } catch (e) {
    console.error("Error fetching notifications", e);
    return [];
  }
};

export const markAsRead = async (id) => {
  try {
    const { data } = await api.patch(`/notifications/${id}/read`);
    return data;
  } catch (e) {
    console.error("Error marking notification as read", e);
    return null;
  }
};

export const deleteNotification = async (id) => {
  try {
    const { data } = await api.delete(`/notifications/${id}`);
    return data;
  } catch (e) {
    console.error("Error deleting notification", e);
    return null;
  }
};

export const markAllAsRead = async () => {
  try {
    const { data } = await api.patch("/notifications/read-all");
    return data;
  } catch (e) {
    console.error("Error marking all notifications as read", e);
    return null;
  }
};
