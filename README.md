# Showdown! Battle History Tracker
By smelin27

![Animated Ferrothorn sprite](/src/images/ferrothorn.gif)

An automated Pokémon Showdown battle history tracker, for displaying your results in each format against opponents.  
When you battle someone, click the Ferrothorn icon in your address bar to see your history against them, with a total wins/losses count then separated by format.  
Currently in beta stage with barebones features. More coming Soon™.

![Example screenshot of a battle history.](/src/images/github-preview-screenshot.png)

Now published as an extension!  
Firefox: https://addons.mozilla.org/en-GB/firefox/addon/showdownbattlehistorytracker/  
Chrome: https://chromewebstore.google.com/detail/showdown-battle-history-t/jidhieeghcobdggacbfmkjgbjfadcdbj  
Edge/other browsers: Coming soon!

To install the extension yourself, download the code and run `build-chrome.bat` for Chromium browsers or `build-firefox.bat` for Firefox. This will create a `build-chrome` or `build-firefox` folder which can be loaded into your browser as an extension.

Bug reports are very appreciated. At the moment, the extension *will* break if you're in multiple active battles at a time, counting wins incorrectly. I might fix it eventually but it would require a significant redesign, and I don't think being in multiple battles is that common anyway.

I don't have a snappy name or icon yet. Suggestions welcome.

**Privacy disclaimer:** This extension works by reading Pokemon Showdown's log messages from your browser's console. All the data required is saved in your browser's local storage, protected by your browser's security, and never leaves your device.
