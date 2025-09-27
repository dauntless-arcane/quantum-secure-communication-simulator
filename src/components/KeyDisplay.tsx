import React from 'react';
import { Key, AlertTriangle, CheckCircle } from 'lucide-react';
import type { QuantumChannel, KeyData, ErrorDetection } from '../types/quantum';

interface KeyDisplayProps {
  channels: QuantumChannel[];
  keyData: KeyData;
  errorDetection: ErrorDetection;
}

export function KeyDisplay({ channels, keyData, errorDetection }: KeyDisplayProps) {
  const formatBinaryString = (binary: string, maxLength: number = 32) => {
    if (binary.length <= maxLength) return binary;
    return binary.slice(0, maxLength) + '...';
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-cyan-500/30 p-6 h-full">
      <div className="flex items-center space-x-2 mb-6">
        <Key className="h-5 w-5 text-cyan-400" />
        <h2 className="text-lg font-semibold text-white">Quantum Key Status</h2>
      </div>

      <div className="space-y-6 overflow-y-auto max-h-[calc(100%-80px)]">
        {/* Channel Keys */}
        <div>
          <h3 className="text-sm font-medium text-slate-300 mb-3">Channel Keys</h3>
          <div className="space-y-3">
            {channels.map((channel, index) => (
              <div key={index} className="bg-slate-700/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-300">
                    Channel {index + 1}
                  </span>
                  <div className="flex items-center space-x-1">
                    {channel.hasError ? (
                      <AlertTriangle className="h-4 w-4 text-red-400" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    )}
                    <span className={`text-xs ${channel.hasError ? 'text-red-400' : 'text-green-400'}`}>
                      {channel.hasError ? 'Errors Detected' : 'Clean'}
                    </span>
                  </div>
                </div>
                <div className="font-mono text-xs text-slate-200 bg-slate-800/50 rounded p-2 break-all">
                  {formatBinaryString(channel.key || '0000000000000000')}
                </div>
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>Length: {channel.key?.length || 0} bits</span>
                  <span>Fidelity: {((1 - (channel.errorRate || 0)) * 100).toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Final Key */}
        {keyData.finalKey && (
          <div>
            <h3 className="text-sm font-medium text-slate-300 mb-3">Final Recovered Key</h3>
            <div className="bg-gradient-to-r from-cyan-600/20 to-purple-600/20 rounded-lg p-4 border border-cyan-500/30">
              <div className="font-mono text-xs text-white bg-slate-800/50 rounded p-3 break-all">
                {formatBinaryString(keyData.finalKey)}
              </div>
              <div className="flex justify-between text-xs text-slate-300 mt-2">
                <span>Length: {keyData.finalKey.length} bits</span>
                <span>Entropy: {keyData.entropy?.toFixed(3) || 'N/A'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Error Detection Status */}
        <div>
          <h3 className="text-sm font-medium text-slate-300 mb-3">Error Detection</h3>
          <div className="bg-slate-700/50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <div className="text-slate-400">Errors Detected</div>
                <div className="text-red-400 font-bold text-lg">
                  {errorDetection.errorsDetected}
                </div>
              </div>
              <div>
                <div className="text-slate-400">Errors Corrected</div>
                <div className="text-green-400 font-bold text-lg">
                  {errorDetection.errorsCorrected}
                </div>
              </div>
              <div>
                <div className="text-slate-400">Recovery Rate</div>
                <div className="text-cyan-400 font-bold text-lg">
                  {errorDetection.recoveryRate ? (errorDetection.recoveryRate * 100).toFixed(1) + '%' : '0%'}
                </div>
              </div>
              <div>
                <div className="text-slate-400">Key Fidelity</div>
                <div className="text-purple-400 font-bold text-lg">
                  {keyData.fidelity ? (keyData.fidelity * 100).toFixed(1) + '%' : '0%'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Status */}
        <div>
          <h3 className="text-sm font-medium text-slate-300 mb-3">Security Assessment</h3>
          <div className={`rounded-lg p-4 border ${
            keyData.isSecure 
              ? 'bg-green-600/20 border-green-500/30 text-green-300'
              : 'bg-red-600/20 border-red-500/30 text-red-300'
          }`}>
            <div className="flex items-center space-x-2">
              {keyData.isSecure ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
              <span className="text-sm font-medium">
                {keyData.isSecure ? 'Key is Secure' : 'Key Compromised'}
              </span>
            </div>
            <div className="text-xs mt-1 opacity-80">
              {keyData.isSecure 
                ? 'Quantum key distribution successful with acceptable error rate'
                : 'High error rate detected - possible eavesdropping attempt'
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}