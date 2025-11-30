/**
 * Convert audio blob to base64 string
 */
export const audioToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove the data URL prefix (e.g., "data:audio/webm;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Send audio data to external webhook
 */
export const sendAudioToWebhook = async (
  audioBlob: Blob,
  webhookUrl: string,
  phoneNumber?: string | null
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Convert audio to base64
    const base64Audio = await audioToBase64(audioBlob);
    
    // Prepare payload
    const payload = {
      audio: base64Audio,
      mimeType: audioBlob.type,
      size: audioBlob.size,
      timestamp: new Date().toISOString(),
      source: 'ema-voice-assistant',
      ...(phoneNumber && { phoneNumber })
    };

    console.log('Sending audio to webhook:', webhookUrl);
    console.log('Audio size:', audioBlob.size, 'bytes');

    // Send to webhook
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Webhook returned status ${response.status}`);
    }

    console.log('Audio sent successfully to webhook');
    return { success: true };
  } catch (error) {
    console.error('Error sending audio to webhook:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send audio',
    };
  }
};
