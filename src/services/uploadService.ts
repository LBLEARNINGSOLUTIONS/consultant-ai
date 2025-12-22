/**
 * File upload service for handling transcript uploads
 * Supports .txt files with client-side text extraction
 * Future: Can extend to support .docx and .pdf files
 */

export interface UploadResult {
  fileId: string;
  filename: string;
  text: string;
  error?: string;
}

const MAX_FILE_SIZE = parseInt(import.meta.env.VITE_MAX_FILE_SIZE_MB || '10') * 1024 * 1024; // Default 10MB

/**
 * Extract text content from a file
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase();

  if (ext === 'txt') {
    return await file.text();
  }

  // For future implementation: .docx and .pdf support
  // if (ext === 'docx') {
  //   // Use mammoth.js: const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
  //   // return result.value;
  // }
  //
  // if (ext === 'pdf') {
  //   // Use pdfjs-dist for PDF text extraction
  // }

  throw new Error(`Unsupported file type: .${ext}. Currently only .txt files are supported.`);
}

/**
 * Validate file before upload
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`,
    };
  }

  // Check file type
  const ext = file.name.split('.').pop()?.toLowerCase();
  const supportedTypes = ['txt']; // Add 'docx', 'pdf' when implemented

  if (!ext || !supportedTypes.includes(ext)) {
    return {
      valid: false,
      error: `Unsupported file type. Please upload ${supportedTypes.map(t => `.${t}`).join(', ')} files.`,
    };
  }

  return { valid: true };
}

/**
 * Process a single file upload
 */
export async function uploadTranscriptFile(
  file: File,
  onProgress?: (progress: number) => void
): Promise<UploadResult> {
  const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Report progress
    if (onProgress) onProgress(10);

    // Extract text
    const text = await extractTextFromFile(file);

    if (onProgress) onProgress(100);

    return {
      fileId,
      filename: file.name,
      text,
    };
  } catch (error) {
    return {
      fileId,
      filename: file.name,
      text: '',
      error: error instanceof Error ? error.message : 'Failed to process file',
    };
  }
}

/**
 * Process multiple file uploads with concurrency control
 */
export async function uploadMultipleTranscripts(
  files: File[],
  onProgress?: (fileId: string, progress: number) => void,
  onComplete?: (fileId: string, result: UploadResult) => void
): Promise<UploadResult[]> {
  const concurrencyLimit = parseInt(import.meta.env.VITE_MAX_CONCURRENT_UPLOADS || '3');
  const results: UploadResult[] = [];

  for (let i = 0; i < files.length; i += concurrencyLimit) {
    const batch = files.slice(i, i + concurrencyLimit);

    const batchPromises = batch.map(async (file) => {
      const result = await uploadTranscriptFile(
        file,
        onProgress ? (progress) => {
          // Create a temporary fileId for progress tracking
          const tempId = `temp_${file.name}`;
          onProgress(tempId, progress);
        } : undefined
      );

      if (onComplete) {
        onComplete(result.fileId, result);
      }

      return result;
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
  }

  return results;
}
