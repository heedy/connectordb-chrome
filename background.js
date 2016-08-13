var defaultOptions = {
    // Time in milliseconds between synchronization attempts
    syncDelay: 0,
    enabled: true
};

function isLoggedIn() {
    var cred = localStorage.getItem("cdb_credentials") || "";
    return (cred.length > 1)
}

// Either returns the credentials used in the extension, or null if
// not logged in
function getCredentials() {
    var cred = localStorage.getItem("cdb_credentials") || "";
    if (cred != "") {
        return JSON.parse(cred);
    }
    return null;
}

// Returns the options set up for the extension
function getOptions() {
    var opt = localStorage.getItem("cdb_options") || "";
    if (opt != "") {
        return Object.assign({}, defaultOptions, JSON.parse(opt));
    } else {
        localStorage.setItem("cdb_options", JSON.stringify(defaultOptions));
        return defaultOptions;
    }
}

// Returns the ConnectorDB object or null
function getCDB() {
    var cred = getCredentials();
    if (cred != null) {
        var cdb = new connectordb.ConnectorDB(cred.apikey, undefined, cred.hostname);
        cdb.chrome_cred = cred;
        return cdb;
    }
    return null
}

// Called on initialization
function login() {
    chrome.tabs.create({url: "login.html"})
}

if (getCredentials() == null) {
    login();
}

function LogDatapoint(pgurl, title) {
    // Don't show new tabs
    if (pgurl != "chrome://newtab/") {
        // Check the sync delay - if it is 0, we write the datapoints
        // directly
        var opt = getOptions();
        // Don't log the datapoint if logging is disabled
        if (!opt.enabled) {
            return;
        }

        console.log({url: pgurl, title: title});

        if (opt.syncDelay == 0) {
            var cdb = getCDB()
            if (cdb != null) {
                cdb.insertStream(cdb.chrome_cred.username, cdb.chrome_cred.devicename, "history", {
                    url: pgurl,
                    title: title
                });
            }
        }
    }
}

// The rest are special listeners that try to catch the different ways pages can be changed.
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.url != null) {
        LogDatapoint(tab.url, tab.title)
    }

});

chrome.tabs.onActivated.addListener(function(activeInfo) {
    chrome.tabs.get(activeInfo.tabId, function(tab) {
        LogDatapoint(tab.url, tab.title)
    });
});

chrome.windows.onFocusChanged.addListener(function(windowId) {
    if (windowId == chrome.windows.WINDOW_ID_NONE) {
        //LogDatapoint("")
    } else {
        chrome.tabs.query({
            "active": true,
            "windowId": windowId
        }, function(tabarr) {
            if (tabarr.length == 1) {
                LogDatapoint(tabarr[0].url, tabarr[0].title)
            }
        });
    }

})

// Set up the extension icon so that when clicking, it opens ConnectorDB
chrome.browserAction.onClicked.addListener(function(activeTab) {
    var c = getCredentials();
    if (c == null) {
        login();
    } else {
        chrome.tabs.create({url: c.hostname});
    }

});
