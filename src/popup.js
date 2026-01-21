// This is run when popup.html is opened. It reads the extension's stored data for the current opponent and
// updates popup.html with that data.

const doLogs = false; // set to true for testing
if (doLogs) console.debug("popup.js running!");

// generic error handler
function onError(error) { console.log(error); }

// get data in storage
let storageItem = browser.storage.local.get();
storageItem.then((results) => {
    // test: print full battle history to console
    // console.log(results);
    
    // display opponent history in popup
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
        formatHeader.innerText = "No opponent!";
        playerHeader.innerHTML = '<img src="images/icon-38px.png"/>';
    }

    else if (!history) { // No battle history against current opponent
        formatHeader.innerText = "No history against " + opponentName + "!";
        playerHeader.innerText = '<img src="images/icon-38px.png"/>';
    }

    else {
        formatHeader.innerText = "Format"
        playerHeader.innerText = playerName;        // Display player name
        opponentHeader.innerText = opponentName;    // Display opponent name
        let totalWins = 0;
        let totalLosses = 0;
        for (const format in history) {             // Loop through formats played against opponent:
            let row = table.insertRow();                    // Create table row
            let formatName = row.insertCell(0);             // Create format name cell
            let playerWins = row.insertCell(1);             // Create player wins cell
            let opponentWins = row.insertCell(2);           // Create opponent wins cell
            formatName.innerText = format;                  // Set format name cell contents
            playerWins.innerText = history[format][0];      // Set player wins cell contents
            opponentWins.innerText = history[format][1];    // Set opponent wins cell contents
            totalWins += history[format][0];                // Update total wins
            totalLosses += history[format][1];              // Update total losses
        };
        let topRow = table.insertRow(1);            // Add row at top for total wins/losses
        let formatName = topRow.insertCell(0);      // Create "Total" cell with above cell naming scheme
        let playerWins = topRow.insertCell(1);      // Create total player wins cell
        let opponentWins = topRow.insertCell(2);    // Create total opponent wins cell
        formatName.innerText = "Total";
        formatName.style.fontWeight = "bold";
        playerWins.innerText = totalWins;
        playerWins.style.fontWeight = "bold";
        opponentWins.innerText = totalLosses;
        opponentWins.style.fontWeight = "bold";
    }
}
