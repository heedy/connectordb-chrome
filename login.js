const DEVICE_NAME = "chrome";
const STREAM_NAME = "history";

function saveCred(uname, pass, hostname) {
    localStorage.setItem("cdb_dname", uname);
    localStorage.setItem("cdb_apikey", pass);
    localStorage.setItem("cdb_hostname", hostname);
}

function handleLogin(e) {
    e.preventDefault();
    var uname = document.getElementById("inputUser").value;
    var pwd = document.getElementById("inputPassword").value;
    var hostname = document.getElementById("inputHostname").value;

    document.getElementById("loginform").removeEventListener("submit", handleLogin);

    cdb = new connectordb.ConnectorDB(uname, pwd, hostname);

    console.log("Starting login...");
    // First, check if the user can be accessed using these credentials
    cdb.readUser(uname, "user").then(function(result) {
        if (result.ref !== undefined) {
            throw new Error(result.msg);
        }
        console.log("Checking if device exists...");
        return cdb.readDevice(uname, DEVICE_NAME);
    })
    // Then, see if the device exists, and create it if it doesn't
        .then(function(result) {
        if (result.ref !== undefined) {
            // The device doesn't exist. Try to create it
            console.log("Creating new device...");
            return cdb.createDevice(uname, {
                name: DEVICE_NAME,
                description: "Google Chrome browsing history"
            });

        }
        return result;
    })
    // Next, check if the history stream exists, and create it if it doesn't exist
        .then(function(result) {
        console.log(result);
        if (result.ref !== undefined) {
            throw new Error(result.msg);
        }
        saveCred(uname + "/" + DEVICE_NAME, result.apikey, hostname);
        console.log("Checking if stream exists...");
        return cdb.readStream(uname, DEVICE_NAME, STREAM_NAME);
    }).then(function(result) {
        if (result.ref !== undefined) {
            // The stream doesn't exist. Try to create it
            return cdb.createStream(uname, DEVICE_NAME, {
                name: STREAM_NAME,
                description: "All websites visited",
                schema: JSON.stringify({
                    type: "object",
                    properties: {
                        url: {
                            type: "string"
                        },
                        title: {
                            type: "string"
                        }
                    }
                }),
                datatype: "browser.history"
            });
        }
        return result;
    })
    // Finally, finish setup
        .then(function(result) {
        if (result.ref !== undefined) {
            throw new Error(result.msg);
        }
        disable();
        window.close();
    }).catch(function(req) {
        saveCred("", "", "");
        console.log(req);
        alert(req);
    });
    console.log("EOF");
    enable();
    return true;
}

function handleLogout(e) {
    e.preventDefault();
    document.getElementById("loginform").removeEventListener("submit", handleLogout);
    localStorage.setItem("cdb_dname", "");
    localStorage.setItem("cdb_apikey", "");
    localStorage.setItem("cdb_hostname", "");
    enable();
}

function disable() {
    document.getElementById("inputHostname").disabled = true;
    document.getElementById("inputUser").disabled = true;
    document.getElementById("inputPassword").disabled = true;
    document.getElementById("signinbtn").innerHTML = "Log out";
    document.getElementById("loginform").addEventListener("submit", handleLogout, false);
}

function enable() {
    console.log("enable");
    document.getElementById("inputHostname").disabled = false;
    document.getElementById("inputUser").disabled = false;
    document.getElementById("inputUser").value = "";
    document.getElementById("inputPassword").disabled = false;
    document.getElementById("inputPassword").value = ""
    document.getElementById("signinbtn").innerHTML = "Sign in";
    document.getElementById("loginform").addEventListener("submit", handleLogin, false);
}

function isLoggedIn() {
    console.log("logincheck");
    dname = localStorage.getItem("cdb_dname") || "";
    return (dname.length > 1)
}

window.addEventListener("load", function() {
    console.log("onload");
    if (isLoggedIn()) {
        disable();
    } else {
        enable();
    }
}, false);
