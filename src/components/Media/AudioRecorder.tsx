import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Save } from 'lucide-react';

interface AudioRecorderProps {
  onSave: (blob: Blob) => void;
  quality?: 'low' | 'medium' | 'high';
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onSave,
  quality = 'medium',
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number>();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: quality === 'high' ? 48000 : quality === 'medium' ? 44100 : 22050,
        },
      });

      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      source.connect(analyser);
      analyserRef.current = analyser;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        if (audioRef.current) {
          audioRef.current.src = url;
        }
      };

      mediaRecorder.start(10);
      setIsRecording(true);
      startTimer();
      drawWaveform();
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      stopTimer();
    }
  };

  const togglePause = () => {
    if (mediaRecorderRef.current) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        startTimer();
      } else {
        mediaRecorderRef.current.pause();
        stopTimer();
      }
      setIsPaused(!isPaused);
    }
  };

  const startTimer = () => {
    timerRef.current = window.setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const drawWaveform = () => {
    if (!canvasRef.current || !analyserRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const draw = () => {
      if (!isRecording) return;

      requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);

      ctx.fillStyle = 'rgb(200, 200, 200)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgb(0, 0, 0)';
      ctx.beginPath();

      const sliceWidth = canvas.width / dataArray.length;
      let x = 0;

      for (let i = 0; i < dataArray.length; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    draw();
  };

  const handleSave = () => {
    if (audioChunksRef.current.length > 0) {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
      onSave(audioBlob);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <canvas
        ref={canvasRef}
        width="300"
        height="60"
        className="w-full h-15 bg-gray-100 rounded mb-4"
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
            >
              <Mic className="h-6 w-6" />
            </button>
          ) : (
            <>
              <button
                onClick={stopRecording}
                className="p-2 bg-gray-500 text-white rounded-full hover:bg-gray-600"
              >
                <Square className="h-6 w-6" />
              </button>
              <button
                onClick={togglePause}
                className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
              >
                {isPaused ? <Play className="h-6 w-6" /> : <Pause className="h-6 w-6" />}
              </button>
            </>
          )}
        </div>

        <span className="text-lg font-mono">{formatTime(duration)}</span>

        {audioUrl && !isRecording && (
          <button
            onClick={handleSave}
            className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600"
          >
            <Save className="h-6 w-6" />
          </button>
        )}
      </div>

      {audioUrl && (
        <audio
          ref={audioRef}
          controls
          className="w-full mt-4"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      )}
    </div>
  );
}; 