// This is run when the popup is opened. It currently reads the extension's stored data and prints it to the console.
// In the future it will update popup.html with the data it reads.

console.log("popup.js running!");

// generic error handler
function onError(error) { console.log(error); }

let storageItem = browser.storage.local.get()
storageItem.then((results) => {
    console.log(results);
}, onError);
