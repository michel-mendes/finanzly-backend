import { apiRequest } from '/javascripts/extra-functions.js';

// Getting page controls
var btnNewWallet = document.getElementById("btnNewWallet");
var ctaCreateNewWallet = document.getElementById("ctaCreateNewWallet"); // Only shown when there are no wallets to show

// Getteing the wallets list controls
var allEditButtons = document.getElementsByName("btnEditWallet");
var allDeleteButtons = document.getElementsByName("btnDeleteWallet");

// Getting modal controls
var modalWallet = document.getElementById("modalAddWallet");
var modalTitle = document.getElementById("modalTitle");
var btnCloseModal = document.getElementById("btnCloseModal");
var btnSaveModal = document.getElementById("btnSave");
var btnCancel = document.getElementById("btnCancel");

// Getting wallet editor controls
var boxWalletEditor = document.getElementById("walletEditorBox");
var editorTitle = document.getElementById("editorTitle");
var btnSaveEditing = document.getElementById("btnSaveEditing");
var btnCloseEditor = document.getElementById("btnCloseEditor");
var btnCancelEdition = document.getElementById("btnCancelEditing");

// Setting up the controls events
btnNewWallet.onclick = function() { openModal() };
btnCloseModal.onclick = function() { closeModal() };
btnSaveModal.onclick = () => { saveWallet() };
btnCancel.onclick = function() { closeModal() };
btnSaveEditing.onclick = () => { editWallet() }
btnCloseEditor.onclick = () => { closeEditor() };
btnCancelEdition.onclick = () => { closeEditor() };
allEditButtons.forEach( editButton => { editButton.onclick = () => { openWalletEditor( editButton ) } } );
if ( ctaCreateNewWallet ) { ctaCreateNewWallet.onclick = () => { openModal() } };


// Here are the functions that will be triggered by the buttons
function openModal() {
    // When the user clicks the button, open the modal 
    modalTitle.innerHTML = 'ADICIONAR CARTEIRA';
    document.getElementById("editName").value = '';
    document.getElementById("editSymbol").value = '';
    document.getElementById("editBalance").value = '';
    
    modalWallet.style.display = "block";
}

function openWalletEditor( buttonSender ) {
    // When the user clicks the button, open the modal 
    editorTitle.innerHTML = 'EDITAR CARTEIRA';

    let walletId = buttonSender.getAttribute("walletId");
    document.getElementById('editId2').value = walletId;
    document.getElementById("editName2").value = document.getElementById(`name${walletId}`).innerText;
    document.getElementById("editSymbol2").value = document.getElementById(`currencySymbol${walletId}`).innerText;
    document.getElementById("editBalance2").value = document.getElementById(`intialBalance${walletId}`).innerText;
    
    boxWalletEditor.style.display = "block";
}

function closeModal() {
    modalWallet.style.display = "none";
}

function closeEditor() {
    boxWalletEditor.style.display = "none";
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

function saveWallet() {
    let walletData = {
        name: document.getElementById("editName").value,
        currencySymbol: document.getElementById("editSymbol").value,
        initialBalance: document.getElementById("editBalance").value     
    }

    axios.post('/wallets', walletData)
    .then( (result) => {
        showNotification( `Carteira cadastrada com sucesso!` );
        setTimeout(refreshPage, 2000);
    })
    .catch( (e) => {
        showNotification( `Erro: ${ e.response.data }` );
    })
}

function editWallet() {
    let walletId = document.getElementById('editId2').value;

    let walletData = {
        name: document.getElementById("editName2").value,
        currencySymbol: document.getElementById("editSymbol2").value,
        initialBalance: document.getElementById("editBalance2").value     
    }

    axios.put(`/wallets/${walletId}`, walletData)
    .then( (result) => {
        showNotification( `Carteira alterada com sucesso!` );
        setTimeout(refreshPage, 2000);
    })
    .catch( (e) => {
        showNotification( `Erro: ${ e.response.data }` );
    })
}

function refreshPage() {
    location.reload()
}