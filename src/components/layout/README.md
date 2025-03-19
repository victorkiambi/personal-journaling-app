# Layout Components Documentation

## Overview

Layout components are responsible for the overall structure and organization of the application. They provide consistent spacing, navigation, and responsive behavior across different screen sizes.

## Components

### Navigation

The main navigation component that provides access to different sections of the application.

```tsx
import { Navigation } from "@/components/layout/Navigation"

// Usage
<Navigation />
```

#### Features
- Responsive design with mobile menu
- Active route highlighting
- User authentication status
- Quick access to common actions
- Smooth transitions

#### Props
None (uses NextAuth session internally)

### Header

The application header component that displays the current page title and context-specific actions.

```tsx
import { Header } from "@/components/layout/Header"

// Usage
<Header
  title="Journal Entries"
  description="Manage your journal entries"
  actions={[
    <Button key="new">New Entry</Button>
  ]}
/>
```

#### Props
- `title`: string - The page title
- `description?`: string - Optional description
- `actions?`: ReactNode[] - Optional action buttons
- `backButton?`: boolean - Show back button
- `onBack?`: () => void - Back button click handler

### Footer

The application footer component that displays copyright information and additional links.

```tsx
import { Footer } from "@/components/layout/Footer"

// Usage
<Footer />
```

#### Features
- Copyright information
- Social media links
- Privacy policy link
- Terms of service link
- Responsive layout

### Sidebar

The sidebar component that provides additional navigation and context-specific information.

```tsx
import { Sidebar } from "@/components/layout/Sidebar"

// Usage
<Sidebar
  items={[
    {
      title: "Dashboard",
      icon: <HomeIcon />,
      href: "/dashboard"
    },
    {
      title: "Journal",
      icon: <BookIcon />,
      href: "/journal"
    }
  ]}
/>
```

#### Props
- `items`: Array<{
  - `title`: string
  - `icon`: ReactNode
  - `href`: string
  - `badge?`: string | number
  - `onClick?`: () => void
}>

### Layout

The main layout component that wraps the application content.

```tsx
import { Layout } from "@/components/layout/Layout"

// Usage
<Layout>
  <Header title="Page Title" />
  <main>
    {/* Page content */}
  </main>
  <Footer />
</Layout>
```

#### Props
- `children`: ReactNode - The page content
- `showNavigation?`: boolean - Show navigation (default: true)
- `showHeader?`: boolean - Show header (default: true)
- `showFooter?`: boolean - Show footer (default: true)

## Responsive Design

Layout components are designed to be responsive and adapt to different screen sizes:

### Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### Mobile Layout
- Collapsible navigation menu
- Full-width content
- Stacked header elements
- Simplified footer

### Tablet Layout
- Side navigation visible
- Split header layout
- Grid-based content
- Expanded footer

### Desktop Layout
- Full navigation visible
- Multi-column layout
- Rich header features
- Full footer with additional links

## Usage Examples

### Basic Page Layout
```tsx
import { Layout, Header, Footer } from "@/components/layout"

export default function Page() {
  return (
    <Layout>
      <Header
        title="My Journal"
        description="Write and organize your thoughts"
      />
      <main className="container mx-auto px-4 py-8">
        {/* Page content */}
      </main>
      <Footer />
    </Layout>
  )
}
```

### Dashboard Layout
```tsx
import { Layout, Header, Sidebar } from "@/components/layout"

export default function Dashboard() {
  return (
    <Layout>
      <Header
        title="Dashboard"
        description="Overview of your journaling activity"
      />
      <div className="flex">
        <Sidebar
          items={[
            {
              title: "Overview",
              icon: <HomeIcon />,
              href: "/dashboard"
            },
            {
              title: "Analytics",
              icon: <ChartIcon />,
              href: "/dashboard/analytics"
            }
          ]}
        />
        <main className="flex-1 p-6">
          {/* Dashboard content */}
        </main>
      </div>
    </Layout>
  )
}
```

## Best Practices

1. **Consistent Spacing**
   - Use the spacing scale defined in Tailwind config
   - Maintain consistent padding and margins
   - Use container classes for content width

2. **Responsive Behavior**
   - Test on multiple screen sizes
   - Ensure smooth transitions
   - Maintain usability on mobile

3. **Accessibility**
   - Use semantic HTML elements
   - Include proper ARIA attributes
   - Ensure keyboard navigation works

4. **Performance**
   - Lazy load components when possible
   - Optimize images and assets
   - Minimize layout shifts

## Testing

Layout components should be tested for:

1. **Responsive Behavior**
```tsx
import { render, screen } from "@testing-library/react"
import { Layout } from "@/components/layout/Layout"

test("Layout adapts to screen size", () => {
  render(
    <Layout>
      <div>Content</div>
    </Layout>
  )
  expect(screen.getByText("Content")).toBeInTheDocument()
})
```

2. **Navigation Integration**
```tsx
import { render, screen } from "@testing-library/react"
import { Navigation } from "@/components/layout/Navigation"

test("Navigation shows correct links", () => {
  render(<Navigation />)
  expect(screen.getByText("Journal")).toBeInTheDocument()
})
```

3. **Header Actions**
```tsx
import { render, screen } from "@testing-library/react"
import { Header } from "@/components/layout/Header"

test("Header shows actions", () => {
  render(
    <Header
      title="Test"
      actions={[<button key="action">Action</button>]}
    />
  )
  expect(screen.getByText("Action")).toBeInTheDocument()
})
```

## Resources

- [Next.js Layout Documentation](https://nextjs.org/docs/basic-features/layouts)
- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [React Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro) 