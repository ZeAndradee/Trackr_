import React, { forwardRef, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { UserLoggedContext } from "../../../contexts/UserLoggedContext";
import { useSocket } from "../../../contexts/SocketContext";
import { useTheme } from "../../../contexts/ThemeContext";
import { handleLogout } from "../../../services/Auth/HandleAuth";
import Toggle from "../Toggle/Toggle";
import {
   FiBook,
   FiList,
   FiMoon,
   FiSun,
   FiMusic,
   FiAward,
   FiUser,
} from "react-icons/fi";
import { ArrowUpRight, Settings as SettingsIcon } from "lucide-react";
import style from "./UserDropdown.module.css";

const UserDropdown = forwardRef(({ open, onClose }, ref) => {
   const { userLogged, setUserLogged } = useContext(UserLoggedContext);
   const { theme, toggleTheme } = useTheme();
   const socket = useSocket();
   const location = useLocation();

   if (!userLogged) return null;

   const isOnline = !(userLogged.status === "invisible" || userLogged.status === "offline");

   const fetchLogout = async () => {
      await handleLogout();
      setUserLogged(null);
      onClose?.();
   };


   const handleToggleStatus = (next) => {
      socket?.emit("change_status", { status: next ? "online" : "invisible" });
   };

   const isActiveDropdown = (path) =>
      location.pathname === path ? style.dropdownItemActive : "";

   return (
      <div
         ref={ref}
         className={`${style.dropdown} ${open ? style.dropdownOpen : ""}`}
         aria-hidden={!open}
      >
         <div className={style.dropdownSection}>
            <div className={style.profileHeader}>
               <div className={style.profileHeaderInfo}>
                  <span className={style.profileHeaderTitle}>
                     {userLogged?.name || userLogged?.displayName || userLogged?.username}
                  </span>
                  <span className={style.profileHeaderUsername}>
                     @{userLogged?.username}
                  </span>
               </div>
            </div>

            <div className={style.profileButtons}>
               <Link
                  to={`/${userLogged?.username}`}
                  className={style.profileActionButton}
                  onClick={onClose}
               >
                  View Profile
               </Link>
            </div>
         </div>

         <div className={style.dropdownSection}>
            <Link
               to={`/${userLogged?.username}/reviews`}
               className={`${style.dropdownItem} ${isActiveDropdown(
                  `/${userLogged?.username}/reviews`
               )}`}
               onClick={onClose}
            >
               <FiBook size={18} className={style.dropdownIcon} />
               Reviews
            </Link>

            <Link
               to={`/${userLogged?.username}/lists`}
               className={`${style.dropdownItem} ${isActiveDropdown(
                  `/${userLogged?.username}/lists`
               )}`}
               onClick={onClose}
            >
               <FiList size={18} className={style.dropdownIcon} />
               Lists
            </Link>

            <Link
               to="/settings"
               className={`${style.dropdownItem} ${isActiveDropdown("/settings")}`}
               onClick={onClose}
            >
               <SettingsIcon size={18} className={style.dropdownIcon} />
               Settings
            </Link>
         </div>

         <div className={style.dropdownSection}>
            <div
               className={style.dropdownItem}
               onClick={(e) => {
                  e.stopPropagation();
                  toggleTheme();
               }}
            >
               {theme === "light" ? (
                  <>
                     <FiMoon size={18} className={style.dropdownIcon} />
                     Dark Mode
                  </>
               ) : (
                  <>
                     <FiSun size={18} className={style.dropdownIcon} />
                     Light Mode
                  </>
               )}
            </div>

            <div
               className={style.statusItem}
               onClick={(e) => e.stopPropagation()}
            >
               <span className={style.dropdownIcon}>
                  <span
                     className={`${style.statusDot} ${isOnline ? style.online : style.invisible
                        }`}
                  />
               </span>
               <span className={style.statusName}>
                  {isOnline ? "Online" : "Invisible"}
               </span>
               <Toggle
                  checked={isOnline}
                  onChange={handleToggleStatus}
                  size="md"
                  ariaLabel="Toggle online status"
               />
            </div>
         </div>

         <div className={style.mobileNavLinks}>
            <div className={`${style.dropdownItem} ${style.dropdownItemDisabled}`}>
               <FiMusic size={16} className={style.dropdownIcon} />
               Tracks
            </div>
            <div className={`${style.dropdownItem} ${style.dropdownItemDisabled}`}>
               <FiList size={16} className={style.dropdownIcon} />
               Lists
            </div>
            <div className={`${style.dropdownItem} ${style.dropdownItemDisabled}`}>
               <FiAward size={16} className={style.dropdownIcon} />
               Artists
            </div>
            <div className={`${style.dropdownItem} ${style.dropdownItemDisabled}`}>
               <FiUser size={16} className={style.dropdownIcon} />
               Trackrs
            </div>
         </div>

         <div className={style.dropdownSection}>
            <Link
               to="/privacy-policy"
               className={`${style.dropdownItem} ${style.dropdownItemFooter}`}
               onClick={onClose}
            >
               Privacy Policy
               <ArrowUpRight size={16} className={style.dropdownTrailingIcon} />
            </Link>
            <Link
               to="/terms-of-use"
               className={`${style.dropdownItem} ${style.dropdownItemFooter}`}
               onClick={onClose}
            >
               Terms of Use
               <ArrowUpRight size={16} className={style.dropdownTrailingIcon} />
            </Link>
            <button
               onClick={fetchLogout}
               className={`${style.dropdownItem} ${style.dropdownItemFooter}`}
            >
               Log out
            </button>
         </div>
      </div>
   );
});

UserDropdown.displayName = "UserDropdown";

export default UserDropdown;
