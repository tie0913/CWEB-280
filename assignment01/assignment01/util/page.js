

function createPage(pageSize, pageNo, recordNumbers){

    let totalPages = Math.ceil(recordNumbers/pageSize)

    let pageNoArr = []
    for(let i = 1; i <= totalPages; i++){
        pageNoArr.push({
            index:i,
            current: i === pageNo
        })
    }
  
    let logicalTo = pageNo * pageSize

    let to = recordNumbers < logicalTo ? recordNumbers : logicalTo

    return {
        pageNo:pageNo,
        pageSize:pageSize,
        from:(pageNo - 1) * pageSize + 1,
        to:to,
        total:totalPages,
        pageNoArr:pageNoArr,
        recordNumbers: recordNumbers,
        isNotFirst:pageNo > 1,
        isNotLast:pageNo < totalPages
    }
}

module.exports = createPage