
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
            next();
        });

        this.app.get('/frame', (req, res) => {
            if (!this.latestFrame) {
                return res.status(404).json({error: 'No frame available'});
            }
            // The frame data is already in JPEG format, just need to convert to base64
            const base64Frame = Buffer.from(this.latestFrame).toString('base64');
            res.json({frame: `data:image/jpeg;base64,${base64Frame}`});
        });

        this.app.post('/capture', (req, res) => {
            if (!this.latestFrame) {
                return res.status(404).json({error: 'No frame available to capture'});
            }

            const timestamp = new Date().toISOString().replace(/[:\.]/g, '-');
            const filename = `capture-${timestamp}.jpg`;
            
            try {
                // Write the raw JPEG data directly to file
                fs.writeFileSync(`./captures/${filename}`, this.latestFrame);
                res.json({
                    message: 'Frame captured successfully',
                    filename: filename
                });
            } catch (error) {
                console.error('Error saving frame:', error);
                res.status(500).json({error: 'Failed to save frame'});
            }
        });
    }

    start(rtspUrl, port = 3001) {
        if (!fs.existsSync('./captures')) {
            fs.mkdirSync('./captures');
        }

        this.stream = new Stream({
            name: 'rtsp-stream',
            streamUrl: rtspUrl,
            wsPort: 9999,
            ffmpegOptions: {
                // Configure FFmpeg to output JPEG frames
                '-f': 'mjpeg',
                '-q:v': '2', // JPEG quality (2-31, lower means better quality)
                '-r': 30,
                '-rtsp_transport': 'tcp'
            }
        });

        this.stream.on('data', (data) => {
            this.latestFrame = data;
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

// Replace this URL with your actual RTSP stream URL
const rtspUrl = process.env.RTSP_URL || 'rtsp://localhost:8554/air';
rtspService.start(rtspUrl);
