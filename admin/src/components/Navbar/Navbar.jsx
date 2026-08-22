// src/components/Navbar.jsx
import React, { useState, useEffect, useCallback } from "react";
import { NavLink } from "react-router-dom";
import {
  Film,
  List,
  Calendar,
  Ticket,
  Menu as MenuIcon,
  X as XIcon,
} from "lucide-react";
import { styles4 } from "../../assets/dummyStyles";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const toggleOpen = useCallback(() => setOpen((v) => !v), []);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, close]);

  // NavLink content - reuse in desktop & mobile
  const NavItem = ({ to, Icon, label, end = false, onClick }) => (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `${styles4.navLinkBase} ${
          isActive
            ? styles4.navLinkActive
            : styles4.navLinkInactive
        }`
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            className={`${styles4.navLinkIconBase} ${
              isActive ? styles4.navLinkIconActive : styles4.navLinkIconInactive
            }`}
          />
          <span
            className={`${styles4.navLinkTextBase} ${
              isActive ? styles4.navLinkTextActive : styles4.navLinkTextInactive
            }`}
          >
            {label}
          </span>
        </>
      )}
    </NavLink>
  );

  return (
    <nav className={styles4.navbar}>
      <div className={styles4.navbarContainer}>
        <div className={styles4.navbarFlex}>
          {/* Logo/Brand */}
          <div className={styles4.logoContainer}>
            <div className={styles4.logoIcon}>
              <Film className={styles4.logoIconInner} />
            </div>
            <span className={styles4.logoText}>
              CINEVERSE
            </span>
          </div>

          {/* Desktop Links (unchanged look) */}
          <div className={styles4.desktopNav}>
            <NavItem to="/" Icon={Film} label="ADD MOVIES" end />
            <NavItem to="/listmovies" Icon={List} label="LIST MOVIES" />
            {/* Dashboard */}
            <NavItem to="/dashboard" Icon={Calendar} label="DASHBOARD" />
            {/* Bookings (new) */}
            <NavItem to="/bookings" Icon={Ticket} label="BOOKINGS" />
          </div>

          {/* Mobile / Tablet Hamburger */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={toggleOpen}
              aria-controls="mobile-menu"
              aria-expanded={open}
              className={styles4.mobileMenuButton}
            >
              <span className="sr-only">Open main menu</span>
              {open ? (
                <XIcon className={styles4.mobileMenuIcon} />
              ) : (
                <MenuIcon className={styles4.mobileMenuIcon} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Slide-over Panel */}
      <div
        className={`${styles4.mobileMenuContainer} ${
          open ? "pointer-events-auto" : "pointer-events-none"
        }`}
        aria-hidden={!open}
      >
        {/* Backdrop */}
        <div
          className={`${styles4.mobileMenuBackdrop} ${
            open ? "opacity-100" : "opacity-0"
          }`}
          onClick={close}
        />

        {/* Panel */}
        <aside
          id="mobile-menu"
          className={`${styles4.mobileMenuPanel} ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
          role="dialog"
          aria-modal="true"
        >
          <div className={styles4.mobileMenuPanelHeader}>
            <div className={styles4.logoContainer}>
              <div className="flex items-center justify-center w-10 h-10 bg-red-600 rounded-full transform rotate-12">
                <Film className="w-6 h-6 text-white transform -rotate-12" />
              </div>
              <span className="font-['Impact'] text-xl text-white tracking-wider">
                CINEVERSE
              </span>
            </div>

            <button
              onClick={close}
              className="p-2 rounded-full hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-red-600"
              aria-label="Close menu"
            >
              <XIcon className="w-5 h-5 text-red-200" />
            </button>
          </div>

          <nav className={styles4.mobileMenuPanelNav}>
            {/* Mobile-friendly stacked links */}
            <NavLink
              to="/"
              end
              onClick={close}
              className={({ isActive }) =>
                `${styles4.mobileNavLinkBase} ${
                  isActive
                    ? styles4.mobileNavLinkActive
                    : styles4.mobileNavLinkInactive
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Film
                    className={`${styles4.mobileNavLinkIconBase} ${
                      isActive ? styles4.mobileNavLinkIconActive : styles4.mobileNavLinkIconInactive
                    }`}
                  />
                  <span className={styles4.mobileNavLinkText}>ADD MOVIES</span>
                </>
              )}
            </NavLink>

            <NavLink
              to="/listmovies"
              onClick={close}
              className={({ isActive }) =>
                `${styles4.mobileNavLinkBase} ${
                  isActive
                    ? styles4.mobileNavLinkActive
                    : styles4.mobileNavLinkInactive
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <List
                    className={`${styles4.mobileNavLinkIconBase} ${
                      isActive ? styles4.mobileNavLinkIconActive : styles4.mobileNavLinkIconInactive
                    }`}
                  />
                  <span className={styles4.mobileNavLinkText}>LIST MOVIES</span>
                </>
              )}
            </NavLink>

            <NavLink
              to="/dashboard"
              onClick={close}
              className={({ isActive }) =>
                `${styles4.mobileNavLinkBase} ${
                  isActive
                    ? styles4.mobileNavLinkActive
                    : styles4.mobileNavLinkInactive
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Calendar
                    className={`${styles4.mobileNavLinkIconBase} ${
                      isActive ? styles4.mobileNavLinkIconActive : styles4.mobileNavLinkIconInactive
                    }`}
                  />
                  <span className={styles4.mobileNavLinkText}>DASHBOARD</span>
                </>
              )}
            </NavLink>

            {/* Bookings (mobile) */}
            <NavLink
              to="/bookings"
              onClick={close}
              className={({ isActive }) =>
                `${styles4.mobileNavLinkBase} ${
                  isActive
                    ? styles4.mobileNavLinkActive
                    : styles4.mobileNavLinkInactive
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Ticket
                    className={`${styles4.mobileNavLinkIconBase} ${
                      isActive ? styles4.mobileNavLinkIconActive : styles4.mobileNavLinkIconInactive
                    }`}
                  />
                  <span className={styles4.mobileNavLinkText}>BOOKINGS</span>
                </>
              )}
            </NavLink>
          </nav>

          {/* Footer action (optional) */}
          <div className={styles4.mobileMenuPanelFooter}>
            <p className={styles4.mobileMenuFooterText}>
              © {new Date().getFullYear()} CINEVERSE
            </p>
          </div>
        </aside>
      </div>
    </nav>
  );
}