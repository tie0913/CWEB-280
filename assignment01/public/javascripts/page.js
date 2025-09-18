
function gotoPage(formId, pageNo){


    let form = document.getElementById(formId)


    let input = document.createElement("input")

    input.type = "hidden"
    input.name = "pageNo"
    input.value = pageNo


    form.appendChild(input)

    form.submit()

}