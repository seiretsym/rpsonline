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
        var user = authResult.user;
        var credential = authResult.credential;
        var isNewUser = authResult.additionalUserInfo.isNewUser;
        var providerId = authResult.additionalUserInfo.providerId;
        var operationType = authResult.operationType;
        // Do something with the returned AuthResult.
        // Return type determines whether we continue the redirect automatically
        // or whether we leave that to developer to handle.
        console.log(user);
        return true;
      },
      signInFailure: function(error) {
        // Some unrecoverable error occurred during sign-in.
        // Return a promise when error handling is completed and FirebaseUI
        // will reset, clearing any UI. This commonly occurs for error code
        // 'firebaseui/anonymous-upgrade-merge-conflict' when merge conflict
        // occurs. Check below for more details on this.
        console.log(error);
        return handleUIError(error);
      },
      uiShown: function() {
        // The widget is rendered.
        // Hide the loader.
        // document.getElementById('loader').style.display = 'none';
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
    // Set to true if you only have a single federated provider like
    // firebase.auth.GoogleAuthProvider.PROVIDER_ID and you would like to
    // immediately redirect to the provider's site instead of showing a
    // 'Sign in with Provider' button first. In order for this to take
    // effect, the signInFlow option must also be set to 'redirect'.
    // immediateFederatedRedirect: false,
    // tosUrl and privacyPolicyUrl accept either url string or a callback
    // function.
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
        console.log(user);
        var displayName = user.displayName;
        var email = user.email;
        var emailVerified = user.emailVerified;
        var photoURL = user.photoURL;
        var uid = user.uid;
        var phoneNumber = user.phoneNumber;
        var providerData = user.providerData;
        user.getIdToken().then(function(accessToken) {
          $("#signOut").removeClass("d-none");
          $("#disclaimer").removeClass("d-none");
          $("#firebaseui-auth-container").addClass("d-none");
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

  window.addEventListener('load', function() {
    initApp();
  });

  $(document).on("click", "#signOut", function() {
      firebase.auth().signOut();
  })