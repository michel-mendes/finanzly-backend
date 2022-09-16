var rightSideToolbar = document.getElementById("rightSide")
var walletsListModalWrapper = document.getElementById("walletsListModalWrapper")
var walletListContainer = document.getElementById("walletListContainer")
var commandsContainer = document.getElementById("commandsContainer")
var ctaSelectWallet = document.getElementById("ctaSelectWallet")
var modalCheckTimerID

// window.onload = () => { getTransactions() }

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

function turnCommandsPanelIntoVisible() {

    let htmlContent = ''

    if ( !commandsContainer ) {
        htmlContent += `<div class="commands-container" id="commandsContainer">`
        htmlContent += `<span class="material-icons">calendar_month</span>`
        htmlContent += `<span class="material-icons search-icon">search</span>`
        htmlContent += `<button class="btn btn-cl-green">`
        htmlContent += `<span class="btn-caption">ADICIONAR TRANSAÇÃO</span>`
        htmlContent += `<span class="btn-icon material-icons">add</span>`
        htmlContent += `</button>`
        htmlContent += `</div>`

        rightSideToolbar.innerHTML = htmlContent
        commandsContainer = document.getElementById("commandsContainer")
    }
}

function closeWalletListModal() {
    let appContent = document.getElementById("app-content")

    appContent.classList.toggle('blur-element')
    walletsListModalWrapper.style.display = 'none'
    walletsListModalWrapper.style.opacity = '0'

    doWalletSelect()
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
            let walletContainer = document.getElementById('selectedWalletContainer')
            let htmlContent = ''

            htmlContent += `<div class="wallet-container">`
            htmlContent += `<img class="wallet-icon" src="/images/wallet.png" alt="Ícone da carteira">`
            htmlContent += `<div class="wallet-info">`
            htmlContent += `<span id="toolbarWalletName" onclick="openWalletsListModal()">${ response.data.name }<i class="material-icons change-wallet-icon">arrow_drop_down</i></span>`
            htmlContent += `<span id="toolbarWalletBalance">`
            htmlContent += `<strong>${ response.data.currencySymbol } ${ Number(response.data.actualBalance).toFixed(2) }</strong>`
            htmlContent += `</span>`
            htmlContent += `</div>`
            htmlContent += `</div>`

            walletContainer.innerHTML = htmlContent

            // Show all this wallet transactions
            getTransactions()
            turnCommandsPanelIntoVisible()

            let setupResponse = await axios.post('transactions/setSelectedWallet', { selectedWalletId: walletId })
            // alert( setupResponse.data )
        }
        catch (e) {
            alert(`${e}`)
        }

    }
}

async function getTransactions() {
    
    try {
        let container = document.getElementById('transactionsContainer')
        let result = await axios.get( `/transactions?userid=${ userId }&walletid=${ walletId }&groupdate=true` )
        let transactions = result.data

        container.innerHTML = buildTransactionsList( transactions )
    }
    catch ( e ) {
        showNotification( e )
    }

}

function buildTransactionsList( transactionsList ) {

    let htmlContent = ''
    let dateGroups = Object.keys( transactionsList )
    
    const dayNames = [
        'domingo',
        'segunda-feira',
        'terça-feira',
        'quarta-feira',
        'quinta-feira',
        'sexta-feira',
        'sábado']

    const brMonthNames = [
        "janeiro",
        "fevereiro",
        "março",
        "abril",
        "maio",
        "junho",
        "julho",
        "agosto",
        "setembro",
        "outubro",
        "novembro",
        "dezembro"
    ]

    dateGroups.forEach( group => {
        let dayNumber = new Date(transactionsList[ group ][0]['date']).getDate()
        let monthNumber = new Date(transactionsList[ group ][0]['date']).getMonth()
        let year = new Date(transactionsList[ group ][0]['date']).getFullYear()

        let accumulatedDataFromDay = (() => {

            let accumulatedValue = 0

            transactionsList[ group ].forEach( transaction => {
                accumulatedValue = transaction.debitValue > 0 ? accumulatedValue - transaction.value : accumulatedValue + transaction.value
            })

            return {
                value: accumulatedValue,
                className: accumulatedValue < 0 ? 'negative-transaction-value' : 'positive-transaction-value',
                currencySymbol: transactionsList[ group ][0].fromWallet.currencySymbol
            }

        })()

        htmlContent += `<ul class="transactions-day-group">`
        htmlContent += `<div class="group-header">`
        htmlContent += `<div class="day-number-box">`
        htmlContent += `<span id="groupDayNumber">${ dayNumber }</span>`
        htmlContent += `</div>`

        htmlContent += `<div class="month-year-box">`
        htmlContent += `<span id="groupMonthYear">`
        htmlContent += `<span>${ dayNames[ new Date(transactionsList[ group ][0]['date']).getDay() ] }</span><br>`
        htmlContent += `<span>${ brMonthNames[ monthNumber ] } de ${ year }</span>`
        htmlContent += `</span>`
        htmlContent += `</div>`

        htmlContent += `<div class="group-total-value">`
        htmlContent += `<span class="total-title">Total do dia</span>`
        htmlContent += `<span class="${ accumulatedDataFromDay.className }" id="transactionsTotalValue">${(() => {return accumulatedDataFromDay.value > 0 ? '+' : ''})()}${ Number(accumulatedDataFromDay.value).toFixed(2) } ${ accumulatedDataFromDay.currencySymbol }</span>`
        htmlContent += `</div>`
        htmlContent += `</div>`

        htmlContent += `<div class="group-body">`
        htmlContent += `<div class="group-items-container">`

        transactionsList[ group ].forEach( transaction => {

            let valueClassName = transaction.debitValue > 0 ? 'negative-transaction-value' : 'positive-transaction-value'

            htmlContent += `<li class="transaction-item" transactionId="${ transaction.id }">`
            htmlContent += `<div class="item-category-icon-container">`
            htmlContent += `<img src="https://picsum.photos/40" alt="Ícone da categoria">`
            htmlContent += `</div>`
            htmlContent += `<div class="item-body-container">`
            htmlContent += `<span id="transactionCategoryName">${ transaction.fromCategory.name }</span>`
            htmlContent += `<span id="transactionDescription">${ transaction.description }</span>`
            htmlContent += `<span id="transactionExtraInfo">${ transaction.extraInfo }</span>`
            htmlContent += `</div>`
            htmlContent += `<div class="item-value-container">`
            htmlContent += `<span class="${ valueClassName }" id="transactionValue">${ Number(transaction.value).toFixed(2) } ${ transaction.fromWallet.currencySymbol }</span>`
            htmlContent += `</div>`
            htmlContent += `</li>`

        })
        
        htmlContent += `</div>`
        htmlContent += `</div>`
        htmlContent += `</ul>`
    })

    return htmlContent

}

doWalletSelect()