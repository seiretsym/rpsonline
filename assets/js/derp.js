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
        var userName = user.displayName;
        var email = user.email

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
            snapshot.forEach(function(childSnapshot) {
                // looking for that email
                if (childSnapshot.val().email === email) {
                    // found it, so do something
                }
                else {
                    // nope, so we're adding it to the database.
                    db.ref().child("users").push({
                        email: email,
                        name: userName
                    });
                }
            })

        });

    } else {
        // User is signed out.
        $("#signOut").addClass("d-none");
        $("#disclaimer").addClass("d-none");
        $("#firebaseui-auth-container").removeClass("d-none");
    }
}, function(error) {
    console.log(error);
});
};

// run initApp to do stuff after user signs in
window.addEventListener('load', function() {
    initApp();
});

// button listener for signing out
$(document).on("click", "#signOut", function() {
    // sign out!
    firebase.auth().signOut();
})

// ----------------------------------- Chat room stuff goes here

// function to send message to chat

    // push message to database


// send button clicked

    // check if input value is empty

        // let user know if it is

        // send message to chat if it isn't

// database listener to populate chat messages

    // add message to chatroom