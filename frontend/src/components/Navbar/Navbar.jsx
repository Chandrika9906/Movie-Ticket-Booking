import React, { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  Film,
  Calendar,
  Mail,
  User,
  X,
  Menu,
  LogOut,
  Clapperboard,
  Ticket, // added for Bookings icon
} from "lucide-react";
import { navbarStyles, navbarCSS } from "../../assets/dummyStyles";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const menuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Read auth state from localStorage
  useEffect(() => {
    const readAuthFromStorage = () => {
      const json = localStorage.getItem("cine_auth");
      if (json) {
        try {
          const parsed = JSON.parse(json);
          setIsLoggedIn(Boolean(parsed?.isLoggedIn));
          setUserEmail(parsed?.email || "");
          return;
        } catch (err) {}
      }

      const simpleFlag = localStorage.getItem("isLoggedIn");
      const email =
        localStorage.getItem("userEmail") ||
        localStorage.getItem("cine_user_email");
      if (simpleFlag === "true") {
        setIsLoggedIn(true);
        setUserEmail(email || "");
        return;
      }

      if (email) {
        setIsLoggedIn(true);
        setUserEmail(email);
        return;
      }

      setIsLoggedIn(false);
      setUserEmail("");
    };

    readAuthFromStorage();
    const onStorage = (e) => {
      if (
        ["cine_auth", "isLoggedIn", "userEmail", "cine_user_email"].includes(
          e.key
        )
      ) {
        readAuthFromStorage();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768 && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === "Escape") setIsMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKey);
    };
  }, [isMenuOpen]);

  const handleLogout = () => {
    localStorage.removeItem("cine_auth");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("cine_user_email");
    localStorage.clear();
    setIsLoggedIn(false);
    setUserEmail("");
    window.location.href = "/login";
  };

  const navItems = [
    { id: "home", label: "Home", icon: Home, path: "/" },
    { id: "movies", label: "Movies", icon: Film, path: "/movies" }, // <--- added Bookings
    { id: "releases", label: "Releases", icon: Calendar, path: "/releases" },
    { id: "contact", label: "Contact", icon: Mail, path: "/contact" },
    { id: "bookings", label: "Bookings", icon: Ticket, path: "/bookings" },
  ];

  return (
    <nav
      className={`${navbarStyles.nav.base} ${
        isScrolled ? navbarStyles.nav.scrolled : navbarStyles.nav.notScrolled
      }`}
      aria-label="Primary navigation"
    >
      <div className={navbarStyles.container}>
        {/* Logo */}
        <div className={navbarStyles.logoContainer}>
          <div className={navbarStyles.logoIconContainer}>
            <Clapperboard className={navbarStyles.logoIcon} />
          </div>
          <div className={navbarStyles.logoText}>CineVerse</div>
        </div>

        {/* Desktop Center Navigation (1024px+) */}
        <div className={navbarStyles.desktopNav}>
          <div className={navbarStyles.desktopNavItems}>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.id} className={navbarStyles.desktopNavItem}>
                  <NavLink
                    to={item.path}
                    end
                    className={({ isActive }) =>
                      `${navbarStyles.desktopNavLink.base} ${
                        isActive
                          ? navbarStyles.desktopNavLink.active
                          : navbarStyles.desktopNavLink.inactive
                      }`
                    }
                  >
                    <Icon className={navbarStyles.desktopNavIcon} aria-hidden />
                    <span>{item.label}</span>
                    <div className="pill-underline" aria-hidden="true" />
                  </NavLink>
                  <span className="pill-border" aria-hidden="true" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Section */}
        <div className={navbarStyles.rightSection}>
          {/* Tablet Navigation (768px - 1023px) */}
          <div className={navbarStyles.tabletNav}>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.id}
                  to={item.path}
                  end
                  className={({ isActive }) =>
                    `${navbarStyles.tabletNavLink.base} ${
                      isActive
                        ? navbarStyles.tabletNavLink.active
                        : navbarStyles.tabletNavLink.inactive
                    }`
                  }
                >
                  <Icon className={navbarStyles.tabletNavIcon} />
                  <span className={navbarStyles.tabletNavText}>
                    {item.label}
                  </span>
                </NavLink>
              );
            })}
          </div>

          {/* Auth Section */}
          <div className={navbarStyles.authSection}>
            {/* Desktop & Tablet Auth */}
            <div className={navbarStyles.desktopAuth}>
              {isLoggedIn ? (
                <button
                  onClick={handleLogout}
                  className={navbarStyles.logoutButton}
                  title={userEmail || "Logout"}
                >
                  <LogOut className={navbarStyles.authIcon} />
                  <span>Logout</span>
                </button>
              ) : (
                <a href="/login" className={navbarStyles.loginButton}>
                  <User className={navbarStyles.authIcon} />
                  <span>Login</span>
                </a>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <div className={navbarStyles.mobileMenuToggle}>
              <button
                onClick={() => setIsMenuOpen((s) => !s)}
                className={navbarStyles.mobileMenuButton}
                aria-expanded={isMenuOpen}
                aria-label="Toggle menu"
              >
                {isMenuOpen ? (
                  <X className={navbarStyles.mobileMenuIcon} />
                ) : (
                  <Menu className={navbarStyles.mobileMenuIcon} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Panel */}
        {isMenuOpen && (
          <div
            ref={menuRef}
            className={navbarStyles.mobileMenuPanel}
            role="dialog"
            aria-modal="true"
          >
            <div className={navbarStyles.mobileMenuItems}>
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    end
                    onClick={() => setIsMenuOpen(false)}
                    className={({ isActive }) =>
                      `${navbarStyles.mobileNavLink.base} ${
                        isActive
                          ? navbarStyles.mobileNavLink.active
                          : navbarStyles.mobileNavLink.inactive
                      }`
                    }
                  >
                    <Icon className={navbarStyles.mobileNavIcon} />
                    <span className={navbarStyles.mobileNavText}>
                      {item.label}
                    </span>
                  </NavLink>
                );
              })}

              <div className={navbarStyles.mobileAuthSection}>
                {isLoggedIn ? (
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleLogout();
                    }}
                    className={navbarStyles.mobileLogoutButton}
                  >
                    <LogOut className={navbarStyles.mobileAuthIcon} />
                    Logout
                  </button>
                ) : (
                  <a
                    href="/login"
                    className={navbarStyles.mobileLoginButton}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className={navbarStyles.mobileAuthIcon} />
                    Login
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{navbarCSS}</style>
    </nav>
  );
};

export default Navbar;
