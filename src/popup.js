// This is run when the popup is opened. It currently reads the extension's stored data and prints it to the console.
// In the future it will update popup.html with the data it reads.

console.log("popup.js running!");

// generic error handler
function onError(error) { console.log(error); }

// get data in storage
let storageItem = browser.storage.local.get();
storageItem.then((results) => {
    // test: print full battle history to console
    console.log(results);
    // test: display player2 history in popup
    populateTable(results.player2);
}, onError);


// function to populate table within the popup
// input parameter: player history object as described in showdown.js
function populateTable(opponent) {
    const table = document.getElementById("table");                 // Get table
    const playerName = document.getElementById("playerName");       // Get player name header (currently nonfunctional)
    const opponentName = document.getElementById("opponentName");   // Get opponent name header (currently nonfunctional)
    for (const format in opponent) {                                // Loop through formats you've played against opponent
        let row = table.insertRow();                                    // Create table row
        let formatName = row.insertCell(0);                             // Create format name cell
        let playerWins = row.insertCell(1);                             // Create player wins cell
        let opponentWins = row.insertCell(2);                           // Create opponent wins cell
        formatName.innerHTML = format;                                  // Set format name cell contents
        playerWins.innerHTML = opponent[format][0];                     // Set player wins cell contents
        opponentWins.innerHTML = opponent[format][1];                   // Set opponent wins cell contents
    };
}
