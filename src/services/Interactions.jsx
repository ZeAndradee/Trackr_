import useApi from "../hooks/Api";

export const likeInteraction = async ({ targetId, targetType }) => {
  const api = useApi();

  if (!targetId) throw new Error("Target ID is required");
  if (!targetType) throw new Error("Target Type is required");

  try {
    const { data } = await api.post("/interactions/like", {
      targetId,
      targetType,
    });
    return data;
  } catch (error) {
    console.error("Service: Failed to like interaction:", error);
    throw error;
  }
};

export const postComment = async ({ logId, content, parentId }) => {
  const api = useApi();

  if (!logId) throw new Error("Log ID is required");
  if (!content) throw new Error("Content is required");

  try {
    const { data } = await api.post("/interactions/comment", {
      logId,
      content,
      parentId,
    });
    return data;
  } catch (error) {
    console.error("Service: Failed to post comment:", error);
    throw error;
  }
};

export const getComments = async (logId) => {
  const api = useApi();

  if (!logId) throw new Error("Log ID is required");

  try {
    const { data } = await api.get(`/interactions/comments/${logId}`);
    return data;
  } catch (error) {
    console.error("Service: Failed to get comments:", error);
    throw error;
  }
};

export const deleteComment = async (commentId) => {
  const api = useApi();

  if (!commentId) throw new Error("Comment ID is required");

  try {
    const { data } = await api.delete(`/interactions/comment/${commentId}`);
    return data;
  } catch (error) {
    console.error("Service: Failed to delete comment:", error);
    throw error;
  }
};

export const editComment = async (commentId, content) => {
  const api = useApi();

  if (!commentId) throw new Error("Comment ID is required");
  if (!content) throw new Error("Content is required");

  try {
    const { data } = await api.put(`/interactions/comment/${commentId}`, {
      content,
    });
    return data;
  } catch (error) {
    console.error("Service: Failed to edit comment:", error);
    throw error;
  }
};
