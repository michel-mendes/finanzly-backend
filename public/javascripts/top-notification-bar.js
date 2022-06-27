var notificationBar = document.getElementById("topNotificationBar");
            
notificationBar.messageContainer = document.getElementById("topNotificationBar-messageContainer");
notificationBar.buttonContainer = document.getElementById("topNotificationBar-buttonContainer");
notificationBar.myMessage = document.getElementById("notificationMessage");
notificationBar.myButton = document.getElementById("notificationCTAButton");
    
function showNotification( messageText ) {
    
    if ( messageText.length > 150 ) {
        notificationBar.myMessage.innerText = "Erro fatal!";

        notificationBar.buttonContainer.style.display = "flex";
        notificationBar.messageContainer.style.flexBasis = "80%";
        notificationBar.buttonContainer.style.flexBasis = "20%";

        notificationBar.myButton.onclick = () => {
            openErrorInNewWindow( messageText );
        }
    }
    else {
        notificationBar.myMessage.innerText = messageText;

        notificationBar.buttonContainer.style.display = "none";
        notificationBar.messageContainer.style.flexBasis = "100%";
    }

    let leftOffset = ( window.innerWidth - notificationBar.clientWidth ) / 2;
    
    notificationBar.style.left = `${ leftOffset }px`;
    notificationBar.style.top = "10px";
    
    setTimeout( hideNotification, 3000 );
}
    
function hideNotification() {
    notificationBar.style.top = "-50px";
}

function openErrorInNewWindow( errorMessage ) {
    // let newWindow = window.open("", "Mensagem de erro", "toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=780,height=200,top="+(screen.height-400)+",left="+(screen.width-840));
    let newWindow = window.open("", "Mensagem de erro", "toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=yes,resizable=yes");
    newWindow.document.body.innerHTML = errorMessage;
}