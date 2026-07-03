import React from "react";

const LoadingIndicator = ({ className = "", style = {} }) => {
  const loaderStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "1.5rem",
    width: "100%",
    ...style,
  };

  const dotStyle = {
    width: "10px",
    height: "10px",
    margin: "0 5px",
    borderRadius: "50%",
    backgroundColor: "var(--primary-color)",
    animation: "pulse 1.5s infinite ease-in-out",
    display: "inline-block",
  };

  return (
    <div className={className} style={loaderStyle}>
      <style>
        {`
          @keyframes pulse {
            0%, 100% { transform: scale(0.5); opacity: 0.5; }
            50% { transform: scale(1); opacity: 1; }
          }
        `}
      </style>
      <div style={{ ...dotStyle, animationDelay: "0s" }}></div>
      <div style={{ ...dotStyle, animationDelay: "0.2s" }}></div>
      <div style={{ ...dotStyle, animationDelay: "0.4s" }}></div>
    </div>
  );
};

export default LoadingIndicator;
