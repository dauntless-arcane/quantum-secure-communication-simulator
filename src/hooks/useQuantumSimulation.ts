import { useState, useRef, useCallback, useEffect } from 'react';
import type { SimulationState, Metrics, QuantumChannel, Qubit } from '../types/quantum';

const initialSettings = {
  message: 'Hello, this is a secret message!',
  coverImage: null,
  eavesdropProbability: 0.1,
  channelCount: 2
};

const initialState: SimulationState = {
  settings: initialSettings,
  isRunning: false,
  phase: 'idle',
  channels: [],
  keyData: {
    finalKey: '',
    entropy: 0,
    fidelity: 1,
    isSecure: true
  },
  errorDetection: {
    errorsDetected: 0,
    errorsCorrected: 0,
    recoveryRate: 0
  },
  eveInterception: {
    isActive: false,
    x: 0,
    y: 0,
    timestamp: 0
  },
  encryptedMessage: '',
  finalKey: ''
};

const initialMetrics: Metrics = {
  transmittedQubits: 0,
  interceptedQubits: 0,
  finalKeyLength: 0,
  successRate: 0,
  averageErrorRate: 0,
  redundancyUsage: 0,
  keyFidelity: 1,
  eavesdroppingDetected: false,
  privacyAmplification: 0,
  isSecureCommunication: true,
  keyGenerationProgress: 0,
  errorCorrectionProgress: 0,
  steganographyProgress: 0
};

export function useQuantumSimulation(canvasRef: React.RefObject<HTMLCanvasElement>) {
  const [simulationState, setSimulationState] = useState<SimulationState>(initialState);
  const [metrics, setMetrics] = useState<Metrics>(initialMetrics);
  const animationRef = useRef<number>();
  const timeoutRef = useRef<NodeJS.Timeout>();

  const generateRandomBit = (): '0' | '1' => Math.random() < 0.5 ? '0' : '1';
  const generateRandomBasis = (): 'rectilinear' | 'diagonal' => Math.random() < 0.5 ? 'rectilinear' : 'diagonal';

  const createQubit = (channelId: number, position: number): Qubit => ({
    id: `${channelId}-${Date.now()}-${Math.random()}`,
    x: 120 + position * 2,
    y: 0, // Will be set by the animation
    basis: generateRandomBasis(),
    state: generateRandomBit(),
    isIntercepted: Math.random() < simulationState.settings.eavesdropProbability,
    timestamp: Date.now()
  });

  const initializeChannels = useCallback((channelCount: number): QuantumChannel[] => {
    return Array.from({ length: channelCount }, (_, index) => ({
      id: index,
      qubits: [],
      key: '',
      hasError: false,
      errorRate: 0,
      isActive: true
    }));
  }, []);

  const simulateKeyGeneration = useCallback(async () => {
    setSimulationState(prev => ({ ...prev, phase: 'keyGeneration' }));
    
    const keyLength = Math.min(256, simulationState.settings.message.length * 8);
    const channels = initializeChannels(simulationState.settings.channelCount);

    for (let i = 0; i < keyLength; i++) {
      channels.forEach((channel, channelIndex) => {
        const qubit = createQubit(channelIndex, i);
        channel.qubits.push(qubit);
        channel.key += qubit.state;

        if (qubit.isIntercepted) {
          channel.hasError = true;
          channel.errorRate = Math.min(channel.errorRate + 0.01, 0.5);
        }
      });

      setMetrics(prev => ({
        ...prev,
        keyGenerationProgress: (i + 1) / keyLength,
        transmittedQubits: prev.transmittedQubits + simulationState.settings.channelCount,
        interceptedQubits: prev.interceptedQubits + channels.filter(c => 
          c.qubits[c.qubits.length - 1]?.isIntercepted
        ).length
      }));

      await new Promise(resolve => setTimeout(resolve, 50));
    }

    setSimulationState(prev => ({ ...prev, channels }));
    return channels;
  }, [simulationState.settings, initializeChannels]);

  const simulateTransmission = useCallback(async (channels: QuantumChannel[]) => {
    setSimulationState(prev => ({ ...prev, phase: 'transmission' }));

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const animationDuration = 3000;
    const startTime = Date.now();

    const animateQubits = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / animationDuration, 1);

      channels.forEach((channel, channelIndex) => {
        channel.qubits.forEach(qubit => {
          qubit.x = 120 + progress * (rect.width - 240);
          
          // Simulate Eve's interception
          if (qubit.isIntercepted && progress > 0.3 && progress < 0.7) {
            setSimulationState(prev => ({
              ...prev,
              eveInterception: {
                isActive: true,
                x: qubit.x + Math.sin(Date.now() / 100) * 10, // Add some movement
                y: rect.height / 2 + (channelIndex - channels.length / 2) * 60,
                timestamp: Date.now()
              }
            }));
            
            // Keep Eve active longer for better visibility
            setTimeout(() => {
              setSimulationState(prev => ({
                ...prev,
                eveInterception: { ...prev.eveInterception, isActive: false }
              }));
            }, 800);
          }
        });
      });

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animateQubits);
      }
    };

    animateQubits();
    await new Promise(resolve => setTimeout(resolve, animationDuration));
  }, [canvasRef]);

  const simulateErrorDetectionAndRecovery = useCallback(async (channels: QuantumChannel[]) => {
    setSimulationState(prev => ({ ...prev, phase: 'errorDetection' }));

    let totalErrors = 0;
    let correctedErrors = 0;

    // Detect errors by comparing channels
    for (let i = 0; i < channels[0].key.length; i++) {
      const bits = channels.map(c => c.key[i]);
      const uniqueBits = [...new Set(bits)];

      if (uniqueBits.length > 1) {
        totalErrors++;
        
        // Use majority voting for correction
        const bitCounts = bits.reduce((acc, bit) => {
          acc[bit] = (acc[bit] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const correctBit = Object.entries(bitCounts).reduce((a, b) => 
          bitCounts[a[0]] > bitCounts[b[0]] ? a : b
        )[0];

        // Correct the minority channels
        channels.forEach(channel => {
          if (channel.key[i] !== correctBit) {
            const keyArray = channel.key.split('');
            keyArray[i] = correctBit;
            channel.key = keyArray.join('');
            correctedErrors++;
          }
        });
      }

      setMetrics(prev => ({
        ...prev,
        errorCorrectionProgress: (i + 1) / channels[0].key.length
      }));

      await new Promise(resolve => setTimeout(resolve, 10));
    }

    setSimulationState(prev => ({
      ...prev,
      phase: 'keyRecovery',
      errorDetection: {
        errorsDetected: totalErrors,
        errorsCorrected: correctedErrors,
        recoveryRate: totalErrors > 0 ? correctedErrors / totalErrors : 1
      }
    }));

    // Generate final key from the first channel (now corrected)
    const finalKey = channels[0].key;
    const entropy = calculateEntropy(finalKey);
    const fidelity = 1 - (totalErrors / channels[0].key.length);
    const isSecure = fidelity > 0.9;

    setSimulationState(prev => ({
      ...prev,
      keyData: { finalKey, entropy, fidelity, isSecure },
      finalKey
    }));

    setMetrics(prev => ({
      ...prev,
      finalKeyLength: finalKey.length,
      keyFidelity: fidelity,
      averageErrorRate: totalErrors / channels[0].key.length,
      redundancyUsage: correctedErrors / Math.max(totalErrors, 1),
      eavesdroppingDetected: totalErrors > channels[0].key.length * 0.1,
      isSecureCommunication: isSecure
    }));

    return finalKey;
  }, []);

  const calculateEntropy = (key: string): number => {
    const counts = key.split('').reduce((acc, bit) => {
      acc[bit] = (acc[bit] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const total = key.length;
    let entropy = 0;

    Object.values(counts).forEach(count => {
      const p = count / total;
      entropy -= p * Math.log2(p);
    });

    return entropy;
  };

  const simulateEncryption = useCallback(async (message: string, key: string) => {
    setSimulationState(prev => ({ ...prev, phase: 'encryption' }));

    // Simple XOR encryption
    let encrypted = '';
    for (let i = 0; i < message.length; i++) {
      const messageChar = message.charCodeAt(i);
      const keyBit = parseInt(key[i % key.length]);
      encrypted += String.fromCharCode(messageChar ^ keyBit);
    }

    setSimulationState(prev => ({ ...prev, encryptedMessage: encrypted }));
    return encrypted;
  }, []);

  const simulateSteganography = useCallback(async () => {
    setSimulationState(prev => ({ ...prev, phase: 'steganography' }));
    
    // Simulate steganography progress
    for (let i = 0; i <= 100; i += 10) {
      setMetrics(prev => ({
        ...prev,
        steganographyProgress: i / 100
      }));
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }, []);

  const runSimulation = useCallback(async () => {
    try {
      const channels = await simulateKeyGeneration();
      await simulateTransmission(channels);
      const finalKey = await simulateErrorDetectionAndRecovery(channels);
      const encryptedMessage = await simulateEncryption(simulationState.settings.message, finalKey);
      await simulateSteganography();

      setSimulationState(prev => ({ ...prev, phase: 'complete' }));
      setMetrics(prev => ({ ...prev, successRate: prev.isSecureCommunication ? 1 : 0.5 }));
    } catch (error) {
      console.error('Simulation error:', error);
      setSimulationState(prev => ({ ...prev, isRunning: false, phase: 'idle' }));
    }
  }, [simulateKeyGeneration, simulateTransmission, simulateErrorDetectionAndRecovery, simulateEncryption, simulateSteganography, simulationState.settings.message]);

  const startSimulation = useCallback(() => {
    setSimulationState(prev => ({ ...prev, isRunning: true }));
    setMetrics(initialMetrics);
    runSimulation();
  }, [runSimulation]);

  const pauseSimulation = useCallback(() => {
    setSimulationState(prev => ({ ...prev, isRunning: false }));
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const resetSimulation = useCallback(() => {
    setSimulationState(initialState);
    setMetrics(initialMetrics);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const updateSettings = useCallback((newSettings: Partial<typeof initialSettings>) => {
    setSimulationState(prev => ({
      ...prev,
      settings: { ...prev.settings, ...newSettings }
    }));
  }, []);

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    simulationState,
    metrics,
    startSimulation,
    pauseSimulation,
    resetSimulation,
    updateSettings
  };
}