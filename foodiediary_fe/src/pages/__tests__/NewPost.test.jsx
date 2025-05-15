// src/pages/__tests__/NewPost.test.jsx
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import NewPost from '../NewPost';

// Mock PostForm component
vi.mock('../../components/posts/PostForm', () => ({
  default: vi.fn(() => (
    <div data-testid="post-form">Mock Post Form</div>
  ))
}));

describe('NewPost Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the PostForm component', () => {
    render(
      <BrowserRouter>
        <NewPost />
      </BrowserRouter>
    );
    
    expect(screen.getByTestId('post-form')).toBeInTheDocument();
    expect(screen.getByText('Mock Post Form')).toBeInTheDocument();
  });
});