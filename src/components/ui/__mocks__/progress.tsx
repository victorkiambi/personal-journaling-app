import React from 'react'

export const Progress = ({ value, className }: { value?: number; className?: string }) => (
  <div data-testid="progress" className={className} data-value={value}>
    <div style={{ width: `${value}%` }} />
  </div>
) 