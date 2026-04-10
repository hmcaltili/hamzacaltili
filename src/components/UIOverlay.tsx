import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { translations } from '../translations';
import type { Lang } from '../translations';

interface UIOverlayProps {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

export const UIOverlay = ({ lang, setLang }: UIOverlayProps) => {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [isManual, setIsManual] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const t = translations[lang];

  const handleEnter = () => setHasEntered(true);

  const handleCopy = (e: React.MouseEvent, text: string) => {
    e.preventDefault();
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => {
      setCopiedText(null);
    }, 2000);
  };
  const containerRef = useRef<HTMLElement>(null);
  const imgTopRef = useRef<HTMLImageElement>(null);
  const logoTopRef = useRef<HTMLDivElement>(null);
  const logoBottomRef = useRef<HTMLDivElement>(null);
  const scannerRef = useRef<HTMLDivElement>(null);

  const posRef = useRef(0);
  const directionRef = useRef(1); // 1 = right, -1 = left
  const isHoveringRef = useRef(false);
  const lastMouseXRef = useRef<number | null>(null);

  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number | null>(null);

  // Süre: %0'dan %100'e 6 saniyede (6000ms). Toplam gidiş dönüş döngü 12s.
  const speed = 100 / 6000;

  const updateVisuals = (pos: number) => {
    if (imgTopRef.current) {
      imgTopRef.current.style.clipPath = `inset(0 0 0 ${pos}%)`;
    }

    // Logo Katmanları için Dual-Clipping (İkili Kırpma)
    if (logoTopRef.current) {
      // İsmi sağ tarafta göster (Soldan silerek)
      logoTopRef.current.style.clipPath = `inset(0 0 0 ${pos}%)`;
    }
    if (logoBottomRef.current) {
      // Ünvanı sol tarafta göster (Sağdan silerek)
      logoBottomRef.current.style.clipPath = `inset(0 ${100 - pos}% 0 0)`;
    }

    if (scannerRef.current) {
      scannerRef.current.style.left = `${pos}%`;
    }
  };

  const animate = (time: number) => {
    // Eger hover yapılmıyorsa otomatik devam et
    if (!isHoveringRef.current) {
      if (lastTimeRef.current != null) {
        const deltaTime = time - lastTimeRef.current;
        let nextPos = posRef.current + (directionRef.current * speed * deltaTime);

        if (nextPos >= 100) {
          nextPos = 100;
          directionRef.current = -1;
        } else if (nextPos <= 0) {
          nextPos = 0;
          directionRef.current = 1;
        }

        posRef.current = nextPos;
        updateVisuals(nextPos);
      }
    }
    lastTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    // Component yüklendiğinde animasyonu başlatıyoruz.
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current || !imgTopRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const img = imgTopRef.current;
    
    // Görselin 'object-fit: contain' halindeki gerçek boyutlarını hesapla
    let renderedWidth = rect.width;
    let renderedHeight = rect.height;
    let imageX = 0;
    let imageY = 0;

    if (img.naturalWidth && img.naturalHeight) {
      const ratio = Math.min(rect.width / img.naturalWidth, rect.height / img.naturalHeight);
      renderedWidth = img.naturalWidth * ratio;
      renderedHeight = img.naturalHeight * ratio;
      imageX = (rect.width - renderedWidth) / 2;
      imageY = (rect.height - renderedHeight) / 2;
    } else {
      // Görsel henüz yüklenmediyse veya metadata gelmediyse 
      // Ekranın orta %60'lık alanını güvenli bölge kabul et
      renderedWidth = rect.width * 0.6;
      renderedHeight = rect.height * 0.6;
      imageX = rect.width * 0.2;
      imageY = rect.height * 0.2;
    }

    // Daha sıkı bir kontrol için sadece merkezdeki %40'lık alanı (makineyi) hedefle
    const strictWidth = renderedWidth * 0.4;
    const strictHeight = renderedHeight * 0.6;
    const strictX = imageX + (renderedWidth - strictWidth) / 2;
    const strictY = imageY + (renderedHeight - strictHeight) / 2;

    const isOverImage = 
      mouseX >= strictX && 
      mouseX <= strictX + strictWidth &&
      mouseY >= strictY && 
      mouseY <= strictY + strictHeight;

    if (isOverImage) {
      isHoveringRef.current = true;
      let x = e.clientX - rect.left;
      x = Math.max(0, Math.min(x, rect.width));

      if (lastMouseXRef.current !== null) {
        if (x > lastMouseXRef.current) directionRef.current = 1;
        else if (x < lastMouseXRef.current) directionRef.current = -1;
      }
      lastMouseXRef.current = x;

      const percentage = (x / rect.width) * 100;
      posRef.current = percentage;
      updateVisuals(percentage);
      if (!isManual) setIsManual(true);
    } else {
      // Makinenin üzerinde değilse otomatik moda geç
      if (isHoveringRef.current) {
        isHoveringRef.current = false;
        setIsManual(false);
        lastMouseXRef.current = null;
        lastTimeRef.current = performance.now();
      }
    }
  };

  const handleMouseLeave = () => {
    isHoveringRef.current = false;
    setIsManual(false);
    lastMouseXRef.current = null;
    lastTimeRef.current = performance.now();
  };

  return (
    <>
      {/* PlayStation giriş ekranı - sadece henüz girilmemişse göster */}
      {!hasEntered && (
        <div className="entry-overlay">
          <div className="entry-content">
            <div className="entry-hint">{t.entry.hint}</div>
            <div className="playstation-input">
              <div id="cross-input">
                <div id="cross-title">CROSS</div>
                <button id="cross" onClick={handleEnter}><p>x</p></button>
              </div>
              <div id="circle-input">
                <div id="circle-title">CIRCLE</div>
                <button id="circle"><div></div></button>
              </div>
              <div id="square-input">
                <div id="square-title">SQUARE</div>
                <button id="square"><div></div></button>
              </div>
              <div id="triangle-input">
                <div id="triangle-title">TRIANGLE</div>
                <button id="triangle"><p>△</p></button>
              </div>
            </div>
          </div>
          <div className="epilepsy-warning">
            {t.entry.epilepsy1}<br/>
            {t.entry.epilepsy2}
          </div>
        </div>
      )}
      <div className={`ui-container${!hasEntered ? ' entry-blurred' : ''}`}>
        <header className="ui-header">
          <div
            className="logo-group"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            style={{ cursor: 'pointer', pointerEvents: 'auto' }}
          >
            {/* Alttaki Katman: Ünvan (Sadece çizginin solunda kalan kısımda görünecek) */}
            <div className="logo-layer logo-bottom-layer" ref={logoBottomRef}>
              <div className="logo">{t.footer.role}</div>
            </div>
            {/* Üstteki Katman: İsim (Sadece çizginin sağında kalan kısımda görünecek) */}
            <div className="logo-layer logo-top-layer" ref={logoTopRef}>
              <div className="logo">Hamza Çaltılı</div>
            </div>
          </div>

          <div className="burger-menu" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <div className={`burger-line ${isMenuOpen ? 'open' : ''}`}></div>
            <div className={`burger-line ${isMenuOpen ? 'open' : ''}`}></div>
            <div className={`burger-line ${isMenuOpen ? 'open' : ''}`}></div>
          </div>

          <AnimatePresence>
            {isMenuOpen && (
              <motion.div 
                className="mobile-menu-overlay"
                initial={{ opacity: 0, x: '100%' }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              >
                <div className="mobile-menu-content">
                  <a href="#work" onClick={() => setIsMenuOpen(false)}>{t.nav.work}</a>
                  <a href="#about" onClick={() => setIsMenuOpen(false)}>{t.nav.about}</a>
                  <a href="#contact" onClick={() => setIsMenuOpen(false)}>{t.nav.contact}</a>
                  <div className="mobile-menu-divider" />
                  <a 
                    href="/CV/Hamza_Caltili_CV.pdf" 
                    download="Hamza_Caltili_CV.pdf" 
                    className="mobile-resume-link"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t.nav.resume}
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <nav className="nav-links">
            <a href="#work">{t.nav.work}</a>
            <a href="#about">{t.nav.about}</a>
            <div className="contact-wrapper">
              <a href="#contact">{t.nav.contact}</a>
              <div className="contact-dropdown">
                <a href="https://linkedin.com/in/hamza-çaltılı" target="_blank" rel="noopener noreferrer" className="contact-item">
                  <img src="/linkedin.png" alt="LinkedIn" style={{ width: '24px', height: '24px' }} />
                  @hamza.caltili
                </a>
                <a href="mailto:hamzaal300@gmail.com" className="contact-item" onClick={(e) => handleCopy(e, "hamzaal300@gmail.com")}>
                  {copiedText === "hamzaal300@gmail.com" ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                  )}
                  {copiedText === "hamzaal300@gmail.com" ? <span style={{ color: "#22c55e" }}>{lang === 'tr' ? 'Kopyalandı!' : 'Copied!'}</span> : "hamzaal300@gmail.com"}
                </a>
                <a href="tel:+9005342773404" className="contact-item" onClick={(e) => handleCopy(e, "+90 0534 277 34 04")}>
                  {copiedText === "+90 0534 277 34 04" ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                  )}
                  {copiedText === "+90 0534 277 34 04" ? <span style={{ color: "#22c55e" }}>{lang === 'tr' ? 'Kopyalandı!' : 'Copied!'}</span> : "+90 0534 277 34 04"}
                </a>
              </div>
            </div>
          </nav>

          <div className="nav-right">
            <div className="language-switcher">
              <button 
                className={`lang-btn ${lang === 'tr' ? 'active' : ''}`} 
                onClick={() => setLang('tr')}
              >
                TR
              </button>
              <span className="lang-divider">/</span>
              <button 
                className={`lang-btn ${lang === 'en' ? 'active' : ''}`} 
                onClick={() => setLang('en')}
              >
                EN
              </button>
            </div>
            <a 
              href="/CV/Hamza_Caltili_CV.pdf" 
              download="Hamza_Caltili_CV.pdf" 
              className="resume-link"
            >
              {t.nav.resume}
              <svg className="download-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </a>
          </div>
        </header>

        <main className="ui-main image-stack-container" ref={containerRef} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
          <div className="image-stack">
            <img src="/img4.png" alt="Portfolio 4" className="stacked-image img-bottom" />
            <img ref={imgTopRef} src="/img1.png" alt="Portfolio 1" className="stacked-image img-top" />

            {/* Dikey Kesici (Scanner) */}
            <div
              ref={scannerRef}
              className="vertical-scanner"
            >
              <div className={`scanner-feedback ${isManual ? 'visible' : ''}`}>
                <svg className="arrow-icon left" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
                <svg className="arrow-icon right" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
              </div>
            </div>
          </div>
        </main>

        <footer className="ui-footer">
          <a href="#work" className="scroll-down-arrow">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 16 18 9"></polyline>
            </svg>
          </a>
        </footer>
      </div>
    </>
  );
};
