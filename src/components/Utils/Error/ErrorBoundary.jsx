import React from "react";
import style from "./ErrorBoundary.module.css";
import { Button } from "../Buttons/Button";
import { IoPause, IoMusicalNote, IoPerson, IoWarning, IoDisc, IoList } from "react-icons/io5";
import { Link } from "react-router-dom";


const ErrorBoundary = ({ source, error }) => {
  const is404 = error?.message?.includes("404") || error?.status === 404;

  const getErrorContent = () => {
    if (source === "trackProfile") {
      if (is404) {
        return {
          title: "Track Not Found",
          message: "This track doesn't exist or is not available in your country.",
          icon: <IoMusicalNote className={style.icon} />,
        };
      }
      return {
        title: "Unable to Load Track",
        message: "We couldn't load this track. Please try again later.",
        icon: <IoWarning className={style.icon} />,
      };
    }

    if (source === "userProfile") {
      if (is404) {
        return {
          title: "User Not Found",
          message: "This user doesn't exist or has been deleted.",
          icon: <IoPerson className={style.icon} />,
        };
      }
      return {
        title: "Unable to Load Profile",
        message: "We couldn't load this user profile. Please try again later.",
        icon: <IoWarning className={style.icon} />,
      };
    }

    if (source === "albumProfile") {
      if (is404) {
        return {
          title: "Album Not Found",
          message: "This album doesn't exist or is not available in your country.",
          icon: <IoDisc className={style.icon} />,
        };
      }
      return {
        title: "Unable to Load Album",
        message: "We couldn't load this album. Please try again later.",
        icon: <IoWarning className={style.icon} />,
      };
    }

    if (source === "listProfile") {
      if (is404) {
        return {
          title: "List Not Found",
          message: "This list doesn't exist or the link is incorrect.",
          icon: <IoList className={style.icon} />,
        };
      }
      return {
        title: "Unable to Load List",
        message: "We couldn't load this list. Please try again later.",
        icon: <IoWarning className={style.icon} />,
      };
    }

    return {
      title: "Someone Hit Pause",
      message: "We're working to fix this and get you back on track.",
      icon: <IoPause className={style.icon} />,
    };
  };

  const { title, message, icon } = getErrorContent();

  return (
    <div className={style.container}>
      <div className={style.iconContainer}>{icon}</div>
      <h2 className={style.title}>{title}</h2>
      <p className={style.message}>{message}</p>
      <div className={style.actions}>
        <Link to="/">
          <Button variant="primary" fullWidth size="lg">
            Return Home
          </Button>
        </Link>
      </div>
    </div >
  );
};

export default ErrorBoundary;
