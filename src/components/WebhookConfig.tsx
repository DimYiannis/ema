import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Settings, Check, X } from 'lucide-react';

interface WebhookConfigProps {
  webhookUrl: string;
  onWebhookChange: (url: string) => void;
}

export const WebhookConfig = ({ webhookUrl, onWebhookChange }: WebhookConfigProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [tempUrl, setTempUrl] = useState(webhookUrl);

  const handleSave = () => {
    onWebhookChange(tempUrl);
    setIsExpanded(false);
  };

  const handleCancel = () => {
    setTempUrl(webhookUrl);
    setIsExpanded(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-6">
      {!isExpanded ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(true)}
          className="w-full justify-between bg-secondary/40 hover:bg-secondary/60"
        >
          <span className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Webhook Configuration
            {webhookUrl && (
              <span className="text-xs text-primary">(Configured)</span>
            )}
          </span>
        </Button>
      ) : (
        <div className="border rounded-lg p-4 bg-card/50 backdrop-blur-sm space-y-4 animate-in fade-in-0 slide-in-from-top-4 duration-300">
          <div>
            <Label htmlFor="webhook-url" className="text-sm font-medium">
              External Webhook URL
            </Label>
            <p className="text-xs text-muted-foreground mb-2">
              Audio will be sent as base64-encoded JSON to this URL
            </p>
            <Input
              id="webhook-url"
              type="url"
              placeholder="https://your-webhook-url.com/audio"
              value={tempUrl}
              onChange={(e) => setTempUrl(e.target.value)}
              className="bg-background/50"
            />
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              className="gap-2"
            >
              <Check className="w-4 h-4" />
              Save
            </Button>
          </div>

          {webhookUrl && (
            <div className="text-xs text-muted-foreground p-3 bg-accent/20 rounded border border-border/50">
              <p className="font-medium mb-1">Payload Format:</p>
              <pre className="text-xs overflow-x-auto">
{`{
  "audio": "base64_encoded_audio_data",
  "mimeType": "audio/webm",
  "size": 12345,
  "timestamp": "2025-11-30T...",
  "source": "ema-voice-assistant",
  "phoneNumber": "+31636345484"
}`}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
