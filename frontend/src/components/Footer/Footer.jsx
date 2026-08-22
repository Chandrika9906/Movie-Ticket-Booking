import React, { useEffect, useState } from 'react';
import { 
  Clapperboard, 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube, 
  Mail, 
  Phone, 
  MapPin,
  Heart,
  ArrowUp,
  Film,
  Star,
  Ticket,
  Popcorn
} from 'lucide-react';
import { footerStyles } from '../../assets/dummyStyles';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [isVisible, setIsVisible] = useState(false);
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const links = [
    { label: "Home", href: "/" },
    { label: "Movies", href: "/movies" },
    { label: "Releases", href: "/releases" },
    { label: "Contact", href: "/contact" },
    { label: "Login", href: "/login" }
  ];
  
  const genreLinks = [
    { label: "Horror", href: "/movies" },
    { label: "Thriller", href: "/movies" },
    { label: "Action", href: "/movies" },
    { label: "Drama", href: "/movies" },
    { label: "Comedy", href: "/movies" },
  ];

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  // Array of icon components for the floating animation
  const floatingIcons = [Clapperboard, Film, Star, Ticket, Popcorn];

  return (
    <footer className={footerStyles.footer}>
      {/* Animated border */}
      <div className={footerStyles.animatedBorder} />

      {/* Animated background elements */}
      <div className={footerStyles.bgContainer}>
        {/* left/top glow: smaller on small screens */}
        <div className={footerStyles.bgGlow1} />
        {/* bottom/right glow: responsive sizes */}
        <div className={footerStyles.bgGlow2} />
      </div>

      {/* Floating icons - hidden on small devices to avoid overlap; still visible on md+ (tablet & desktop) */}
      <div className={footerStyles.floatingIconsContainer}>
        {[...Array(12)].map((_, i) => {
          const IconComponent = floatingIcons[i % floatingIcons.length];
          // Use deterministic-ish positions so layout is stable across renders on same screen size:
          const left = (i * 23) % 100; // simple spread
          const top = (i * 17) % 100;
          const dur = 6 + (i % 5);
          const delay = (i % 4) * 0.6;
          return (
            <div
              key={i}
              className={footerStyles.floatingIcon}
              style={{
                left: `${left}%`,
                top: `${top}%`,
                animation: `float ${dur}s infinite ease-in-out`,
                animationDelay: `${delay}s`
              }}
            >
              <IconComponent className="w-8 h-8" />
            </div>
          );
        })}
      </div>

      {/* Main footer content */}
      <div className={footerStyles.mainContainer}>
        <div className={footerStyles.gridContainer}>
          {/* Brand section */}
          <div className={footerStyles.brandContainer}>
            <div className={footerStyles.brandLogoContainer}>
              <div className="relative">
                <div className={footerStyles.logoGlow} />
                <div className={footerStyles.logoContainer}>
                  <Clapperboard className={footerStyles.logoIcon} />
                </div> 
              </div>
              <h2
                className={footerStyles.brandTitle}
                style={{ fontFamily: "Monoton, cursive" }}
              >
                Cine<span className={footerStyles.brandTitleWhite}>Verse</span>
              </h2>
            </div>
            <p className={footerStyles.brandDescription}>
              Experience the dark side of cinema with the latest news, reviews, and exclusive content.
            </p>
            <div className={footerStyles.socialContainer}>
              {[
                { Icon: Facebook, href: "#" },
                { Icon: Twitter, href: "#" },
                { Icon: Instagram, href: "https://www.instagram.com/chandrika_9906/" },
                { Icon: Youtube, href: "https://www.youtube.com/@ChandrikaM-r8w" }
              ].map((item, index) => (
                <a 
                  key={index}
                  href={item.href}
                  target={item.href !== "#" ? "_blank" : undefined}
                  rel={item.href !== "#" ? "noopener noreferrer" : undefined}
                  className={footerStyles.socialLink}
                  aria-label={`Visit our ${item.Icon.name || 'social'} page`}
                >
                  <item.Icon className={footerStyles.socialIcon} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className={footerStyles.sectionHeader}>
              <div className={footerStyles.sectionDot} />
              Explore
            </h3>
            <ul className={footerStyles.linksList}>
              {links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className={footerStyles.linkItem}
                    aria-label={link.label}
                  >
                    <span className={footerStyles.linkDot} />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Genres */}
          <div>
            <h3 className={footerStyles.sectionHeader}>
              <div className={footerStyles.sectionDot} />
              Genres
            </h3>
            <ul className={footerStyles.linksList}>
              {genreLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className={footerStyles.linkItem}
                    aria-label={link.label}
                  >
                    <div className={footerStyles.linkDot} />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className={footerStyles.sectionHeader}>
              <div className={footerStyles.sectionDot} />
              Contact Us
            </h3>
            <ul className={footerStyles.contactList}>
              <li className={footerStyles.contactItem}>
                <div className={footerStyles.contactIconContainer}>
                  <Mail className={footerStyles.contactIcon} />
                </div>
                <span className={footerStyles.contactText}>chandrika993006@gmail.com</span>
              </li>
              <li className={footerStyles.contactItem}>
                <div className={footerStyles.contactIconContainer}>
                  <Phone className={footerStyles.contactIcon} />
                </div>
                <span className={footerStyles.contactText}>+91 9042200974</span>
              </li>
              <li className={footerStyles.contactItem}>
                <div className={footerStyles.contactIconContainer}>
                  <MapPin className={footerStyles.contactIcon} />
                </div>
                <span className={footerStyles.contactText}>OMR, Chennai, 600119</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className={footerStyles.divider}>
          <div className={footerStyles.dividerIconContainer}>
            <Film className={footerStyles.dividerIcon} />
          </div>
        </div>

        {/* Bottom bar */}
        <div className={footerStyles.bottomBar}>
          {/* Center: Designed by (plain text) + Chandrika M (link only) */}
          <div className={footerStyles.designedBy}>
            <span className={footerStyles.designedByText}>Designed by</span>
            <a
              href="https://chandrika-portfolio-ruby.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className={footerStyles.designedByLink}
              aria-label="Chandrika M Portfolio"
            >
              Chandrika M
            </a>
          </div>
          
          <div className={footerStyles.policyLinks}>
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item, index) => (
              <a 
                key={index}
                href="#" 
                className={footerStyles.policyLink}
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
      {/* Scroll to top button */}
      {isVisible && (
        <button 
          onClick={scrollToTop}
          className={footerStyles.scrollTopButton}
          aria-label="Scroll to top"
        >
          <ArrowUp className={footerStyles.scrollTopIcon} />
        </button>
      )}

      {/* Custom styles for animations */}
      <style>{footerStyles.customCSS}</style>
    </footer>
  );
};

export default Footer;