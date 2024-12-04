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
  ChangeBlockBounds: {
    apply: ( level, cmd ) => changeBlockBounds( level, cmd.index, cmd.dx1, cmd.dy1, cmd.dx2, cmd.dy2 ),
    undo:  ( level, cmd ) => changeBlockBounds( level, cmd.index, -cmd.dx1, -cmd.dy1, -cmd.dx2, -cmd.dy2 ),
  },
  DeleteBlock: {
    apply: ( level, cmd ) => deleteBlock( level, cmd.index ),
    undo:  ( level, cmd ) => addBlock( level, cmd.index, cmd.block ),
  },
};

function addBlock( level, index, block ) {
  level.blocks.splice( index, 0, block );
}

function deleteBlock( level, index ) {
  level.blocks.splice( index, 1 );
}

function changeBlockBounds( level, index, dx1, dy1, dx2, dy2 ) {
  level.blocks[ index ].bounds[ 0 ] += dx1;
  level.blocks[ index ].bounds[ 1 ] += dy1;
  level.blocks[ index ].bounds[ 2 ] += dx2;
  level.blocks[ index ].bounds[ 3 ] += dy2;
}