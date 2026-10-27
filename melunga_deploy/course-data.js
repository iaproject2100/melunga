/* Read-only course documents: retry one transient transport failure. Source
 * fingerprints and account permissions are still checked by their callers. */
(() => {
  'use strict';
  if (window.MelungaCourseData) return;
  const nativeFetch = window.fetch.bind(window);
  const transient = new Set([408, 425, 429, 500, 502, 503, 504]);
  const timeoutMs = 12000, retryMs = 300;
  let lastFailure = null;
  const abortError = () => new DOMException('Course request aborted', 'AbortError');
  function pause(signal) {
    return new Promise((resolve, reject) => {
      if (signal?.aborted) {reject(abortError()); return;}
      const abort = () => {clearTimeout(timer); reject(abortError());};
      const timer = setTimeout(() => {signal?.removeEventListener('abort', abort); resolve();}, retryMs);
      signal?.addEventListener('abort', abort, {once:true});
    });
  }
  async function fetchDocument(path, options = {}) {
    if (typeof path !== 'string' || !/^content\/[\w/-]+\.json$/.test(path)
        || (options.method || 'GET').toUpperCase() !== 'GET' || options.body !== undefined) {
      return nativeFetch(path, options);
    }
    for (let attempt = 0; attempt < 2; attempt++) {
      if (options.signal?.aborted) throw abortError();
      const controller = new AbortController();
      const abort = () => controller.abort();
      options.signal?.addEventListener('abort', abort, {once:true});
      let timedOut = false;
      const timer = setTimeout(() => {timedOut = true; controller.abort();}, timeoutMs);
      try {
        const response = await nativeFetch(path, {...options, signal:controller.signal});
        // Read the complete body here: a broken download must be retried too.
        const bytes = await response.arrayBuffer();
        if (options.signal?.aborted) throw abortError();
        if (response.ok) JSON.parse(new TextDecoder().decode(bytes));
        if (transient.has(response.status) && attempt === 0) {
          lastFailure = {path, kind:'http', status:response.status, retrying:true};
        } else {
          lastFailure = response.ok ? null : {path, kind:'http', status:response.status, retrying:false};
          return new Response(bytes, {status:response.status, statusText:response.statusText, headers:response.headers});
        }
      } catch (error) {
        if (options.signal?.aborted) throw abortError();
        lastFailure = {path, kind:timedOut ? 'timeout' : error.name === 'SyntaxError' ? 'invalid-json' : 'network', retrying:attempt === 0};
        if (attempt === 1) {
          if (timedOut) {const timeout = new Error('Course document timed out'); timeout.name = 'TimeoutError'; throw timeout;}
          throw error;
        }
      } finally {
        clearTimeout(timer);
        options.signal?.removeEventListener('abort', abort);
      }
      await pause(options.signal);
    }
  }
  Object.defineProperty(window, 'MelungaCourseData', {value:Object.freeze({fetch:fetchDocument,
    state:() => lastFailure ? {...lastFailure} : null}), writable:false, configurable:false});
})();
