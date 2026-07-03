import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar as solidStar } from "@fortawesome/free-solid-svg-icons";
import { faStar as regularStar } from "@fortawesome/free-regular-svg-icons";

export const renderStarRating = (
  rating,
  hoveredRating,
  handleRatingClick,
  handleRatingHover,
  handleRatingLeave,
  classes
) => {
  const stars = [];

  for (let i = 1; i <= 5; i++) {
    const isFilled = hoveredRating >= i || (!hoveredRating && rating >= i);

    stars.push(
      React.createElement(FontAwesomeIcon, {
        key: i,
        icon: isFilled ? solidStar : regularStar,
        className: classes.starIcon,
        onClick: () => handleRatingClick(i),
        onMouseEnter: () => handleRatingHover(i),
        onMouseLeave: handleRatingLeave,
      })
    );
  }

  return stars;
};

export const getRatingText = (rating) => {
  if (!rating) return "Not rated";

  const ratingTexts = {
    0.5: "Terrible",
    1: "Bad",
    1.5: "Poor",
    2: "Disappointing",
    2.5: "Average",
    3: "Good",
    3.5: "Very Good",
    4: "Great",
    4.5: "Excellent",
    5: "Masterpiece",
  };

  return ratingTexts[rating] || "Not rated";
};
