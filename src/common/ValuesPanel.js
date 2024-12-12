export class ValuesPanel {

  // TODO: Optional parameter with min/max/step for values?
  constructor( values ) {
    const panelUI = document.createElement( 'div' );
    Object.assign( panelUI.style, {
      position: 'absolute',
      left: 0,
      top: 0,
      display: 'grid',
      background: '#000a',
    } );

    const addValue = ( val, parent, parentName ) => {

      const name = parentName ? `${ parentName }.${ val }` : val;

      if ( typeof parent[ val ] == 'object' ) {
        for ( const subVal in parent[ val ] ) {
          addValue( subVal, parent[ val ], name );
        }
      }
      else if ( typeof parent[ val ] == 'number' ) {
        const labelUI = document.createElement( 'label' );
        labelUI.innerText = name;
        panelUI.appendChild( labelUI );
        
        const numInputUI = document.createElement( 'input' );
        
        numInputUI.type = 'number';
        // numInputUI.min = 0;
        // numInputUI.max = parent[ val ] * 2;
        numInputUI.step = Math.pow( 10, Math.floor( Math.log10( parent[ val ] ) ) - 1 );
        
        numInputUI.value = parent[ val ];
        numInputUI.oninput = _ => {
          parent[ val ] = parseFloat( numInputUI.value );
          this.valueChanged();
        };
        
        panelUI.appendChild( numInputUI );
      }

      // TODO: Do we still need to check for functions?
      // if ( typeof parent[ val ] != 'function' ) {
    }

    for ( const val in values ) {
      addValue( val, values );
    }
      
    // TODO: Better size for value?
    panelUI.style.gridTemplateColumns = `1fr 75px`;

    document.body.appendChild( panelUI );
  }

  valueChanged() {}
}

