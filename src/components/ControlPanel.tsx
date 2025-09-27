import React from 'react';
import { Play, Pause, RotateCcw, Upload, Settings } from 'lucide-react';
import type { SimulationSettings } from '../types/quantum';

interface ControlPanelProps {
  settings: SimulationSettings;
  onUpdateSettings: (settings: Partial<SimulationSettings>) => void;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  isRunning: boolean;
}

export function ControlPanel({
  settings,
  onUpdateSettings,
  onStart,
  onPause,
  onReset,
  isRunning
}: ControlPanelProps) {
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onUpdateSettings({ coverImage: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-cyan-500/30 p-6 h-full">
      <div className="flex items-center space-x-2 mb-6">
        <Settings className="h-5 w-5 text-cyan-400" />
        <h2 className="text-lg font-semibold text-white">Control Panel</h2>
      </div>

      <div className="space-y-6">
        {/* Message Input */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Plaintext Message
          </label>
          <textarea
            value={settings.message}
            onChange={(e) => onUpdateSettings({ message: e.target.value })}
            className="w-full h-24 px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
            placeholder="Enter your secret message..."
            maxLength={200}
          />
          <div className="text-xs text-slate-400 mt-1">
            {settings.message.length}/200 characters
          </div>
        </div>

        {/* Cover Image Upload */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Cover Image for Steganography
          </label>
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="cover-image"
            />
            <label
              htmlFor="cover-image"
              className="flex items-center justify-center w-full h-32 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer hover:border-cyan-500 transition-colors duration-300"
            >
              {settings.coverImage ? (
                <img
                  src={settings.coverImage}
                  alt="Cover"
                  className="h-full w-full object-cover rounded-lg"
                />
              ) : (
                <div className="text-center">
                  <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <span className="text-sm text-slate-400">Upload image</span>
                </div>
              )}
            </label>
          </div>
        </div>

        {/* Eavesdrop Probability */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Eavesdropping Probability: {Math.round(settings.eavesdropProbability * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={settings.eavesdropProbability}
            onChange={(e) => onUpdateSettings({ eavesdropProbability: parseFloat(e.target.value) })}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Parallel Channels */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Parallel Channels
          </label>
          <select
            value={settings.channelCount}
            onChange={(e) => onUpdateSettings({ channelCount: parseInt(e.target.value) })}
            className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          >
            {[1, 2, 3, 4].map(count => (
              <option key={count} value={count}>
                {count} Channel{count > 1 ? 's' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Control Buttons */}
        <div className="flex space-x-3 pt-4">
          <button
            onClick={isRunning ? onPause : onStart}
            disabled={!settings.message.trim() || !settings.coverImage}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-500 hover:to-blue-500 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed transition-all duration-300"
          >
            {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            <span className="font-medium">{isRunning ? 'Pause' : 'Start'}</span>
          </button>
          
          <button
            onClick={onReset}
            className="px-4 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors duration-300"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}