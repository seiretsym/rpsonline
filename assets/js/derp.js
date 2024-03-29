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
var userName = "guest";
    email = "email",
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
    // add to list
    var user = connectionsRef.push({
        name: userName,
    });
    // remove from list if disconnected
    user.onDisconnect().remove();
  }
})

// when users are added to the connection list
connectionsRef.on("value", function(snapshot) {
    // empty list before repopulating
    $("#chat-users").empty();
    // set usercount back to 0 because this refreshes every time a new user connects
    userCount = 0;

    // read through connected users
    snapshot.forEach(function(childSnapshot) {
        // increase userCount for each child
        userCount++;

        if (childSnapshot.val().name !== undefined) {
            // add user name to user list
            var p = $("<p>").attr("id", "#user" + userCount);
            p.addClass("mb-0");
            p.append(childSnapshot.val().name);
            $("#chat-users").append(p);
        }
    })
})

// when a user disconnects
connectionsRef.on("child_removed", function(snapshot) {
    // remove from userlist
    var user = "#user" + userCount;
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

        // send the message
        sendMessage(timeStamp, userName, message)
    }
})

// database listener to populate chat messages
db.ref().child("chat").on("child_added", function(snapshot) {
    var chatDisplay = document.getElementById("chat-display");
    // add message to chatroom
    $("#chat-display").append(snapshot.val().message + "<br>")
    // scroll chat container to bottom
    chatDisplay.scrollTop = chatDisplay.scrollHeight;
})

// ----------------------------------- RPS Stuff goes here

// game rules
// best out of 3
// up to 2 players

// 1. players can choose left or right side
// 1a. page reflects left and right

// 2. after both player slots are taken
// 2a. countdown to start game begins
// 2b. both players will have a set time to pick rock, paper, or scissors

// 3. show results
// 3aa. timer runs out
// 3ab. both players have chosen

// 4. round outcome
// 4a. determine winner and keep score
// 4ba. continue playing until up to 3 rounds have passed
// 4bb. if a single player wins 2 in a row, determine winner

// 5. match outcome
// 5a. winner stays seated in player slot
// 5b. loser gets booted and can't pick a slot until x amount of time passes

// use buttons for rock, paper, scissor, so create click listeners
