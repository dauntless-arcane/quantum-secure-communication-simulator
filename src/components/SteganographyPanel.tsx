import React, { useState, useRef, useEffect } from 'react';
import { Image, Eye, EyeOff, Download, Lock, Unlock, Zap } from 'lucide-react';
import { embedMessageInImage, extractMessageFromImage } from '../utils/steganography';

interface SteganographyPanelProps {
  coverImage: string | null;
  encryptedMessage: string;
  finalKey: string;
  originalMessage: string;
  isComplete: boolean;
}

export function SteganographyPanel({
  coverImage,
  encryptedMessage,
  finalKey,
  originalMessage,
  isComplete
}: SteganographyPanelProps) {
  const [stegoImage, setStegoImage] = useState<string | null>(null);
  const [isEncrypted, setIsEncrypted] = useState(false);
  const [isDecrypted, setIsDecrypted] = useState(false);
  const [extractedMessage, setExtractedMessage] = useState<string>('');
  const [highlightedPixels, setHighlightedPixels] = useState<Array<{x: number, y: number}>>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const highlightCanvasRef = useRef<HTMLCanvasElement>(null);

  const handleEncryptMessage = async () => {
    if (!coverImage || !encryptedMessage) return;
    
    setIsProcessing(true);
    try {
      const result = await embedMessageInImage(coverImage, encryptedMessage, canvasRef.current!);
      setStegoImage(result.imageData);
      setHighlightedPixels(result.modifiedPixels);
      setIsEncrypted(true);
      
      // Show pixel highlights for 3 seconds
      setTimeout(() => {
        setHighlightedPixels([]);
      }, 3000);
    } catch (error) {
      console.error('Error embedding message:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecryptMessage = async () => {
    if (!stegoImage) return;

    setIsProcessing(true);
    try {
      const extracted = await extractMessageFromImage(stegoImage, canvasRef.current!);
      // Decrypt the message using XOR with the final key
      const decrypted = xorDecrypt(extracted, finalKey);
      setExtractedMessage(decrypted);
      setIsDecrypted(true);
    } catch (error) {
      console.error('Error extracting message:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const xorDecrypt = (ciphertext: string, key: string): string => {
    if (!key) return ciphertext;
    
    let result = '';
    for (let i = 0; i < ciphertext.length; i++) {
      const keyBit = key[i % key.length];
      const cipherBit = ciphertext.charCodeAt(i);
      result += String.fromCharCode(cipherBit ^ parseInt(keyBit));
    }
    return result;
  };

  const downloadStegoImage = () => {
    if (!stegoImage) return;
    
    const link = document.createElement('a');
    link.download = 'stego_image.png';
    link.href = stegoImage;
    link.click();
  };

  // Draw pixel highlights
  useEffect(() => {
    if (highlightedPixels.length > 0 && highlightCanvasRef.current && stegoImage) {
      const canvas = highlightCanvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // Highlight modified pixels
        ctx.fillStyle = 'rgba(0, 255, 255, 0.8)';
        highlightedPixels.forEach(pixel => {
          ctx.fillRect(pixel.x, pixel.y, 2, 2);
        });

        // Add pulsing effect
        let alpha = 0.8;
        const pulse = () => {
          alpha = 0.4 + 0.4 * Math.sin(Date.now() / 200);
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          ctx.fillStyle = `rgba(0, 255, 255, ${alpha})`;
          highlightedPixels.forEach(pixel => {
            ctx.fillRect(pixel.x - 1, pixel.y - 1, 3, 3);
          });
          
          if (highlightedPixels.length > 0) {
            requestAnimationFrame(pulse);
          }
        };
        pulse();
      };
      img.src = stegoImage;
    }
  }, [highlightedPixels, stegoImage]);
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-cyan-500/30 p-6 h-full">
      <div className="flex items-center space-x-2 mb-6">
        <Image className="h-5 w-5 text-cyan-400" />
        <h2 className="text-lg font-semibold text-white">Steganography</h2>
      </div>

      <div className="space-y-6">
        {/* Image Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Cover Image */}
          <div>
            <h3 className="text-sm font-medium text-slate-300 mb-2">Cover Image</h3>
            <div className="aspect-square bg-slate-700/50 rounded-lg overflow-hidden border-2 border-dashed border-slate-600">
              {coverImage ? (
                <img
                  src={coverImage}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <div className="text-center">
                    <Image className="h-12 w-12 mx-auto mb-2" />
                    <p className="text-sm">No cover image</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stego Image */}
          <div>
            <h3 className="text-sm font-medium text-slate-300 mb-2">Steganographic Image</h3>
            <div className="aspect-square bg-slate-700/50 rounded-lg overflow-hidden border-2 border-dashed border-slate-600 relative">
              {stegoImage ? (
                <>
                  <img
                    src={stegoImage}
                    alt="Stego"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={downloadStegoImage}
                    className="absolute top-2 right-2 p-2 bg-slate-800/80 rounded-lg hover:bg-slate-700/80 transition-colors"
                    title="Download stego image"
                  >
                    <Download className="h-4 w-4 text-cyan-400" />
                  </button>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <div className="text-center">
                    <Eye className="h-12 w-12 mx-auto mb-2" />
                    <p className="text-sm">
                      {isComplete ? 'Embedding message...' : 'Awaiting completion'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Message Status */}
        <div>
          <h3 className="text-sm font-medium text-slate-300 mb-3">Message Status</h3>
          <div className="space-y-3">
            <div className="bg-slate-700/50 rounded-lg p-3">
              <div className="text-xs text-slate-400 mb-1">Original Message:</div>
              <div className="text-sm text-white font-mono">{originalMessage || 'None'}</div>
            </div>
            
            <div className="bg-slate-700/50 rounded-lg p-3">
              <div className="text-xs text-slate-400 mb-1">Encrypted Message:</div>
              <div className="text-sm text-cyan-300 font-mono break-all">
                {encryptedMessage || 'Awaiting encryption...'}
              </div>
            </div>

            {isDecrypted && (
              <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 rounded-lg p-3 border border-green-500/30">
                <div className="text-xs text-green-300 mb-1">Extracted & Decrypted:</div>
                <div className="text-sm text-white font-mono">{extractedMessage}</div>
                <div className="text-xs text-green-400 mt-2">
                  ✓ Message successfully recovered from steganographic image
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleEncryptMessage}
            disabled={!coverImage || !encryptedMessage || isEncrypted || isProcessing}
            className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-500 hover:to-red-500 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed transition-all duration-300"
          >
            {isProcessing ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            ) : (
              <Lock className="h-4 w-4" />
            )}
            <span className="font-medium">
              {isEncrypted ? 'Encrypted' : 'Encrypt Message'}
            </span>
          </button>

          <button
            onClick={handleDecryptMessage}
            disabled={!stegoImage || isDecrypted || isProcessing}
            className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-500 hover:to-pink-500 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed transition-all duration-300"
          >
            {isProcessing ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            ) : (
              <Unlock className="h-4 w-4" />
            )}
            <span className="font-medium">
              {isDecrypted ? 'Decrypted' : 'Decrypt Message'}
            </span>
          </button>
        </div>

        {/* Info */}
        <div className="text-xs text-slate-400 bg-slate-700/30 rounded-lg p-3">
          <strong>How it works:</strong> The encrypted message is hidden in the least significant bits 
          of the cover image pixels. To the naked eye, the steganographic image appears identical 
          to the original, but it contains the secret encrypted data. Modified pixels are highlighted 
          in cyan during encryption.
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}