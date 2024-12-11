export function newLevel() {
  return {
    blocks: [],
  }
}

export function applyCommand( level, cmd ) {
  Edit[ cmd.type ].apply( level, cmd );
}

export function undoCommand( level, cmd ) {
  Edit[ cmd.type ].undo( level, cmd );
}

export const Edit = {
  AddBlock: {
    apply: ( level, cmd ) => addBlock( level, cmd.index, cmd.block ),
    undo:  ( level, cmd ) => deleteBlock( level, cmd.index ),
  },
  DeleteBlock: {
    apply: ( level, cmd ) => deleteBlock( level, cmd.index ),
    undo:  ( level, cmd ) => addBlock( level, cmd.index, cmd.block ),
  },
  ChangeBlockBounds: {
    apply: ( level, cmd ) => changeBlockBounds( level, cmd.index, cmd.dBounds ),
    undo:  ( level, cmd ) => changeBlockBounds( level, cmd.index, cmd.dBounds.map( b => -b ) ),
  },
  ReorderBlock: {
    apply: ( level, cmd ) => reorderBlock( level, cmd.index, cmd.dIndex ),
    undo:  ( level, cmd ) => reorderBlock( level, cmd.index, -cmd.dIndex ),
  },
};

function addBlock( level, index, block ) {
  level.blocks.splice( index, 0, block );
}

function deleteBlock( level, index ) {
  level.blocks.splice( index, 1 );
}

function changeBlockBounds( level, index, dBounds ) {
  dBounds.forEach( ( b, bIndex ) => level.blocks[ index ].bounds[ bIndex ] += b );
}

function reorderBlock( level, index, dIndex ) {
  level.blocks.splice( index + dIndex, 0, ...level.blocks.splice( index, 1 ) )
}