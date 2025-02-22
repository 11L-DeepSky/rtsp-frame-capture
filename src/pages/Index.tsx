
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const REFRESH_INTERVAL = 1000; // 1 second

const Index = () => {
  const [frameUrl, setFrameUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLatestFrame = async () => {
    try {
      const response = await fetch('http://localhost:3001/frame');
      if (!response.ok) throw new Error('Failed to fetch frame');
      const data = await response.json();
      setFrameUrl(data.frame);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching frame:', error);
      toast.error('Failed to fetch video frame');
      setIsLoading(false);
    }
  };

  const captureFrame = async () => {
    try {
      const response = await fetch('http://localhost:3001/capture', {
        method: 'POST',
      });
      
      if (!response.ok) throw new Error('Failed to capture frame');
      
      const data = await response.json();
      toast.success(`Frame captured as ${data.filename}`);
    } catch (error) {
      console.error('Error capturing frame:', error);
      toast.error('Failed to capture frame');
    }
  };

  useEffect(() => {
    const interval = setInterval(fetchLatestFrame, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-100 to-neutral-200 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-4">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-neutral-200 text-neutral-600 text-sm font-medium">
              Live Stream
            </div>
            <h1 className="text-4xl font-bold tracking-tight">RTSP Stream Monitor</h1>
          </div>
          
          <Card className="overflow-hidden backdrop-blur-sm bg-white/90 border border-neutral-200">
            <div className="aspect-video relative">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-neutral-100">
                  <div className="animate-pulse text-neutral-400">Loading...</div>
                </div>
              )}
              {frameUrl && (
                <img
                  src={frameUrl}
                  alt="RTSP Stream"
                  className="w-full h-full object-contain"
                  style={{ opacity: isLoading ? 0 : 1 }}
                  onLoad={() => setIsLoading(false)}
                />
              )}
            </div>
          </Card>

          <div className="flex justify-center gap-4">
            <div className="text-sm text-neutral-500">
              Auto-refreshing every {REFRESH_INTERVAL / 1000} second
            </div>
            <Button 
              onClick={captureFrame}
              variant="outline"
              className="bg-white hover:bg-neutral-100"
            >
              Capture Frame
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
