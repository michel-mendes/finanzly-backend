let loginButton = document.getElementById( 'loginButton' );
let loginHeaderBox = document.getElementById( 'loginHeaderBox' );
let loginHeaderErrorBox = document.getElementById( 'loginHeaderErrorBox' );
let errorBox = document.getElementById( 'errorBox' );
let editUserName = document.getElementById( 'editUserName' );
let editPassword = document.getElementById( 'editPassword' );

editPassword.onkeyup = function ( key ) {
    let keyCode = key.keyCode;

    if ( keyCode === 13 ) loginUser();
}

loginButton.onclick = function() { loginUser() };

function loginUser() {
    let loginBody = {
        userIdentification: editUserName.value,
        password: editPassword.value
    }

    loginButton.disabled = true;
    loginButton.innerText = 'Conectando...';
    
    sendApiRequest('/app/authenticate', 'POST', loginBody);
}

function showErrorMessage ( message, borderColor ) {
    errorBox.innerHTML = message;
    errorBox.style.borderLeftColor = borderColor;
    errorBox.style.display = 'block';
}

function sendApiRequest ( reqUrl, reqMethod = 'GET' /* Default is GET */, reqBody) {
    
    var reqHeaders = new Headers();
    reqHeaders.append("Content-Type", "application/json");
    
    let reqInit = {
        method: reqMethod,
        headers: reqHeaders,
        body: JSON.stringify( reqBody )
    };

    let myRequest = new Request( reqUrl, reqInit );
    
    // alert(reqInit.body);
    fetch(myRequest)
    .then( response => ( response.text() ))
    .then( text => {
        try {
            const userDataObject = JSON.parse( text );

            if ( !userDataObject.error ) {
                // If the user is authorized then show login success message
                // showErrorMessage( userDataObject.message, '#00AA00' );
                showNotification( userDataObject.message );
                
                // Redirect to main page after 2 seconds
                let timeOut = ( setTimeout( () => { window.location.replace("/app/dashboard") }, 1000 ) );
            }
            else {
                // showErrorMessage( userDataObject.message, '#FF4500' )
                showNotification( userDataObject.message );
            }
        } catch( err ) {
            // showErrorMessage( text, '#FF0000' )
            // showErrorMessage( text, '#FF0000' )
            showNotification( text );
        }
        finally {
            loginButton.disabled = false;
            loginButton.innerText = 'Log In';
        }
    });
}