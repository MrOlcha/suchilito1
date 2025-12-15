/**
 * Estado compartido del cache del menú
 * Usado para invalidación de cache en tiempo real
 */

let cacheInvalidationToken = Date.now();
let cachedMenuData: any = null;
let cachedMenuTimestamp: number = 0;
let lastInvalidationToken: string | number = '';

export function getCacheInvalidationToken() {
  return cacheInvalidationToken;
}

export function invalidateCache() {
  cacheInvalidationToken = Date.now();
  console.log('🔄 Cache invalidated, token:', cacheInvalidationToken);
}

export function getCachedMenuData() {
  return cachedMenuData;
}

export function getCachedMenuTimestamp() {
  return cachedMenuTimestamp;
}

export function setCachedMenuData(data: any) {
  cachedMenuData = data;
  cachedMenuTimestamp = Date.now();
}

export function getLastInvalidationToken() {
  return lastInvalidationToken;
}

export function setLastInvalidationToken(token: string | number) {
  lastInvalidationToken = token;
}
