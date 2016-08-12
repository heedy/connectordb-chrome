uname = ""

function isLoggedIn() {
    dname = localStorage.getItem("cdb_dname") || "";
    return (dname.length > 1)
}

function getConnector() {
    dname = localStorage.getItem("cdb_dname") || "";
    apikey = localStorage.getItem("cdb_apikey") || "";
    hostname = localStorage.getItem("cdb_hostname") || "";
    if (dname.length > 1) {
        uname = dname.split("/")[0];
        return new connectordb.ConnectorDB(apikey, undefined, hostname);
    }
    return null;
}

function Initialize() {
    chrome.tabs.create({url: "login.html"})
}

if (!isLoggedIn()) {
    Initialize();
}

function LogDatapoint(pgurl, title) {
    if (pgurl != "chrome://newtab/") {
        c = getConnector();
        if (c != null) {
            console.log({url: pgurl, title: title});

            c.insertStream(uname, "chrome", "history", {
                url: pgurl,
                title: title
            });

        }
    }
}

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
