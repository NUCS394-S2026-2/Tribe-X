import React, { useEffect, useRef, useState } from 'react';

import { analyzeMusicFile } from '../../shared/api/analyzeMusicFile';
import { chatWithGemini } from '../../shared/api/chatWithGemini';
import type { AnalysisRecord } from '../../shared/api/saveAnalysis';
import { saveAnalysis, updateAnalysisTags } from '../../shared/api/saveAnalysis';
import type {
  AudioContext,
  ConversationMessage,
  DiscoTags,
} from '../../shared/types/MusicTags';
import { AccountMenu } from './AccountMenu';
import { AudioSidebar } from './AudioSidebar';
import { HistoryPanel } from './HistoryPanel';
import { type ChatMessage, ResultsPage } from './ResultsPage';
import { UploadPage } from './UploadPage';

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const SUPPORTED_TYPES = new Set([
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/wave',
  'audio/flac',
  'audio/ogg',
  'audio/m4a',
  'audio/aiff',
]);
const SUPPORTED_EXTENSIONS = new Set(['.mp3', '.wav', '.flac', '.ogg', '.m4a', '.aiff']);

export interface FileValidationError {
  type: 'invalid-type' | 'too-large' | 'corrupted';
  message: string;
}

function validateAudioFile(file: File): FileValidationError | null {
  if (file.size > MAX_FILE_SIZE) {
    return {
      type: 'too-large',
      message: 'File too large. Please upload files under 50MB.',
    };
  }
  if (!SUPPORTED_TYPES.has(file.type)) {
    const ext = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    if (!SUPPORTED_EXTENSIONS.has(ext)) {
      return {
        type: 'invalid-type',
        message:
          'Unsupported file type. Please upload MP3, WAV, FLAC, OGG, M4A, or AIFF files.',
      };
    }
  }
  return null;
}

// ─── Main component ───────────────────────────────────────────────────────────

interface AudioTaggerProps {
  displayName?: string;
  uid?: string;
}

export function AudioTagger({ displayName, uid }: AudioTaggerProps): React.ReactElement {
  const [file, setFile] = useState<File | null>(null);
  const [tags, setTags] = useState<DiscoTags | null>(null);
  const [suggestedTags, setSuggestedTags] = useState<DiscoTags | null>(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>(
    [],
  );
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<FileValidationError | null>(
    null,
  );
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loadedFileName, setLoadedFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!file || typeof URL.createObjectURL !== 'function') {
      setAudioPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setAudioPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  // Debounce tag edits back to Firestore whenever tags change after a save.
  useEffect(() => {
    if (!analysisId || !tags) return;
    const timer = setTimeout(() => {
      updateAnalysisTags(analysisId, tags).catch(() => {});
    }, 800);
    return () => clearTimeout(timer);
  }, [tags, analysisId]);

  const resetAll = () => {
    setFile(null);
    setTags(null);
    setSuggestedTags(null);
    setAudioContext(null);
    setConversationHistory([]);
    setChatMessages([]);
    setError(null);
    setValidationError(null);
    setAnalysisId(null);
    setSaveError(null);
    setLoadedFileName(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    resetAll();
    if (selected) {
      const err = validateAudioFile(selected);
      if (err) {
        setValidationError(err);
      } else {
        setFile(selected);
      }
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setSaveError(null);
    try {
      const result = await analyzeMusicFile(file);
      setTags(result.tags);
      setAudioContext(result.audioContext);
      setConversationHistory(result.conversationHistory ?? []);
      setChatMessages(
        (result.conversationHistory ?? []).map((m) => ({
          role: m.role,
          text: m.parts[0]?.text ?? '',
        })),
      );

      if (uid) {
        try {
          const id = await saveAnalysis(uid, file.name, result.tags, result.audioContext);
          setAnalysisId(id);
        } catch {
          setSaveError('Could not save analysis — results shown locally only.');
        }
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChat = async (message: string) => {
    if (!audioContext) return;
    setChatMessages((prev) => [...prev, { role: 'user', text: message }]);
    setChatLoading(true);
    setError(null);
    try {
      const result = await chatWithGemini(message, conversationHistory, audioContext);
      setSuggestedTags(result.updatedTags);
      setConversationHistory(result.conversationHistory);
      setChatMessages((prev) => [...prev, { role: 'model', text: result.message }]);
    } catch {
      setError('Chat failed. Please try again.');
    } finally {
      setChatLoading(false);
    }
  };

  const handleSelectHistory = (record: AnalysisRecord) => {
    setFile(null);
    setTags(record.tags);
    setAudioContext(record.audioContext);
    setAnalysisId(record.analysisId);
    setLoadedFileName(record.fileName);
    setSuggestedTags(null);
    setConversationHistory([]);
    setChatMessages([]);
    setError(null);
    setSaveError(null);
    setValidationError(null);
  };

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden bg-white">
      <AudioSidebar />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-white">
        <header className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#7c6ed1] to-[#4c3b99] text-white shadow-md shadow-violet-200">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-6 w-6"
              >
                <path d="M19.952 1.651a.75.75 0 0 1 .298.599V16.303a3 3 0 0 1-2.176 2.884l-1.32.377a2.553 2.553 0 1 1-1.403-4.909l2.311-.66a1.5 1.5 0 0 0 1.088-1.442V6.994l-9 2.572v9.737a3 3 0 0 1-2.176 2.884l-1.32.377a2.553 2.553 0 1 1-1.402-4.909l2.31-.66a1.5 1.5 0 0 0 1.088-1.442V5.25a.75.75 0 0 1 .544-.721l10.5-3a.75.75 0 0 1 .658.122Z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-950">
                MetaMusic
              </h1>
              <p className="mt-0.5 text-base font-semibold text-[#4f46a5]">
                Tag Generator
              </p>
            </div>
          </div>

          {displayName && <AccountMenu displayName={displayName} />}
        </header>

        {!tags ? (
          <UploadPage
            file={file}
            audioPreviewUrl={audioPreviewUrl}
            inputRef={inputRef}
            loading={loading}
            error={error}
            validationError={validationError}
            onAnalyze={handleAnalyze}
            onFileChange={handleFileChange}
            onReset={resetAll}
            historySlot={
              uid ? <HistoryPanel uid={uid} onSelect={handleSelectHistory} /> : undefined
            }
          />
        ) : (
          <ResultsPage
            audioContext={audioContext}
            chatLoading={chatLoading}
            chatMessages={chatMessages}
            error={error}
            file={file}
            audioPreviewUrl={audioPreviewUrl}
            tags={tags}
            suggestedTags={suggestedTags}
            saveError={saveError}
            loadedFileName={loadedFileName}
            onChat={handleChat}
            onNewTrack={resetAll}
            onTagsChange={setTags}
            onSaveSuggested={() => {
              if (suggestedTags) setTags(suggestedTags);
              setSuggestedTags(null);
            }}
            onDismissSuggested={() => setSuggestedTags(null)}
          />
        )}
      </div>
    </div>
  );
}
