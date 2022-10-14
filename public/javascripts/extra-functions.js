async function apiRequest ( reqUrl, reqMethod = 'GET' /* Default is GET */, reqBody ) {
    
    var reqHeaders = new Headers();
    reqHeaders.append("Content-Type", "application/json");
    
    let reqInit = {
        method: reqMethod,
        headers: reqHeaders,
        body: JSON.stringify( reqBody )
    };

    let myRequest = new Request( reqUrl, reqInit );
    
    const fetchResponse = await fetch( myRequest );
    const textResponse = await fetchResponse.text();
    
    try {
        const jsonResponse = JSON.parse( textResponse );

        return jsonResponse;
    } catch ( catchError ) {
        return {
            error: true,
            message: textResponse,
            errorMessage: catchError
        }
    }
}

function getFullDate() {
    let now = new Date();

    let day = ("0" + now.getDate()).slice(-2);
    let month = ("0" + (now.getMonth() + 1)).slice(-2);

    return ( now.getFullYear()+"-"+(month)+"-"+(day) );
}

function parseDate( date ) {
    var parts = date.match(/(\d+)/g);
    // new Date(year, month [, date [, hours[, minutes[, seconds[, ms]]]]])
    return new Date(parts[0], parts[1]-1, parts[2]); // months are 0-based
}

function hexToStr( hex ) {
    var hex = hex.toString();//force conversion
    var str = '';
    for (var i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}

function strToHex( str ) {
    var hex = '';
    for(var i=0;i<str.length;i++) {
        hex += ''+str.charCodeAt(i).toString(16);
    }
    return hex;
}

function addString( targetString, stringToPut, index ) {
    return targetString.substring(0, index) + stringToPut + targetString.substring(index, targetString.length);
}