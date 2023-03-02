const encoder = new TextEncoder();
const decoder = new TextDecoder();

export function encodeToBytes(text: string) {
  return encoder.encode(text);
}

export function decodeFromBytes(buffer: Uint8Array): string {
  return decoder.decode(buffer);
}
