class ModalSelectIcon {
  modal
  iconName
  elementIconsList
  cancelledByUser
  onCloseModal_event

  constructor( iconsNames = [] ) {
    this.cancelledByUser = true
    this.iconName = ''
    this.elementIconsList = document.getElementById('iconsList')
    this.onCloseModal_event = undefined
    this.buildIconsList( iconsNames )
    this.modal = document.getElementById('selectIconModal')

    window.addEventListener('keyup', ( ev ) => {
      if ( ev.code == 'Escape' && this.isShowing() ) {
        this.cancelledByUser = true
        this.closeModal()
      }
    })

    document.getElementById( 'btnCloseIconModal' ).onclick = () => { this.closeModal() }
  }

  isShowing() {
    return getComputedStyle( this.modal ).visibility == 'visible'
  }

  getIconName() {
    return this.iconName
  }

  setIconName( name = '' ) {
    this.iconName = name
  }

  showModal() {
    this.modal.classList.remove('close-modal')
    this.modal.classList.add('open-modal')
  }

  closeModal() {
    if ( this.cancelledByUser ) {
      this.iconName = null
    }

    this.modal.classList.remove('open-modal')
    this.modal.classList.add('close-modal')

    typeof this.onCloseModal_event === 'function' ? this.onCloseModal_event( this.getIconName() ) : undefined
  }

  buildIconsList( iconsNames = [] ) {

    iconsNames.forEach( (itemName) => {
      let listItem
      let listItemImage

      listItem = document.createElement('li')
      listItem.className = 'list-item'
      listItem.setAttribute('iconname', itemName)
      listItem.onclick = () => { this.doSelectItem( listItem ) }

      listItemImage = document.createElement('img')
      listItemImage.className = 'icon'
      listItemImage.setAttribute('src', `/icons/${ itemName }`)
      listItemImage.setAttribute('alt', 'Ícone da categoria')

      listItem.appendChild( listItemImage )
      this.elementIconsList.appendChild( listItem )
    })
    
  }
  
  doSelectItem( element = new HTMLElement ) {
    this.cancelledByUser = false
    this.setIconName( element.getAttribute('iconname') )
    this.closeModal()
  }

}