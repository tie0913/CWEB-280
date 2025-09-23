
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
    let invites = document.getElementById("code").innerText
    fetch('/registrations/regist', {
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({
            code:invites
        })
    })
    .then(res => res.json())
    .then(data => {
        closeRegisterDialog()
        if(data.code === 0){
            show("tip", data.message)
            window.setTimeout(function(){
                window.location = "/registrations/enter"
            }, 3300)
        }else{
            show("alert", data.message)
        }
    })
    .catch(err => console.error(err));
}

 function show(id, message) {
    
    const alertBox = document.getElementById(id);
    alertBox.querySelector("#message").innerText = message 

    alertBox.classList.remove("hidden");
    requestAnimationFrame(() => { 
      alertBox.classList.add("opacity-100");
      alertBox.classList.remove("opacity-0");
    });

    setTimeout(() => {
      alertBox.classList.remove("opacity-100");
      alertBox.classList.add("opacity-0");

      // 动画结束后彻底隐藏
      setTimeout(() => {
        alertBox.classList.add("hidden");
      }, 1000); // duration-1000 对应 1s
    }, 3000);
  }