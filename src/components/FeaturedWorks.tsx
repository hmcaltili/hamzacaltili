import { motion } from 'framer-motion';

interface Project {
  id: number;
  title: string;
  bgColor: string;
  logo: string;
}

const projects: Project[] = [
  { id: 1, title: 'UES',       bgColor: '#0a0a1a', logo: '/logo/1.png' },
  { id: 2, title: 'Gamestein', bgColor: '#0d0014', logo: '/logo/2.png' },
  { id: 3, title: 'Bionluk',   bgColor: '#0a0b14', logo: '/logo/3.png' },
  { id: 5, title: 'Takeover',  bgColor: '#1a000a', logo: '/logo/Takeover.png' },
  { id: 4, title: 'İbraş',     bgColor: '#1a0a00', logo: '/logo/4.png' },
];

export function FeaturedWorks() {
  return (
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
                marginLeft: index === 0 ? 0 : '-40px',
                zIndex: projects.length - index,
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
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
