// This is run when the Showdown web page is opened. It listens for console messages, updates the stored values for user, opponent and format, and records wins/losses in the database.

// Note for later: reloading the page during a battle will break the extension, since the battle log is loaded before the
// user account is connected, so user name is a guest account and neither battler is recognised as the user.
// Pretty sure spectating a battle has the same result, so this needs to be fixed. Ignore result if neither p1 or p2 = username?
// Being in multiple battles also breaks it.

// Finally, the most pressing issue is that all other formats are overwritten when you finish a match.

console.log("BATTLELOG: showdown.js running!");

// generic error handler
function onError(error) { console.log(error); }


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


    // clear data on first loading showdown webpage
    if (message[1] === "/autojoin ") {
        browser.storage.local.set({
            "_USER": null,
            "_OPPONENT": null,
            "_FORMAT": null
        });
        console.log("BATTLELOG: temporary data cleared.");
    }


    // set user name
    if (message[1] === "updateuser") {
        const username = message[2].trim();
        browser.storage.local.set({
            "_USER": username
        });
        console.log("BATTLELOG: user is", username);
    }


    // set opponent name
    if (message[1] === "player") {
        // The player names "p1" and "p2" are sent as different console messages. Here we check each of them against the
        // player name in storage.
        // All this is necessary because the battle protocol (whose console messages we are reading) doesn't actually
        // describe which battler is the player, it just describes the current state of play.
        // TODO: use "_P1" and "_P2" values to allow for neither battler being the player.
        const playername = message[3];
        // console.log("BATTLELOG: checking player", playername)
        let storageItem = browser.storage.local.get();
        
        storageItem.then((results) => { // If checked username is not the player's, set _OPPONENT to it. THIS IS STUPID! FIX IT!
            if (results._USER !== playername) {
                browser.storage.local.set({
                    "_OPPONENT": playername
                });
                console.log("BATTLELOG: opponent is", playername);
            }
        }, onError);
    }

    // set format
    // not sure "tier" is always arg 8. please test this
    if (message[8] && message[8] === "tier") {
        const formatLen = message[9].length;
        const format = message[9].substring(0, formatLen - 1); // remove newline character
        browser.storage.local.set({
            "_FORMAT": format
        });
        console.log("BATTLELOG: format is", format);
    }


    // record win/loss
    if (message[2] === "win") {
        let storageItem = browser.storage.local.get();
        storageItem.then((results) => {
            // get values
            const user = results._USER;
            const opponent = results._OPPONENT;
            const format = results._FORMAT;
            // check if history exists for this opponent & format, create 0-0 history and update storageItem if not
            if (!results[opponent]) results[opponent] = {};
            if (!results[opponent][format]) results[opponent][format] = [0, 0];
            // get more values
            let wins = results[opponent][format][0];
            let losses = results[opponent][format][1];
            // decide if user won or lost and update stored data
            if (message[3] === user) wins += 1; // message[3] contains the winner
            else losses += 1;
            browser.storage.local.set({
                [opponent]: {
                    [format]: [wins, losses]
                }
            });
            console.log("BATTLELOG results (hypothetically) updated!")
        }, onError);
    }

    // print results after every message
    // let storageItem = browser.storage.local.get();
    // storageItem.then((results) => {
    //     console.log("BATTLELOG player: " + results._USER + ", opponent: " + results._OPPONENT + ", format: " + results._FORMAT);
    // }, onError);
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
