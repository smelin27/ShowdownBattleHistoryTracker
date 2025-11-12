// In the future this will be a script that reads console messages from Showdown and updates the extension's 
// database when necessary.

console.log("showdown.js running!");


// add sample battle history
// only run when changing or loading addon for the first time, otherwise leave commented out
browser.storage.local.set({
    "player1": {
        "gen9ou": [1, 2],
        "gen9ubers": [3, 4]
    },
    "player2": {
        "gen9ou": [5, 6],
        "gen9ubers": [7, 8]
    }
});
