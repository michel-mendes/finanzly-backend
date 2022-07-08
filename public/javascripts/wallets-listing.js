import { apiRequest } from '/javascripts/extra-functions.js';

let modalWallet = document.getElementById("modalAddWallet");
var modalTitle = document.getElementById("modalTitle");

var btnNewWallet = document.getElementById("btnNewWallet");
var btnCloseModal = document.getElementById("btnCloseModal");
var btnCancel = document.getElementById("btnCancel");
var ctaCreateNewWallet = document.getElementById("ctaCreateNewWallet");

var allEditButtons = document.getElementsByName("btnEditWallet");
var allDeleteButtons = document.getElementsByName("btnDeleteWallet");

var walletEditorBox = document.getElementById("walletEditorBox");

btnNewWallet.onclick = function() { openModal() };
btnCloseModal.onclick = function() { closeModal() };
btnCancel.onclick = function() { closeModal() };

if ( ctaCreateNewWallet ) { ctaCreateNewWallet.onclick = () => { openModal() } };

allEditButtons.forEach( editButton => { editButton.onclick = () => {walletEditorBox.style.display = 'block'} } );

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