# UI Components Documentation

## Overview
The Shamiri Journal application uses a component-based architecture built with Next.js 14, React, TypeScript, and shadcn/ui. Components are organized by feature and responsibility, emphasizing reusability and maintainability.

## Component Organization

### Directory Structure
```
src/
├── components/
│   ├── ui/            # Reusable UI components
│   ├── settings/      # Settings-related components
│   ├── journal/       # Journal-related components
│   ├── analytics/     # Analytics components
│   └── shared/        # Shared components
├── hooks/             # Custom React hooks
└── lib/              # Utility functions and services
```

## Core Components

### Settings Components

#### PersonalInfoCard
Profile information management component.

```typescript
interface PersonalInfoCardProps {
  formData: {
    name: string;
    bio: string;
    location: string;
  };
  onInputChange: (field: string, value: string) => void;
}
```

**Features:**
- User name input field
- Bio text input field
- Location input field
- Real-time validation
- Form state management

**Usage:**
```tsx
<PersonalInfoCard 
  formData={formData} 
  onInputChange={handleInputChange} 
/>
```

#### PreferencesCard
User preferences management component.

```typescript
interface PreferencesCardProps {
  formData: {
    theme: string;
    emailNotifications: boolean;
  };
  onInputChange: (field: string, value: any) => void;
}
```

**Features:**
- Theme selection (Light/Dark/System)
- Email notifications toggle
- Immediate preference application
- State persistence

**Usage:**
```tsx
<PreferencesCard 
  formData={formData} 
  onInputChange={handleInputChange} 
/>
```

#### AccountCard
Account management component.

```typescript
interface AccountCardProps {
  email: string;
}
```

**Features:**
- Email display
- Password change functionality
- Account security settings
- Modal integration

**Usage:**
```tsx
<AccountCard email={user.email} />
```

### Custom Hooks

#### useProfile
Profile management hook.

```typescript
interface UseProfileReturn {
  profile: UserProfile | null;
  formData: FormData;
  isLoading: boolean;
  error: string | null;
  isDirty: boolean;
  handleSave: () => Promise<void>;
  handleInputChange: (field: string, value: any) => void;
}

const {
  profile,
  formData,
  isLoading,
  error,
  isDirty,
  handleSave,
  handleInputChange
} = useProfile();
```

**Features:**
- Profile data fetching
- Form state management
- Error handling
- Loading states
- Save functionality
- Dirty state tracking

## UI Elements

### Form Components

#### Input
Enhanced input component with validation.

```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  helperText?: string;
}
```

**Usage:**
```tsx
<Input
  label="Name"
  value={value}
  onChange={onChange}
  error={error}
  helperText="Enter your full name"
/>
```

#### Select
Enhanced select component with theme support.

```typescript
interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  items: { label: string; value: string }[];
}
```

**Usage:**
```tsx
<Select
  value={theme}
  onValueChange={handleThemeChange}
  items={themeOptions}
/>
```

### Feedback Components

#### Toast
Notification system for user feedback.

**Features:**
- Success messages
- Error notifications
- Loading states
- Custom styling
- Auto-dismiss

**Usage:**
```typescript
toast.success('Profile updated successfully');
toast.error('Failed to update profile');
```

#### LoadingSpinner
Loading indicator component.

```typescript
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}
```

**Usage:**
```tsx
<LoadingSpinner size="md" className="text-primary" />
```

## Layout Components

### Card
Container component for content sections.

```typescript
interface CardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}
```

**Usage:**
```tsx
<Card
  title="Personal Information"
  description="Update your details"
>
  {children}
</Card>
```

## State Management

### Form State
Form state is managed using controlled components and the `useProfile` hook.

```typescript
interface FormData {
  name: string;
  bio: string;
  location: string;
  theme: string;
  emailNotifications: boolean;
}
```

### Loading State
Loading states are managed through the `useProfile` hook and displayed using the `LoadingSpinner` component.

### Error State
Error handling is implemented at multiple levels:
- Form validation errors
- API request errors
- Network errors
- Toast notifications

## Accessibility

### ARIA Labels
All interactive components include proper ARIA labels:
```tsx
<button
  aria-label="Save changes"
  aria-disabled={isLoading}
>
  Save
</button>
```

### Keyboard Navigation
Components support keyboard navigation:
- Tab navigation
- Enter key submission
- Escape key for modals
- Arrow keys for selects

## Theming

### Theme Configuration
```typescript
interface Theme {
  light: Record<string, string>;
  dark: Record<string, string>;
  system: Record<string, string>;
}
```

### Theme Application
Themes are applied using CSS variables and Tailwind CSS:
```css
:root {
  --primary: var(--color-primary);
  --background: var(--color-background);
  --text: var(--color-text);
}
```

## Best Practices

### Component Guidelines
1. Single Responsibility
2. Props Interface Definition
3. Error Boundary Implementation
4. Loading State Handling
5. Accessibility Compliance

### Performance Optimization
1. Memoization
2. Lazy Loading
3. Debounced Updates
4. Optimized Re-renders

## Testing

### Component Tests
```typescript
describe('PersonalInfoCard', () => {
  it('renders user information correctly', () => {
    // Test implementation
  });

  it('handles input changes', () => {
    // Test implementation
  });
});
```

### Hook Tests
```typescript
describe('useProfile', () => {
  it('fetches profile data', async () => {
    // Test implementation
  });

  it('handles form updates', () => {
    // Test implementation
  });
});
```

## Future Enhancements

### Planned Components
1. Profile Picture Upload
2. Social Media Integration
3. Activity Timeline
4. Advanced Analytics

### Accessibility Improvements
1. Screen Reader Optimization
2. High Contrast Mode
3. Motion Reduction Support
4. Focus Management

### Performance Optimizations
1. Component Code Splitting
2. Image Loading Strategy
3. State Management Optimization
4. Network Request Caching
``` 