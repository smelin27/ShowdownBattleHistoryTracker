// This script intercepts console messages, broadcasts them to be picked up by showdown.js, then sends the messages back to the
// browser console.
(function () {
    const originalLog = console.log;
    console.log = function (...args) {
        window.postMessage({ type: 'BATTLELOG', args }, '*');
        originalLog.apply(console, args);
    };
})();
