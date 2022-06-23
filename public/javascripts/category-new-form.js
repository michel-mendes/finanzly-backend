import { apiRequest } from '/javascripts/extra-functions.js';

let modalCategory = document.getElementById("modalAddCategory");
var modalTitle = document.getElementById("modalTitle");

var bntNewCategory = document.getElementById("bntNewCategory");
var btnCloseModal = document.getElementById("buttonCloseModal");
var btnCancel = document.getElementById("btnCancel");
var btnSave = document.getElementById("btnSave");
var editName = document.getElementById("editName");
var radioButtonCredito = document.getElementById("radioCred");
var radioButtonDebito = document.getElementById("radioDeb");

bntNewCategory.onclick = function() { openModal() };
btnCloseModal.onclick = function() { closeModal() };
btnCancel.onclick = function() { closeModal() };
btnSave.onclick = function() { saveCategory() };


function closeModal() {
    modalCategory.style.display = "none";
}

function openModal() {
    // When the user clicks the button, open the modal 
    modalTitle.innerHTML = 'Adicionar categoria';
    editName.value = '';
    radioButtonCredito.checked = false;
    radioButtonDebito.checked = false;
    
    modalCategory.style.display = "block";
}

async function saveCategory() {
    let categoryData = {
        name: editName.value,
        transactionType:    (function() {
                                let result = ( radioButtonCredito.checked ) ? 'C' : 'D';
                                return result;
                            })() // IIFE
    }
    
    if ( !radioButtonCredito.checked && !radioButtonDebito.checked ) {
        return alert('Selecione o tipo de transação (débito ou crédito)');
    }

    // alert(JSON.stringify(categoryData, ' ', 4));
    
    apiRequest('/categories', 'POST', categoryData)
    .then( response => {
        alert('Oppaa, tudo certo -> \n\n' + JSON.stringify( response, ' ', 4 ));
    })
    .catch( errorResponse => {
        alert('Erro -> \n\n' + errorResponse);
    })
    .finally( () => {
        location.reload();
    })
}