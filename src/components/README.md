# Component Documentation

## Overview

The Shamiri Journal application uses shadcn/ui components, which are built on top of Radix UI primitives. All components are built with TypeScript and styled using Tailwind CSS.

## Component Categories

### Layout Components
- Navigation
- Header
- Footer
- Sidebar
- Layout

### Form Components
- Input
- Button
- Select
- Checkbox
- Radio
- Switch
- Textarea
- Form
- Label

### Data Display Components
- Card
- Badge
- Progress
- Avatar
- Alert
- Toast
- Dialog
- Modal
- Tabs
- Table

### Journal Components
- JournalEntry
- JournalList
- JournalEditor
- JournalCard
- JournalHeader
- JournalFooter

### Analytics Components
- SentimentAnalysis
- MonthlyActivityChart
- AnalyticsDashboard

## Component Library

### Base Components

#### Input
```tsx
import { Input } from "@/components/ui/input"

export function InputDemo() {
  return (
    <Input
      type="text"
      placeholder="Enter text..."
      className="w-full"
    />
  )
}
```

#### Button
```tsx
import { Button } from "@/components/ui/button"

export function ButtonDemo() {
  return (
    <Button variant="default">
      Click me
    </Button>
  )
}
```

#### Select
```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function SelectDemo() {
  return (
    <Select>
      <SelectTrigger>
        <SelectValue placeholder="Select option" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option1">Option 1</SelectItem>
        <SelectItem value="option2">Option 2</SelectItem>
      </SelectContent>
    </Select>
  )
}
```

#### Card
```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"

export function CardDemo() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card Description</CardDescription>
      </CardHeader>
      <CardContent>
        Card content goes here
      </CardContent>
      <CardFooter>
        Card footer content
      </CardFooter>
    </Card>
  )
}
```

### Journal Components

#### JournalEntry
```tsx
import { JournalEntry } from "@/components/journal/journal-entry"

export function JournalEntryDemo() {
  return (
    <JournalEntry
      title="My Journal Entry"
      content="Entry content..."
      date={new Date()}
      categories={["Personal", "Thoughts"]}
    />
  )
}
```

#### JournalEditor
```tsx
import { JournalEditor } from "@/components/journal/journal-editor"

export function JournalEditorDemo() {
  return (
    <JournalEditor
      initialContent=""
      onSave={(content) => console.log(content)}
    />
  )
}
```

### Analytics Components

#### SentimentAnalysis
```tsx
import { SentimentAnalysis } from "@/components/analytics/sentiment-analysis"

export function SentimentAnalysisDemo() {
  return (
    <SentimentAnalysis
      data={[
        { date: "2024-01", positive: 0.7, negative: 0.3 },
        { date: "2024-02", positive: 0.8, negative: 0.2 },
      ]}
    />
  )
}
```

#### MonthlyActivityChart
```tsx
import { MonthlyActivityChart } from "@/components/analytics/monthly-activity-chart"

export function MonthlyActivityChartDemo() {
  return (
    <MonthlyActivityChart
      data={[
        { month: "Jan", entries: 5 },
        { month: "Feb", entries: 8 },
      ]}
    />
  )
}
```

## Styling

Components are styled using Tailwind CSS. The theme configuration is in `tailwind.config.js`:

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        // ... other color variables
      },
    },
  },
}
```

Component variants are handled through the `variant` prop:

```tsx
<Button variant="default">Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
```

## Accessibility

All components follow accessibility best practices:

1. ARIA attributes
2. Keyboard navigation
3. Screen reader compatibility
4. Focus management
5. Color contrast

Example of accessible component:

```tsx
import { Button } from "@/components/ui/button"

export function AccessibleButton() {
  return (
    <Button
      aria-label="Save changes"
      onClick={() => console.log("Saving...")}
    >
      Save
    </Button>
  )
}
```

## Testing

Components are tested using Jest and React Testing Library:

```tsx
import { render, screen, fireEvent } from "@testing-library/react"
import { Button } from "@/components/ui/button"

describe("Button", () => {
  it("renders correctly", () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole("button")).toHaveTextContent("Click me")
  })

  it("handles click events", () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    fireEvent.click(screen.getByRole("button"))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

## Contributing

When creating new components:

1. Follow the shadcn/ui component structure
2. Use TypeScript for type safety
3. Include proper documentation
4. Add tests for functionality
5. Ensure accessibility compliance
6. Follow the project's styling conventions

## Resources

- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro) 