
function gotoPage(formId, pageNo){


    let form = document.getElementById(formId)


    let input = document.createElement("input")

    input.type = "hidden"
    input.name = "pageNo"
    input.value = pageNo


    form.appendChild(input)

    form.submit()

}

 function newSearch(){

    let typeCode = document.createElement("input")
    let statusCode = document.createElement("input")
    typeCode.type = "hidden"
    statusCode.type = "hidden"
    typeCode.name = "typeCode"
    statusCode.name = "statusCode"
    typeCode.value = document.getElementById("q_TypeCode").value
    statusCode.value = document.getElementById("q_StatusCode").value

    let form = document.getElementById("queryForm")
    form.appendChild(typeCode)
    form.appendChild(statusCode)
    form.submit()
  }