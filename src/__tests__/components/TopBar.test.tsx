import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { TopBar } from '@/app/components/TopBar';

describe('TopBar', () => {
  it('should render logo and site title', () => {
    render(
      <BrowserRouter>
        <TopBar />
      </BrowserRouter>
    );

    expect(screen.getByText('Jobs Board')).toBeInTheDocument();
  });

  it('should render with job title when provided', () => {
    render(
      <BrowserRouter>
        <TopBar jobTitle="Software Engineer" />
      </BrowserRouter>
    );

    expect(screen.getByText('Software Engineer')).toBeInTheDocument();
  });

  it('should link to home page', () => {
    render(
      <BrowserRouter>
        <TopBar />
      </BrowserRouter>
    );

    const homeLink = screen.getByRole('link', { name: /jobs board/i });
    expect(homeLink).toHaveAttribute('href', '/');
  });
});
