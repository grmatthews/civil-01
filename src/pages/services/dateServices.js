import dateFnsParse from 'date-fns/parse'
import * as moment  from 'moment'

const getClassName = (obj) => {

    if(obj === null) {
        return 'null'
    }
    return obj.constructor.name
}


const parseTimestamp = (ts) => {

    if(ts !== undefined && ts !== null) {
        return ts.toDate()
    }
    return null
}

const tsToDateStr = (ts) => {
    var t = new Date(1970, 0, 1) // Epoch
    t.setSeconds(ts.seconds)
    return moment(t).format('D-MMM-yyyy')
}

const secsToDateTimeStr = (secs) => {
    var t = new Date(1970, 0, 1) // Epoch
    t.setSeconds(secs)
    return moment(t).format('D-MMM-yyyy HH:mm a')
}

const secsToDateStr = (secs) => {
    var t = new Date(1970, 0, 1) // Epoch
    t.setSeconds(secs)
    return moment(t).format('D-MMM-yyyy')
}

const parseDate = (dateVal) => {

    const className = getClassName(dateVal)

    console.log('parsing', dateVal, className)

    let parsedDate
    switch(className) {

        case 'String':
            parsedDate = dateFnsParse(dateVal, 'dd/MM/yyyy', new Date())
            break;

        case 'Date':
            parsedDate = dateVal
            break;

        case 'null':
            parsedDate = null
            break;

        case 't':       // firebase timestamp
            parsedDate = dateVal.toDate()
            break;

        default:
            console.error('Unexpected expiry date class', className, dateVal)
    }
    //console.log('parse', dateVal, 'as', className, 'to', parsedDate)
    return parsedDate
}

export { parseDate, parseTimestamp, secsToDateStr, secsToDateTimeStr, tsToDateStr } 