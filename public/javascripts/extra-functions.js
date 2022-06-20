function apiRequest ( reqUrl, reqMethod = 'GET' /* Default is GET */, reqBody = {}) {
    
    var reqHeaders = new Headers();
    reqHeaders.append("Content-Type", "application/json");
    
    let reqInit = {
        method: reqMethod,
        headers: reqHeaders,
        body: JSON.stringify( reqBody )
    };

    let myRequest = new Request( reqUrl, reqInit );
    
    fetch( myRequest )
    .then ( function( response )
    {
        return response.json();
    })
    .then ( function( myJSON )
    {
        return myJSON;
    })
    .catch( function(er)
    {
        alert('Erro: \n\n\n' + er);
    })
}

export { apiRequest };