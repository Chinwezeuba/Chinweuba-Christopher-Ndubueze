import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import {
  signInWithPopup,
  signOut,
  User as FirebaseUser,
  onAuthStateChanged,
} from 'firebase/auth';
import { db, auth, googleProvider } from './config';
import { handleFirestoreError, OperationType } from './firestoreErrors';
import { UserProfile, SrsItem } from '../types';
import { DEFAULT_PROFILES, saveCurrentUser } from '../utils/storage';

export async function loginWithGoogle(): Promise<FirebaseUser | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Google sign-in error:', error);
    throw error;
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
}

export async function fetchUserProfileFromFirestore(userId: string): Promise<UserProfile | null> {
  const currentAuthUser = auth.currentUser;
  if (!currentAuthUser || (currentAuthUser.uid !== userId && currentAuthUser.email !== 'chinwezeuba@gmail.com')) {
    // Only fetch cloud profile when authenticated as this user or admin
    return null;
  }
  const path = `users/${userId}`;
  try {
    const userDocRef = doc(db, 'users', userId);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveUserProfileToFirestore(user: UserProfile): Promise<void> {
  const currentAuthUser = auth.currentUser;
  if (!currentAuthUser || (currentAuthUser.uid !== user.id && currentAuthUser.email !== 'chinwezeuba@gmail.com')) {
    // Demo users (e.g. user-adult-1) and unauthenticated sessions are safely kept in local storage.
    // Cloud sync only applies to authenticated Firebase users.
    return;
  }
  const path = `users/${user.id}`;
  try {
    const userDocRef = doc(db, 'users', user.id);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      await updateDoc(userDocRef, {
        name: user.name,
        email: user.email,
        role: user.role,
        ageGroup: user.ageGroup,
        targetLanguage: user.targetLanguage,
        currentCefr: user.currentCefr,
        dailyGoalMinutes: user.dailyGoalMinutes,
        dailyGoalXp: user.dailyGoalXp || 100,
        dailyXpEarnedToday: user.dailyXpEarnedToday || 0,
        dailyXpDate: user.dailyXpDate || '',
        streakDays: user.streakDays,
        bestStreak: user.bestStreak || user.streakDays,
        lastActiveDate: user.lastActiveDate,
        totalXp: user.totalXp,
        avatar: user.avatar,
        perfectLessonsCount: user.perfectLessonsCount || 0,
        totalWordsLearned: user.totalWordsLearned || 0,
        roleplayConversationsCount: user.roleplayConversationsCount || 0,
        voiceRecordingsCount: user.voiceRecordingsCount || 0,
        dailyTimeSpentTodayMinutes: user.dailyTimeSpentTodayMinutes || 0,
        voiceEnabled: user.voiceEnabled ?? true,
        slowAudioPreference: user.slowAudioPreference ?? false,
      });
    } else {
      await setDoc(userDocRef, {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        ageGroup: user.ageGroup,
        targetLanguage: user.targetLanguage,
        nativeLanguage: user.nativeLanguage || 'en',
        currentCefr: user.currentCefr,
        learningGoal: user.learningGoal || 'Master practical real-world conversations',
        dailyGoalMinutes: user.dailyGoalMinutes,
        dailyGoalXp: user.dailyGoalXp || 100,
        dailyXpEarnedToday: user.dailyXpEarnedToday || 0,
        dailyXpDate: user.dailyXpDate || '',
        streakDays: user.streakDays,
        bestStreak: user.bestStreak || user.streakDays,
        lastActiveDate: user.lastActiveDate,
        totalXp: user.totalXp,
        avatar: user.avatar,
        perfectLessonsCount: user.perfectLessonsCount || 0,
        totalWordsLearned: user.totalWordsLearned || 0,
        roleplayConversationsCount: user.roleplayConversationsCount || 0,
        voiceRecordingsCount: user.voiceRecordingsCount || 0,
        dailyTimeSpentTodayMinutes: user.dailyTimeSpentTodayMinutes || 0,
        voiceEnabled: user.voiceEnabled ?? true,
        slowAudioPreference: user.slowAudioPreference ?? false,
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function fetchUserSrsCardsFromFirestore(userId: string): Promise<SrsItem[]> {
  const currentAuthUser = auth.currentUser;
  if (!currentAuthUser || (currentAuthUser.uid !== userId && currentAuthUser.email !== 'chinwezeuba@gmail.com')) {
    return [];
  }
  const path = `users/${userId}/srsCards`;
  try {
    const cardsCol = collection(db, 'users', userId, 'srsCards');
    const snap = await getDocs(cardsCol);
    const items: SrsItem[] = [];
    snap.forEach((d) => {
      items.push(d.data() as SrsItem);
    });
    return items;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export function subscribeToAuthChanges(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}
