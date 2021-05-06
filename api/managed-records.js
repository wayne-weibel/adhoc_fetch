import fetch from "../util/fetch-fill";
import URI from "urijs";

// /records endpoint
window.path = "http://localhost:3000/records";

function resolved(data, options) {
    const _end = Math.min(options.offset + options.limit, data.length)
    const ret = {
        ids: [],               // An array containing the ids of all items returned from the request.
        open: [],              // An array containing all of the items returned from the request that have a `disposition` value of `"open"`. Add a fourth key to each item called `isPrimary` indicating whether or not the item contains a primary color (red, blue, or yellow).
        closedPrimaryCount: 0, // The total number of items returned from the request that have a `disposition` value of `"closed"` and contain a primary color.
        previousPage: null,    // The page number for the previous page of results, or `null` if this is the first page.
        nextPage: null,        // The page number for the next page of results, or `null` if this is the last page.
    }
    ret.previousPage = (options.page > 1) ? options.page - 1 : null
    ret.nextPage = (_end >= data.length) ? null : options.page + 1

    const primaryColors = ['red', 'blue', 'yellow']
    for (const record of data.slice(options.offset, _end)) {
        ret.ids.push(record.id)
        if (record.disposition == 'open') {
            record.isPrimary = primaryColors.includes(record.color)
            ret.open.push(record)
        }
        if (record.disposition == 'closed' && primaryColors.includes(record.color)) {
            ret.closedPrimaryCount += 1
        }
    }

    return ret
}

function rejected(error) {
    console.log(error.reason)
    return error.promise
}

// Your retrieve function plus any additional functions go here ...
function retrieve(options = {}) {
    options.page ||= 1
    options.limit ||= 10
    options.colors ||= []
    options.offset = options.limit * (options.page - 1)

    const url = new URI(window.path)
    url.addQuery({limit: 500, 'color[]': options.colors})

    const response = fetch(url.toString())
            .then(result => result.json())
            .then(data => resolved(data, options))
            .catch(rejected)

    return response
}

export default retrieve;
