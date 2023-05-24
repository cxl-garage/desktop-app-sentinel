/**
 * Misc. helper functions
 */

import assertUnreachable from 'util/assertUnreachable';

export function getDateFromTimestamp(
  timestamp: number,
  unit: 's' | 'us' | 'ns',
): Date {
  switch (unit) {
    case 's':
      return new Date(timestamp * 1000);
    case 'us':
      return new Date(timestamp);
    case 'ns':
      return new Date(timestamp / 1000);
    default:
      return assertUnreachable(unit);
  }
}
