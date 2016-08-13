var STREAM_NAME = "history";

function saveCred(username, devicename, apikey, hostname) {
    // This function saves the login credentials
    if (username !== "") {
        // If the username is not given, we clear the credentials
        localStorage.setItem("cdb_credentials", JSON.stringify({username: username, devicename: devicename, apikey: apikey, hostname: hostname}));
    } else {
        localStorage.setItem("cdb_credentials", "");
    }
}

function enabled(val) {
    $("#username").prop('disabled', !val);
    $("#password").prop('disabled', !val);
    $("#server").prop('disabled', !val);
    $("#device").prop('disabled', !val);

    $("#loginbtn").prop('disabled', !val);
}

//login attempts to log into ConnectorDB. If successful, it refreshes the site. if not, it notifies the user.
function login() {
    usrname = $("#username").val();
    pass = $("#password").val();
    server = $("#server").val();
    device = $("#device").val();

    if (usrname == "") {
        alert("Please type in a username!");
    } else if (pass == "") {
        alert("Please type in a password!");
    } else if (server == "") {
        alert("No server was specified")
    } else if (device == "") {
        alert("Please choose a device name");
    } else {
        //While waiting for response, disable the inputs
        enabled(false);

        // Now log into ConnectorDB
        cdb = new connectordb.ConnectorDB(usrname, pass, server);

        // First, check if the user can be accessed using these credentials
        cdb.readUser(usrname, "user").then(function(result) {
            if (result.ref !== undefined) {
                throw new Error(result.msg);
            }
            console.log("Checking if device exists...");
            return cdb.readDevice(usrname, device);
        }).then(function(result) {
            if (result.ref !== undefined) {
                // The device doesn't exist. Try to create it
                console.log("Creating new device...");
                return cdb.createDevice(usrname, {
                    name: device,
                    nickname: "Chrome Browser",
                    description: "Google Chrome Extension"
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
            saveCred(usrname, device, result.apikey, server);
            console.log("Checking if stream exists...");
            return cdb.readStream(usrname, device, STREAM_NAME);
        }).then(function(result) {
            if (result.ref !== undefined) {
                // The stream doesn't exist. Try to create it
                return cdb.createStream(usrname, device, {
                    name: STREAM_NAME,
                    description: "Websites visited in the browser",
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
            window.close();
        }).catch(function(req) {
            saveCred("");
            console.log(req);
            setTimeout(function() {
                alert(req);
            }, 0);
            enabled(true);
        });

    }

    return true;
}

// Set up the click handler
$("#loginbtn").click(login);
