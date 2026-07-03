import { useState } from 'react';
import useApi from './Api';

const useTrackReviewApi = () => {
  const api = useApi();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const postReview = async (reviewData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/reviews', reviewData);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateReview = async (reviewId, reviewData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.put(`/reviews/${reviewId}`, reviewData);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update review');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getReviewsByTrackId = async (trackId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/reviews/track/${trackId}`);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch reviews');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteReview = async (reviewId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.delete(`/reviews/${reviewId}`);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete review');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    postReview,
    updateReview,
    getReviewsByTrackId,
    deleteReview,
    loading,
    error
  };
};

export default useTrackReviewApi;