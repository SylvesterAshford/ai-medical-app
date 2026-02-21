# Implementation Tasks: Burmese Text Padding Fix

## Task 1: Update HomeScreen Text Components
Apply typography styles to all text elements in HomeScreen to fix Burmese character clipping.

**Details:**
- Update header label and subtitle to use typography.h3 and typography.bodySmall
- Update greeting text to use typography.h1
- Update feature card titles to use typography.h3
- Update feature card subtitles to use typography.bodySmall
- Update topics section title to use typography.h2
- Update topic card titles to use typography.h3
- Update topic card descriptions to use typography.bodySmall

**Files to modify:**
- src/screens/HomeScreen.tsx

## Task 2: Update ProfileScreen Text Components
Apply typography styles to all text elements in ProfileScreen.

**Details:**
- Update screen title to use typography.h1
- Update menu item labels to use typography.body
- Update section headers to use typography.h3
- Update profile name and email to use appropriate typography styles

**Files to modify:**
- src/screens/ProfileScreen.tsx

## Task 3: Update ChatScreen Text Components
Apply typography styles to all text elements in ChatScreen.

**Details:**
- Update header title to use typography.h2
- Update status text (online/offline) to use typography.caption
- Update message bubble text to use typography.body
- Update placeholder text to use typography.body

**Files to modify:**
- src/screens/ChatScreen.tsx

## Task 4: Update EmergencyScreen Text Components
Apply typography styles to all text elements in EmergencyScreen.

**Details:**
- Update main emergency text to use typography.h1
- Update description text to use typography.body
- Update button text to use typography.button
- Update all labels and captions to use appropriate typography styles

**Files to modify:**
- src/screens/EmergencyScreen.tsx

## Task 5: Update HospitalFinderScreen Text Components
Apply typography styles to all text elements in HospitalFinderScreen.

**Details:**
- Update screen title to use typography.h1
- Update section headers to use typography.h2
- Update hospital card text to use appropriate typography styles
- Update emergency banner text to use typography.body

**Files to modify:**
- src/screens/HospitalFinderScreen.tsx

## Task 6: Update HealthToolsScreen Text Components
Apply typography styles to all text elements in HealthToolsScreen.

**Details:**
- Update screen title to use typography.h1
- Update tool card titles to use typography.h3
- Update tool card descriptions to use typography.bodySmall

**Files to modify:**
- src/screens/HealthToolsScreen.tsx

## Task 7: Update Remaining Screen Components
Apply typography styles to LoginScreen, OnboardingScreen, SubscriptionScreen, and ImageAnalysisScreen.

**Details:**
- Update all titles, labels, and body text in each screen
- Apply appropriate typography styles based on text hierarchy
- Ensure consistent application across all screens

**Files to modify:**
- src/screens/LoginScreen.tsx
- src/screens/OnboardingScreen.tsx
- src/screens/SubscriptionScreen.tsx
- src/screens/ImageAnalysisScreen.tsx

## Task 8: Update Reusable Component Text
Apply typography styles to reusable components.

**Details:**
- Update HospitalCard text elements
- Update TriageQuestionCard text elements
- Update DisclaimerModal title and body text
- Update OfflineBanner text

**Files to modify:**
- src/components/HospitalCard.tsx
- src/components/TriageQuestionCard.tsx
- src/components/DisclaimerModal.tsx
- src/components/OfflineBanner.tsx

## Task 9: Visual Testing and Validation
Test all updated components with both English and Burmese text.

**Details:**
- Switch app language to Burmese and verify no text clipping on all screens
- Switch app language to English and verify text renders correctly
- Check all headers, titles, buttons, and labels
- Verify card components display text correctly
- Test modal and overlay text rendering
- Document any remaining issues

**Testing approach:**
- Manual visual inspection of each screen
- Test language switching functionality
- Verify both portrait and landscape orientations if applicable
