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

module.exports = { 
    getFullDate, 
    parseDate, 
    getFullDateName_PtBr, 
    addString,
    getWeeks,
    daysToMilliseconds
};