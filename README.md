# Chrome Extension

The extension is available from the [chrome web store](https://chrome.google.com/webstore/detail/connectordb-chrome-logger/nekbpbloplgnhgfknjaebahdjnabaclf)


## Debugging/Extending

To debug the extension, or to modify it, to gather extra data or other information,
clone this repository, and in chrome, go to `chrome://extensions`, where you can
open the folder using the `Load unpacked extension...` button.

Login and stream creation is handled by `js/login.js`. All data is gathered by `background.js`.

The extension is extremely basic, but should also be readily extensible.

## Streams

### History

Upon each click, records the URL and titlebar text of the current webpage.
One weakness of this method is that it gives unusual weight to domains where one clicks
many times. For example, a video lecture, or publication will count as one click,
whereas idle browsing of reddit will register as many clicks.

## More data?

Pull requests are welcome! Ideally, there would be an option for in-depth monitoring of
web usage (even if not enabled by default).