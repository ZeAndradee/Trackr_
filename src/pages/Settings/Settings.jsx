import { NavLink, Outlet } from "react-router-dom";
import {
  CircleUser,
  KeyRound,
  Bell,
  Lock,
  Link2,
  ShieldCheck,
} from "lucide-react";
import style from "./Settings.module.css";

const NAV_ITEMS = [
  { to: "/settings/profile", label: "Profile", Icon: CircleUser },
  { to: "/settings/password", label: "Password", Icon: KeyRound },
  { to: "/settings/email-notifications", label: "Email / Notifications", Icon: Bell },
  { to: "/settings/privacy", label: "Privacy Settings", Icon: Lock },
  { to: "/settings/connections", label: "Connections", Icon: Link2 },
  { to: "/settings/security", label: "Security Settings", Icon: ShieldCheck },
];

const Settings = () => {
  return (
    <div className={style.page}>
      <aside className={style.sidebar}>
        <h2 className={style.sidebarTitle}>Account Settings</h2>
        <nav className={style.nav}>
          {NAV_ITEMS.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `${style.navItem} ${isActive ? style.navItemActive : ""}`
              }
            >
              <Icon size={20} strokeWidth={1.75} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className={style.content}>
        <Outlet />
      </main>
    </div>
  );
};

export default Settings;
