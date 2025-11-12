// In the future this will be a script that reads console messages from Showdown and updates the extension's database
// when necessary.

console.log("showdown.js running!");


/*
ADD SAMPLE BATTLE HISTORY

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

// Only run this when changing or loading extension for the first time, otherwise leave it commented out

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
