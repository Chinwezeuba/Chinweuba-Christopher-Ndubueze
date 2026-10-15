/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { UserProfile, LessonUnit, AccessibilitySettings, AppVariant } from './types';
import {
  getStoredCurrentUser,
  saveCurrentUser,
  switchUserProfile,
  getStoredAccessibility,
  saveAccessibility,
} from './utils/storage';
import { CURRICULUM_LESSONS } from './data/curriculum';
import { Navbar } from './components/layout/Navbar';
import { AccessibilityModal } from './components/common/AccessibilityModal';
import { LandingScreen } from './components/screens/LandingScreen';
import { AuthScreen } from './components/screens/AuthScreen';
import { OnboardingScreen } from './components/screens/OnboardingScreen';
import { PlacementScreen } from './components/screens/PlacementScreen';
import { HomeScreen } from './components/screens/HomeScreen';
import { LessonPlayerScreen } from './components/screens/LessonPlayerScreen';
import { ConversationTutorScreen } from './components/screens/ConversationTutorScreen';
import { PronunciationLabScreen } from './components/screens/PronunciationLabScreen';
import { VocabularySrsScreen } from './components/screens/VocabularySrsScreen';
import { StoriesScreen } from './components/screens/StoriesScreen';
import { ProgressScreen } from './components/screens/ProgressScreen';
import { ParentDashboardScreen } from './components/screens/ParentDashboardScreen';
import { AdminScreen } from './components/screens/AdminScreen';
import { SubscriptionScreen } from './components/screens/SubscriptionScreen';
import { SystemHealthModal } from './components/common/SystemHealthModal';
import { WebsiteVariantView } from './components/variants/WebsiteVariantView';
import { MobileAppVariantView } from './components/variants/MobileAppVariantView';
import { WebAppVariantView } from './components/variants/WebAppVariantView';
import { LeonardoTriggerButton } from './components/leonardo/LeonardoTriggerButton';
import { LeonardoAssistantModal } from './components/leonardo/LeonardoAssistantModal';
import { LeonardoAction } from './types';

export default function App() {
  const [appVariant, setAppVariant] = useState<AppVariant>('webapp');
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => getStoredCurrentUser());
  const [currentScreen, setCurrentScreen] = useState<string>('home');
  const [activeLesson, setActiveLesson] = useState<LessonUnit>(CURRICULUM_LESSONS[0]);
  const [accessibility, setAccessibility] = useState<AccessibilitySettings>(() => getStoredAccessibility());
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState<boolean>(false);
  const [isPipelinesOpen, setIsPipelinesOpen] = useState<boolean>(false);
  const [isAiOnline, setIsAiOnline] = useState<boolean>(true);
  const [isLeonardoOpen, setIsLeonardoOpen] = useState<boolean>(false);
  const [leonardoInitialPrompt, setLeonardoInitialPrompt] = useState<string | undefined>(undefined);

  // Check backend server health
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        setIsAiOnline(data.aiConfigured !== false);
      })
      .catch(() => {
        setIsAiOnline(false);
      });

    // Subscribe to Firebase Auth
    import('./firebase/userService').then(({ subscribeToAuthChanges, fetchUserProfileFromFirestore }) => {
      const unsub = subscribeToAuthChanges(async (fbUser) => {
        if (fbUser) {
          try {
            const profile = await fetchUserProfileFromFirestore(fbUser.uid);
            if (profile) {
              setCurrentUser(profile);
              saveCurrentUser(profile);
            }
          } catch (e) {
            console.error('Error fetching Firestore user profile', e);
          }
        }
      });
      return () => unsub();
    });

    const handleOpenLeonardoEvent = (e: Event) => {
      setIsLeonardoOpen(true);
      const customEv = e as CustomEvent<{ prompt?: string }>;
      if (customEv.detail?.prompt) {
        setLeonardoInitialPrompt(customEv.detail.prompt);
      }
    };
    window.addEventListener('open-leonardo', handleOpenLeonardoEvent);
    return () => {
      window.removeEventListener('open-leonardo', handleOpenLeonardoEvent);
    };
  }, []);

  const handleSwitchUser = (userId: string) => {
    const updated = switchUserProfile(userId);
    setCurrentUser(updated);
  };

  const handleChangeTargetLanguage = (langId: string) => {
    const updated: UserProfile = { ...currentUser, targetLanguage: langId };
    setCurrentUser(updated);
    saveCurrentUser(updated);
    import('./firebase/userService').then(({ saveUserProfileToFirestore }) => {
      saveUserProfileToFirestore(updated).catch(() => {});
    });
  };

  const handleUpdateCurrentUser = (updated: UserProfile) => {
    setCurrentUser(updated);
    saveCurrentUser(updated);
    import('./firebase/userService').then(({ saveUserProfileToFirestore }) => {
      saveUserProfileToFirestore(updated).catch(() => {});
    });
  };

  const handleUpdateAccessibility = (newSettings: AccessibilitySettings) => {
    setAccessibility(newSettings);
    saveAccessibility(newSettings);
  };

  const handleStartLesson = (lesson: LessonUnit) => {
    setActiveLesson(lesson);
    setCurrentScreen('lesson');
  };

  const handleLeonardoAction = (action: LeonardoAction) => {
    if (action.type === 'navigate' && action.payload?.screen) {
      if (appVariant !== 'webapp') setAppVariant('webapp');
      setCurrentScreen(action.payload.screen as string);
    } else if (action.type === 'start_challenge') {
      if (appVariant !== 'webapp') setAppVariant('webapp');
      setCurrentScreen('home');
    } else if (action.type === 'review_srs') {
      if (appVariant !== 'webapp') setAppVariant('webapp');
      setCurrentScreen('srs');
    } else if (action.type === 'switch_language' && action.payload?.langId) {
      handleChangeTargetLanguage(action.payload.langId as string);
    } else if (action.type === 'run_self_correct') {
      fetch('/api/billing/self-correct-glitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, clientGlitchReport: true }),
      }).catch(() => {});
    }
  };

  const handleAddXp = (amount: number) => {
    const updated: UserProfile = {
      ...currentUser,
      totalXp: (currentUser.totalXp || 0) + amount,
      dailyXpEarnedToday: (currentUser.dailyXpEarnedToday || 0) + amount,
    };
    handleUpdateCurrentUser(updated);
  };

  // Dynamic accessibility classes
  const fontScaleClass =
    accessibility.fontSize === 'large'
      ? 'font-scale-large'
      : accessibility.fontSize === 'xlarge'
      ? 'font-scale-xlarge'
      : '';
  const dyslexiaClass = accessibility.dyslexiaFont ? 'dyslexia-font' : '';
  const contrastClass = accessibility.highContrast ? 'high-contrast' : '';

  // 1. WEBSITE VARIANT
  if (appVariant === 'website') {
    return (
      <div className={`min-h-screen bg-slate-50 text-slate-800 ${fontScaleClass} ${dyslexiaClass} ${contrastClass}`}>
        <WebsiteVariantView
          onLaunchWebApp={() => setAppVariant('webapp')}
          onLaunchMobileApp={() => setAppVariant('mobile')}
          onSelectLanguage={handleChangeTargetLanguage}
          onOpenPricing={() => {
            setAppVariant('webapp');
            setCurrentScreen('subscription');
          }}
        />
        <AccessibilityModal
          isOpen={isAccessibilityOpen}
          onClose={() => setIsAccessibilityOpen(false)}
          settings={accessibility}
          onUpdateSettings={handleUpdateAccessibility}
        />
        <LeonardoTriggerButton
          isOpen={isLeonardoOpen}
          onToggle={() => setIsLeonardoOpen(!isLeonardoOpen)}
        />
        <LeonardoAssistantModal
          isOpen={isLeonardoOpen}
          onClose={() => setIsLeonardoOpen(false)}
          currentUser={currentUser}
          currentScreen={currentScreen}
          initialPrompt={leonardoInitialPrompt}
          onClearInitialPrompt={() => setLeonardoInitialPrompt(undefined)}
          onNavigate={(screen) => {
            setAppVariant('webapp');
            setCurrentScreen(screen);
          }}
          onActionTrigger={handleLeonardoAction}
          onAddXp={handleAddXp}
        />
      </div>
    );
  }

  // 2. MOBILE APP VARIANT (PWA Touch Ergonomics)
  if (appVariant === 'mobile') {
    return (
      <div className={`min-h-screen bg-slate-100 text-slate-800 ${fontScaleClass} ${dyslexiaClass} ${contrastClass}`}>
        <MobileAppVariantView
          currentUser={currentUser}
          onUpdateCurrentUser={handleUpdateCurrentUser}
          onStartLesson={handleStartLesson}
          onNavigateToScreen={(screen) => {
            setAppVariant('webapp');
            setCurrentScreen(screen);
          }}
          onSwitchToWebApp={() => setAppVariant('webapp')}
          onSwitchToWebsite={() => setAppVariant('website')}
          onOpenAccessibility={() => setIsAccessibilityOpen(true)}
        />
        <AccessibilityModal
          isOpen={isAccessibilityOpen}
          onClose={() => setIsAccessibilityOpen(false)}
          settings={accessibility}
          onUpdateSettings={handleUpdateAccessibility}
        />
        <LeonardoTriggerButton
          isOpen={isLeonardoOpen}
          onToggle={() => setIsLeonardoOpen(!isLeonardoOpen)}
        />
        <LeonardoAssistantModal
          isOpen={isLeonardoOpen}
          onClose={() => setIsLeonardoOpen(false)}
          currentUser={currentUser}
          currentScreen={currentScreen}
          initialPrompt={leonardoInitialPrompt}
          onClearInitialPrompt={() => setLeonardoInitialPrompt(undefined)}
          onNavigate={(screen) => {
            setAppVariant('webapp');
            setCurrentScreen(screen);
          }}
          onActionTrigger={handleLeonardoAction}
          onAddXp={handleAddXp}
        />
      </div>
    );
  }

  // 3. WEB APP STUDIO VARIANT (Desktop Immersion Workspace)
  return (
    <div className={`min-h-screen bg-slate-50 text-slate-800 ${fontScaleClass} ${dyslexiaClass} ${contrastClass}`}>
      <WebAppVariantView
        currentUser={currentUser}
        currentScreen={currentScreen}
        onNavigate={(screen) => setCurrentScreen(screen)}
        onSwitchUser={handleSwitchUser}
        onChangeTargetLanguage={handleChangeTargetLanguage}
        onOpenAccessibility={() => setIsAccessibilityOpen(true)}
        onOpenPipelines={() => setIsPipelinesOpen(true)}
        onSwitchToWebsite={() => setAppVariant('website')}
        onSwitchToMobileApp={() => setAppVariant('mobile')}
      >
        {/* Universal Navbar (hidden during full-screen immersive lesson, auth, onboarding, placement) */}
        {currentScreen !== 'lesson' && currentScreen !== 'auth' && currentScreen !== 'onboarding' && currentScreen !== 'placement' && (
          <Navbar
            currentScreen={currentScreen}
            onNavigate={(screen) => setCurrentScreen(screen)}
            currentUser={currentUser}
            onSwitchUser={handleSwitchUser}
            onChangeTargetLanguage={handleChangeTargetLanguage}
            onOpenAccessibility={() => setIsAccessibilityOpen(true)}
            onOpenPipelines={() => setIsPipelinesOpen(true)}
            onOpenLeonardo={() => setIsLeonardoOpen(true)}
            aiStatusOnline={isAiOnline}
            appVariant={appVariant}
            onSelectVariant={setAppVariant}
          />
        )}

        {/* Primary Screen Router */}
        <main>
          {currentScreen === 'landing' && (
            <LandingScreen
              onStartOnboarding={() => setCurrentScreen('onboarding')}
              onSelectExistingProfile={() => setCurrentScreen('auth')}
            />
          )}

          {currentScreen === 'auth' && (
            <AuthScreen
              onLoginSuccess={(user) => {
                setCurrentUser(user);
                setCurrentScreen('home');
              }}
              onCancel={() => setCurrentScreen('home')}
            />
          )}

          {currentScreen === 'onboarding' && (
            <OnboardingScreen
              onComplete={(user, shouldTakePlacement) => {
                setCurrentUser(user);
                if (shouldTakePlacement) {
                  setCurrentScreen('placement');
                } else {
                  setCurrentScreen('home');
                }
              }}
              onCancel={() => setCurrentScreen('home')}
            />
          )}

          {currentScreen === 'placement' && (
            <PlacementScreen
              currentUser={currentUser}
              onPlacementComplete={(user) => {
                setCurrentUser(user);
                setCurrentScreen('home');
              }}
              onSkipToBeginner={() => setCurrentScreen('home')}
            />
          )}

          {currentScreen === 'home' && (
            <HomeScreen
              currentUser={currentUser}
              onStartLesson={handleStartLesson}
              onNavigate={(screen) => setCurrentScreen(screen)}
              onUpdateUser={handleUpdateCurrentUser}
              onOpenPipelines={() => setIsPipelinesOpen(true)}
            />
          )}

          {currentScreen === 'lesson' && (
            <LessonPlayerScreen
              lesson={activeLesson}
              currentUser={currentUser}
              onComplete={(updatedUser) => {
                if (updatedUser) {
                  setCurrentUser(updatedUser);
                } else {
                  setCurrentUser(getStoredCurrentUser());
                }
                setCurrentScreen('home');
              }}
              onExit={() => setCurrentScreen('home')}
            />
          )}

          {currentScreen === 'tutor' && (
            <ConversationTutorScreen
              currentUser={currentUser}
              onUpdateUser={handleUpdateCurrentUser}
              onNavigate={(screen) => setCurrentScreen(screen)}
            />
          )}

          {currentScreen === 'pronunciation' && (
            <PronunciationLabScreen currentUser={currentUser} />
          )}

          {currentScreen === 'srs' && (
            <VocabularySrsScreen currentUser={currentUser} />
          )}

          {currentScreen === 'stories' && (
            <StoriesScreen currentUser={currentUser} />
          )}

          {currentScreen === 'progress' && (
            <ProgressScreen currentUser={currentUser} />
          )}

          {currentScreen === 'parent' && (
            <ParentDashboardScreen currentUser={currentUser} />
          )}

          {currentScreen === 'admin' && (
            <AdminScreen currentUser={currentUser} />
          )}

          {currentScreen === 'subscription' && (
            <SubscriptionScreen
              currentUser={currentUser}
              onUpdateUser={handleUpdateCurrentUser}
              onNavigate={(screen) => setCurrentScreen(screen)}
            />
          )}
        </main>
      </WebAppVariantView>

      {/* Accessibility Preferences Modal */}
      <AccessibilityModal
        isOpen={isAccessibilityOpen}
        onClose={() => setIsAccessibilityOpen(false)}
        settings={accessibility}
        onUpdateSettings={handleUpdateAccessibility}
      />

      {/* Self-Updating Pipelines & System Health Telemetry Modal */}
      <SystemHealthModal
        isOpen={isPipelinesOpen}
        onClose={() => setIsPipelinesOpen(false)}
      />

      {/* Leonardo Floating Assistant Trigger */}
      <LeonardoTriggerButton
        isOpen={isLeonardoOpen}
        onToggle={() => setIsLeonardoOpen(!isLeonardoOpen)}
      />

      {/* Leonardo Intelligent Assistant Modal */}
      <LeonardoAssistantModal
        isOpen={isLeonardoOpen}
        onClose={() => setIsLeonardoOpen(false)}
        currentUser={currentUser}
        currentScreen={currentScreen}
        initialPrompt={leonardoInitialPrompt}
        onClearInitialPrompt={() => setLeonardoInitialPrompt(undefined)}
        onNavigate={(screen) => setCurrentScreen(screen)}
        onActionTrigger={handleLeonardoAction}
        onAddXp={handleAddXp}
      />
    </div>
  );
}
