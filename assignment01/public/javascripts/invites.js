
function createInvites(eventId){
    fetch('/events/invites?eventId='+eventId)
    .then(res => res.json())
    .then(data => {
        document.getElementById("token_p").innerText = data.message
        document.getElementById("dialog").style.display = "block"
    })
    .catch(err => console.error(err));
}