# Design Document: Burmese Text Padding Fix

## Overview

This design addresses the systematic issue of Burmese character clipping in a React Native medical AI assistant application. Burmese script contains tall glyphs (diacritics and vowel marks) that extend significantly above the baseline, requiring additional vertical padding to prevent visual truncation.

The application already has a well-designed typography system in `src/theme/index.ts` with appropriate `paddingTop` values for different text styles. However, these styles are not consistently applied across all Text components throughout the application, resulting in clipping issues on many screens.

The solution involves a systematic audit and update of all Text components to ensure they properly apply the existing typography styles, creating a consistent and readable experience for Burmese-speaking users without breaking English text rendering.

## Architecture

### Current State Analysis

**Typography System (src/theme/index.ts)**:
- Defines typography styles: h1, h2, h3, body, bodySmall, caption, button, tabLabel
- Each style includes appropriate `paddingTop` values (ranging from 2-4 pixels)
- Styles also include fontSize, fontWeight, lineHeight, and color properties

**Component Categories**:
1. **Correctly Implemented**: Components that already apply typography styles
   - GradientButton: Applies `typography.button` style
   - TabBar: Applies `typography.tabLabel` with additional marginTop
   - Some screen headers that use typography styles

2. **Needs Update**: Components with inline styles or missing typography application
   - Screen headers and titles across multiple screens
   - Card titles and descriptions
   - Form labels and input-related text
   - Modal headers and content
   - List items and menu labels

### Solution Architecture

The solution follows a **systematic audit and update pattern**:

1. **Audit Phase**: Identify all Text components that don't apply typography styles
2. **Update Phase**: Apply appropriate typography styles from the theme
3. **Validation Phase**: Test with both English and Burmese text

**Key Principles**:
- Leverage existing typography system (no new padding logic)
- Maintain backward compatibility with English text
- Preserve custom styles while adding typography base styles
- Use style composition: `[typography.h1, customStyles]`

## Components and Interfaces

### Typography Style Application Pattern

```typescript
// BEFORE (problematic)
<Text style={styles.title}>
  {title}
</Text>

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.text,
    // Missing paddingTop for Burmese text
  },
});

// AFTER (correct)
<Text style={[typography.h2, styles.title]}>
  {title}
</Text>

const styles = StyleSheet.create({
  title: {
    // Only custom overrides, typography.h2 provides base styles
    // including paddingTop: 4
  },
});
```

### Component Update Strategy

**Screen Components** (src/screens/):
- HomeScreen: Update header titles, feature card titles, topic titles
- ChatScreen: Update header title, bubble text (already has some typography)
- HealthToolsScreen: Update header title, section titles, labels
- ProfileScreen: Update header title, menu labels, profile name
- EmergencyScreen: Update all text elements
- HospitalFinderScreen: Update headers and card text
- ImageAnalysisScreen: Update headers and result text
- SubscriptionScreen: Update plan titles and descriptions
- OnboardingScreen: Update slide titles and descriptions
- LoginScreen: Update form labels and titles

**Reusable Components** (src/components/):
- Card: No changes needed (container only)
- HospitalCard: Update hospital name and address text
- TriageQuestionCard: Update question text
- DisclaimerModal: Update title and body text
- OfflineBanner: Update banner text

### Style Composition Rules

1. **Always place typography style first** in the style array:
   ```typescript
   <Text style={[typography.h1, styles.customStyle]}>
   ```

2. **Typography styles provide base**, custom styles override:
   ```typescript
   // typography.h1 provides: fontSize, fontWeight, color, lineHeight, paddingTop
   // styles.customStyle can override any of these
   ```

3. **Preserve existing custom properties**:
   ```typescript
   // If a component has custom color or fontSize, keep them
   <Text style={[typography.h2, { color: colors.teal }]}>
   ```

## Data Models

No new data models are required. The existing typography system in the theme provides all necessary style definitions.

### Typography Style Reference

```typescript
typography = {
  h1: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.5,
    lineHeight: 40,
    paddingTop: 4,  // Critical for Burmese
  },
  h2: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.3,
    lineHeight: 32,
    paddingTop: 4,  // Critical for Burmese
  },
  h3: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 26,
    paddingTop: 4,  // Critical for Burmese
  },
  body: {
    fontSize: 15,
    fontWeight: '400',
    color: colors.text,
    lineHeight: 24,
    paddingTop: 3,  // Critical for Burmese
  },
  bodySmall: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.textSecondary,
    lineHeight: 20,
    paddingTop: 3,  // Critical for Burmese
  },
  caption: {
    fontSize: 11,
    fontWeight: '400',
    color: colors.textLight,
    lineHeight: 16,
    paddingTop: 2,  // Critical for Burmese
  },
  button: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    paddingTop: 3,  // Critical for Burmese
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    lineHeight: 14,
    paddingTop: 2,  // Critical for Burmese
  },
}
```