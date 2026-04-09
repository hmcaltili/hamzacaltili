import { useState, useEffect, useRef } from 'react';
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
  { id: 7, title: 'Molecube', bgColor: '#141400', logo: '/logo/Molecube.png' },
  { id: 8, title: 'Unity Asset Store', bgColor: '#101010', logo: '/logo/UnityAssetStore.png' },
  { id: 4, title: 'İbraş', bgColor: '#1a0a00', logo: '/logo/4.png' },
];

const projectLinks: Record<number, string> = {
  8: "https://assetstore.unity.com/packages/3d/environments/urban/low-poly-farm-construction-pack-buildings-vehicles-326393",
  7: "https://www.instagram.com/molecube_design/",
  6: "https://www.celenoir.com/tum-urunler",
  5: "https://www.linkedin.com/company/takeover-technology/",
  2: "https://www.linkedin.com/company/gamestein/",
  4: "https://www.ibras.com/",
  3: "https://bionluk.com/hmcaltili"
};

function ScratchReveal({ claySrc, textureSrc }: { claySrc: string, textureSrc: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const objectPixelsRef = useRef<number[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = claySrc;
    img.onload = () => {
      const { naturalWidth: w, naturalHeight: h } = img;
      canvas.width = 1000;
      canvas.height = 1000;

      // Object-fit: cover mantığı (Canvas için)
      let sx, sy, sWidth, sHeight;
      const imageAspect = w / h;
      const targetAspect = 1; // 1000/1000

      if (imageAspect > targetAspect) {
        // Görsel daha genişse: Boyu tam al, yanlardan kırp
        sHeight = h;
        sWidth = h * targetAspect;
        sx = (w - sWidth) / 2;
        sy = 0;
      } else {
        // Görsel daha dikeyse: Eni tam al, üstten/alttan kırp
        sWidth = w;
        sHeight = w / targetAspect;
        sx = 0;
        sy = (h - sHeight) / 2;
      }

      ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, 1000, 1000);

      // Obje tespiti (Arka plandan ayırma) - Artık kırpılmış alan üzerinden
      const clayData = ctx.getImageData(0, 0, 1000, 1000).data;
      const objectIndices: number[] = [];

      for (let i = 0; i < clayData.length; i += 40) {
        const r = clayData[i];
        const g = clayData[i + 1];
        const b = clayData[i + 2];

        if (r + g + b > 50) {
          objectIndices.push(i + 3);
        }
      }
      objectPixelsRef.current = objectIndices;

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      console.log(`ScratchReveal: Adjusted for ${w}x${h} (Cover Mode). Found ${objectIndices.length} pixels.`);
    };
    img.onerror = () => {
      console.error("ScratchReveal: Failed to load clay image at", claySrc);
    };
  }, [claySrc]);

  const checkCompletion = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    try {
      const imageData = ctx.getImageData(0, 0, width, height).data;
      const objectIndices = objectPixelsRef.current;
      if (objectIndices.length === 0) return;

      let transparentObjectCount = 0;

      for (const index of objectIndices) {
        if (imageData[index] < 150) {
          transparentObjectCount++;
        }
      }

      const percentage = (transparentObjectCount / objectIndices.length) * 100;

      // Konsolda ilerlemeyi görmek için
      if (Math.random() > 0.9) console.log(`Object Colorize Progress: ${Math.round(percentage)}%`);

      if (percentage > 80 && !isCompleted) {
        console.log("Reveal COMPLETED!");
        setIsCompleted(true);
        ctx.clearRect(0, 0, width, height);
      }
    } catch (err) {
      console.warn("Canvas check error:", err);
    }
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (isCompleted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let x, y;

    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = (e as React.MouseEvent).clientX - rect.left;
      y = (e as React.MouseEvent).clientY - rect.top;
    }

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x * scaleX, y * scaleY, 60, 0, Math.PI * 2);
    ctx.fill();

    // Periyodik tamamlama kontrolü
    checkCompletion(ctx, canvas.width, canvas.height);
  };

  return (
    <div className={`scratch-reveal-container ${isCompleted ? 'completed' : ''}`} style={{ position: 'relative', width: '100%', aspectRatio: '1/1', overflow: 'hidden', borderRadius: '12px' }}>
      <img src={textureSrc} alt="Texture" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />

      {!isCompleted && (
        <canvas
          ref={canvasRef}
          onMouseMove={handleMove}
          onTouchMove={handleMove}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            cursor: 'crosshair',
            touchAction: 'none'
          }}
        />
      )}

      <div className="scratch-hint-wrapper">
        <motion.div
          key={isCompleted ? "thanks" : "hint"}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`scratch-hint ${isCompleted ? 'completed-text' : ''}`}
        >
          {isCompleted ? "THANK YOU" : "COLORIZE MY RENDER"}
        </motion.div>
      </div>
    </div>
  );
}

export function FeaturedWorks() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [gamesteinCategory, setGamesteinCategory] = useState<'buildings' | 'fruits' | 'characters'>('buildings');

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
                style={{
                  backgroundColor: project.bgColor,
                  marginLeft: index === 0 ? 0 : '-60px',
                  zIndex: projects.length - index,
                  cursor: (project.id === 6 || project.id === 4 || project.id === 7 || project.id === 8 || project.id === 5 || project.id === 3 || project.id === 2) ? 'pointer' : 'default'
                }}
                onClick={() => {
                  if (project.id === 6 || project.id === 4 || project.id === 7 || project.id === 8 || project.id === 5 || project.id === 3 || project.id === 2) {
                    setSelectedProject(project);
                  }
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
                  {(project.id === 6 || project.id === 4 || project.id === 7 || project.id === 8 || project.id === 5 || project.id === 3 || project.id === 2) ? (
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
                {projectLinks[selectedProject.id] ? (
                  <a
                    href={projectLinks[selectedProject.id]}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {selectedProject.title}
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </h3>
                  </a>
                ) : (
                  <h3>{selectedProject.title}</h3>
                )}
                <button className="render-modal-close" onClick={() => setSelectedProject(null)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              {/* Gamestein Sub-Navigation (Category Folders) */}
              {selectedProject.id === 2 && (
                <div className="render-category-tabs">
                  {[
                    { id: 'buildings', label: 'Buildings', icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
                    { id: 'fruits', label: 'Fruits', icon: 'M12 22c4.97 0 9-3.582 9-8s-4.03-8-9-8-9 3.582-9 8 4.03 8 9 8z M12 6V2' },
                    { id: 'characters', label: 'Characters', icon: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 3a4 4 0 1 0 0 8 4 4 0 1 0 0-8z' }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      className={`category-tab ${gamesteinCategory === cat.id ? 'active' : ''}`}
                      onClick={() => setGamesteinCategory(cat.id as any)}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d={cat.icon} />
                      </svg>
                      {cat.label}
                    </button>
                  ))}
                </div>
              )}

              <div className={`render-cards-grid ${selectedProject?.id === 5 ? 'grid-3x2' : ''}`}>
                {selectedProject.id === 6 && (
                  <ScratchReveal
                    claySrc="/renders/clay.png"
                    textureSrc="/renders/texture.png"
                  />
                )}

                {selectedProject.id === 4 && [1, 2, 3].map((num) => (
                  <div key={`ibras-${num}`} className="render-card hover-swap-card molecube-card">
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

                {selectedProject.id === 2 && (
                  <>
                    {gamesteinCategory === 'buildings' && Array.from({ length: 27 }, (_, i) => i + 1).map((num) => (
                      <div key={`gs-buildings-${num}`} className="render-card molecube-card hover-swap-card">
                        <img
                          src={`/renders/gamestein/buildings/${num}clay.png`}
                          alt={`Building Clay ${num}`}
                          className="render-card-img img-hover"
                        />
                        <img
                          src={`/renders/gamestein/buildings/${num}texture.png`}
                          alt={`Building Texture ${num}`}
                          className="render-card-img img-default"
                        />
                      </div>
                    ))}
                    {gamesteinCategory === 'fruits' && Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                      <div key={`gs-fruits-${num}`} className="render-card molecube-card hover-swap-card">
                        <img
                          src={`/renders/gamestein/fruits/f${num}clay.png`}
                          alt={`Fruit Clay ${num}`}
                          className="render-card-img img-hover"
                        />
                        <img
                          src={`/renders/gamestein/fruits/f${num}texture.png`}
                          alt={`Fruit Texture ${num}`}
                          className="render-card-img img-default"
                        />
                      </div>
                    ))}
                    {gamesteinCategory === 'characters' && [
                      { title: "Michi(Gamestein)", id: "710b17560c004022bf272d69eae0cc69" },
                      { title: "Mano(Gamestein)", id: "60ccfedcd1184282aa75bbde7702403a" }
                    ].map((model) => (
                      <div key={model.id} className="render-card molecube-card" style={{ cursor: 'default' }}>
                        <div className="sketchfab-embed-wrapper" style={{ width: '100%', height: '100%' }}>
                          <iframe
                            title={model.title}
                            src={`https://sketchfab.com/models/${model.id}/embed?autostart=1&preload=1`}
                            allowFullScreen
                            allow="autoplay; fullscreen; xr-spatial-tracking; web-share"
                            style={{ width: '100%', height: '100%', border: 'none' }}
                          />
                        </div>
                      </div>
                    ))}
                  </>
                )}

                {selectedProject.id === 3 && [1, 2, 3, 4, 5].map((num) => (
                  <div key={`bionluk-${num}`} className="render-card molecube-card hover-swap-card">
                    <img
                      src={`/renders/bionluk/${num}clay.png`}
                      alt={`Bionluk Clay Render ${num}`}
                      className="render-card-img img-hover"
                    />
                    <img
                      src={`/renders/bionluk/${num}texture.png`}
                      alt={`Bionluk Texture Render ${num}`}
                      className="render-card-img img-default"
                    />
                  </div>
                ))}

                {selectedProject.id === 5 && [
                  { name: 'pistol', tex: '_texture', clay: '_clay' },
                  { name: 'magazine_out', tex: '', clay: '_clay' },
                  { name: 'rifle', tex: '_texture', clay: '_clay' },
                  { name: 'meat', tex: '_texture', clay: '_clay' },
                  { name: 'fridge', tex: '_texture', clay: '_clay' },
                  { name: 'corner', tex: '_texture', clay: '_clay' }
                ].map((item) => (
                  <div key={`takeover-${item.name}`} className="render-card molecube-card hover-swap-card">
                    <img
                      src={`/renders/takeover/${item.name}${item.clay}.png`}
                      alt={`${item.name} Clay Render`}
                      className="render-card-img img-hover"
                    />
                    <img
                      src={`/renders/takeover/${item.name}${item.tex}.png`}
                      alt={`${item.name} Texture Render`}
                      className="render-card-img img-default"
                    />
                  </div>
                ))}

                {selectedProject.id === 7 && ['batman', 'fc', 'harry', 'starwars'].map((name) => (
                  <div key={`molecube-${name}`} className="render-card molecube-card hover-swap-card">
                    <img
                      src={`/renders/Molecube/${name}_clay.png`}
                      alt={`${name} Clay Render`}
                      className="render-card-img img-hover"
                      onError={(e) => {
                        // Eğer clay görseli yoksa grayscale filtre ile simüle et (fallback)
                        (e.target as HTMLImageElement).style.filter = 'grayscale(1) brightness(0.7)';
                        (e.target as HTMLImageElement).src = `/renders/Molecube/${name}.png`;
                      }}
                    />
                    <img
                      src={`/renders/Molecube/${name}.png`}
                      alt={`${name} Texture Render`}
                      className="render-card-img img-default"
                    />
                  </div>
                ))}

                {selectedProject.id === 8 && [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                  <div key={`unity-${num}`} className="render-card">
                    <img
                      src={`/renders/unity/${num}.png`}
                      alt={`Unity Render ${num}`}
                      className="render-card-img"
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