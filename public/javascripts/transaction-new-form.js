import { apiRequest } from '/javascripts/extra-functions.js';
import { getFullDate } from '/javascripts/extra-functions.js';

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
btnSave.onclick             = function() { saveTransaction() };
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
    let date
    let transactionData = {
        id:             document.getElementById('editId').value,
        userId:         document.getElementById('editUserId').value,
        categoryId:     document.getElementById('editCategoryId').value,
        walletId:       document.getElementById('editWalletId').value,
        date:           document.getElementById('editDate').value,
        description:    document.getElementById('editDescription').value,
        extraInfo:      document.getElementById('editExtraInfo').value,
        value:          document.getElementById('editValue').value
        // creditValue:    document.getElementById('editId'),
        // debitValue:     document.getElementById('editId'),
        // csvImportId:    document.getElementById('editId')
    }

    // date = new Date( transactionData.date )
    // date.setHours(3, 0, 0, 0)
    // date = parseDate( transactionData.date )
    transactionData.date = parseDate( transactionData.date )

    return transactionData
}

async function saveTransaction() {
    try {
        let data = getFormValues()
        let result = await axios.post( '/transactions', data )
        let response = result.data

        showNotification(`${ response }`)
    }
    catch (e) {
        console.log(e)
        showNotification( e.response.data )
    }
}

function parseDate(input) {
    var parts = input.match(/(\d+)/g);
    // new Date(year, month [, date [, hours[, minutes[, seconds[, ms]]]]])
    return new Date(parts[0], parts[1]-1, parts[2]); // months are 0-based
  }