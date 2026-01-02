// This is run when the Showdown web page is opened. It listens for console messages, updates the stored values for user, opponent and format, and records wins/losses in the database.

// Note for later: reloading the page during a battle will break the extension, since the battle log is loaded before the
// user account is connected, so user name is a guest account and neither battler is recognised as the user. In this case,
// the battle result SHOULD be ignored, but I haven't extensively tested it. 

// Being in multiple battles causes all wins to be recorded for the most recent opponent. No fix for this yet.

// Features to add:
// Messages for "no opponent selected!" and "no history to display!" instead of a broken-looking popup.
// Have formats appear in order? Alphabetical, relevance as listed on showdown main page, idk
// Maybe - opponent search? Not just limited to most recent opponent
// Maybe - keep notes on opponent? so I can call indy a smelly nerd


// generic error handler
function onError(error) { console.log(error); }

// console.log("BATTLELOG: showdown.js running!"); // LOG


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
            "_FORMAT": null,
            "_P1_IS_USER": false,
            "_P2_IS_USER": false
        });
        // console.log("BATTLELOG: temporary data cleared."); // LOG
    }


    // set user name
    if (message[1] === "updateuser") {
        const username = message[2].trim();
        browser.storage.local.set({
            "_USER": username
        });
        // console.log("BATTLELOG: user is", username); // LOG
    }


    // check both battlers, set opponent name in storage
    if (message[1] === "player") {
        // The player names "p1" and "p2" are sent as different console messages. Here we check each of them against the
        // player name in storage.
        // This is necessary because the battle protocol (whose console messages we are reading) doesn't actually
        // describe which battler is the player, it just describes the current state of play.

        // This block also contains the logic for checking if *neither* battler is the player, in which case we set
        // _P1 and _P2 both to false, and the results of the battle will be ignored. This messing around is, again,
        // necessary because we get the user's and opponent's name in different ways.

        let checkingPlayerNumber;
        if (message[2] == "p1") checkingPlayerNumber = 1;
        else checkingPlayerNumber = 2;

        const checkingPlayerName = message[3];
        // console.log("BATTLELOG: checking player", checkingPlayerName) // LOG

        let storageItem = browser.storage.local.get();
        
        storageItem.then((results) => {
            // pretty sure this is inefficient code but I need it all laid out to make sense of it. might fix later
            
            if (checkingPlayerNumber === 1) {
                if (results._USER === checkingPlayerName) {
                    browser.storage.local.set({"_P1_IS_USER": true});
                    // console.log("BATTLELOG p1 is user"); // LOG
                }
                else {
                    browser.storage.local.set({"_P1_IS_USER": false});
                    browser.storage.local.set({"_OPPONENT": checkingPlayerName});
                    // console.log("BATTLELOG p1 not user"); // LOG
                }
            }

            else { // checkingPlayerNumber === 2
                if (results._USER === checkingPlayerName) {
                    browser.storage.local.set({"_P2_IS_USER": true})
                    // console.log("BATTLELOG p2 is user"); // LOG
                }
                else {
                    browser.storage.local.set({"_P2_IS_USER": false});
                    browser.storage.local.set({"_OPPONENT": checkingPlayerName});
                    // console.log("BATTLELOG p2 not user"); // LOG
                }
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
        // console.log("BATTLELOG: format is", format); // LOG
    }


    // record win/loss
    if (message[2] === "win") {
        let storageItem = browser.storage.local.get();
        storageItem.then((results) => {
            // get values
            const user = results._USER;
            const opponent = results._OPPONENT;
            const format = results._FORMAT;

            // Only continue if one of the battlers is the user. This prevents the script breaking if you load into an
            // existing battle rather than starting a new one. Results that *should* be recorded might be ignored, so
            // this is more of a bandaid fix than a real solution. Sorry.

            // check both P IS USER and whether OPPONENT is null because my code is stupid and inefficient and the trigger
            // could be either of these. fuck my chungus life
            if ((results._P1_IS_USER || results._P2_IS_USER) && results._OPPONENT !== null) { 
                // check if history exists for this opponent & format, create 0-0 history and update storageItem if not
                if (!results[opponent]) results[opponent] = {};
                if (!results[opponent][format]) results[opponent][format] = [0, 0];
                // get more values
                let wins = results[opponent][format][0];
                let losses = results[opponent][format][1];
                // decide if user won or lost and update stored data
                if (message[3] === user) wins += 1; // message[3] contains the winner
                else losses += 1;
                results[opponent][format] = [wins, losses];
                browser.storage.local.set(results);
                // console.log("BATTLELOG results updated!") // LOG
                console.log(results);
            }
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
