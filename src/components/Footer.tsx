import { translations } from '../translations';
import type { Lang } from '../translations';

interface FooterProps {
  lang: Lang;
}

export function Footer({ lang }: FooterProps) {
  const t = translations[lang];
  return (
    <footer className="main-footer">
      <div className="footer-container">
        <div className="footer-logo">Hamza Çaltılı</div>
        
        <div className="footer-marquee">
          <div className="marquee-track">
            {/* Repeated text for continuous scroll */}
            {[...Array(6)].map((_, i) => (
              <div key={i} className="marquee-item">
                {t.footer.role} <span className="marquee-dot">•</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
