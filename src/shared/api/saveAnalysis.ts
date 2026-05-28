import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

import { db, storage } from '../firebase';
import type { AudioContext, DiscoTags } from '../types/MusicTags';

export interface AnalysisRecord {
  analysisId: string;
  uid: string;
  fileName: string;
  tags: DiscoTags;
  audioContext: AudioContext;
  analyzedAt: Timestamp | null;
  storageUrl?: string;
}

export async function uploadAudioFile(
  uid: string,
  analysisId: string,
  file: File,
): Promise<string> {
  const storageRef = ref(storage, `audio/${uid}/${analysisId}/${file.name}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function saveAnalysis(
  uid: string,
  fileName: string,
  tags: DiscoTags,
  audioContext: AudioContext,
): Promise<string> {
  const ref = await addDoc(collection(db, 'analyses'), {
    uid,
    fileName,
    tags,
    audioContext,
    analyzedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateAnalysisTags(
  analysisId: string,
  tags: DiscoTags,
): Promise<void> {
  await updateDoc(doc(db, 'analyses', analysisId), { tags });
}

export async function updateAnalysisStorageUrl(
  analysisId: string,
  storageUrl: string,
): Promise<void> {
  await updateDoc(doc(db, 'analyses', analysisId), { storageUrl });
}
