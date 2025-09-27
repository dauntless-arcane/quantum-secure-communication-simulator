import { useRef } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { Header } from './components/Header';
import { KeyDisplay } from './components/KeyDisplay';
import { MetricsDashboard } from './components/MetricsDashboard';
import { SimulationCanvas } from './components/SimulationCanvas';
import { SteganographyPanel } from './components/SteganographyPanel';
import { useQuantumSimulation } from './hooks/useQuantumSimulation';

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    simulationState,
    metrics,
    startSimulation,
    pauseSimulation,
    resetSimulation,
    updateSettings
  } = useQuantumSimulation(canvasRef);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />

      <div className="container mx-auto px-4 py-6 space-y-12">
        {/* ===== Top Grid ===== */}
        <div className="grid grid-cols-12 gap-6">
          {/* Control Panel */}
          <div className="col-span-12 lg:col-span-3">
            <ControlPanel
              settings={simulationState.settings}
              onUpdateSettings={updateSettings}
              onStart={startSimulation}
              onPause={pauseSimulation}
              onReset={resetSimulation}
              isRunning={simulationState.isRunning}
            />
          </div>

          {/* Main Simulation Canvas */}
          <div className="col-span-12 lg:col-span-6">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-cyan-500/30 h-full">
              <SimulationCanvas
                ref={canvasRef}
                simulationState={simulationState}
                metrics={metrics}
              />
            </div>
          </div>

          {/* Key Display */}
          <div className="col-span-12 lg:col-span-3">
            <KeyDisplay
              channels={simulationState.channels}
              keyData={simulationState.keyData}
              errorDetection={simulationState.errorDetection}
            />
          </div>
        </div>

        {/* ===== Bottom Grid ===== */}
        <div className="grid grid-cols-12 gap-6">
          {/* Metrics Dashboard */}
          <div className="col-span-12 lg:col-span-6">
            <MetricsDashboard metrics={metrics} />
          </div>

          {/* Steganography Panel */}
          <div className="col-span-12 lg:col-span-6">
            <SteganographyPanel
              coverImage={simulationState.settings.coverImage}
              encryptedMessage={simulationState.encryptedMessage}
              finalKey={simulationState.finalKey}
              originalMessage={simulationState.settings.message}
              isComplete={simulationState.phase === 'complete'}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
