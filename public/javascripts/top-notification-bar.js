var notificationBar = document.getElementById("topNotificationBar");
            
notificationBar.messageContainer = document.getElementById("topNotificationBar-messageContainer");
notificationBar.buttonContainer = document.getElementById("topNotificationBar-buttonContainer");
notificationBar.myMessage = document.getElementById("notificationMessage");
notificationBar.myButton = document.getElementById("notificationCTAButton");
    
function showNotification( messageText ) {
    notificationBar.myMessage.innerText = messageText;
    
    let leftOffset = ( window.innerWidth - notificationBar.clientWidth ) / 2;
    
    notificationBar.style.left = `${ leftOffset }px`;
    notificationBar.style.top = "10px";
    
    if ( messageText.length > 150 ) {
        notificationBar.buttonContainer.style.display = "flex";
        notificationBar.messageContainer.style.flexBasis = "90%";
        notificationBar.buttonContainer.style.flexBasis = "10%";
    }
    else {
        notificationBar.buttonContainer.style.display = "none";
        notificationBar.messageContainer.style.flexBasis = "100%";
    }
    
    setTimeout( hideNotification, 3000 );
}
    
function hideNotification() {
    notificationBar.style.top = "-50px";
}