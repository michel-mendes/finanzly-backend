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
    
    let parts = String( date ).match( /(\d+)/g )

    return new Date( parts[0], parts[1]-1, parts[2] ) // months are 0-based

}

function getWeeks( start = new Date(), end = new Date() ) {

    let startDate = start
    let endDate = end
    let currentDate
    let weekCounter = 0
    let dates = {}
    let count = 0

    currentDate = new Date(startDate)
    
    while ( currentDate <= endDate ) {
        let startOfWeek = new Date(currentDate)
        let endOfWeek = new Date(currentDate)
        
        startOfWeek.setDate( startOfWeek.getDate() - startOfWeek.getDay() )
        endOfWeek = new Date( startOfWeek.getTime() + daysToMilliseconds(6) )

        if ( dates[ weekCounter ] ) {
            
            if ( startOfWeek > new Date(dates[ weekCounter ].firstDay )) {
                weekCounter++

                dates[ weekCounter ] = insertWeek( startOfWeek, endOfWeek )
            }

        }
        else {
            weekCounter++

            dates[ weekCounter ] = insertWeek( startOfWeek, endOfWeek )
        }
        
        count++
        currentDate.setDate( currentDate.getDate() + 1 )
        // currentDate = new Date( currentDate.getTime() + daysToMilliseconds(1) )
    }

    return {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        daysCount: count,
        weeksCount: weekCounter,
        yearsCount: ( count / 365 ),
        weeksList: dates
    }

    function insertWeek( weekFirstDay, weekLastDay ) {

        return {
            firstDay: weekFirstDay.toISOString(),
            lastDay: weekLastDay.toISOString(),
            daysCount: Math.round( Math.abs( new Date(weekLastDay) - new Date(weekFirstDay)) / daysToMilliseconds(1) )
        }

    }

}

function daysToMilliseconds(days) {
    // 👇️        hour  min  sec  ms
    return days * 24 * 60 * 60 * 1000;
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

// Front-End only
// Change input to uppercase without the cursor jumping to the end of the text
// #input #uppercase
// ---------------------------------------------------------------------------
// uses:
// HTML -> <input onkeyup="setInputUppercase( this )">
// JS -> element.onkeyup = () => { setInputUppercase( element ) }
// ---------------------------------------------------------------------------
function setInputUppercase( inputField ) {

    // Get the start and end positions of the selected text in the input
    // if not selected both values will be the same
    let startPos = inputField.selectionStart
    let endPos = inputField.selectionEnd

    // Change the input value to Uppercase, this will make the caret position
    // run to the last character of the input text
    inputField.value = String( inputField.value ).toUpperCase()

    // Set the caret position to the values before the text uppercasing
    inputField.selectionStart = startPos
    inputField.selectionEnd = endPos

}
// ---------------------------------------------------------------------------