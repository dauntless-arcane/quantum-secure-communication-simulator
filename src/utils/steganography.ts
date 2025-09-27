export async function embedMessageInImage(
  imageDataUrl: string,
  message: string,
  canvas: HTMLCanvasElement
): Promise<{ imageData: string; modifiedPixels: Array<{x: number, y: number}> }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Convert message to binary
      const messageBinary = message
        .split('')
        .map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
        .join('');

      // Add delimiter to mark end of message
      const delimiter = '1111111111111110';
      const fullBinary = messageBinary + delimiter;

      const modifiedPixels: Array<{x: number, y: number}> = [];

      // Embed binary data in LSBs
      for (let i = 0; i < fullBinary.length && i * 4 < data.length; i++) {
        const bit = parseInt(fullBinary[i]);
        const pixelIndex = i * 4; // R channel of each pixel
        
        // Clear LSB and set new bit
        data[pixelIndex] = (data[pixelIndex] & 0xFE) | bit;
        
        // Track modified pixel coordinates
        const x = (pixelIndex / 4) % canvas.width;
        const y = Math.floor((pixelIndex / 4) / canvas.width);
        modifiedPixels.push({ x: Math.floor(x), y: Math.floor(y) });
      }

      ctx.putImageData(imageData, 0, 0);
      resolve({
        imageData: canvas.toDataURL('image/png'),
        modifiedPixels
      });
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageDataUrl;
  });
}

export async function extractMessageFromImage(
  imageDataUrl: string,
  canvas: HTMLCanvasElement
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Extract LSBs
      let binaryMessage = '';
      const delimiter = '1111111111111110';
      
      for (let i = 0; i * 4 < data.length; i++) {
        const pixelIndex = i * 4; // R channel
        const bit = data[pixelIndex] & 1;
        binaryMessage += bit;
        
        // Check for delimiter
        if (binaryMessage.endsWith(delimiter)) {
          // Remove delimiter
          binaryMessage = binaryMessage.slice(0, -delimiter.length);
          break;
        }
      }

      // Convert binary to text
      let message = '';
      for (let i = 0; i < binaryMessage.length; i += 8) {
        const byte = binaryMessage.slice(i, i + 8);
        if (byte.length === 8) {
          message += String.fromCharCode(parseInt(byte, 2));
        }
      }

      resolve(message);
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageDataUrl;
  });
}