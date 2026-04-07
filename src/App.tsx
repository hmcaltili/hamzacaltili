import { UIOverlay } from './components/UIOverlay';
import { FeaturedWorks } from './components/FeaturedWorks';
import { About } from './components/About';
import { Footer } from './components/Footer';
import './index.css';

function App() {
  return (
    <>
      <div className="hero-wrapper">
        <UIOverlay />
      </div>
      <FeaturedWorks />
      <About />
      <Footer />
    </>
  );
}

export default App;
