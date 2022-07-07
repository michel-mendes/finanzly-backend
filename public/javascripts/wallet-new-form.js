import { apiRequest } from '/javascripts/extra-functions.js';

let modalWallet = document.getElementById("modalAddWallet");
var modalTitle = document.getElementById("modalTitle");

var bntNewWallet = document.getElementById("bntNewWallet");
var btnCloseModal = document.getElementById("buttonCloseModal");
var btnCancel = document.getElementById("btnCancel");

bntNewWallet.onclick = function() { openModal() };
btnCloseModal.onclick = function() { closeModal() };
btnCancel.onclick = function() { closeModal() };

function openModal() {
    // When the user clicks the button, open the modal 
    modalTitle.innerHTML = 'Adicionar categoria';
    
    modalWallet.style.display = "block";
}

function closeModal() {
    modalWallet.style.display = "none";
}

window.onkeyup = function( key ) {
    let keyCode = key.keyCode;

    if ( (keyCode === 27) && ( modalWallet.style.display == "block" ) ) { //Pressed esc key when modal is open
        closeModal();
    }
}

window.onclick = function(event) {
    // When the user clicks anywhere outside of the modal, close it
    if (event.target == modalWallet) {
      closeModal();
    }
}