console.log("Hello world!");

// generic error handler
function onError(error) { console.log(error); }

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



let storageItem = browser.storage.local.get()
storageItem.then((results) => {
    console.log(results);
}, onError);
