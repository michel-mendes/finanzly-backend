var walletsListModalWrapper = document.getElementById("walletsListModalWrapper")
var walletListContainer = document.getElementById("walletListContainer")
var ctaSelectWallet = document.getElementById("ctaSelectWallet")
var modalCheckTimerID

if ( ctaSelectWallet ) {
    ctaSelectWallet.onclick = () => { openWalletsListModal() }
}

function openWalletsListModal() {
    let appContent = document.getElementById("app-content")

    getWalletsList()
    appContent.classList.toggle('blur-element')
    walletsListModalWrapper.style.display = 'flex'
    walletsListModalWrapper.style.opacity = '1'

    // Constantly check the wallet selection modal result
    modalCheckTimerID = setInterval( checkModalResult, 100 )
}

function closeWalletListModal() {
    let appContent = document.getElementById("app-content")

    appContent.classList.toggle('blur-element')
    walletsListModalWrapper.style.display = 'none'
    walletsListModalWrapper.style.opacity = '0'
    // alert(selectedWallet)
}

function checkModalResult() {
    // cancel the verification if the modal is still opened
    if ( walletsListModalWrapper.style.display == 'flex' ) return

    // if the modal is closed, kill the timer
    if ( walletsListModalWrapper.style.display == 'none' ) {
        clearInterval( modalCheckTimerID )
    }

    walletId = selectedWallet

    closeWalletListModal()
}

async function doWalletSelect() {
    if ( walletId > -1 ) {

        try {
            let response = await axios.get(`/wallets/${ walletId }`)
            let htmlContent = ''

            htmlContent += `<div class="wallet-container">`
            htmlContent += `<img class="wallet-icon" src="/images/wallet.png" alt="Ícone da carteira">`
            htmlContent += `<div class="wallet-info">`
            htmlContent += `<span id="toolbarWalletName">${ response.data.name }<i class="material-icons change-wallet-icon">arrow_drop_down</i></span>`
            htmlContent += `<span id="toolbarWalletBalance">`
            htmlContent += `<strong>${ response.data.actualBalance }</strong>`
            htmlContent += `</span>`
            htmlContent += `</div>`
            htmlContent += `</div>`
        }
        catch (e) {
            alert(`e`)
        }

    }
}