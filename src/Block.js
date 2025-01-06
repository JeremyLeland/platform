export const Styles = {
  'lightBrick': {
    'grass': 'lime',
    'brick': 'tan',
  },
  'darkBrick': {
    'grass': 'green',
    'brick': 'brown',
  },
  'stoneBrick': {
    'brick': 'gray',
  },
  'blueWater': {
    'water': '#00fa',
  },
};

export function draw( ctx, block, time = 0 ) {

  let offsetX = -0.5, offsetY = -0.5;

  if ( block.waypoints ) {
    const totalTime = block.waypoints[ block.waypoints.length - 1 ].time;
    const loopTime = time % totalTime;

    let index = 0;
    for ( ; block.waypoints[ index ].time < loopTime; index ++ );

    const nextWaypoint = block.waypoints[ index ];
    const prevWaypoint = index > 0 ? block.waypoints[ index - 1 ] : {
      offset: [ 0, 0 ],
      time: 0,
    };

    const partialTime = ( loopTime - prevWaypoint.time ) / ( nextWaypoint.time - prevWaypoint.time );

    offsetX += prevWaypoint.offset[ 0 ] + ( nextWaypoint.offset[ 0 ] - prevWaypoint.offset[ 0 ] ) * partialTime;
    offsetY += prevWaypoint.offset[ 1 ] + ( nextWaypoint.offset[ 1 ] - prevWaypoint.offset[ 1 ] ) * partialTime;
  }

  ctx.translate( offsetX, offsetY );

  const style = Styles[ block.type ];

  if ( style.brick ) {
    ctx.fillStyle = style.brick;
    drawBrick( ctx, ...block.bounds );
  }

  if ( style.grass ) {
    ctx.fillStyle = style.grass;
    drawGrass( ctx, ...block.bounds );
  }

  if ( style.water ) {
    ctx.fillStyle = style.water;
    drawWater( ctx, ...block.bounds );
  }

  ctx.translate( -offsetX, -offsetY );
}

function drawBrick( ctx, startCol, startRow, endCol, endRow ) {
  const body = new Path2D();
  body.rect( startCol, startRow, 1 + endCol - startCol, 1 + endRow - startRow );
  // ctx.fillStyle = 'tan';
  ctx.fill( body );

  const border = new Path2D();
  const light = new Path2D();
  const dark = new Path2D();

  const SUB_COLS = 2, SUB_ROWS = 4;
  const EDGE_SIZE = 0.04;

  for ( let row = startRow; row < endRow + 1; row ++ ) {
    for ( let subRow = 0; subRow < SUB_ROWS; subRow ++ ) {
      const y0 = row + subRow / SUB_ROWS;
      const y1 = row + ( subRow + 1 ) / SUB_ROWS;

      border.moveTo( startCol, y0 );
      border.lineTo( endCol + 1, y0 );

      for ( let col = startCol; col <= endCol + 1; col ++ ) {
        const left = col - 0.25 * ( subRow % 2 ? 1 : 0 );

        for ( let subCol = 0; subCol < SUB_COLS; subCol ++ ) {

          const x0 = Math.max( startCol, left + subCol / SUB_COLS );
          const x1 = Math.min( left + ( subCol + 1 ) / SUB_COLS, endCol + 1 );

          if ( x1 <= x0 ) {
            continue;
          }

          border.moveTo( x0, y0 );
          border.lineTo( x0, y1 );

          light.moveTo( x0, y0 );
          light.lineTo( x1, y0 );
          light.lineTo( x1 - EDGE_SIZE, y0 + EDGE_SIZE );
          light.lineTo( x0 + EDGE_SIZE, y0 + EDGE_SIZE );
          light.lineTo( x0 + EDGE_SIZE, y1 - EDGE_SIZE );
          light.lineTo( x0, y1 );
          light.closePath();

          dark.moveTo( x1, y1 );
          dark.lineTo( x0, y1 );
          dark.lineTo( x0 + EDGE_SIZE, y1 - EDGE_SIZE );
          dark.lineTo( x1 - EDGE_SIZE, y1 - EDGE_SIZE );
          dark.lineTo( x1 - EDGE_SIZE, y0 + EDGE_SIZE );
          dark.lineTo( x1, y0 );
          dark.closePath();
        }
      }
    }
  }


  ctx.fillStyle = '#fff8';
  ctx.fill( light );

  ctx.fillStyle = '#0006';
  ctx.fill( dark );

  ctx.strokeStyle = 'darkgray';
  ctx.stroke( border );


  // Outline the block last (to cover any other mess)
  ctx.strokeStyle = 'black';
  ctx.stroke( body );
}

function drawGrass( ctx, startCol, startRow, endCol, endRow ) {
  const GRASS_OFFSET = 0.1;
  const GRASS_HEIGHT = [ 0.2, 0.3 ];

  const grass = new Path2D();

  grass.moveTo( startCol - GRASS_OFFSET, startRow );
  grass.lineTo( startCol - GRASS_OFFSET, startRow + GRASS_HEIGHT[ 1 ] );

  const GRASS_PER_block = 10;

  for ( let x = 0, ndx = 0; x <= ( 1 + endCol - startCol ) * GRASS_PER_block; x ++, ndx = ( ndx + 1 ) % 2 ) {
    grass.lineTo( startCol + x / GRASS_PER_block, startRow + GRASS_HEIGHT[ ndx ] );
  }

  grass.lineTo( 1 + endCol + GRASS_OFFSET, startRow + GRASS_HEIGHT[ 1 ] );
  grass.lineTo( 1 + endCol + GRASS_OFFSET, startRow );

  grass.closePath();


  // ctx.fillStyle = 'lime';
  ctx.fill( grass );
  ctx.strokeStyle = 'black';
  ctx.stroke( grass );
}

function drawWater( ctx, startCol, startRow, endCol, endRow, time = 0 ) {
  const WAVE_CREST = 0.1;
  const WAVES_PER_block = 4;
  const WAVE_SIZE = 1 / WAVES_PER_block;

  const water = new Path2D();

  water.moveTo( startCol, endRow + 1 );
  water.lineTo( startCol, startRow + WAVE_CREST );

  const offset = ( time / 4000 ) % WAVE_SIZE;
  const crest = WAVE_CREST * ( 1.5 + 0.5 * Math.sin( time / 500 ) ); 

  for ( let x = 0, ndx = 0; x <= ( 1 + endCol - startCol ) * WAVES_PER_block; x ++, ndx = ( ndx + 1 ) % 2 ) {
    water.arc( startCol + offset - WAVE_SIZE / 2 + x / WAVES_PER_block, startRow + crest, WAVE_SIZE / 2, Math.PI, 0, true /* counter-clockwise */ );
  }

  water.lineTo( 1 + endCol, startRow + WAVE_CREST );
  water.lineTo( 1 + endCol, endRow + 1);

  water.closePath();

  // ctx.fillStyle = '#00fa';
  ctx.fill( water );
  ctx.strokeStyle = 'black';
  ctx.stroke( water );
}