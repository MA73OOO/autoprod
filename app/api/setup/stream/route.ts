import { EventEmitter } from 'events';
import { NextResponse } from 'next/server';

// Global event emitter for the setup logs
const setupEmitter = new EventEmitter();
setupEmitter.setMaxListeners(50); // Prevent memory leak warnings if many connections

export async function GET(req: Request) {
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    start(controller) {
      const onLog = (data: string) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ log: data })}\n\n`));
      };
      
      const onProgress = (percentage: number) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ progress: percentage })}\n\n`));
      };

      let isClosed = false;

      const onComplete = () => {
        if (isClosed) return;
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ status: 'complete' })}\n\n`));
        isClosed = true;
        cleanup();
        controller.close();
      };

      const onError = (error: string) => {
        if (isClosed) return;
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error })}\n\n`));
        isClosed = true;
        cleanup();
        controller.close();
      };

      let interval: NodeJS.Timeout;

      const cleanup = () => {
        setupEmitter.off('log', onLog);
        setupEmitter.off('progress', onProgress);
        setupEmitter.off('complete', onComplete);
        setupEmitter.off('error', onError);
        if (interval) clearInterval(interval);
      };

      setupEmitter.on('log', onLog);
      setupEmitter.on('progress', onProgress);
      setupEmitter.on('complete', onComplete);
      setupEmitter.on('error', onError);

      // Keep connection alive
      interval = setInterval(() => {
        if (isClosed) {
          clearInterval(interval);
          return;
        }
        try {
          controller.enqueue(encoder.encode(': keepalive\n\n'));
        } catch (e) {
          isClosed = true;
          clearInterval(interval);
        }
      }, 15000);

      req.signal.addEventListener('abort', () => {
        isClosed = true;
        cleanup();
      });
    }
  });

  return new NextResponse(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}

// Export the emitter to be used by the install route
export { setupEmitter };
