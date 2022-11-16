let modalCategory = document.getElementById("modalAddCategory");
var modalTitle = document.getElementById("titleText");

var bntNewCategory = document.getElementById("bntNewCategory");
var btnCloseModal = document.getElementById("buttonCloseModal");
var btnCancel = document.getElementById("btnCancel");
var btnSave = document.getElementById("btnSave");
var btnDelete = document.getElementById("btnDeleteCategory")
var editId = document.getElementById("editId")
var editUserId = document.getElementById("editUserId")
var editName = document.getElementById("editName");
var radioButtonCredito = document.getElementById("radioCred");
var radioButtonDebito = document.getElementById("radioDeb");

var successfullyInsertedOrEdited = false;

bntNewCategory.onclick = function() { openModal() };
btnCloseModal.onclick = function() { closeModal() };
btnDelete.onclick = () => { deleteCategory() }
btnCancel.onclick = function() { closeModal() };
btnSave.onclick = function() { saveCategory() };


function closeModal() {
    modalCategory.style.display = "none";

    // Update the page if the editing or insertion of the category succeeds
    if ( successfullyInsertedOrEdited ) {
        location.reload();
    }
}

function openModal( editingCategoryId = 0, userId = 0, categoryName = '', categoryTrasactionType = '' ) {
    // When the user clicks the button, open the modal 
    successfullyInsertedOrEdited = false;
    modalTitle.innerHTML = editingCategoryId <= 0 ? 'ADICIONAR CARTEIRA' : 'ALTERANDO CARTEIRA';
    btnDelete.style.visibility = editingCategoryId <= 0 ? 'hidden' : 'visible';
    
    editId.value = editingCategoryId
    editUserId.value = userId
    editName.value = categoryName

    if ( categoryTrasactionType == 'C' ) {
        radioButtonCredito.checked = true
    }
    else if ( categoryTrasactionType == 'D' ) {
        radioButtonDebito.checked = true
    }
    else {
        radioButtonCredito.checked = false
        radioButtonDebito.checked = false
    }
    
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
    try {
        let axiosResult
        let notificationText
        let categoryData = {
            userId: editUserId.value,
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
        
        axiosResult = Number( editId.value ) <= 0 ? await axios.post('/categories', categoryData) : await axios.put('/categories/' + editId.value, categoryData)
        notificationText = Number( editId.value ) <= 0 ? `Categoria ${categoryData.name} foi criada com sucesso` : `Categoria ${categoryData.name} foi alterada com sucesso`
        
        showNotification( notificationText )

        successfullyInsertedOrEdited = true
    }
    catch( e ) {
        // console.log(e)
        showNotification( `Erro >> ${ e }` );
    }
}
async function deleteCategory() {
    let deletionConfirmed = confirm( `Você tem certeza de que deseja excluir a categoria abaixo?\n\n[${editId.value}] - ${editName.value}` );

    if ( deletionConfirmed ) {
        let axiosResult = await axios.delete('/categories/' + editId.value)
        
        if (axiosResult.data.error) {
            return showNotification( response.data.message );
        }

        showNotification( "Categoria excluída com sucesso!" );
        location.reload()
    }
}