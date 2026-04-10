import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { translations } from '../translations';
import type { Lang } from '../translations';

interface AboutProps {
  lang: Lang;
}

export function About({ lang }: AboutProps) {
  const [jumpscareStep, setJumpscareStep] = useState<'idle' | 'video' | 'text'>('idle');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const t = translations[lang];

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.checked) {
      // Ses motorunu uyandır ve videoyu başlat
      if (videoRef.current) {
        videoRef.current.muted = false;
        videoRef.current.volume = 1;
        videoRef.current.currentTime = 0;
        videoRef.current.play().then(() => {
          setJumpscareStep('video');
        }).catch(err => {
          console.error("Video play failed:", err);
          setJumpscareStep('video');
        });
      } else {
        setJumpscareStep('video');
      }
    } else {
      setJumpscareStep('idle');
    }
  };

  const preloadVideo = () => {
    if (videoRef.current) {
      videoRef.current.load();
    }
  };

  const handleVideoEnded = () => {
    setJumpscareStep('text');
  };

  // Video bittiğinde veya iptal edildiğinde temizlik
  useEffect(() => {
    if (jumpscareStep === 'idle' && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [jumpscareStep]);

  return (
    <>
      <div 
        onClick={() => { if (jumpscareStep === 'text') setJumpscareStep('idle'); }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 999999,
          backgroundColor: 'black',
          display: jumpscareStep !== 'idle' ? 'flex' : 'none',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          color: 'white',
          cursor: jumpscareStep === 'text' ? 'pointer' : 'default'
        }}
      >
        <video 
          ref={videoRef}
          src="/jumpscare.mp4" 
          preload="auto"
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover',
            display: jumpscareStep === 'video' ? 'block' : 'none' 
          }}
          onEnded={handleVideoEnded}
        />

        {jumpscareStep === 'text' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            style={{ textAlign: 'center', padding: '2rem' }}
          >
            <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', marginBottom: '1rem', color: '#ffffff' }}>
              {t.about.jumpscareTitle} <span style={{ color: '#ff1818' }}>Five Nights at Freddy's :)</span>
            </h2>
            <p style={{ opacity: 0.5, fontStyle: 'italic' }}>{t.about.jumpscareReturn}</p>
          </motion.div>
        )}
      </div>

      <section id="about" className="about-section">
        <div className="about-container">
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="about-title"
          >
            {t.about.title}
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="about-content"
          >
            <div className="about-bio-wrapper">
              <p>{t.about.bio1}</p>
              
              <AnimatePresence>
                {(!isMobile || isExpanded) && (
                  <motion.div
                    initial={isMobile ? { opacity: 0, height: 0 } : { opacity: 1, height: 'auto' }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    style={{ overflow: 'hidden' }}
                    className="about-bio-expanded"
                  >
                    <p>{t.about.bio2}</p>
                    <p>{t.about.bio3}</p>
                    <p>{t.about.bio4}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {isMobile && (
                <button 
                  className={`read-more-btn ${isExpanded ? 'expanded' : ''}`} 
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded 
                    ? (lang === 'tr' ? 'Daha Az Gör' : 'Read Less')
                    : (lang === 'tr' ? 'Devamını Oku' : 'Read More')
                  }
                  <svg 
                    width="12" 
                    height="12" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="3" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }}
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="about-softwares"
          >
            <h3>{t.about.softwareTitle}</h3>
            <div className="softwares-grid">
              {[1, 6, 3, 2, 4, 5].map(num => (
                <img 
                  key={num} 
                  src={`/softwares/${num}.png`} 
                  alt={`Software ${num}`} 
                  className="software-icon" 
                />
              ))}
            </div>
          </motion.div>

          <div style={{ marginTop: '7rem', display: 'flex', justifyContent: 'center' }}>
            <label className="switch" onMouseEnter={preloadVideo} onPointerEnter={preloadVideo}>
              <input type="checkbox" defaultChecked onChange={handleSwitchChange} />
              <div className="button">
                <div className="light"></div>
                <div className="dots"></div>
                <div className="characters"></div>
                <div className="shine"></div>
                <div className="shadow"></div>
              </div>
            </label>
          </div>
          <p style={{ marginTop: '1.5rem', opacity: 0.6, fontStyle: 'italic', fontSize: '0.9rem' }}>
            {t.about.lightHint}
          </p>

        </div>
      </section>
    </>
  );
}