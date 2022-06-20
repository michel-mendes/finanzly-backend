import { apiRequest } from '/javascripts/extra-functions.js';

// Get the modal
let modalTransaction = document.getElementById("modalTransaction");

// Get the constrols
let modalTitle          = document.getElementById('modalTitle');
let cbNewTransaction    = document.getElementById('cbNewTransaction');  //Verifies if is a new transaction or an existing one
let editDate            = document.getElementById('editDate');
let btnAddTransaction   = document.getElementById("menuBtnAddTransaction");
let btnCloseModal       = document.getElementsByClassName("btnCloseModal")[0];
let btnSave             = document.getElementById('btnSave');
let btnCancel           = document.getElementById('btnCancel');

// Assign buttons events
btnSave.onclick             = function() { apiRequest('app', 'POST', getFormValues()) };
btnCancel.onclick           = function() { closeModal() };

btnAddTransaction.onclick   = function() {
    // When the user clicks the button, open the modal 
    modalTitle.innerHTML = 'Adicionar transação';
    cbNewTransaction.checked = true;
    editDate.value = getFullDate();
    
    modalTransaction.style.display = "block";
}

btnCloseModal.onclick       = function() {
    // When the user clicks on <span> (x), close the modal
    closeModal();
}

window.onclick              = function(event) {
    // When the user clicks anywhere outside of the modal, close it
    if (event.target == modalTransaction) {
      closeModal();
    }
}

window.onkeyup              = function( key ) {
    let keyCode = key.keyCode;

    if ( (keyCode === 27) && ( modalTransaction.style.display == "block" ) ) { //Pressed esc key
        closeModal();
    }
}

function closeModal() {
    modalTransaction.style.display = "none";
}


// Create an object with the field values ​​to pass through the API
function getFormValues() {
    return {
        id:             document.getElementById('editId'),
        categoryId:     document.getElementById('editCategoryId'),
        walletId:       document.getElementById('editWalletId'),
        date:           document.getElementById('editDate'),
        description:    document.getElementById('editDescription'),
        extraInfo:      document.getElementById('editExtraInfo'),
        value:          document.getElementById('editValue')
        // creditValue:    document.getElementById('editId'),
        // debitValue:     document.getElementById('editId'),
        // csvImportId:    document.getElementById('editId')
    }
}