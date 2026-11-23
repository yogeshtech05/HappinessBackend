import { randomUUID } from 'node:crypto';

/** Generates a prefixed, collision-resistant identifier: `prefix-<timestamp>-<rand>`. */
export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function randomToken(length = 6): string {
  return randomUUID().replace(/-/g, '').slice(0, length);
}

/** Generates a human-friendly order number using the configured prefix. */
export function generateOrderNumber(prefix = 'HD-', year = new Date().getFullYear()): string {
  const sequence = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${year}-${sequence}`;
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
