import useApi from "../hooks/Api";

export const fetchList = async (username, slug) => {
    const api = useApi();

    if (!username || !slug) {
        throw new Error("Username and slug are required");
    }

    try {
        const { data: response } = await api.get(
            `/lists/${username}/${slug}`
        );
        return response.data;
    } catch (error) {
        console.error("Service: Failed to fetch list:", error);
        throw error;
    }
};

export const fetchListById = async (listId) => {
    const api = useApi();

    if (!listId) {
        throw new Error("List ID is required");
    }

    try {
        const { data: response } = await api.get(`/lists/${listId}`);
        return response.data;
    } catch (error) {
        console.error("Service: Failed to fetch list by ID:", error);
        throw error;
    }
};

export const fetchUserLists = async (userId) => {
    const api = useApi();

    if (!userId) {
        throw new Error("User ID is required");
    }

    try {
        const { data: response } = await api.get(`/lists/user/${userId}`);
        return response.data;
    } catch (error) {
        console.error("Service: Failed to fetch user lists:", error);
        throw error;
    }
};

export const fetchPopularLists = async () => {
    const api = useApi();

    try {
        const { data: response } = await api.get("/lists/popular");
        return response.data;
    } catch (error) {
        console.error("Service: Failed to fetch popular lists:", error);
        throw error;
    }
};

export const fetchTrendingList = async () => {
    const api = useApi();

    try {
        const { data: response } = await api.get("/lists/trackr/trending");
        return response.data;
    } catch (error) {
        console.error("Service: Failed to fetch trending list:", error);
        throw error;
    }
};
export const createList = async ({ name, description, tags, isPublic, tracks }) => {
    const api = useApi();

    if (!name) {
        throw new Error("List name is required");
    }

    try {
        const { data: response } = await api.post("/lists", {
            name,
            description,
            tags,
            isPublic,
            tracks,
        });
        return response.data;
    } catch (error) {
        console.error("Service: Failed to create list:", error);
        throw error;
    }
};

export const updateList = async (listId, { name, description, tags, isPublic, tracks, isRanked }) => {
    const api = useApi();

    if (!listId) {
        throw new Error("List ID is required");
    }

    try {
        const { data: response } = await api.put(`/lists/${listId}`, {
            name,
            description,
            tags,
            isPublic,
            tracks,
            isRanked,
        });
        return response.data;
    } catch (error) {
        console.error("Service: Failed to update list:", error);
        throw error;
    }
};

export const deleteList = async (listId) => {
    const api = useApi();

    if (!listId) {
        throw new Error("List ID is required");
    }

    try {
        const { data: response } = await api.delete(`/lists/${listId}`);
        return response.data;
    } catch (error) {
        console.error("Service: Failed to delete list:", error);
        throw error;
    }
};

export const likeList = async (listId) => {
    const api = useApi();

    if (!listId) {
        throw new Error("List ID is required");
    }

    try {
        const { data: response } = await api.post(
            `/lists/${listId}/like`
        );
        return response.data;
    } catch (error) {
        console.error("Service: Failed to like list:", error);
        throw error;
    }
};

export const shareList = async (listId) => {
    const api = useApi();

    if (!listId) {
        throw new Error("List ID is required");
    }

    try {
        const { data: response } = await api.post(`/lists/${listId}/share`);
        return response.data;
    } catch (error) {
        console.error("Service: Failed to share list:", error);
        throw error;
    }
};

export const addTrackToList = async (listId, { trackId, index, position }) => {
    const api = useApi();

    if (!listId) {
        throw new Error("List ID is required");
    }
    if (!trackId) {
        throw new Error("Track ID is required");
    }

    try {
        const body = { trackId };
        if (index !== undefined) body.index = index;
        if (position !== undefined) body.position = position;
        const { data: response } = await api.post(`/lists/${listId}/tracks`, body);
        return response.data;
    } catch (error) {
        console.error("Service: Failed to add track to list:", error);
        throw error;
    }
};

export const reorderListTracks = async (listId, trackIds) => {
    const api = useApi();

    if (!listId) {
        throw new Error("List ID is required");
    }
    if (!Array.isArray(trackIds)) {
        throw new Error("Track IDs must be an array");
    }

    try {
        const { data: response } = await api.put(`/lists/${listId}/reorder`, {
            trackIds,
        });
        return response.data;
    } catch (error) {
        console.error("Service: Failed to reorder list tracks:", error);
        throw error;
    }
};

export const removeTrackFromList = async (listId, trackId) => {
    const api = useApi();

    if (!listId) {
        throw new Error("List ID is required");
    }
    if (!trackId) {
        throw new Error("Track ID is required");
    }

    try {
        const { data: response } = await api.delete(
            `/lists/${listId}/tracks/${trackId}`
        );
        return response.data;
    } catch (error) {
        console.error("Service: Failed to remove track from list:", error);
        throw error;
    }
};
