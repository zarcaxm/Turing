import './styles/terminal.css';
import './styles/crt-effects.css';
import { Screen } from './components/Terminal/Screen';

function App() {

  return (
    <div className="monitor-frame">
      <div className="monitor-bezel">
        <div className="screen-recess">
          <Screen />
        </div>

        <div className="bezel-bottom">
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
