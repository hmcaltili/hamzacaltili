import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';

export function About() {
  const [jumpscareStep, setJumpscareStep] = useState<'idle' | 'video' | 'text'>('idle');
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.checked) {
      // Ses motorunu uyandır ve videoyu başlat
      if (videoRef.current) {
        videoRef.current.muted = false;
        videoRef.current.volume = 1;
        videoRef.current.currentTime = 0;
        videoRef.current.play().then(() => {
          // Video oynamaya başladığında (ses hazır olduğunda) gösterimi başlat
          setJumpscareStep('video');
        }).catch(err => {
          console.error("Video play failed:", err);
          setJumpscareStep('video');
        });
      } else {
        setJumpscareStep('video');
      }
    }
  };

  const preloadVideo = () => {
    if (videoRef.current && jumpscareStep === 'idle') {
      videoRef.current.load();
    }
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
          onEnded={() => setJumpscareStep('text')}
        />

        {jumpscareStep === 'text' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            style={{ textAlign: 'center', padding: '2rem' }}
          >
            <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', marginBottom: '1rem', color: '#ffffff' }}>
              I told you my favorite game was <span style={{ color: '#ff1818' }}>Five Nights at Freddy's :)</span>
            </h2>
            <p style={{ opacity: 0.5, fontStyle: 'italic' }}>Click anywhere to return</p>
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
            ABOUT
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="about-content"
          >
            <p>
              I’m Hamza Mücahit Çaltılı, a 3D Artist with about four years of active experience in the 3D art world.
            </p>
            <p>
              I don't just build models; I am passionate about the entire technical pipeline, from rigging to animation, and I truly enjoy sharing that knowledge through teaching. Throughout my career, I’ve worked on a diverse range of projects—from educational games and NFT collections to hybrid-casual mobile titles. I thrive in collaborative environments where I can work closely with game designers to produce optimized, high-quality low-poly assets that enhance the overall player experience.
            </p>
            <p>
              I am excited about the possibility of bringing my technical skills and creative energy to your team. You can find examples of my work on Work Section. By the way, my favorite game is Five Nights at Freddy's :)
            </p>
            <p>
              I look forward to hearing from you!
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="about-softwares"
          >
            <h3>Softwares That I Use</h3>
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
            Don't forget to turn the lights off before you leave!
          </p>

        </div>
      </section>
    </>
  );
}
