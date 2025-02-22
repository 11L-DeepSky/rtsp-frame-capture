
import Stream from 'node-rtsp-stream';
import { Server } from 'http';
import express from 'express';
import { Buffer } from 'buffer';

class RTSPService {
  private stream: any;
  private latestFrame: Buffer | null = null;
  private app: express.Application;
  private server: Server | null = null;

  constructor() {
    this.app = express();
    this.setupRoutes();
  }

  private setupRoutes() {
    this.app.use((req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
      next();
    });

    this.app.get('/frame', (req, res) => {
      if (!this.latestFrame) {
        return res.status(404).json({ error: 'No frame available' });
      }
      const base64Frame = this.latestFrame.toString('base64');
      res.json({ frame: `data:image/jpeg;base64,${base64Frame}` });
    });
  }

  public start(rtspUrl: string, port: number = 3001) {
    this.stream = new Stream({
      name: 'rtsp-stream',
      streamUrl: rtspUrl,
      wsPort: 9999,
      ffmpegOptions: {
        '-stats': '',
        '-r': 30,
      },
    });

    this.stream.on('data', (data: Buffer) => {
      this.latestFrame = data;
    });

    this.server = this.app.listen(port, () => {
      console.log(`RTSP service listening on port ${port}`);
    });
  }

  public stop() {
    if (this.stream) {
      this.stream.stop();
    }
    if (this.server) {
      this.server.close();
    }
  }
}

export const rtspService = new RTSPService();
