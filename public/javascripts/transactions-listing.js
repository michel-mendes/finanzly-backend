var rightSideToolbar = document.getElementById("rightSide")
var walletListContainer = document.getElementById("walletListContainer")
var commandsContainer
var ctaSelectWallet = document.getElementById("ctaSelectWallet")

var btnAddTransaction
var btnImportTransactions
var btnSearchTransaction

// window.onload = () => { getTransactions() }

if ( ctaSelectWallet ) {
    ctaSelectWallet.onclick = () => { openWalletsListModal() }
}

function turnCommandsPanelIntoVisible() {

    let htmlContent = ''

    /*if ( !commandsContainer )*/ {
        htmlContent += `<div class="commands-container" id="commandsContainer">`
        // htmlContent += `<span class="material-icons">calendar_month</span>`
        htmlContent += `<span class="material-icons search-icon" id="btnSearchTransaction">search</span>`
        
        htmlContent += `<button class="btn btn-cl-yellow" id="menuBtnImportTransactions" onclick="location.href='/app/transactions/import?walletId=${ walletId }'">`
        htmlContent += `<span class="btn-caption">IMPORTAR</span>`
        htmlContent += `<span class="btn-icon material-icons">file_download</span>`
        htmlContent += `</button>`

        htmlContent += `<button class="btn btn-cl-green" id="menuBtnAddTransaction">`
        htmlContent += `<span class="btn-caption">ADICIONAR TRANSAÇÃO</span>`
        htmlContent += `<span class="btn-icon material-icons">add</span>`
        htmlContent += `</button>`
        htmlContent += `</div>`

        rightSideToolbar.innerHTML = htmlContent
        commandsContainer = document.getElementById("commandsContainer")

        btnAddTransaction = document.getElementById( 'menuBtnAddTransaction' )
        btnAddTransaction.onclick = () => { openNewTransactionModal() }

        btnImportTransactions = document.getElementById( 'menuBtnImportTransactions' )
        
        btnSearchTransaction = document.getElementById( 'btnSearchTransaction' )
        btnSearchTransaction.onclick = () => { openSearchTransactionDialog() }

    }
}

function openSearchTransactionDialog() {
    // "dialogSearchTransaction" is declared in "/javascripts/search-transaction-dialog.js"
    dialogSearchTransaction.showModal()
}

async function doWalletSelect() {
    if ( walletId > -1 ) {

        try {
            let response = await axios.get(`/wallets/${ walletId }`)

            if ( !response.data ) return

            let walletContainer = document.getElementById('selectedWalletContainer')
            let balanceClassName = Number( response.data.actualBalance ) < 0 ? 'class="negative-value"' : 'class="positive-value"'
            let htmlContent = ''

            htmlContent += `<div class="wallet-container">`
            htmlContent += `<img class="wallet-icon" src="/images/wallet.png" alt="Ícone da carteira">`
            htmlContent += `<div class="wallet-info">`
            htmlContent += `<span id="toolbarWalletName" onclick="openWalletsListModal()">${ response.data.name }<i class="material-icons change-wallet-icon">arrow_drop_down</i></span>`
            htmlContent += `<span id="toolbarWalletBalance">`
            htmlContent += `<strong ${ balanceClassName }>${ response.data.currencySymbol } ${ Number(response.data.actualBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }</strong>`
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
            // console.log(e)
            showNotification(`Erro >> ${ e }`)
        }

    }
}

async function getTransactions(startDate, endDate, searchText) {
    
    try {
        let container = document.getElementById('transactionsContainer')
        let result = await axios.get( `/transactions?userid=${ userId }&walletid=${ walletId }${ startDate }${ endDate }${ searchText }&groupdate=true` )
        let transactions = result.data

        container.innerHTML = buildTransactionsList( transactions )
    }
    catch ( e ) {
        showNotification( e )
    }

}

async function deleteTransaction( id ) {

    let deletionConfirmed = confirm( `Deseja realmente excluir esta transação?` )
    
    if ( deletionConfirmed ) {
        try {
            let result = await axios.delete( `/transactions/${ id }` )

            showNotification( result.data )
            closeNewTransactionModal()
            await doWalletSelect()
        }
        catch( e ) {
            showNotification( e )
        }
    }

}

function buildTransactionsList( transactionsList ) {

    try {    
        let htmlContent = ''
        let monthGroups = Object.keys( transactionsList )
        
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

        monthGroups.forEach( month => {
            
            let dateGroups = Object.keys( transactionsList[ month ] )
            let monthName = month.split('-')[0] + ' de ' + month.split('-')[1] 

            htmlContent += `<div class="month-separator">`
            htmlContent += `<h2 style="text-align: center; margin: 2px; padding: 2px;">`
            htmlContent += monthName
            htmlContent += `</h2>`
            htmlContent += `</div>`
            
            dateGroups.forEach( dateGroup => {

                let dayNumber = new Date(transactionsList[ month ][ dateGroup ][0]['date']).getDate()
                let monthNumber = new Date(transactionsList[ month ][ dateGroup ][0]['date']).getMonth()
                let year = new Date(transactionsList[ month ][ dateGroup ][0]['date']).getFullYear()

                let accumulatedDataFromDay = (() => {

                    let accumulatedValue = 0

                    transactionsList[ month ][ dateGroup ].forEach( transaction => {
                        accumulatedValue = transaction.debitValue > 0 ? accumulatedValue - transaction.value : accumulatedValue + transaction.value
                    })

                    return {
                        value: accumulatedValue,
                        className: accumulatedValue < 0 ? 'negative-transaction-value' : 'positive-transaction-value',
                        currencySymbol: transactionsList[ month ][ dateGroup ][0].fromWallet.currencySymbol
                    }

                })()

                htmlContent += `<ul class="transactions-day-group">`
                htmlContent += `<div class="group-header">`
                htmlContent += `<div class="day-number-box">`
                htmlContent += `<span id="groupDayNumber">${ dayNumber }</span>`
                htmlContent += `</div>`

                htmlContent += `<div class="month-year-box">`
                htmlContent += `<span id="groupMonthYear">`
                htmlContent += `<span class="day-name">${ dayNames[ new Date(transactionsList[ month ][ dateGroup ][0]['date']).getDay() ] }</span><br>`
                htmlContent += `<span>${ brMonthNames[ monthNumber ] } de ${ year }</span>`
                htmlContent += `</span>`
                htmlContent += `</div>`

                htmlContent += `<div class="group-total-value">`
                htmlContent += `<span class="total-title">Total do dia</span>`
                htmlContent += `<span class="${ accumulatedDataFromDay.className }" id="transactionsTotalValue">${(() => {return accumulatedDataFromDay.value > 0 ? '+' : ''})()} ${ accumulatedDataFromDay.currencySymbol } ${ Number(accumulatedDataFromDay.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }</span>`
                htmlContent += `</div>`
                htmlContent += `</div>`

                htmlContent += `<div class="group-body">`
                htmlContent += `<div class="group-items-container">`

                transactionsList[ month ][ dateGroup ].forEach( transaction => {

                    let valueClassName = transaction.debitValue > 0 ? 'negative-transaction-value' : 'positive-transaction-value'

                    htmlContent += `<li class="transaction-item" onclick="openNewTransactionModal( '${strToHex( JSON.stringify(transaction) )}' )">`
                    htmlContent += `<div class="item-category-icon-container">`
                    htmlContent += `<img src="https://picsum.photos/40" alt="Ícone da categoria">`
                    htmlContent += `</div>`
                    htmlContent += `<div class="item-body-container">`
                    htmlContent += `<span id="transactionCategoryName">${ transaction.fromCategory.name }</span>`
                    htmlContent += `<span id="transactionDescription">${ transaction.description }</span>`
                    htmlContent += `<span id="transactionExtraInfo">${ transaction.extraInfo }</span>`
                    htmlContent += `</div>`
                    htmlContent += `<div class="item-value-container">`
                    htmlContent += `<span class="${ valueClassName }" id="transactionValue">${ transaction.fromWallet.currencySymbol } ${ Number(transaction.value).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) }</span>`
                    htmlContent += `</div>`
                    // htmlContent += `<div class="item-toolbox">`
                    // htmlContent += `<span name="editTransactionButton" class="material-icons tool-button" transactiondata='${ strToHex( JSON.stringify(transaction) ) }' onclick="openNewTransactionModal( JSON.parse( hexToStr( this.getAttribute('transactiondata') ) ) )">edit</span><span name="deleteTransactionButton" class="material-icons tool-button" onclick="(async () => {await deleteTransaction(${ transaction.id })})()">delete</span>`
                    // htmlContent += `</div>`
                    htmlContent += `</li>`

                })

                htmlContent += `</div>`
                htmlContent += `</div>`
                htmlContent += `</ul>`

            } )
            
        })

        return htmlContent
    }
    catch( e ) {
        throw `Erro >> ${ e }`
    }

}

( async () => {
    await doWalletSelect()
})()