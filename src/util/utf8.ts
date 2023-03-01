const encoder = new TextEncoder();

export function encodeToBytes(text: string) {
    return encoder.encode(text);
}
