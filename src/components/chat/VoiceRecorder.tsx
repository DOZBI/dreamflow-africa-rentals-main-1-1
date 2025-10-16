import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Send, X, Trash2 } from 'lucide-react';

interface VoiceRecorderProps {
  onSendVoice: (audioBlob: Blob) => void;
  onCancel: () => void;
  disabled?: boolean;
}

const VoiceRecorder = ({ onSendVoice, onCancel, disabled = false }: VoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Start recording automatically when component mounts
    startRecording();

    return () => {
      stopRecording();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
        setAudioBlob(audioBlob);
        
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      onCancel();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const handleSend = () => {
    if (audioBlob) {
      onSendVoice(audioBlob);
    }
  };

  const handleDelete = () => {
    stopRecording();
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    onCancel();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2 bg-[#202c33] px-2 py-2 rounded-lg">
      <Button
        type="button"
        size="icon"
        variant="ghost"
        onClick={handleDelete}
        className="h-10 w-10 text-red-400 hover:text-red-300 hover:bg-[#2a3942]"
      >
        <Trash2 className="h-5 w-5" />
      </Button>

      <div className="flex-1 flex items-center gap-3 bg-[#2a3942] rounded-lg px-4 py-2">
        {isRecording ? (
          <>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse" />
              <Mic className="h-5 w-5 text-red-500" />
            </div>
            <span className="text-white text-sm font-medium">
              {formatTime(recordingTime)}
            </span>
            <Button
              type="button"
              size="sm"
              onClick={stopRecording}
              className="ml-auto bg-[#00a884] hover:bg-[#06cf9c] text-white"
            >
              Arrêter
            </Button>
          </>
        ) : (
          <>
            <Mic className="h-5 w-5 text-gray-400" />
            <span className="text-white text-sm font-medium">
              {formatTime(recordingTime)}
            </span>
            {audioUrl && (
              <audio
                ref={audioRef}
                src={audioUrl}
                controls
                className="flex-1 h-8"
                style={{
                  filter: 'invert(1) hue-rotate(180deg)',
                }}
              />
            )}
          </>
        )}
      </div>

      {!isRecording && audioBlob && (
        <Button
          type="button"
          size="icon"
          onClick={handleSend}
          disabled={disabled}
          className="h-10 w-10 rounded-full bg-[#00a884] hover:bg-[#06cf9c] disabled:opacity-50"
        >
          <Send className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
};

export default VoiceRecorder;