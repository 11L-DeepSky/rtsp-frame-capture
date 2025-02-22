
# RTSP Frame Server

This is a simple Node.js server that connects to an RTSP stream and provides the latest frame via HTTP endpoint.

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set your RTSP stream URL:
Either set the `RTSP_URL` environment variable or modify the URL directly in `index.js`.

3. Start the server:
```bash
npm start
```

## API

The server exposes one endpoint:

- GET `/frame`: Returns the latest frame from the RTSP stream as a base64-encoded image.

Example response:
```json
{
  "frame": "data:image/jpeg;base64,..."
}
```

## Configuration

- Default port: 3001
- WebSocket port: 9999

These can be modified in the `index.js` file.
