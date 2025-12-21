// This is run when the Showdown web page is opened. It listens for console messages and currently just stores the number
// of messages received.
// In the future it will update the database when a battle is won/lost.

console.log("showdown.js running!");

var messageCounter = 0; // test 


/*
INJECT LISTENER HOOK TO READ CONSOLE MESSAGES
I won't lie to you I got this code off chatgpt because I couldn't find a decent guide anywhere.
There's probably a better way to do this, because in my experience generative AI always gives you slightly inefficient code,
but I don't know how I would do it.

This code block creates a script that intercepts console messages, sends them to showdown.js with window.postMessage(),
then sends it back to the browser console.
*/

const hookScript = document.createElement('script');
hookScript.textContent = `
    (function() {
        const originalLog = console.log;
        console.log = function(...args) {
            // Send console messages to content script (showdown.js)
            window.postMessage({ type: 'SHOWDOWN_EXTENSION', args: args }, '*');
            originalLog.apply(console, args);
        };
    })();
`;
(document.head || document.documentElement).appendChild(hookScript);
hookScript.remove();


/*
CREATE LISTENER FOR CONSOLE MESSAGES
Full disclosure. The template for this is also from chatgpt.
This code block receives console messages, sent with window.postMessage() from the previous code block, and processes them.
*/

window.addEventListener('message', (event) => {
    // Ignore messages from other sources
    if (event.source !== window) return;
    if (event.data.type !== 'SHOWDOWN_EXTENSION') return;

    const message = event.data.args.join(' ');

    // Example functionality: increment message counter in extension memory and print to console.
    messageCounter++;
    browser.storage.local.set({
        "messages": messageCounter
    });

    // Shorten console output if necessary
    if (message.length < 50) console.log("Showdown console message:", message);
    else console.log("Showdown console message:", message.substring(0, 50), "...");

    let storageItem = browser.storage.local.get();
    storageItem.then((results) => {
        console.log("Messages received:", results.messages);
    });
});


/*
ADD SAMPLE BATTLE HISTORY

For testing purposes. Remove in final version.

"browser.storage.local" is a single JS object. The data for each player you've faced is stored as a property of that
object. JS object properties are key-value pairs, so the key is their username, and the value is another object, which
stores history for each format as an integer array.

So the format is (with "key : value" for properties):

browser.storage.local            (object)
  playerName : playerHistory     (string : object)
    formatName : formatHistory   (string : int array)
  playerName : playerHistory     (string : object)
    formatName : formatHistory   (string : int array)

*/

browser.storage.local.set({
    "player1": {
        "gen9ou": [1, 2],
        "gen9ubers": [3, 4]
    },
    "player2": {
        "gen9ou": [5, 6],
        "gen9ubers": [7, 8],
        "gen9uu": [9, 10]
    }
});
