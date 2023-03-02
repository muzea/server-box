let cache = caches.open("server-box-request");

export function getCacheInstance() {
  return cache;
}

export async function fetchWithCache(url: string): Promise<Response> {
  const cacheIns = await cache;
  const maybeResult = await cacheIns.match(url);
  if (maybeResult) return maybeResult;

  const result = await fetch(url);

  await cacheIns.put(url, result.clone());
  return result;
}

export async function fetchArrayBuffer(url: string): Promise<ArrayBuffer> {
  return (await fetchWithCache(url)).arrayBuffer();
}
