// VoiceInteraction.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Mic, MicOff, Radio } from 'lucide-react';

const VoiceInteraction = ({ onTranscription }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [socket, setSocket] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // WebSocket setup
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws');
    
    ws.onopen = () => {
      console.log('Connected to WebSocket');
    };

    ws.onmessage = (event) => {
      try {
        console.log('Received WebSocket message:', event.data);
        const response = JSON.parse(event.data);
        console.log('Parsed response:', response);
        if (response.transcription) {
          console.log('Transcription received:', response.transcription);
          onTranscription(response.transcription);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setErrorMessage('Connection error occurred');
    };

    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };

    setSocket(ws);

    return () => {
      if (ws) ws.close();
    };
  }, [onTranscription]);

  // Setup audio recording
  const setupMediaRecorder = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000, // Optimal for Whisper API
          channelCount: 1    // Mono audio
        }
      });

      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 128000 // 128 kbps for better quality
      });

      // Increase chunk size for better accuracy
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0 && socket?.readyState === WebSocket.OPEN) {
          socket.send(event.data);
        }
      };

      setMediaRecorder(recorder);
      setErrorMessage('');
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setErrorMessage('Please allow microphone access');
    }
  }, [socket]);

  useEffect(() => {
    setupMediaRecorder();
  }, [setupMediaRecorder]);

  const toggleRecording = () => {
    if (!mediaRecorder) {
      setupMediaRecorder();
      return;
    }

    if (isRecording) {
      mediaRecorder.stop();
    } else {
      mediaRecorder.start(5000); // Send audio chunks every second
    }
    setIsRecording(!isRecording);
  };

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={toggleRecording}
        className={`p-3 rounded-full transition-colors ${
          isRecording 
            ? 'bg-red-500 hover:bg-red-600' 
            : 'bg-blue-500 hover:bg-blue-600'
        }`}
        title={isRecording ? 'Stop Recording' : 'Start Recording'}
      >
        {isRecording ? (
          <MicOff className="h-6 w-6 text-white" />
        ) : (
          <Mic className="h-6 w-6 text-white" />
        )}
      </button>
      {isRecording && (
        <Radio className="h-5 w-5 text-red-500 animate-pulse" />
      )}
      {errorMessage && (
        <span className="text-red-500 text-sm">{errorMessage}</span>
      )}
    </div>
  );
};

export default VoiceInteraction;