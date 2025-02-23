
import express from 'express';
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

        this.app.get('/frame', async (req, res) => {
            // if (!this.latestFrame) {
            //     return res.status(404).json({error: 'No frame available'});
            // }
            // The frame data is already in JPEG format, just need to convert to base64
            // const base64Frame = Buffer.from(this.latestFrame).toString('base64');
            // const mockData = await this.fetchMockedImage();

            const data = fs.readFileSync('./captures/frame.jpg', {
                encoding: 'base64'
            });

            res.json({frame: `data:image/jpeg;base64,${data}`});
        });

    }

    start(rtspUrl, port = 3001) {
        if (!fs.existsSync('./captures')) {
            fs.mkdirSync('./captures');
        }

        // this.stream = new Stream({
        //     name: 'rtsp-stream',
        //     streamUrl: rtspUrl,
        //     wsPort: 9999,
        //     ffmpegOptions: {
        //         '-stats': '',
        //         '-r': 30,
        //         '-rtsp_transport': 'tcp',
        //     }
        // });
        //
        // this.stream.on('camdata', (data) => {
        //     this.latestFrame = data;
        // });

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

