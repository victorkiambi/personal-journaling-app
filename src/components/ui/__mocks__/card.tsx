import React from 'react'

export const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div data-testid="card" className={className}>{children}</div>
)

export const CardHeader = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div data-testid="card-header" className={className}>{children}</div>
)

export const CardTitle = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div data-testid="card-title" className={className}>{children}</div>
)

export const CardDescription = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div data-testid="card-description" className={className}>{children}</div>
)

export const CardContent = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div data-testid="card-content" className={className}>{children}</div>
) 