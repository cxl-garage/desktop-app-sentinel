/**
 * Misc. helper functions
 */

import assertUnreachable from 'util/assertUnreachable';

export function getDateFromTimestamp(
  timestamp: number,
  unit: 's' | 'us' | 'ns',
): Date {
  let date; // use variable because ts struggles with switch typing
  switch (unit) {
    case 's':
      date = new Date(timestamp * 1000);
      break;
    case 'us':
      date = new Date(timestamp);
      break;
    case 'ns':
      date = new Date(timestamp / 1000);
      break;
    default:
      assertUnreachable(unit);
  }
  return date;
}
