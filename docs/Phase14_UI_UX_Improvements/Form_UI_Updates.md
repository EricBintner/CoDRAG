# Form UI/UX Improvements

## Overview
Addressed spacing and layout issues in the Dashboard form components to improve usability and visual hierarchy.

## Changes

### 1. BuildCard Component
- **Path**: `packages/ui/src/components/dashboard/BuildCard.tsx`
- **Changes**:
  - Increased vertical spacing from `space-y-4` to `space-y-6` to separate the input field from the title and button.
  - Added bottom margin (`mb-2`) to the "Repository Root" label for better separation from the input field.

### 2. SearchPanel Component
- **Path**: `packages/ui/src/components/search/SearchPanel.tsx`
- **Changes**:
  - Added explicit labels ("Search Query", "Results (K)", "Min Score") to all inputs for better accessibility and clarity.
  - Increased vertical spacing to `space-y-6`.
  - Grouped "Results (K)", "Min Score", and the "Search" button in a flex row with `gap-4` and `items-end` alignment.
  - This ensures the button aligns visually with the input fields (accounting for the label height).
  - Adjusted button width/padding (`px-8`) for a more substantial click target.
  - Added placeholder "0.0 - 1.0" to Min Score for clarity.

### 3. ContextOptionsPanel Component
- **Path**: `packages/ui/src/components/search/ContextOptionsPanel.tsx`
- **Changes**:
  - Restructured the layout to use a vertical stack (`space-y-6`) separating the numeric inputs from the toggle switches.
  - Added a divider (`border-t`) between the inputs and the switches.
  - Added explicit labels for "Chunks (k)" and "Max Chars".
  - Grouped switches under an "Inclusions" label.
  - Added hover effects (`hover:opacity-80`) to switch labels for better interactivity feedback.

### 4. SymbolSearchInput Component
- **Path**: `packages/ui/src/components/trace/SymbolSearchInput.tsx`
- **Changes**:
  - Replaced the custom CSS spinner with the standard `Loader2` icon from `lucide-react` for consistency with other components.
  - Increased gap between the input and the filter select (`gap-3`).
  - Adjusted the width of the filter select to `w-36` to better accommodate the text.

### 5. SymbolResultRow Component
- **Path**: `packages/ui/src/components/trace/SymbolResultRow.tsx`
- **Changes**:
  - Updated selection state styling to use theme tokens (`border-primary`, `bg-primary/5`) instead of hardcoded blue colors.
  - Aligned hover states (`hover:border-border`, `hover:shadow-sm`) with `SearchResultsList` for consistency across lists.
  - Used `bg-surface-raised` for the base background to match other list items.

### 6. TraceStatusCard Component
- **Path**: `packages/ui/src/components/trace/TraceStatusCard.tsx`
- **Changes**:
  - Updated layout to use `space-y-6` for consistent vertical spacing with other dashboard cards.
  - Grouped content sections (Header, Stats, Footer/Actions) logically.
  - Improved spacing around the error message and build time display.

## Verification
- Components should now have consistent spacing (usually `space-y-6` for main sections).
- Labels are consistently placed above inputs.
- Buttons and inputs in the same row are aligned at the bottom to account for labels.
- Loading states use consistent iconography.
