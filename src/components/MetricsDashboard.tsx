import React from 'react';
import { Activity, Zap, Shield, Target } from 'lucide-react';
import type { Metrics } from '../types/quantum';

interface MetricsDashboardProps {
  metrics: Metrics;
}

export function MetricsDashboard({ metrics }: MetricsDashboardProps) {
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat().format(num);
  };

  const formatPercentage = (value: number): string => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const metricCards = [
    {
      title: 'Transmitted Qubits',
      value: formatNumber(metrics.transmittedQubits),
      icon: Zap,
      color: 'from-blue-500 to-cyan-500',
      description: 'Total quantum bits sent'
    },
    {
      title: 'Intercepted Qubits',
      value: formatNumber(metrics.interceptedQubits),
      icon: Target,
      color: 'from-red-500 to-orange-500',
      description: 'Qubits compromised by Eve'
    },
    {
      title: 'Final Key Length',
      value: `${metrics.finalKeyLength} bits`,
      icon: Shield,
      color: 'from-green-500 to-emerald-500',
      description: 'Secure key bits generated'
    },
    {
      title: 'Success Rate',
      value: formatPercentage(metrics.successRate),
      icon: Activity,
      color: 'from-purple-500 to-pink-500',
      description: 'Communication success'
    }
  ];

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-cyan-500/30 p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Activity className="h-5 w-5 text-cyan-400" />
        <h2 className="text-lg font-semibold text-white">Metrics Dashboard</h2>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((card, index) => (
          <div
            key={index}
            className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/50 hover:border-cyan-500/50 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg bg-gradient-to-r ${card.color} bg-opacity-20`}>
                <card.icon className={`h-4 w-4 text-white`} />
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-white">{card.value}</div>
                <div className="text-xs text-slate-400">{card.title}</div>
              </div>
            </div>
            <div className="text-xs text-slate-400">
              {card.description}
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Statistics */}
      <div className="mt-6">
        <h3 className="text-sm font-medium text-slate-300 mb-4">Detailed Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-700/30 rounded-lg p-4">
            <h4 className="text-sm font-medium text-slate-300 mb-3">Channel Performance</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Average Error Rate:</span>
                <span className="text-white">{formatPercentage(metrics.averageErrorRate)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Redundancy Usage:</span>
                <span className="text-white">{formatPercentage(metrics.redundancyUsage)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Key Fidelity:</span>
                <span className="text-white">{formatPercentage(metrics.keyFidelity)}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-700/30 rounded-lg p-4">
            <h4 className="text-sm font-medium text-slate-300 mb-3">Security Metrics</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Eavesdropping Detected:</span>
                <span className={metrics.eavesdroppingDetected ? 'text-red-400' : 'text-green-400'}>
                  {metrics.eavesdroppingDetected ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Privacy Amplification:</span>
                <span className="text-white">{formatPercentage(metrics.privacyAmplification)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Communication Secure:</span>
                <span className={metrics.isSecureCommunication ? 'text-green-400' : 'text-red-400'}>
                  {metrics.isSecureCommunication ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Indicators */}
      <div className="mt-6">
        <h3 className="text-sm font-medium text-slate-300 mb-4">Progress Indicators</h3>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Key Generation Progress</span>
              <span>{formatPercentage(metrics.keyGenerationProgress)}</span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${metrics.keyGenerationProgress * 100}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Error Correction Progress</span>
              <span>{formatPercentage(metrics.errorCorrectionProgress)}</span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${metrics.errorCorrectionProgress * 100}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-400 mb-1">
              <span>Steganography Progress</span>
              <span>{formatPercentage(metrics.steganographyProgress)}</span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${metrics.steganographyProgress * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}