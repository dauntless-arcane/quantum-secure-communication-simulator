export interface SimulationSettings {
  message: string;
  coverImage: string | null;
  eavesdropProbability: number;
  channelCount: number;
}

export interface Qubit {
  id: string;
  x: number;
  y: number;
  basis: 'rectilinear' | 'diagonal';
  state: '0' | '1';
  isIntercepted: boolean;
  timestamp: number;
}

export interface QuantumChannel {
  id: number;
  qubits: Qubit[];
  key: string;
  hasError: boolean;
  errorRate: number;
  isActive: boolean;
}

export interface KeyData {
  finalKey: string;
  entropy: number;
  fidelity: number;
  isSecure: boolean;
}

export interface ErrorDetection {
  errorsDetected: number;
  errorsCorrected: number;
  recoveryRate: number;
}

export interface EveInterception {
  isActive: boolean;
  x: number;
  y: number;
  timestamp: number;
}

export interface SimulationState {
  settings: SimulationSettings;
  isRunning: boolean;
  phase: 'idle' | 'keyGeneration' | 'transmission' | 'errorDetection' | 'keyRecovery' | 'encryption' | 'steganography' | 'complete';
  channels: QuantumChannel[];
  keyData: KeyData;
  errorDetection: ErrorDetection;
  eveInterception: EveInterception;
  encryptedMessage: string;
  finalKey: string;
}

export interface Metrics {
  transmittedQubits: number;
  interceptedQubits: number;
  finalKeyLength: number;
  successRate: number;
  averageErrorRate: number;
  redundancyUsage: number;
  keyFidelity: number;
  eavesdroppingDetected: boolean;
  privacyAmplification: number;
  isSecureCommunication: boolean;
  keyGenerationProgress: number;
  errorCorrectionProgress: number;
  steganographyProgress: number;
}