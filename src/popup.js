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

    // get table cells
    const table = document.getElementById("table");                     // Get table
    const formatHeader = document.getElementById("formatHeader");       // Get format header
    const playerHeader = document.getElementById("playerHeader");       // Get player name header
    const opponentHeader = document.getElementById("opponentHeader");   // Get opponent name header

    if (opponentName === null) { // No opponent selected yet
        formatHeader.innerHTML = "No opponent!";
        playerHeader.innerHTML = '<img src="images/icon-38px.png"/>';
    }

    else if (!history) { // No battle history against current opponent
        formatHeader.innerHTML = "No history against " + opponentName + "!";
        playerHeader.innerHTML = '<img src="images/icon-38px.png"/>';
    }

    else {
        formatHeader.innerHTML = "Format"
        playerHeader.innerHTML = playerName;        // Display player name
        opponentHeader.innerHTML = opponentName;    // Display opponent name
        for (const format in history) {             // Loop through formats played against opponent:
            let row = table.insertRow();                    // Create table row
            let formatName = row.insertCell(0);             // Create format name cell
            let playerWins = row.insertCell(1);             // Create player wins cell
            let opponentWins = row.insertCell(2);           // Create opponent wins cell
            formatName.innerHTML = format;                  // Set format name cell contents
            playerWins.innerHTML = history[format][0];      // Set player wins cell contents
            opponentWins.innerHTML = history[format][1];    // Set opponent wins cell contents
        };
    }
}
