import { useState } from 'react';
import { UIOverlay } from './components/UIOverlay';
import { FeaturedWorks } from './components/FeaturedWorks';
import { About } from './components/About';
import { Footer } from './components/Footer';
import type { Lang } from './translations';
import './index.css';

function App() {
  const [lang, setLang] = useState<Lang>('en');

  return (
    <>
      <div className="hero-wrapper">
        <UIOverlay lang={lang} setLang={setLang} />
      </div>
      <FeaturedWorks lang={lang} />
      <About lang={lang} />
      <Footer lang={lang} />
    </>
  );
}

export default App;
