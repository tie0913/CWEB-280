const qs = require('qs')
/**
 * Parse query parameters from a request.
 *
 * Extracts pagination (page number and size) and filter (name)
 * from the request URL query string.
 *
 * Returns:
 *   {
 *     filter: { name },
 *     page: { no, size }
 *   }
 */
function reader(req){
    const parsed = qs.parse(req._parsedUrl.query)
    console.log(parsed)
    const no = parseInt(parsed.page?.mp??'1', 10)
    const size = parseInt(parsed.page?.size?? '20', 10)
    const name = parsed.filter?.name

    return {
        filter:{name:name},
        page:{
            no:no,
            size:size
        }
    }
}

module.exports = reader