
function createInvites(eventId){

    document.getElementById("copyButton").innerText = "Copy";
    fetch('/events/invites?eventId='+eventId)
    .then(res => res.json())
    .then(data => {
        document.getElementById("token_p").innerText = data.message
        document.getElementById("dialog").style.display = "block"
    })
    .catch(err => console.error(err));
}


function closeInvitesDialog(){
    document.getElementById("dialog").style.display = "none"
}

function copyToClipboard(){
    let text = document.getElementById("token_p").innerText;
    navigator.clipboard.writeText(text);
    document.getElementById("copyButton").innerText = "Copied";
    window.setTimeout(function(){
        closeInvitesDialog()
    }, 200);
}