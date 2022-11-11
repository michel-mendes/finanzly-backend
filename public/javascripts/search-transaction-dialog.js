var dialogSearchTransaction = document.getElementById('searchTransactionsDialog')
var btnCloseDialog = document.getElementById('btnCloseSearchDialog')
var searchDg_btnApply = document.getElementById('sdgBtnApplyFilters')
var searchDg_btnCancel = document.getElementById('sdgBtnCancel')

var searchDg_Cancelled = false

const elementObserver = new MutationObserver( elements => {
    elements.forEach( element => {

        if ( element.attributeName !== 'open' ) {
            return
        }

        if ( element.target.hasAttribute('open') ) {
            element.target.dispatchEvent( new CustomEvent( 'opendialog' ) )
        }

    } )
} )

elementObserver.observe( dialogSearchTransaction, {attributes: true} )

dialogSearchTransaction.addEventListener( 'opendialog', openSearchDialog )
dialogSearchTransaction.addEventListener( 'close', closeSearchDialog )
searchDg_btnApply.addEventListener( 'click', applySearchDialog )
searchDg_btnCancel.addEventListener( 'click', cancelSearchDialog )
btnCloseDialog.addEventListener( 'click', cancelSearchDialog )


function openSearchDialog() {
    // dialogSearchTransaction.style.visibility = 'visible'
    dialogSearchTransaction.style.opacity = 1
    // document.getElementById('sdgInputStartDate').value = ''
    // document.getElementById('sdgInputEndDate').value = ''
    // document.getElementById('sdgInputText').value = ''
}

function closeSearchDialog() {
    dialogSearchTransaction.style.opacity = 0
    
    if ( searchDg_Cancelled ) return
    
    let startDate = document.getElementById('sdgInputStartDate').value ? `&start=${document.getElementById('sdgInputStartDate').value}` : ''
    let endDate = document.getElementById('sdgInputEndDate').value ? `&end=${document.getElementById('sdgInputEndDate').value}` : ''
    let searchText = document.getElementById('sdgInputText').value ? `&search=${document.getElementById('sdgInputText').value}` : ''

    // alert('Vamos atualizar')
    getTransactions(startDate, endDate, searchText)
}

function applySearchDialog() {
    // alert('confirmado')
    searchDg_Cancelled = false
    dialogSearchTransaction.close()
}

function cancelSearchDialog() {
    // alert('cancelado')
    searchDg_Cancelled = true
    dialogSearchTransaction.close()
}