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
    
    try {
        var parts = date.match(/(\d+)/g);
        // new Date(year, month [, date [, hours[, minutes[, seconds[, ms]]]]])
        return new Date(parts[0], parts[1]-1, parts[2]); // months are 0-based
    }
    catch ( error ) {
        throw `Erro {parseDate} >> ${ error }`
    }

}

function getFullDateName_PtBr( date = new Date() ) {

    const brDayNames = [
        'domingo',
        'segunda-feira',
        'terça-feira',
        'quarta-feira',
        'quinta-feira',
        'sexta-feira',
        'sábado']

    const brMonthNames = [
        "janeiro",
        "fevereiro",
        "março",
        "abril",
        "maio",
        "junho",
        "julho",
        "agosto",
        "setembro",
        "outubro",
        "novembro",
        "dezembro"
    ]

    return {
        dayNumber: new Date( date ).getDate(),
        dayName: brDayNames[ new Date( date ).getDay() ],
        monthName: brMonthNames[ new Date( date ).getMonth() ],
        yearNumber: new Date( date ).getFullYear()
    }

}

function addString( targetString, stringToPut, index ) {
    return targetString.substring(0, index) + stringToPut + targetString.substring(index, targetString.length);
}

module.exports = { apiRequest, getFullDate, parseDate, getFullDateName_PtBr , addString};