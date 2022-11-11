// Getting page controls
var btnNewWallet = document.getElementById("btnNewWallet");
var ctaCreateNewWallet = document.getElementById("ctaCreateNewWallet"); // Only shown when there are no wallets to show

// Getting modal controls
var modalWallet = document.getElementById("modalAddWallet");
var titleCaption = document.getElementById("titleCaption");
var btnCloseModal = document.getElementById("btnCloseModal");
var btnSaveModal = document.getElementById("btnSave");
var btnDeleteWallet = document.getElementById('btnDeleteWallet')
var btnCancel = document.getElementById("btnCancel");
var walletsList = document.querySelectorAll('.list-item')

// Setting up the controls events
btnNewWallet.onclick = function() { openModal() };
btnCloseModal.onclick = function() { closeModal() };
btnSaveModal.onclick = () => { saveWallet() };
btnCancel.onclick = function() { closeModal() };
btnDeleteWallet.onclick = () => {
    let editingWalletId = document.getElementById("editId").value
    deleteWallet( editingWalletId )
}

walletsList.forEach( (item) => {
    let walletId = item.getAttribute('walletid')
    let walletName = document.getElementById( `name${walletId}` ).innerText
    let currencySymbol = document.getElementById( `currencySymbol${walletId}` ).innerText
    let initialBalance = document.getElementById( `intialBalance${walletId}` ).innerText

    item.onclick = () => { openModal( walletId, walletName, currencySymbol, initialBalance ) }
})

if ( ctaCreateNewWallet ) { ctaCreateNewWallet.onclick = () => { openModal() } };


// Here are the functions that will be triggered by the buttons
function openModal( editingWalletId = 0, walletName = '', currencySymbol = '', initialBalance = 0 ) {
    // When the user clicks the button, open the modal 
    titleCaption.innerHTML = Number(editingWalletId) <= 0 ? 'ADICIONAR CARTEIRA' : 'ALTERANDO CARTEIRA';
    btnDeleteWallet.style.visibility = Number(editingWalletId) <= 0 ? 'hidden' : 'visible'

    document.getElementById("editId").value = Number( editingWalletId );
    document.getElementById("editName").value = walletName;
    document.getElementById("editSymbol").value = currencySymbol;
    document.getElementById("editBalance").value = initialBalance;
    
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

async function saveWallet() {
    try {
        let editingWalletId = document.getElementById("editId").value
        
        let walletData = {
            name: document.getElementById("editName").value,
            currencySymbol: document.getElementById("editSymbol").value,
            initialBalance: document.getElementById("editBalance").value     
        }

        let axiosResponse = editingWalletId <= 0 ? await axios.post('/wallets', walletData) : axios.put(`/wallets/${editingWalletId}`, walletData)
        let notificationText = editingWalletId <= 0 ? `Carteira ${ walletData.name } criada com sucesso` : `Carteira ${ walletData.name } alterada com sucesso`
        
        showNotification( notificationText )
        setTimeout(refreshPage, 2000);
    }
    catch ( e ) {
        showNotification( `Erro >> ${ e }` );
    }
}

function refreshPage() {
    location.reload()
}

function deleteWallet( walletId ) {
    const walletName = document.getElementById(`name${walletId}`).innerText;

    const deletionConfirmed = confirm( `Deseja excluir a carteira "${walletName}"?` )
    
    if ( deletionConfirmed ) {
        axios.delete( `/wallets/${walletId}` )
        .then( result => {
            showNotification( `Carteira exluída com sucesso!` );
            setTimeout(refreshPage, 2000);
        })
        .catch( error => {
            showNotification( `Erro: ${error.response.data}` );
        })
    }
}