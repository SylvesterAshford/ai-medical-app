# Requirements Document: Burmese Text Padding Fix

## Introduction

This specification addresses the systematic issue of Burmese character clipping throughout the React Native medical AI assistant application. Burmese script contains tall glyphs that extend significantly above the normal text baseline, causing the tops of characters to be cut off when insufficient vertical padding is provided. While the theme system already defines appropriate paddingTop values for typography styles, these styles are not consistently applied across all Text components in the application, resulting in widespread clipping issues.

The solution involves ensuring all Text components throughout the application properly apply the existing typography styles from the theme, creating a consistent and readable experience for Burmese-speaking users.

## Glossary

- **Typography_System**: The centralized design system defined in `src/theme/index.ts` that contains typography styles (h1, h2, h3, body, etc.) with appropriate paddingTop values for Burmese text
- **Text_Component**: React Native's Text component used to render text content throughout the application
- **Burmese_Script**: The writing system used for the Burmese language, characterized by tall glyphs that extend above the normal text baseline
- **Clipping**: The visual truncation of text where the top portions of tall glyphs are cut off due to insufficient vertical space
- **Theme_Style**: A predefined style object from the Typography_System that includes fontSize, fontWeight, lineHeight, paddingTop, and other text styling properties

## Requirements

### Requirement 1: Typography System Application

**User Story:** As a developer, I want all Text components to consistently apply typography styles from the theme system, so that Burmese text displays correctly without clipping across the entire application.

#### Acceptance Criteria

1. WHEN a Text component renders header text (h1, h2, h3), THE Text_Component SHALL apply the corresponding typography style from the Typography_System
2. WHEN a Text component renders body text, THE Text_Component SHALL apply the body or bodySmall typography style from the Typography_System
3. WHEN a Text component renders caption or label text, THE Text_Component SHALL apply the caption or tabLabel typography style from the Typography_System
4. WHEN a Text component applies a typography style, THE Text_Component SHALL preserve any additional custom styles provided by the component
5. THE Typography_System SHALL maintain existing paddingTop values (h1: 4, h2: 4, h3: 4, body: 3, bodySmall: 3, caption: 2, button: 3, tabLabel: 2)

### Requirement 2: Screen Header Text Rendering

**User Story:** As a Burmese-speaking user, I want all screen headers and titles to display fully without clipping, so that I can read page titles clearly.

#### Acceptance Criteria

1. WHEN a screen displays a header title, THE Text_Component SHALL render the full height of Burmese characters without clipping the top portions
2. WHEN a screen displays a subtitle or description in the header, THE Text_Component SHALL render the full height of Burmese characters without clipping
3. WHEN header text uses gradient backgrounds, THE Text_Component SHALL maintain sufficient padding to prevent clipping
4. FOR ALL screens in `src/screens/`, header text SHALL apply appropriate typography styles from the Typography_System

### Requirement 3: Card Component Text Rendering

**User Story:** As a Burmese-speaking user, I want all text within cards to display fully without clipping, so that I can read card content clearly.

#### Acceptance Criteria

1. WHEN a Card component contains title text, THE Text_Component SHALL render Burmese characters without clipping
2. WHEN a Card component contains body or description text, THE Text_Component SHALL render Burmese characters without clipping
3. WHEN a Card component contains label or caption text, THE Text_Component SHALL render Burmese characters without clipping
4. FOR ALL card-based components (Card, HospitalCard, TriageQuestionCard), text SHALL apply appropriate typography styles

### Requirement 4: Button Text Rendering

**User Story:** As a Burmese-speaking user, I want all button labels to display fully without clipping, so that I can understand button actions clearly.

#### Acceptance Criteria

1. WHEN a GradientButton component renders text, THE Text_Component SHALL apply the button typography style from the Typography_System
2. WHEN a TouchableOpacity contains text acting as a button, THE Text_Component SHALL render Burmese characters without clipping
3. WHEN button text is rendered in any component, THE Text_Component SHALL maintain the paddingTop value of 3 from the button typography style

### Requirement 5: Navigation and Tab Text Rendering

**User Story:** As a Burmese-speaking user, I want tab labels and navigation text to display fully without clipping, so that I can navigate the app clearly.

#### Acceptance Criteria

1. WHEN the TabBar component renders tab labels, THE Text_Component SHALL apply the tabLabel typography style with paddingTop of 2
2. WHEN navigation elements contain text labels, THE Text_Component SHALL render Burmese characters without clipping
3. WHEN tab labels switch between active and inactive states, THE Text_Component SHALL maintain consistent padding

### Requirement 6: Modal and Overlay Text Rendering

**User Story:** As a Burmese-speaking user, I want modal headers and overlay text to display fully without clipping, so that I can read modal content clearly.

#### Acceptance Criteria

1. WHEN a modal displays a header or title, THE Text_Component SHALL render Burmese characters without clipping
2. WHEN a DisclaimerModal or other modal component contains text, THE Text_Component SHALL apply appropriate typography styles
3. WHEN overlay components display text, THE Text_Component SHALL maintain sufficient padding for Burmese script

### Requirement 7: Input and Form Text Rendering

**User Story:** As a Burmese-speaking user, I want input labels and placeholder text to display fully without clipping, so that I can understand form fields clearly.

#### Acceptance Criteria

1. WHEN a form displays input labels, THE Text_Component SHALL render Burmese characters without clipping
2. WHEN input fields contain placeholder text in Burmese, THE TextInput SHALL render characters without clipping
3. WHEN form validation messages are displayed, THE Text_Component SHALL apply appropriate typography styles

### Requirement 8: Consistency Across Language Modes

**User Story:** As a user switching between English and Burmese, I want text rendering to work correctly in both languages, so that the app provides a consistent experience regardless of language selection.

#### Acceptance Criteria

1. WHEN the app language is set to English, THE Text_Component SHALL render text correctly without excessive padding
2. WHEN the app language is set to Burmese, THE Text_Component SHALL render text without clipping
3. WHEN a user switches between English and Burmese, THE Text_Component SHALL maintain appropriate padding for both scripts
4. THE Typography_System paddingTop values SHALL work correctly for both English and Burmese text

### Requirement 9: Component Reusability and Maintainability

**User Story:** As a developer, I want a maintainable solution that leverages the existing theme system, so that future text components automatically handle Burmese text correctly.

#### Acceptance Criteria

1. THE solution SHALL utilize the existing Typography_System without creating duplicate padding logic
2. WHEN new Text components are added to the application, THE components SHALL apply typography styles from the Typography_System
3. WHEN typography styles are updated in the theme, THE changes SHALL automatically apply to all Text components using those styles
4. THE solution SHALL NOT require individual padding adjustments in each component file
