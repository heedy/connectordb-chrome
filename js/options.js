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
    var opt = JSON.parse(localStorage.getItem("cdb_options"));

    updateOptions(opt);
    return opt;
}

function setOptions(opt) {
    var old = getOptions();
    var newopt = Object.assign(old, opt);
    localStorage.setItem("cdb_options", JSON.stringify(newopt));
    updateOptions(newopt);
}

function setEnabledButton(opt) {
    if (opt.enabled) {
        $("#enable_disable").html("disable logging");
    } else {
        $("#enable_disable").html("enable logging");
    }
}
function updateOptions(opt) {
    setEnabledButton(opt);
}

function goLogin() {
    window.location.replace("./login.html");
}

var cred = getCredentials()
if (cred == null) {
    goLogin();
}
var deviceurl = cred.hostname + "/" + cred.username + "/" + cred.devicename;
// Set up the link at top of options page
$("#linkme").prop("href", deviceurl);
$("#textme").text(deviceurl);

var opt = getOptions();

$("#loginbtn").click(function() {
    localStorage.setItem("cdb_credentials", "");
    goLogin();
});

$("#enable_disable").click(function() {
    opt = getOptions();
    setOptions({
        enabled: !opt.enabled
    });
});
