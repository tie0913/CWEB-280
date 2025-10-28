const qs = require('qs')
function r(req){
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

module.exports = r