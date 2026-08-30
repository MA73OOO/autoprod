import fs from 'fs';
import path from 'path';
import os from 'os';

export async function downloadFile(url: string, destPath: string, onProgress?: (percentage: number) => void): Promise<string> {
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.statusText}`);
  }

  const contentLength = response.headers.get('content-length');
  const totalBytes = contentLength ? parseInt(contentLength, 10) : 0;
  let receivedBytes = 0;

  const fileStream = fs.createWriteStream(destPath);
  
  if (response.body) {
    const reader = response.body.getReader();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      fileStream.write(value);
      receivedBytes += value.length;
      
      if (totalBytes > 0 && onProgress) {
        const percentage = Math.round((receivedBytes / totalBytes) * 100);
        onProgress(percentage);
      }
    }
  }

  return new Promise((resolve, reject) => {
    fileStream.end();
    fileStream.on('finish', () => resolve(destPath));
    fileStream.on('error', reject);
  });
}
