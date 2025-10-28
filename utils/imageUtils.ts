export function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        resolve(result);
      } else {
        reject(new Error('Failed to convert blob to data URL: Result is not a string'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read blob data'));
    };

    reader.onabort = () => {
      reject(new Error('Blob reading was aborted'));
    };

    try {
      reader.readAsDataURL(blob);
    } catch (error) {
      reject(new Error(`Failed to start reading blob: ${error instanceof Error ? error.message : 'Unknown error'}`));
    }
  });
}


export function isValidDataURL(url: string): boolean {
  return typeof url === 'string' && url.startsWith('data:');
}


export function getMIMETypeFromDataURL(dataURL: string): string | null {
  if (!isValidDataURL(dataURL)) {
    return null;
  }

  const match = dataURL.match(/^data:([^;]+);/);
  return match ? match[1] : null;
}


export function generateInitials(name?: string, surname?: string): string {
  if (!name && !surname) return "U";

  const nameInitial = name?.charAt(0).toUpperCase() || "";
  const surnameInitial = surname?.charAt(0).toUpperCase() || "";

  const initials = `${nameInitial}${surnameInitial}`.trim();
  return initials || "U";
}