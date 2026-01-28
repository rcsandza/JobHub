/**
 * Convert a File to base64 string
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Get the data URI scheme for a file based on extension
 */
export function getDataUriScheme(fileName: string): string {
  const ext = fileName.toLowerCase().split('.').pop();
  switch (ext) {
    case 'pdf':
      return 'data:application/pdf;base64';
    case 'docx':
      return 'data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64';
    case 'doc':
      return 'data:application/msword;base64';
    default:
      return 'data:application/octet-stream;base64';
  }
}
