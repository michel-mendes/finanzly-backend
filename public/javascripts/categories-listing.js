// Get the user ID in the document
var myUserId = document.getElementById("myUserId").innerText;
document.getElementById("myUserId").remove();

let allEditButtons = document.getElementsByName("btnEditCategory");
let allDeleteButtons = document.getElementsByName("btnDeleteCategory");

let editorBox = document.getElementById("categoryEditorBox");
let editorEditId= document.getElementById("editorEditId");
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

    editorEditId.value = buttonElement.parentElement.getAttribute( "categoryId" );
    editorBox.style.display = "block";
}

function deleteCategory( buttonElement ) {
    let categoryId = buttonElement.parentElement.getAttribute( "categoryId" );
    let CategoryName = buttonElement.parentElement.previousElementSibling.innerText;

    let deletionConfirmed = confirm( `Você tem certeza de que deseja excluir a categoria abaixo?\n\n[${categoryId}] - ${CategoryName}` );
    let deletionOnServerConfirmed = false;

    if ( deletionConfirmed ) {
        axios.delete('/categories/' + categoryId)
        .then( response => {

            if (response.data.error) {
                return showNotification( response.data.message );
            }

            showNotification( "Categoria excluída com sucesso!" );
            deletionOnServerConfirmed = true;
        })
        .catch( errorResponse => {
            showNotification( `Erro: ${ errorResponse }` );
        })
        .finally( () => {
            if ( deletionOnServerConfirmed ) {
                setTimeout( categoriesPageRefresh, 1000 );
            }
        })
    }
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
        id: editorEditId.value,
        userId: myUserId,
        name: editorEditName.value,
        transactionType: (function() {
                            let result = ( editorRadioCred.checked ) ? 'C' : 'D';
                            return result;
                          })() // IIFE
    }

    axios.put('/categories/' + editorEditId.value, bodyData)
    .then( response => {
        
        if (response.data.error) {
            return showNotification( response.data.message );
        }
        
        showNotification( "Categoria atualizada com sucesso!" );

        successfullyEditedCategory = true;
    })
    .catch( errorResponse => {
        showNotification( `Erro: ${ errorResponse }` );
    })
    .finally( () => {
        if ( successfullyEditedCategory ) {
            setTimeout( categoriesPageRefresh, 2000);
        }
    })
}

function categoriesPageRefresh() {
    location.reload();
}