var btnSubscribe = document.getElementById('btnSave');

btnSubscribe.onclick = function() {
    sendApiRequest( '/users', 'POST', makePOSTbody()) ;
}

function makePOSTbody() {
   
    return {
        firstName:  document.getElementById('editFirstName').value,
        userName:   document.getElementById('editUserName').value,
        email:      document.getElementById('editEmail').value,
        password:   document.getElementById('editPassword').value
    }

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
    
    fetch(myRequest)
    .then( function( response ) {

        return response.json();

    })
    .then( function(myJSON)
    {
        
        // alert( JSON.stringify(myJSON, null, ' ') );
        if ( !myJSON.error ) {
            location.assign('/app/registration/success');
        }
        else {
            alert(`Oops...\n\n${myJSON.message}`);
        }
    })
    .catch( function(er)
    {
        alert('Erro: ' + er);
    })
}