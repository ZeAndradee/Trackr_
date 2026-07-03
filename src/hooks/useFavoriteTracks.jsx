import { useState, useEffect, useCallback } from "react";

const useFavoriteTracks = (initialUserData) => {
  const [favoriteTracks, setFavoriteTracks] = useState(Array(5).fill(null));
  const [isTrackPickerOpen, setIsTrackPickerOpen] = useState(false);
  const [editingTrackIndex, setEditingTrackIndex] = useState(null);

  useEffect(() => {
    if (initialUserData) {
      const initialTracks = initialUserData.favorite_tracks || [];
      const filledTracks = Array(5)
        .fill(null)
        .map((_, i) => initialTracks[i] || null);
      setFavoriteTracks(filledTracks);
    }
  }, [initialUserData]);

  const handleReorderTracks = useCallback((startIndex, endIndex) => {
    setFavoriteTracks((prevTracks) => {
      const newTracks = [...prevTracks];
      const [removed] = newTracks.splice(startIndex, 1);
      newTracks.splice(endIndex, 0, removed);
      return newTracks;
    });
  }, []);

  const handleRemoveTrack = useCallback((idx) => {
    setFavoriteTracks((prevTracks) => {
      const newTracks = [...prevTracks];
      newTracks[idx] = null;
      return newTracks;
    });
  }, []);

  const handleOpenTrackPicker = useCallback((idx) => {
    setEditingTrackIndex(idx);
    setIsTrackPickerOpen(true);
  }, []);

  const handleCloseTrackPicker = useCallback(() => {
    setIsTrackPickerOpen(false);
    setEditingTrackIndex(null);
  }, []);

  const handleTrackSelected = useCallback(
    (trackData) => {
      if (editingTrackIndex !== null && trackData) {
        const normalizedTrack = {
          trackId: trackData.id || trackData.trackId,
          name: trackData.name || "Unknown Track",
          artists: trackData.artists || trackData.artist || "Unknown Artist",
          coverUrl:
            trackData.coverUrl || "",
        };
        setFavoriteTracks((prevTracks) => {
          const newTracks = [...prevTracks];
          newTracks[editingTrackIndex] = normalizedTrack;
          return newTracks;
        });
      }
      handleCloseTrackPicker();
    },
    [editingTrackIndex, handleCloseTrackPicker]
  );

  const getFavoriteTrackIds = useCallback(() => {
    return favoriteTracks.map((track) => track?.trackId || null);
  }, [favoriteTracks]);

  return {
    favoriteTracks,
    setFavoriteTracks,
    isTrackPickerOpen,
    editingTrackIndex,
    handleRemoveTrack,
    handleOpenTrackPicker,
    handleCloseTrackPicker,
    handleTrackSelected,
    getFavoriteTrackIds,
    handleReorderTracks,
  };
};

export default useFavoriteTracks;
