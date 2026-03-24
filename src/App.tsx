import { useState } from 'react';
import './styles/terminal.css';
import './styles/crt-effects.css';
import { Screen } from './components/Terminal/Screen';

function App() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    setIsFullscreen(prev => !prev);
  };

  return (
    <div className={`monitor-frame${isFullscreen ? ' is-fullscreen' : ''}`}>
      <div className={`monitor-bezel${isFullscreen ? ' is-fullscreen' : ''}`}>
        <div className={`screen-recess${isFullscreen ? ' is-fullscreen' : ''}`}>
          <Screen
            isFullscreen={isFullscreen}
            onToggleFullscreen={toggleFullscreen}
          />
        </div>

        <div className={`bezel-bottom${isFullscreen ? ' is-fullscreen' : ''}`}>
          <div className="bezel-vent-group">
            <div className="bezel-vent"></div>
            <div className="bezel-vent"></div>
            <div className="bezel-vent"></div>
            <div className="bezel-vent"></div>
            <div className="bezel-vent"></div>
          </div>

          <div className="monitor-controls">
            <div className="power-led"></div>
            <span className="monitor-label">WEYLAND-YUTANI</span>
          </div>

          <div className="bezel-vent-group">
            <div className="bezel-vent"></div>
            <div className="bezel-vent"></div>
            <div className="bezel-vent"></div>
            <div className="bezel-vent"></div>
            <div className="bezel-vent"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
