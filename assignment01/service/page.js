

function createPage(pageSize, pageNo, totalPages, recordNumbers){

    let pageNoArr = []
    for(let i = 1; i <= totalPages; i++){
        pageNoArr.push({
            index:i,
            current: i === pageNo
        })
    }

    return {
        pageNo:pageNo,
        pageSize:pageSize,
        from:(pageNo - 1) * pageSize + 1,
        to:pageNo * pageSize,
        total:totalPages,
        pageNoArr:pageNoArr,
        recordNumbers: recordNumbers,
        isNotFirst:pageNo > 1,
        isNotLast:pageNo < totalPages
    }
}

module.exports = createPage