import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Project {
  id: number;
  title: string;
  bgColor: string;
  logo: string;
}

const projects: Project[] = [
  { id: 1, title: 'UES', bgColor: '#0a0a1a', logo: '/logo/1.png' },
  { id: 2, title: 'Gamestein', bgColor: '#0d0014', logo: '/logo/2.png' },
  { id: 3, title: 'Bionluk', bgColor: '#0a0b14', logo: '/logo/3.png' },
  { id: 5, title: 'Takeover', bgColor: '#1a000a', logo: '/logo/Takeover.png' },
  { id: 6, title: 'Célenoir', bgColor: '#0a0a1a', logo: '/logo/Celenoir.png' },
  { id: 4, title: 'İbraş', bgColor: '#1a0a00', logo: '/logo/4.png' },
];

export function FeaturedWorks() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Modal açıkken body scroll'unu kilitle
  useEffect(() => {
    if (selectedProject) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedProject]);

  return (
    <>
      <section id="work" className="featured-works-section">
        <div className="featured-works-container">
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="featured-works-title"
          >
            WORK
          </motion.h2>

          <div className="card-stack-wrapper">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, x: -60, rotateZ: -15, rotateY: -20 }}
                whileInView={{ opacity: 1, x: 0, rotateZ: -10, rotateY: -15 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                viewport={{ once: true }}
                className="stack-card"
                onClick={() => {
                  if (project.id === 6 || project.id === 4) { // Celenoir veya İbraş
                    setSelectedProject(project);
                  }
                }}
                style={{
                  backgroundColor: project.bgColor,
                  marginLeft: index === 0 ? 0 : '-40px',
                  zIndex: projects.length - index,
                  cursor: (project.id === 6 || project.id === 4) ? 'pointer' : 'default' // Tıklanabilir projeler
                }}
              >
                {/* Shine overlay */}
                <div className="card-shine" />

                {/* Logo */}
                <div className="card-logo-wrapper">
                  <img
                    src={project.logo}
                    alt={project.title}
                    className="card-logo"
                  />
                </div>

                {/* Hover title pill */}
                <div className="card-title-pill">
                  <span>{project.title}</span>
                  {(project.id === 6 || project.id === 4) ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 3h6v6" />
                      <path d="M9 21H3v-6" />
                      <path d="M21 3l-7 7" />
                      <path d="M3 21l7-7" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Render Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div
            className="render-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedProject(null)}
          >
            <motion.div
              className="render-modal-content"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()} // Arkaya tıklanınca kapanması için
            >
              <div className="render-modal-header">
                <h3>{selectedProject.title}</h3>
                <button className="render-modal-close" onClick={() => setSelectedProject(null)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              
              <div className="render-cards-grid">
                {selectedProject.id === 6 && (
                  <div className="render-card hover-swap-card">
                    <span style={{ position: 'absolute', zIndex: 1, pointerEvents: 'none', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      Yükleniyor...
                    </span>
                    <img 
                      src={`/renders/clay.png`} 
                      alt="Célenoir Clay Render" 
                      className="render-card-img img-hover"
                    />
                    <img 
                      src={`/renders/texture.png`} 
                      alt="Célenoir Texture Render" 
                      className="render-card-img img-default"
                    />
                  </div>
                )}

                {selectedProject.id === 4 && [1, 2, 3].map((num) => (
                  <div key={`ibras-${num}`} className="render-card hover-swap-card">
                    <span style={{ position: 'absolute', zIndex: 1, pointerEvents: 'none', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      Yükleniyor...
                    </span>
                    {/* Hover Yapıldığında Görünecek Görsel (Clay) - Alta Yerleştirilir */}
                    <img 
                      src={`/renders/ibras/${num}clay.png`} 
                      alt={`İbraş Clay Render ${num}`} 
                      className="render-card-img img-hover"
                    />
                    {/* Varsayılan Görsel (Texture) - Üste Yerleştirilir ve Hover'da Silikleşir */}
                    <img 
                      src={`/renders/ibras/${num}texture.png`} 
                      alt={`İbraş Texture Render ${num}`} 
                      className="render-card-img img-default"
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
