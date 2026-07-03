import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const StaticFileRedirect = ({ filePath }) => {
  const navigate = useNavigate();

  useEffect(() => {
    window.location.href = filePath;
  }, [filePath]);

  return null;
};

export default StaticFileRedirect;
