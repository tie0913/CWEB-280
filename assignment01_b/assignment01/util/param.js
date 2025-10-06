
function getOrElse(v, d){
    r = parseInt(v)
    if(isNaN(r)){
        return d
    }else{
        return r
    }
}

module.exports = getOrElse