import * as async from 'async';

/**
 * There was a missing definition for the async.queue constructor so we are
 * adding it here.
 */
declare module 'async' {
  export function queue<T, R>(
    worker: async.AsyncResultIteratorPromise<T, R>,
    concurrency?: number,
  ): async.QueueObject<T>;
}
