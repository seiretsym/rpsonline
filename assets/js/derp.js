// ----------------------------------- Firebase Stuff goes here

// Your web app's Firebase configuration
var firebaseConfig = {
apiKey: "AIzaSyAFaORLkbTeXnLhYTyrbk7bQUMZv-iQi3k",
authDomain: "rps-online-f5b1a.firebaseapp.com",
databaseURL: "https://rps-online-f5b1a.firebaseio.com",
projectId: "rps-online-f5b1a",
storageBucket: "",
messagingSenderId: "878502711181",
appId: "1:878502711181:web:a907baf6fa512ae63077c4"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

var db = firebase.database();

// global variables
var userName,
    email,
    userCount = 0;

// FirebaseUI config.
var uiConfig = {
    callbacks: {
      signInSuccessWithAuthResult: function(authResult, redirectUrl) {
        // Do something with the returned AuthResult.
        return true;
      },
      signInFailure: function(error) {
        // FirebaseUI error handler
        return handleUIError(error);
      },
      uiShown: function() {
        // do something here, maybe
      }
    },
    credentialHelper: firebaseui.auth.CredentialHelper.ACCOUNT_CHOOSER_COM,
    // Query parameter name for mode.
    queryParameterForWidgetMode: 'mode',
    // Query parameter name for sign in success url.
    queryParameterForSignInSuccessUrl: 'signInSuccessUrl',
    // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
    signInFlow: 'popup',
    signInSuccessUrl: './',
    signInOptions: [
      // Leave the lines as is for the providers you want to offer your users.
      firebase.auth.GithubAuthProvider.PROVIDER_ID,
    ],
    // Terms of service url/callback.
    tosUrl: './',
    // Privacy policy url/callback.
    privacyPolicyUrl: function() {
      window.location.assign('./');
    }
};

var ui = new firebaseui.auth.AuthUI(firebase.auth());
// The start method will wait until the DOM is loaded.
ui.start('#firebaseui-auth-container', uiConfig);

initApp = function() {
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        // User is signed in.
        user.getIdToken().then(function(accessToken) {
            $("#signOut").removeClass("d-none");
            $("#disclaimer").removeClass("d-none");
            $("#firebaseui-auth-container").addClass("d-none");
        });

        // get user name
        userName = user.displayName;
        email = user.email

        // if display name is null then... use email address with provider omitted
        if (userName === null) {

            var length = 0;
            for (var i = 0; i < email.length;i ++){
                if (email[i] === "@") {
                    length = i;

                }
            }
            userName = email.slice(0, length);
        }

        // check database to see if user exists
        db.ref().child("users").once("value", function(snapshot) {
            // check each child in ./users
            userExists(snapshot);
        });

    } else {
        // User is signed out.
        $("#signOut").addClass("d-none");
        $("#disclaimer").addClass("d-none");
        $("#firebaseui-auth-container").removeClass("d-none");
        // remove user from userlist
        $("#"+userName).remove();
    }
}, function(error) {
    console.log(error);
});
};

// function to read through each child in users database
function userExists(snapshot) {
    // set a boolean to false
    var userFound = false;

    // read through each child
    snapshot.forEach(function(childSnapshot) {
        if (childSnapshot.val().email === email) {
            // change boolean to true if user is found
            userFound = true;
        }
    });

    // stop function if user is found
    if (userFound) {
        return;
    }
    else {
        // otherwise, add to database if user isn't found in database
        db.ref().child("users").push({
            email: email,
            name: userName
        });
    }
}


// run initApp to do stuff after user signs in
window.addEventListener('load', function() {
    initApp();
});

// button listener for signing out
$(document).on("click", "#signOut", function() {
    // sign out!
    firebase.auth().signOut();
})

// ----------------------------------- Check online users and display them in userlist if they're online
// connection list
var connectionsRef = db.ref("/connections");
// connection status
var connectedRef = db.ref(".info/connected");

// listen to connection state
connectedRef.on("value", function(snap) {
    // if connection is made
    if (snap.val()) {
    // increment userCount
    userCount++;
    // add to list
    var user = connectionsRef.push({
        name: userName,
        count: "user" + userCount
    });

    // remove from list if disconnected
    user.onDisconnect().remove();
  }
})

// when users are added to the connection list
connectionsRef.on("value", function(snapshot) {
    // empty list before repopulating
    $("#chat-users").empty();

    // read through connected users
    snapshot.forEach(function(childSnapshot) {
        if (childSnapshot.val().name !== undefined) {
            // add user name to user list
            var p = $("<p>").attr("id", childSnapshot.val().count);
            p.append(childSnapshot.val().name);
            $("#chat-users").append(p);
        }
    })
})

// when a user disconnects
connectionsRef.on("child_removed", function(snapshot) {
    userCount--;
    // remove from userlist
    var user = "#" + snapshot.val().count;
    $(user).remove();
})


// ----------------------------------- Chat room stuff goes here

// function to send message to chat
function sendMessage(time, name, message) {
    // format message
    var msg = time + name + ": " + message;

    // push message to database
    db.ref().child("chat").push({
        message: msg
    })
}

// send button clicked
$(document).on("click", "#chat-submit", function() {
    // prevent page refresh
    event.preventDefault();

    // check if input value is empty
    if ($("#chat-input").val() == "") {
        // let user know if it is
        $("#chat-input").attr("placeholder", "You can't send an empty message!")
    }
    else {
        // send message to chat if it isn't
        var message = $("#chat-input").val();

        // clear input box
        $("#chat-input").val("");
        $("#chat-input").attr("placeholder", "");

        // get current time and user name
        var timeStamp = "(" + moment().format("MM/DD@h:mma") + ") ";

        // set username to guest if they aren't signed in to github
        if (userName === undefined) {
            userName = "Guest";
        }

        // send the message
        sendMessage(timeStamp, userName, message)
    }
})

// database listener to populate chat messages
db.ref().child("chat").on("child_added", function(snapshot) {
    // add message to chatroom
    $("#chat-display").append(snapshot.val().message + "<br>")
})