let modalCategory = document.getElementById("modalAddCategory");
var modalTitle = document.getElementById("modalTitle");

var bntNewCategory = document.getElementById("bntNewCategory");
var btnCloseModal = document.getElementById("buttonCloseModal");
var btnCancel = document.getElementById("btnCancel");
var btnSave = document.getElementById("btnSave");
var editName = document.getElementById("editName");
var radioButtonCredito = document.getElementById("radioCred");
var radioButtonDebito = document.getElementById("radioDeb");

var successfullyInsertedOrEdited = false;

bntNewCategory.onclick = function() { openModal() };
btnCloseModal.onclick = function() { closeModal() };
btnCancel.onclick = function() { closeModal() };
btnSave.onclick = function() { saveCategory() };


function closeModal() {
    modalCategory.style.display = "none";

    // Update the page if the editing or insertion of the category succeeds
    if ( successfullyInsertedOrEdited ) {
        location.reload();
    }
}

function openModal() {
    // When the user clicks the button, open the modal 
    successfullyInsertedOrEdited = false;
    modalTitle.innerHTML = 'Adicionar categoria';
    editName.value = '';
    radioButtonCredito.checked = false;
    radioButtonDebito.checked = false;
    
    modalCategory.style.display = "block";
}

window.onkeyup = function( key ) {
    let keyCode = key.keyCode;

    if ( (keyCode === 27) && ( modalCategory.style.display == "block" ) ) { //Pressed esc key when modal is open
        closeModal();
    }
}

window.onclick = function(event) {
    // When the user clicks anywhere outside of the modal, close it
    if (event.target == modalCategory) {
      closeModal();
    }
}

async function saveCategory() {
    let categoryData = {
        name: editName.value,
        transactionType:    (function() {
                                let result = ( radioButtonCredito.checked ) ? 'C' : 'D';
                                return result;
                            })() // IIFE
    }
    
    if ( editName.value == "" ) {
        return showNotification( "Informe o nome da categoria!" );
    }
    
    if ( !radioButtonCredito.checked && !radioButtonDebito.checked ) {
        // return alert('Selecione o tipo de transação (débito ou crédito)');
        return showNotification( "Selecione o tipo de transação (Ganhos ou Gastos)" );
    }

    // alert(JSON.stringify(categoryData, ' ', 4));
    
    axios.post('/categories', categoryData)
    .then( response => {
        showNotification( "Categoria cadastrada com sucesso!" );

        successfullyInsertedOrEdited = true;
    })
    .catch( errorResponse => {
        showNotification( `Erro: ${ errorResponse }` );
    })
    .finally( () => {
        // closeModal();
    })
}