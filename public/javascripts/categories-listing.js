// Get the user ID in the document
var myUserId = document.getElementById("myUserId").innerText;
document.getElementById("myUserId").remove();
var categoriesList = document.querySelectorAll('.list-item')

let successfullyEditedCategory = false;

categoriesList.forEach( (item) => {
    let categoryId = item.getAttribute('categoryid')
    let categoryName = item.getAttribute('categoryname')
    let categoryType = item.getAttribute('categorytype')

    item.onclick = () => { openModal( categoryId, myUserId, categoryName, categoryType ) }
})

function categoriesPageRefresh() {
    location.reload();
}