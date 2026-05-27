import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';

import { db } from '../firebase';
import type { AudioContext, DiscoTags } from '../types/MusicTags';

export interface AnalysisRecord {
  analysisId: string;
  uid: string;
  fileName: string;
  tags: DiscoTags;
  audioContext: AudioContext;
  analyzedAt: Timestamp | null;
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
