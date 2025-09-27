import React, { useEffect, forwardRef } from 'react';
import { Users, Zap, Eye } from 'lucide-react';
import type { SimulationState, Metrics } from '../types/quantum';

interface SimulationCanvasProps {
  simulationState: SimulationState;
  metrics: Metrics;
}

export const SimulationCanvas = forwardRef<HTMLCanvasElement, SimulationCanvasProps>(
  ({ simulationState, metrics }, ref) => {
    const canvasRef = ref as React.RefObject<HTMLCanvasElement>;

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size
      const resizeCanvas = () => {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * window.devicePixelRatio;
        canvas.height = rect.height * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
      };

      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);

      // Animation loop
      const animate = () => {
        const rect = canvas.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Draw Alice (sender)
        drawNode(ctx, 80, height / 2, 'Alice', '#10b981', Users);

        // Draw Bob (receiver)
        drawNode(ctx, width - 80, height / 2, 'Bob', '#3b82f6', Users);

        // Draw channels
        const channelSpacing = Math.min(60, (height - 200) / Math.max(1, simulationState.settings.channelCount - 1));
        const startY = height / 2 - (channelSpacing * (simulationState.settings.channelCount - 1)) / 2;

        for (let i = 0; i < simulationState.settings.channelCount; i++) {
          const y = startY + i * channelSpacing;
          const channel = simulationState.channels[i];
          
          // Draw channel line
          ctx.beginPath();
          ctx.moveTo(120, y);
          ctx.quadraticCurveTo(width / 2, y + Math.sin(Date.now() / 1000 + i) * 20, width - 120, y);
          ctx.strokeStyle = channel?.hasError ? '#ef4444' : '#06b6d4';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Draw qubits
          if (channel?.qubits) {
            channel.qubits.forEach(qubit => {
              drawQubit(ctx, qubit.x, y + Math.sin(qubit.x / 50) * 10, qubit.isIntercepted);
            });
          }

          // Draw channel label
          ctx.fillStyle = '#94a3b8';
          ctx.font = '12px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`Channel ${i + 1}`, width / 2, y - 25);
        }

        // Draw Eve (eavesdropper) when intercepting
        if (simulationState.eveInterception.isActive) {
          drawEve(ctx, simulationState.eveInterception.x, simulationState.eveInterception.y);
        }

        // Draw phase indicator
        drawPhaseIndicator(ctx, width, simulationState.phase);

        requestAnimationFrame(animate);
      };

      if (simulationState.isRunning || simulationState.phase !== 'idle') {
        animate();
      }

      return () => {
        window.removeEventListener('resize', resizeCanvas);
      };
    }, [simulationState, canvasRef]);

    const drawNode = (ctx: CanvasRenderingContext2D, x: number, y: number, label: string, color: string, IconComponent: any) => {
      // Node circle
      ctx.beginPath();
      ctx.arc(x, y, 30, 0, 2 * Math.PI);
      ctx.fillStyle = color + '40';
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Inner glow
      ctx.beginPath();
      ctx.arc(x, y, 15, 0, 2 * Math.PI);
      ctx.fillStyle = color + '80';
      ctx.fill();

      // Label
      ctx.fillStyle = '#ffffff';
      ctx.font = '14px bold monospace';
      ctx.textAlign = 'center';
      ctx.fillText(label, x, y - 45);
    };

    const drawQubit = (ctx: CanvasRenderingContext2D, x: number, y: number, isIntercepted: boolean) => {
      ctx.save();
      
      // Outer glow
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, 8);
      gradient.addColorStop(0, isIntercepted ? '#ef444460' : '#06b6d460');
      gradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, 2 * Math.PI);
      ctx.fill();

      // Core
      ctx.fillStyle = isIntercepted ? '#ef4444' : '#06b6d4';
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctx.fill();

      ctx.restore();
    };

    const drawEve = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
      // Pulsing warning background
      ctx.save();
      const pulseIntensity = 0.3 + 0.4 * Math.sin(Date.now() / 200);
      ctx.fillStyle = `rgba(239, 68, 68, ${pulseIntensity})`;
      ctx.beginPath();
      ctx.arc(x, y, 35, 0, 2 * Math.PI);
      ctx.fill();

      // Inner warning circle
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(x, y, 20, 0, 2 * Math.PI);
      ctx.fill();

      // Lightning bolt effect
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x - 8, y - 10);
      ctx.lineTo(x + 2, y - 2);
      ctx.lineTo(x - 3, y + 2);
      ctx.lineTo(x + 8, y + 10);
      ctx.stroke();

      // Eye symbol overlay
      ctx.fillStyle = '#ef4444';
      ctx.font = '16px bold';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('👁', x + 15, y - 15);

      // Label
      ctx.fillStyle = '#ef4444';
      ctx.font = '12px bold monospace';
      ctx.fillText('EVE INTERCEPTING', x, y + 45);
      
      // Warning text
      ctx.fillStyle = '#fbbf24';
      ctx.font = '10px monospace';
      ctx.fillText('⚠ EAVESDROPPING DETECTED', x, y + 58);
      
      ctx.restore();
    };

    const drawPhaseIndicator = (ctx: CanvasRenderingContext2D, width: number, phase: string) => {
      const phaseLabels = {
        idle: 'Ready',
        keyGeneration: 'Generating Keys',
        transmission: 'Transmitting Qubits',
        errorDetection: 'Detecting Errors',
        keyRecovery: 'Recovering Keys',
        encryption: 'Encrypting Message',
        steganography: 'Embedding in Image',
        complete: 'Communication Complete'
      };

      ctx.fillStyle = '#ffffff';
      ctx.font = '14px bold monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`Phase: ${phaseLabels[phase] || phase}`, width - 20, 30);
    };

    return (
      <div className="relative w-full h-full">
        <canvas
          ref={canvasRef}
          className="w-full h-full rounded-xl"
          style={{ background: 'transparent' }}
        />
        
        {/* Status overlay */}
        <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-sm rounded-lg px-4 py-2">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${simulationState.isRunning ? 'bg-green-400 animate-pulse' : 'bg-slate-400'}`}></div>
            <span className="text-sm text-white font-medium">
              {simulationState.isRunning ? 'Simulation Running' : 'Simulation Paused'}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-sm rounded-lg p-3">
          <div className="text-xs text-slate-300 space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-cyan-400 rounded-full"></div>
              <span>Normal Qubit</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <span>Intercepted Qubit</span>
            </div>
            <div className="flex items-center space-x-2">
              <Eye className="w-3 h-3 text-red-400" />
              <span>Eve (Eavesdropper)</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
);