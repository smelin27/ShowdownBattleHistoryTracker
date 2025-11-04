console.log("Hello world!");

// generic error handler
function onError(error) { console.log(error); }

browser.storage.local.set({ "a": 1, "b": 2, "c": 3 });

let storageItem = browser.storage.local.get()
storageItem.then((results) => {
    console.log(storageItem);
    console.log(results);
    console.log(Object.keys(results));
    console.log(Object.keys(results)[0]);
}, onError);
