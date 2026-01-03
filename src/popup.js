// This is run when popup.html is opened. It reads the extension's stored data for the current opponent and
// updates popup.html with that data.

const doLogs = true; // set to true for testing
if (doLogs) console.log("popup.js running!"); // LOG

// generic error handler
function onError(error) { console.log(error); }

// get data in storage
let storageItem = browser.storage.local.get();
storageItem.then((results) => {
    // test: print full battle history to console
    // console.log(results);
    // display oppon history in popup
    populateTable(results._USER, results._OPPONENT, results[results._OPPONENT]);
}, onError);


// function to populate table within the popup
// input parameters:
    // opponent: player history object as described in showdown.js
function populateTable(playerName, opponentName, history) {
    const table = document.getElementById("table");                 // Get table
    const playerHeader = document.getElementById("playerName");     // Get player name header
    playerHeader.innerHTML = playerName;                            // Display player name
    const opponentHeader = document.getElementById("opponentName"); // Get opponent name header
    opponentHeader.innerHTML = opponentName;                        // Display opponent name
    for (const format in history) {                                 // Loop through formats you've played against opponent:
        let row = table.insertRow();                                    // Create table row
        let formatName = row.insertCell(0);                             // Create format name cell
        let playerWins = row.insertCell(1);                             // Create player wins cell
        let opponentWins = row.insertCell(2);                           // Create opponent wins cell
        formatName.innerHTML = format;                                  // Set format name cell contents
        playerWins.innerHTML = history[format][0];                      // Set player wins cell contents
        opponentWins.innerHTML = history[format][1];                    // Set opponent wins cell contents
    };
}
