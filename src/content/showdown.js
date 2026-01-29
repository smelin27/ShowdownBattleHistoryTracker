// This is run when the Showdown web page is opened. It listens for console messages, updates the stored values for user, 
// opponent and format, and records wins/losses in the database.

// Being in multiple battles causes all wins to be recorded for the most recent opponent. No fix for this yet.

// Features to add:
// Have formats appear in order? Alphabetical, order listed on format selector dropdown, idk
// Maybe - page for full history against all opponents?
// Maybe - keep notes on opponent? so I can call indy a smelly nerd
// Auto open popup on battle start (don't think this is allowed in firefox, to prevent abuse)


// generic error handler
function onError(error) { console.log(error); }

const doLogs = false; // set to true for testing
if (doLogs) console.debug("BATTLEHIST: showdown.js running!");


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
            window.postMessage({ type: 'BATTLELOG', args: args }, '*');
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

User name, opponent name, and battle format are stored as "_USER", "_OPPONENT", and "_FORMAT" in the storage object. This
can only track one battle at a time so being in multiple will (probably?) break the code.

*/

window.addEventListener('message', (event) => {
    // Ignore messages from other sources
    if (event.source !== window) return;
    if (event.data.type !== 'BATTLELOG') return;

    const message = event.data.args[0].split("|");
    // Message format:
        // [0]: "<<" for receiving, ">>" for sending
        // [1]: message type (e.g. start, updateuser)
        // [2+]: other args (may not exist)

    if (message[1] == "c") return; // Ignore chat messages


    // clear data on first loading showdown webpage
    if (message[1] === "/autojoin ") {
        browser.storage.local.set({
            "_USER": null,
            "_OPPONENT": null,
            "_FORMAT": null,
            "_P1": null,
            "_P2": null
        });
        if (doLogs) console.debug("BATTLEHIST: temporary data cleared.");
    }


    // set user name
    if (message[1] === "updateuser") {
        const username = message[2].trim();
        browser.storage.local.set({
            "_USER": username
        });
        if (doLogs) console.debug("BATTLEHIST: user is", username);
    }


    // pretty sure this code is unnecessarily messy as hell but whatever
    if (message[0].startsWith("<< >battle")) { // check only messages in a battle room


        // The player names "p1" and "p2" are sent as different console messages. Here we check each of them against the
        // player name in storage.
        // This is necessary because the battle protocol (whose console messages we are reading) doesn't actually
        // describe which battler is the player, it just describes the current state of play.


        // check battlers, set each name in storage
        let playerIndex = message.indexOf("player"); // index of "player" value, player number and name come after
        if (playerIndex !== -1 && message[playerIndex+1] === "p1") {
            let checkingPlayerName = message[playerIndex+2];
            browser.storage.local.set({"_P1": checkingPlayerName});
            message.splice(playerIndex, 1); // remove first "player" item from array so we can check again for p2
        }

        playerIndex = message.indexOf("player");
        if (playerIndex !== -1 && message[playerIndex+1] === "p2") {
            let checkingPlayerName = message[playerIndex+2];
            browser.storage.local.set({"_P2": checkingPlayerName});
        }


        // This will trigger every update but it makes everything breaking less likely
        let storageItem = browser.storage.local.get();
        storageItem.then((results) => {
            // only set opponent if the user is in this battle, stops code from breaking when spectating
            if (results._P1 === results._USER || results._P2 === results._USER) {
                if (results._P1 !== results._USER) browser.storage.local.set({"_OPPONENT": results._P1});
                else browser.storage.local.set({"_OPPONENT": results._P2});
            }
            else browser.storage.local.set({"_OPPONENT": null});
        }, onError);

        if (doLogs) {
            let storageItem = browser.storage.local.get();
            storageItem.then((results) => {
                console.debug("BATTLEHIST: Opponent is", results._OPPONENT);
            }, onError);
        }



        // set format
        const formatIndex = message.indexOf("tier"); // index of "tier" value, format name comes after
        if (formatIndex !== -1) {
            const formatLen = message[formatIndex+1].length;
            const format = message[formatIndex+1].substring(0, formatLen-1); // remove newline character
            browser.storage.local.set({
                "_FORMAT": format
            });
            
            if (doLogs) console.debug("BATTLEHIST: format is", format);
        }


        
        // record win/loss
        // "win" value may be in different indexes so we find it first
        const winIndex = message.indexOf("win");
        if (winIndex !== -1) { // this will trigger only if the chat room is a battle and the console message announces a winner
            let storageItem = browser.storage.local.get();
            storageItem.then((results) => {
                // get values
                const user = results._USER;
                const opponent = results._OPPONENT;
                const format = results._FORMAT;

                // Ignore battle results if opponent is set to null, which happens in some edge cases.
                if (results._OPPONENT !== null) { 

                    // check if history exists for this opponent & format, create 0 - 0 history if not
                    if (!results[opponent]) results[opponent] = {};
                    if (!results[opponent][format]) results[opponent][format] = [0, 0];

                    // get more values
                    let wins = results[opponent][format][0];
                    let losses = results[opponent][format][1];

                    // decide if user won or lost and update stored data
                    if (message[winIndex + 1] === user) wins += 1; // message[3] contains the winner
                    else losses += 1;
                    results[opponent][format] = [wins, losses];
                    browser.storage.local.set(results);
                    if (doLogs) console.debug("BATTLEHIST results updated!")
                    if (doLogs) console.debug(results);
                }
            }, onError);
        }


    }
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

// browser.storage.local.set({
//     "player1": {
//         "gen9ou": [1, 2],
//         "gen9ubers": [3, 4]
//     },
//     "edfe": {
//         "[Gen 9] Random Battle": [0, 0],
//         "gen9ou": [5, 6],
//         "gen9ubers": [7, 8],
//         "gen9uu": [9, 10]
//     }
// });
