
import express from 'express';
import Stream from 'node-rtsp-stream';
import fs from 'fs';

class RTSPService {
    constructor() {
        this.app = express();
        this.latestFrame = null;
        this.setupRoutes();
    }

    setupRoutes() {
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
            res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
            next();
        });

        this.app.get('/frame', (req, res) => {
            if (!this.latestFrame) {
                return res.status(404).json({ error: 'No frame available' });
            }
            res.json({ frame: `data:image/jpeg;base64,${this.latestFrame}` });
        });

        this.app.post('/capture', (req, res) => {
            if (!this.latestFrame) {
                return res.status(404).json({ error: 'No frame available to capture' });
            }

            const timestamp = new Date().toISOString().replace(/[:\.]/g, '-');
            const filename = `capture-${timestamp}.jpg`;

            try {
                if (!fs.existsSync('./captures')) {
                    fs.mkdirSync('./captures');
                }
                
                // Convert base64 to buffer and save
                const imageBuffer = Buffer.from(this.latestFrame, 'base64');
                fs.writeFileSync(`./captures/${filename}`, imageBuffer);
                
                res.json({
                    message: 'Frame captured successfully',
                    filename: filename
                });
            } catch (error) {
                console.error('Error saving frame:', error);
                res.status(500).json({ error: 'Failed to save frame' });
            }
        });
    }

    start(rtspUrl, port = 3001) {
        // Configure stream with proper FFmpeg options for JPEG output
        this.stream = new Stream({
            name: 'rtsp-stream',
            streamUrl: rtspUrl || 'rtsp://localhost:8554/stream',
            wsPort: 9999,
            ffmpegOptions: {
                '-stats': '',
                '-r': 30,
                '-s': '640x480',  // Set resolution
                '-q:v': 2,        // JPEG quality (2-31, lower is better)
                '-f': 'image2',   // Force image2 format
                '-vcodec': 'mjpeg', // Use MJPEG codec
                '-pix_fmt': 'yuvj420p', // Use full range yuv420p
                '-rtsp_transport': 'tcp'
            }
        });

        this.stream.on('camdata', (frame) => {
            // Convert frame buffer to base64
            this.latestFrame = Buffer.from(frame).toString('base64');
        });

        this.app.listen(port, () => {
            console.log(`RTSP service listening on port ${port}`);
        });
    }

    stop() {
        if (this.stream) {
            this.stream.stop();
        }
    }
}

// Create and start the service
const rtspService = new RTSPService();
const rtspUrl = process.env.RTSP_URL;
rtspService.start(rtspUrl);

