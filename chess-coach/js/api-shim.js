// This is a static portfolio demo — there is no backend behind it. Every
// call the app makes to a same-origin `/api/...` endpoint (login, AI
// analysis, puzzles, payments, etc.) is intercepted here before it ever
// leaves the browser, and answered with a synthetic response carrying the
// text "api functionalities disabled". That response is shaped to match
// what each endpoint's caller already expects (plain JSON error, or an
// SSE stream event for the two streaming endpoints), so the app's own
// existing error UI displays the message instead of the app crashing on a
// failed network request.
//
// Must load before app.js / landing.js so window.fetch is patched first.
(function () {
  const DISABLED_MESSAGE = 'api functionalities disabled';
  const originalFetch = window.fetch.bind(window);

  function requestUrl(input) {
    return typeof input === 'string' ? input : (input && input.url) || '';
  }

  function jsonDisabledResponse() {
    return new Response(JSON.stringify({ error: DISABLED_MESSAGE }), {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Endpoints consumed as an SSE stream (`response.body.getReader()`)
  // expect a 200 with a real stream, not an HTTP error — so we hand back a
  // stream containing a single `type: "error"` frame, which is exactly how
  // the app already renders backend error messages inline.
  function sseDisabledResponse() {
    const frame = `data: ${JSON.stringify({ type: 'error', message: DISABLED_MESSAGE })}\n\n`;
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(frame));
        controller.close();
      },
    });
    return new Response(stream, {
      status: 200,
      headers: { 'Content-Type': 'text/event-stream' },
    });
  }

  window.fetch = function (input, init) {
    const url = requestUrl(input);
    if (!url.includes('/api/')) return originalFetch(input, init);

    console.info('[api-shim]', DISABLED_MESSAGE + ':', url);
    return Promise.resolve(url.includes('/stream') ? sseDisabledResponse() : jsonDisabledResponse());
  };
})();
