var userId = document.getElementById('inputUserId').value
var walletId = document.getElementById('inputWalletId').value

var btnSelectFile = document.getElementById("menuBtnSelectFile")
var importsContainer = document.getElementById("importsContainer")
var inputFile = document.getElementById("inputSelectFile")

var inputCollection     = document.getElementsByTagName('input')

btnSelectFile.onclick = () => { 
    
    let selectBox = document.getElementById('selectBanksList')

    if ( selectBox.value == 'n/a' ) {
        alert( 'Selecione uma instituição financeira antes de fazer a importação!' )
        selectBox.focus()
        return
    }
    
    inputFile.click()
}
inputFile.onchange = () => { sendCsvFile() }

for ( let i = 0; i < inputCollection.length; i++ ) {

    if ( ( inputCollection.item(i).getAttribute('type') == 'number' ) || ( inputCollection.item(i).getAttribute('type') == 'date' ) ) continue
    
    inputCollection.item(i).onkeyup = () => { inputCollection.item(i).value = inputCollection.item(i).value.toUpperCase(); alert('teste') }

}

async function sendCsvFile() {
    
    let selectedBank = document.getElementById('selectBanksList').value
    
    if ( !inputFile.files[0] ) {
        return
    }
    else {
        
        let response
        let formData = new FormData()
        let extension = new String( inputFile.value ).toUpperCase()

        if ( !extension.includes( '.CSV' ) ) {
            alert( 'Este não é um arquivo CSV válido!' )
            return
        }

        formData.append( 'csvFile', inputFile.files[0] )
        response = await axios.post( `/app/transactions/import?bank=${ selectedBank }`, formData )
        importsContainer.innerHTML = await buildImportTable( response.data )
        inputFile.value = ''

    }

}

async function saveTransaction() {

    let transactionsList = document.getElementsByName('transactionData')
    let validationPassed = await validateImportData( transactionsList )
    let totalImports = 0
    let btnImport = document.getElementById('btnImportAll')
    let confirmImport

    if ( validationPassed ) {

        confirmImport = confirm('Deseja iniciar a importação de todas as transações?')

        if ( confirmImport ) {
            btnImport.disabled = true

            for ( let i = 0; i < transactionsList.length; i++ ) {

                let transactionData = JSON.parse( transactionsList.item(i).getAttribute('transactiondata') )

                if ( transactionData.alreadyExists ) continue
                
                try {

                    let postResult = await axios.post( '/transactions', transactionData )
                    // console.log(transaction)
                    let transactionDataRow = document.getElementById( transactionsList.item(i).getAttribute('mydatarow') ).style.display = 'none'
                    totalImports++

                }
                catch (error) {
                    alert( `Erro ao importar transação: "${error}"` )
                    btnImport.disabled = false
                }

            }

            showNotification( `Foram importadas ${ totalImports } transações com sucesso!` )
        }

    }

}

async function validateImportData( transactionsList ) {

    let transactionData = {}
    let categories = document.getElementsByTagName('option')
    let editDescription, editCategory

    for ( let i = 0; i < transactionsList.length; i++ ) {

        editDescription = document.getElementById( ( transactionsList.item( i ).getAttribute( 'mydescriptionedit' ) ) )
        editCategory    = document.getElementById( ( transactionsList.item( i ).getAttribute( 'mycategoryedit' ) ) )
        transactionData = JSON.parse( transactionsList.item( i ).getAttribute( 'transactiondata' ) )

        if (transactionData.alreadyExists) continue

        transactionData.userId = userId
        transactionData.walletId = walletId
        transactionData.categoryId = (() => {
            let value = -1

            for (let i = 0; i < categories.length; i++) {
                
                if ( categories.item(i).innerHTML == editCategory.value ) {
                    value = categories.item(i).getAttribute('categoryId')
                    break
                }
            };
            
            return value
            }
        )()

        if ( transactionData.categoryId == -1 ) {
            alert( 'Categoria inexistente!' )
            editCategory.focus()
            return false
        }

        transactionData.description = editDescription.value
        // alert(`Antes -> ${transactionData.date}\nDepois -> ${ parseDate( transactionData.date ) }`)
        transactionData.date = parseDate( transactionData.date )

        transactionsList.item( i ).setAttribute( 'transactiondata', JSON.stringify( transactionData ) )

    }

    return true

}

function setUpperCaseAndCursorPosition( inputField ) {

    let startPos = inputField.selectionStart
    let endPos = inputField.selectionEnd

    inputField.value = String( inputField.value ).toUpperCase()
    inputField.selectionStart = startPos
    inputField.selectionEnd = endPos

}

async function buildImportTable( csvData ) {

    let selectBanks = document.getElementById('selectBanksList')
    let bankName = selectBanks.options[ selectBanks.selectedIndex ].text
    
    try {

            let html = '<table>'
            
            html += '<thead>'
            html += '<tr>'
            html += '<td>#</td>'
            html += '<td class="col-date">Data</td>'
            html += '<td class="col-description">Histórico</td>'
            html += '<td class="col-value">Valor</td>'
            html += '<td class="col-category">Categoria</td>'
            html += '<td class="col-command"></td>'
            html += '</tr>'
            html += '</thead>'

            html += '<tbody>'

            csvData.forEach( (transaction, index) => {

                let transactionAlreadyExistsClassName = transaction.alreadyExists ? ' stroked' : ''
                let valueClassName = ''
                let value = 0

                if ( transaction.creditValue > 0 ) {
                    valueClassName = 'positive-value'
                    value = Number( transaction.value )
                }
                else if ( transaction.debitValue > 0 ) {
                    valueClassName = 'negative-value'
                    value = Number( transaction.value ) * (-1)
                }
                else {
                    valueClassName = 'neutral-value'
                    value = Number( transaction.value )
                }

                html += `<tr class="data-row${ transactionAlreadyExistsClassName }" id="dataRowId${index + 1}">`

                html += '<td class="col-number-transaction">'
                html += `<span>${ index + 1 }</span>`
                html += '</td>'
                
                html += '<td class="col-date">'
                html += `<span value="${transaction.date}">${ new Date(transaction.date).toLocaleString().slice(0, 10) }</span>`
                html += '</td>'

                html += '<td class="col-description">'
                html += `<input type="text" onkeyup="setUpperCaseAndCursorPosition( this )" class="borderless monofont" value='${ transaction.alreadyExists ? '** JÁ EXISTE ** --> ' : '' }${ transaction.description }' tabindex="${index + 1}" id="editDescription${index + 1}" ${ transaction.alreadyExists ? 'disabled' : '' }>`
                html += '</td>'

                html += '<td class="col-value">'
                html += `<span class="${valueClassName}" value="${transaction.value}">${ Number( value, '.', 15).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) }</span>`
                html += '</td>'

                html += '<td class="col-category">'
                html += `<input list="lsCategoriesList" class="borderless" value="" tabindex="${csvData.length + (index + 1)}" id="editCategory${index + 1}" placeholder="Informe a categoria aqui" ${ transaction.alreadyExists ? 'disabled' : '' }>`
                html += '</td>'

                html += '<td class="col-command">'
                html += `<button class="btn btn-cl-yellow" name="transactionData" id="btnTransactionNumber${index + 1}" transactionData='${ JSON.stringify(transaction) }' onclick="document.getElementById('dataRowId${index + 1}').remove()" myDescriptionEdit="editDescription${ index + 1 }" myCategoryEdit="editCategory${ index + 1 }" mydatarow="dataRowId${index + 1}" ${ transaction.alreadyExists ? 'disabled' : '' }><span class="material-icons">delete</span></button>`
                html += '</td>'

                html += '</tr>'

            })

            html += '</tbody>'

            html += '</table>'

            html += `<div class="save-button-container">`
            html += `<button id="btnImportAll" class="btn btn-cl-green" onclick="saveTransaction()">`
            html += `<span class="btn-caption">SALVAR TRANSAÇÕES</span>`
            html += `<span class="btn-icon material-icons">save</span>`
            html += `</button>`
            html += `</div>`
            
            return html

    }
    catch ( error ) {
        return `Erro inesperado durate a leitura dos dados, verifique se a origem do arquivo CSV é realmente de "${ bankName }"`
    }

}