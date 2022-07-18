var walletsListModalWrapper = document.getElementById("walletsListModalWrapper");
var ctaSelectWallet = document.getElementById("ctaSelectWallet");

if ( ctaSelectWallet ) {
    ctaSelectWallet.onclick = () => { openWalletsListModal(); }
}

function openWalletsListModal() {
    let appContent = document.getElementById("app-content");

    appContent.className = 'blur-element'
    walletsListModalWrapper.style.display = 'flex';
    walletsListModalWrapper.style.opacity = '1';
}