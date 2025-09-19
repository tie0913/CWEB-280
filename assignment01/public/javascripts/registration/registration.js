
function openRegisterDialog(){
    let code = document.getElementById("code")
    code.innerText = ""
    let dialog = document.getElementById("registerDialog")
    dialog.style.display = "block"
}

function closeRegisterDialog(){
    let dialog = document.getElementById("registerDialog")
    dialog.style.display = "none"
}

function register(){
    let code = document.getElementById("code")
    alert(code)
}