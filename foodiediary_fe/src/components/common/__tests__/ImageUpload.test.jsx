import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ImageUpload from '../ImageUpload';

describe('ImageUpload Component', () => {
  const onChange = vi.fn();
  const currentImage = 'https://example.com/existing-image.jpg';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders image preview when currentImage is provided', () => {
    render(<ImageUpload onChange={onChange} currentImage={currentImage} />);
    
    const imagePreview = screen.getByAltText('Preview');
    expect(imagePreview).toBeInTheDocument();
    expect(imagePreview).toHaveAttribute('src', currentImage);
  });

  it('renders upload placeholder when no image is provided', () => {
    render(<ImageUpload onChange={onChange} />);
    
    expect(screen.queryByAltText('Preview')).not.toBeInTheDocument();
    expect(screen.getByText('Click to upload an image or drag and drop')).toBeInTheDocument();
  });

  it('opens file dialog when upload area is clicked', async () => {
    render(<ImageUpload onChange={onChange} />);
    
    // Mock the file input click
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    const clickSpy = vi.spyOn(HTMLInputElement.prototype, 'click');
    
    // Find the clickable area and click it
    await userEvent.click(screen.getByText('Click to upload an image or drag and drop'));
    
    expect(clickSpy).toHaveBeenCalled();
    clickSpy.mockRestore();
  });

  it('calls onChange with file when file is selected', async () => {
    render(<ImageUpload onChange={onChange} />);
    
    const file = new File(['dummy content'], 'example.png', { type: 'image/png' });
    
    // Mock FileReader
    const mockFileReader = {
      readAsDataURL: vi.fn(),
      onloadend: null,
      result: 'data:image/png;base64,dummybase64'
    };
    
    global.FileReader = vi.fn(() => mockFileReader);
    
    // Upload file
    const input = document.querySelector('input[type="file"]');
    await userEvent.upload(input, file);
    
    expect(onChange).toHaveBeenCalledWith(file);
    
    // Simulate FileReader loaded event
    mockFileReader.onloadend();
    
    // Now the preview should show
    await waitFor(() => {
      expect(screen.getByAltText('Preview')).toBeInTheDocument();
    });
  });

  // Add more tests as needed...
});