// Get the modal
var modalTransaction = document.getElementById("modalTransaction");

// Get the constrols
var modalTitle          = document.getElementById('modalTitle')
var cbNewTransaction    = document.getElementById('cbNewTransaction')  //Verifies if is a new transaction or an existing one
var editWalletId        = document.getElementById('editWalletId')
var categoryComboBox    = document.getElementById('inputCategoryAutoComplete')
var editDate            = document.getElementById('editDate')
var btnAddTransaction   = document.getElementById("menuBtnAddTransaction")
var btnCloseModal       = document.getElementsByClassName("btnCloseModal")[0]
var btnSave             = document.getElementById('btnSave')
var btnCancel           = document.getElementById('btnCancel')

// Assign buttons events
btnSave.onclick             = function() { saveTransaction() }
btnCancel.onclick           = function() { closeNewTransactionModal() }

btnCloseModal.onclick       = function() {
    // When the user clicks on <span> (x), close the modal
    closeNewTransactionModal()
}

window.onclick              = function(event) {
    // When the user clicks anywhere outside of the modal, close it
    if (event.target == modalTransaction) {
      closeNewTransactionModal()
    }
}

// Triggers "onkeydown" event only if the keys CTRL + ENTER are pressed
// tags: ctrl+enter, ctrl + enter , control + enter , control+enter
// --------------------------------------------------------------------------
window.onkeydown            = async ( key ) => {

    let keyCode = key.keyCode

    if ( ( key.ctrlKey ) && ( keyCode == 13 ) && ( modalTransaction.style.visibility == "visible" ) ) {
        await saveTransaction()
    }

}
// --------------------------------------------------------------------------

window.onkeyup = function( key ) {
    let keyCode = key.keyCode

    if ( (keyCode === 27) && ( modalTransaction.style.visibility == "visible" ) ) { //Pressed esc key
        closeNewTransactionModal();
    }

    if ( (keyCode === 45) && ( modalTransaction.style.visibility == "hidden" || modalTransaction.style.opacity == 0 ) ) { //Pressed ins key
        openNewTransactionModal()
    }
}

function openNewTransactionModal( transactionData ) {
    
    modalTransaction.style.visibility = "visible"
    modalTransaction.style.opacity = 1

    if ( !transactionData ) {
        //New transaction
        modalTitle.innerHTML = 'Adicionar transação'
        cbNewTransaction.checked = true

        editWalletId.value = walletId
        categoryComboBox.value = ''
        editDate.value = getFullDate()

        categoryComboBox.focus()
    }
    else {
        // Editing existing transaction
        modalTitle.innerHTML = 'Alteração de transação'
        cbNewTransaction.checked = false

        document.getElementById('editId').value = transactionData.id
        document.getElementById('editWalletId').value = transactionData.walletId
        document.getElementById('inputCategoryAutoComplete').value = transactionData.fromCategory.name
        document.getElementById('editDate').value = new Date(transactionData.date).toISOString().substring(0, 10);
        document.getElementById('editDescription').value = transactionData.description
        document.getElementById('editExtraInfo').value = transactionData.extraInfo
        document.getElementById('editValue').value = transactionData.value

        categoryComboBox.focus()
    }

}

function closeNewTransactionModal() {
    setTimeout(() => { modalTransaction.style.visibility = "hidden" }, 100)
    modalTransaction.style.opacity = 0
    
    // modalTransaction.style.display = "none";

    document.getElementById('editCategoryId').value = ''
    document.getElementById('editWalletId').value = ''
    document.getElementById('editDate').value = ''
    document.getElementById('editDescription').value = ''
    document.getElementById('editExtraInfo').value = ''
    document.getElementById('editValue').value = ''
}


// Create an object with the field values ​​to pass through the API
function getFormValues() {
    
    let categories = document.getElementsByTagName('option')
    
    let transactionData = {
        id:             document.getElementById('editId').value,
        userId:         document.getElementById('editUserId').value,

        categoryId:     (  () => {
            let value = -1

            for (let i = 0; i < categories.length; i++) {
                
                if ( categories.item(i).innerHTML == categoryComboBox.value ) {
                    value = categories.item(i).getAttribute('categoryId')
                    break
                }
            };

            return value
        })(),

        walletId:       document.getElementById('editWalletId').value,
        date:           document.getElementById('editDate').value,
        description:    document.getElementById('editDescription').value,
        extraInfo:      document.getElementById('editExtraInfo').value,
        value:          document.getElementById('editValue').value

    }

    transactionData.date = parseDate( transactionData.date )

    return transactionData
}

async function saveTransaction() {
    try {
        let data = getFormValues()
        
        if ( data.categoryId == -1 ) {
            showNotification(`Categoria "${ categoryComboBox.value }" não encontrada!`)
            categoryComboBox.value = ''
            categoryComboBox.focus()
            return
        }

        let result = cbNewTransaction.checked ? await axios.post( '/transactions', data ) : await axios.put( `/transactions/${ data.id }`, data )
        let response = result.data

        showNotification(`${ response }`)
        closeNewTransactionModal()
        doWalletSelect() /* declared in 'transactions-listing.js' */
    }
    catch (e) {
        showNotification( e.response.data )
    }
}

function parseDate(input) {
    var parts = input.match(/(\d+)/g);
    // new Date(year, month [, date [, hours[, minutes[, seconds[, ms]]]]])
    return new Date(parts[0], parts[1]-1, parts[2]); // months are 0-based
  }
