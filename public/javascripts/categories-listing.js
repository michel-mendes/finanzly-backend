import { apiRequest } from '/javascripts/extra-functions.js';

// Get the user ID in the document
var myUserId = document.getElementById("myUserId").innerText;
document.getElementById("myUserId").remove();

let allEditButtons = document.getElementsByName("btnEditCategory");
let allDeleteButtons = document.getElementsByName("btnDeleteCategory");

let editorBox = document.getElementById("categoryEditorBox");
let editorEditName = document.getElementById("editorEditName");
let editorRadioCred = document.getElementById("editorRadioCred");
let editorRadioDeb = document.getElementById("editorRadioDeb");
let btnCloseEditor = document.getElementById("buttonCloseEditor");
let btnEditorSave = document.getElementById("btnEditorSave");
let btnEditorCancel = document.getElementById("btnEditorCancel");

let successfullyEditedCategory = false;

allEditButtons.forEach(editButton => { editButton.onclick = () => { editCategory( editButton ) } });
allDeleteButtons.forEach(deleteButton => { deleteButton.onclick = () => { deleteCategory( deleteButton ) } });
btnEditorCancel.onclick = () => { closeCategoryEditorBox() };
btnEditorSave.onclick = () => { saveCategoryChanges() };
btnCloseEditor.onclick = () => { closeCategoryEditorBox() };

function editCategory( buttonElement ) {
    successfullyEditedCategory = false;
    let categoryType  = buttonElement.parentElement.getAttribute( "categoryType" );
    
    editorEditName.value = buttonElement.parentElement.previousElementSibling.innerHTML;
    ( categoryType == "C" ) ? editorRadioCred.checked = true : editorRadioDeb.checked = true;

    editorBox.style.display = "block";
}

function deleteCategory( buttonElement ) {
    alert(buttonElement.parentElement.previousElementSibling.innerHTML);
}

function closeCategoryEditorBox() {
    editorBox.style.display = "none"; 
}

function saveCategoryChanges() {
    if (editorEditName.value == '') {
        return showNotification( "Informe o nome da categoria!" );
    }

    if ( !editorRadioCred.checked && !editorRadioDeb.checked ) {
        return showNotification( "Selecione o tipo de transação (Ganhos ou Gastos)" );
    }
    
    let bodyData = {
        userId: myUserId,
        name: editorEditName.value,
        transactionType: (function() {
                            let result = ( editorRadioCred.checked ) ? 'C' : 'D';
                            return result;
                          })() // IIFE
    }

    apiRequest('/categories/' + myUserId, 'PUT', bodyData)
    .then( response => {
        if (response.error) {
            return showNotification( JSON.stringify(response.message) );
        }
        
        showNotification( "Categoria atualizada com sucesso!" );

        successfullyEditedCategory = true;
    })
    .catch( errorResponse => {
        showNotification( `Erro: ${ errorResponse }` );
    })
    .finally( () => {
        // closeModal();
    })
}