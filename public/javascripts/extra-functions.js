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
    .then ( function(response) { return response.text() } )
    .then ( function(text) {
        try {
            const jsonResponse = JSON.parse( text );

            return jsonResponse;
        }
        catch(err) {
            return {
                error: true,
                message: err
            };
        }
    })
}

export { apiRequest };