import React, { useRef, useEffect, useState } from 'react';

export const UIOverlay = () => {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [isManual, setIsManual] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);

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
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    const centerY = rect.height / 2;
    const scannerHeight = 360; // Bu değeri index.css'den aldık

    // Sadece çizgi boyu kadar olan dikey alanda (merkezden +/- 180px) etkileşim olsun
    const isInRange = Math.abs(mouseY - centerY) <= scannerHeight / 2;

    if (isInRange) {
      isHoveringRef.current = true;
      let x = e.clientX - rect.left;
      x = Math.max(0, Math.min(x, rect.width)); // X sınırlarının dışına çıkmasını engelle

      // Farenin anlık hareket yönüne göre animasyonun hangi yöne gideceğini ayarla
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
      // Menzil dışındaysa otomatik moda devam etsin
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
    lastTimeRef.current = performance.now(); // Animasyonun aniden zıplamasını önlemek için zamanı sıfırla
  };

  return (
    <>
      {/* PlayStation giriş ekranı - sadece henüz girilmemişse göster */}
      {!hasEntered && (
        <div className="entry-overlay">
          <div className="entry-hint">PRESS X TO START</div>
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
            <div className="logo">3D Artist / Graphic Designer</div>
          </div>
          {/* Üstteki Katman: İsim (Sadece çizginin sağında kalan kısımda görünecek) */}
          <div className="logo-layer logo-top-layer" ref={logoTopRef}>
            <div className="logo">Hamza Çaltılı</div>
          </div>
        </div>

        <nav className="nav-links">
          <a href="#work">Work</a>
          <a href="#about">About</a>
          <div className="contact-wrapper">
            <a href="#contact">Contact</a>
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
                {copiedText === "hamzaal300@gmail.com" ? <span style={{ color: "#22c55e" }}>Copied!</span> : "hamzaal300@gmail.com"}
              </a>
              <a href="tel:+9005342773404" className="contact-item" onClick={(e) => handleCopy(e, "+90 0534 277 34 04")}>
                {copiedText === "+90 0534 277 34 04" ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                )}
                {copiedText === "+90 0534 277 34 04" ? <span style={{ color: "#22c55e" }}>Copied!</span> : "+90 0534 277 34 04"}
              </a>
            </div>
          </div>
        </nav>

        <div className="nav-right">
          <a href="#resume" className="resume-link">My Resume</a>
        </div>
      </header>

      <main
        className="ui-main image-stack-container"
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className="image-stack">
          {/* Sabit olarak Altta IMG4 duracak */}
          <img src="/img4.png" alt="Portfolio 4" className="stacked-image img-bottom" />

          {/* Üstteki IMG1, Mouse Takip ile kırpılacak */}
          <img
            ref={imgTopRef}
            src="/img1.png"
            alt="Portfolio 1"
            className="stacked-image img-top"
          />

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
