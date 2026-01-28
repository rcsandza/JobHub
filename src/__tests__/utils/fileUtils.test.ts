import { describe, it, expect } from 'vitest';
import { fileToBase64, getDataUriScheme } from '@/utils/fileUtils';

describe('getDataUriScheme', () => {
  it('should return PDF scheme for .pdf files', () => {
    expect(getDataUriScheme('resume.pdf')).toBe('data:application/pdf;base64');
    expect(getDataUriScheme('DOCUMENT.PDF')).toBe('data:application/pdf;base64');
  });

  it('should return DOCX scheme for .docx files', () => {
    expect(getDataUriScheme('resume.docx')).toBe(
      'data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64'
    );
    expect(getDataUriScheme('DOCUMENT.DOCX')).toBe(
      'data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64'
    );
  });

  it('should return DOC scheme for .doc files', () => {
    expect(getDataUriScheme('resume.doc')).toBe('data:application/msword;base64');
    expect(getDataUriScheme('DOCUMENT.DOC')).toBe('data:application/msword;base64');
  });

  it('should return default scheme for unknown extensions', () => {
    expect(getDataUriScheme('file.txt')).toBe('data:application/octet-stream;base64');
    expect(getDataUriScheme('file.xyz')).toBe('data:application/octet-stream;base64');
    expect(getDataUriScheme('noextension')).toBe('data:application/octet-stream;base64');
  });
});

describe('fileToBase64', () => {
  it('should convert file to base64', async () => {
    // Create a mock file
    const content = 'test content';
    const blob = new Blob([content], { type: 'text/plain' });
    const file = new File([blob], 'test.txt', { type: 'text/plain' });

    const base64 = await fileToBase64(file);

    // Verify it's a valid base64 string (no data URL prefix)
    expect(base64).toBeTruthy();
    expect(base64).not.toContain('data:');
    expect(base64).not.toContain('base64,');
  });

  it('should handle PDF files', async () => {
    const content = '%PDF-1.4';
    const blob = new Blob([content], { type: 'application/pdf' });
    const file = new File([blob], 'test.pdf', { type: 'application/pdf' });

    const base64 = await fileToBase64(file);

    expect(base64).toBeTruthy();
    expect(base64).not.toContain('data:');
  });

  it('should reject on reader error', async () => {
    // Create a file that will cause an error
    const file = new File([], 'test.txt');

    // Mock FileReader to simulate an error
    const originalFileReader = global.FileReader;
    global.FileReader = class extends originalFileReader {
      readAsDataURL() {
        setTimeout(() => {
          if (this.onerror) {
            this.onerror(new Error('Read error') as any);
          }
        }, 0);
      }
    } as any;

    await expect(fileToBase64(file)).rejects.toThrow();

    // Restore original FileReader
    global.FileReader = originalFileReader;
  });
});
