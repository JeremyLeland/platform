import { Line } from './common/Line.js';
import * as Block from './Block.js';

export const Constants = {
  Gravity: 0.0001,
  Player: {
    Radius: 0.5,
    Move: 0.008,
    Jump: 0.03,
  },
}

const Direction = {
  Up: 0,
  Left: 1,
  Down: 2,
  Right: 3,
};

const EPSILON = 1e-6;

export class World {
  player = {
    x: 0,
    y: -3,
    dx: 0,
    dy: 0,
    ax: 0,
    ay: 0,
    bounds: [
      [ -0.5, -0.5 ],
      [ -0.5,  0.5 ],
      [  0.5,  0.5 ],
      [  0.5, -0.5 ],
    ],
  };

  #level;
  #lines = [];

  constructor( level ) {
    this.#level = level;

    level.blocks.forEach( b => {
      const left   = b.bounds[ 0 ] - 0.5;
      const top    = b.bounds[ 1 ] - 0.5;
      const right  = b.bounds[ 2 ] + 0.5;
      const bottom = b.bounds[ 3 ] + 0.5;

      this.#lines.push( new Line( left, top, right, top ) );

      if ( b.type == 'stoneBrick' ) {
        this.#lines.push( new Line( right, top, right, bottom ) );
        this.#lines.push( new Line( right, bottom, left, bottom ) );
        this.#lines.push( new Line( left, bottom, left, top ) );
      }
    } );
  }

  update( dt ) {
    // TODO: Figure out best method below
  }

  //
  // Just do it based on the blocks, forget the general case
  //

  updateBlocks( dt ) {
    this.player.ax = 0;
    this.player.ay = Constants.Gravity;

    this.player.x += this.player.dx * dt + 0.5 * this.player.ax * dt ** 2;
    this.player.y += this.player.dy * dt + 0.5 * this.player.ay * dt ** 2;
    this.player.dx += this.player.ax * dt;
    this.player.dy += this.player.ay * dt;


    // TODO: Combine below somehow
    if ( this.player.dy < 0 ) {
      [ -0.49, 0.49 ].forEach( xOffset => {
        const x = this.player.x + xOffset;
        const y = this.player.y - 0.5;
        
        const block = this.#level.blocks.find( b => 
          b.bounds[ 0 ] - 0.5 <= x && x <= b.bounds[ 2 ] + 0.5 &&
          b.bounds[ 1 ] - 0.5 <= y && y <= b.bounds[ 3 ] + 0.5
        );
        
        if ( block ) {
          // console.log( `Found ${ JSON.stringify( block ) } at ${ x },${ y }` );
          this.player.y = Math.floor( y ) + 1;
          this.player.dy = 0;
          this.player.ay = 0;
        }
      } );
    }

    if ( this.player.dy > 0 ) {
      [ -0.49, 0.49 ].forEach( xOffset => {
        const x = this.player.x + xOffset;
        const y = this.player.y + 0.5;
        
        const block = this.#level.blocks.find( b => 
          b.bounds[ 0 ] - 0.5 <= x && x <= b.bounds[ 2 ] + 0.5 &&
          b.bounds[ 1 ] - 0.5 <= y && y <= b.bounds[ 3 ] + 0.5
        );
        
        if ( block ) {
          // console.log( `Found ${ JSON.stringify( block ) } at ${ x },${ y }` );
          this.player.y = Math.ceil( y ) - 1;
          this.player.dy = 0;
          this.player.ay = 0;
        }
      } );
    }

    if ( this.player.dx < 0 ) {
      [ -0.49, 0.49 ].forEach( yOffset => {
        const x = this.player.x - 0.5;
        const y = this.player.y + yOffset;

        const block = this.#level.blocks.find( b => 
          b.bounds[ 0 ] - 0.5 <= x && x <= b.bounds[ 2 ] + 0.5 &&
          b.bounds[ 1 ] - 0.5 <= y && y <= b.bounds[ 3 ] + 0.5
        );

        if ( block ) {
          // console.log( `Found ${ JSON.stringify( block ) } at ${ x },${ y }` );
          this.player.x = Math.floor( x ) + 1;
          this.player.dx = 0;
          this.player.ax = 0;
        }
      } );
    }

    if ( this.player.dx > 0 ) {
      [ -0.49, 0.49 ].forEach( yOffset => {
        const x = this.player.x + 0.5;
        const y = this.player.y + yOffset;

        const block = this.#level.blocks.find( b => 
          b.bounds[ 0 ] - 0.5 <= x && x <= b.bounds[ 2 ] + 0.5 &&
          b.bounds[ 1 ] - 0.5 <= y && y <= b.bounds[ 3 ] + 0.5
        );

        if ( block ) {
          // console.log( `Found ${ JSON.stringify( block ) } at ${ x },${ y }` );
          this.player.x = Math.ceil( x ) - 1;
          this.player.dx = 0;
          this.player.ax = 0;
        }
      } );
    }
  }

  //
  // Try overlap tests to move player out of collisions with ground
  //

  updateOverlap( dt ) {
    this.player.ax = 0;
    this.player.ay = Constants.Gravity;

    this.player.x += this.player.dx * dt + 0.5 * this.player.ax * dt ** 2;
    this.player.y += this.player.dy * dt + 0.5 * this.player.ay * dt ** 2;
    this.player.dx += this.player.ax * dt;
    this.player.dy += this.player.ay * dt;

    for ( let tries = 0; tries < 5; tries ++ ) {
      // TODO: These names are terribly confusing. Need a better term for this. LineDistance?
      let leastOverlap = -Infinity, leastLine = null;

      

      this.#lines.forEach( line => {
        console.log( JSON.stringify( line ) );

        let worstOverlap = 0; //Infinity;

        for ( let i = 0; i < this.player.bounds.length; i ++ ) {
          const current = this.player.bounds[ i ];
          const next = this.player.bounds[ ( i + 1 ) % this.player.bounds.length ];

          const overlap = line.getOverlap( 
            this.player.x + current[ 0 ], 
            this.player.y + current[ 1 ], 
            this.player.x + next[ 0 ], 
            this.player.y + next[ 1 ],
          );

          if ( -1 <= overlap && overlap < worstOverlap ) {
            worstOverlap = Math.min( overlap, worstOverlap );
          }
        }
        
        if ( leastOverlap < worstOverlap && worstOverlap < 0) {
          leastOverlap = worstOverlap;
          leastLine = line;
        }
      } );

      if ( leastOverlap > -Infinity ) {

        // if ( tries > 0 ) {
        //   debugger;
        // }

        const normalAngle = leastLine.getNormalAngle();
        const normX = Math.cos( normalAngle );
        const normY = Math.sin( normalAngle );

        this.player.x -= normX * leastOverlap;
        this.player.y -= normY * leastOverlap;

        // TODO: Base on slope?
        if ( Math.abs( normX ) > EPSILON ) {
          this.player.dx = 0;
        }

        if ( Math.abs( normY ) > EPSILON ) {
          this.player.dy = 0;
        }
      }
      else {
        break;
      }
    }
  }

  //
  // Try sweep tests to see when player would hit ground
  //

  updateSweep( dt ) {
    log( 'collision', `updateSweep( ${ dt } )` );

    this.player.ax = 0;
    this.player.ay = Constants.Gravity;

    const skipLines = new Set();

    for ( let tries = 0; tries < 5; tries ++ ) {
      log( 'collision', JSON.stringify( this.player ) );

      let closestLine = null, closestTime = dt, closestBoundsIndex = -1;

      // TODO: What if we only checked the bounds in the direction we are moving?
      //       e.g. bottom vs top, left vs right

      this.#lines.filter( line => !skipLines.has( line ) ).forEach( line => {

        for ( let i = 0; i < this.player.bounds.length; i ++ ) {
          const current = this.player.bounds[ i ];
          const next = this.player.bounds[ ( i + 1 ) % this.player.bounds.length ];

          const time = line.timeToHitLine( 
            this.player.x + current[ 0 ], 
            this.player.y + current[ 1 ], 
            this.player.x + next[ 0 ], 
            this.player.y + next[ 1 ],
            this.player.dx, 
            this.player.dy, 
            this.player.ax, 
            this.player.ay,
          );

          log( 'collision', `---Bounds ${ i } will hit line ${ JSON.stringify( line ) } at ${ time }` );

          if ( 0 <= time && time < closestTime ) {
            closestLine = line;
            closestTime = time;
            closestBoundsIndex = i;
          }
        }
      } );

      this.player.x += this.player.dx * closestTime + 0.5 * this.player.ax * closestTime ** 2;
      this.player.y += this.player.dy * closestTime + 0.5 * this.player.ay * closestTime ** 2;
      this.player.dx += this.player.ax * closestTime;
      this.player.dy += this.player.ay * closestTime;
      
      if ( closestLine ) {
        log( 'collision', `Bounds ${ closestBoundsIndex } will hit line ${ JSON.stringify( closestLine ) } at ${ closestTime }` );

        // TODO: Base on normal (so we don't stick to ceiling)
        const b1 = this.player.bounds[ closestBoundsIndex ];
        const b2 = this.player.bounds[ ( closestBoundsIndex + 1 ) % this.player.bounds.length ];
        const normalAngle = closestLine.getAngleToLine( 
          this.player.x + b1[ 0 ], 
          this.player.y + b1[ 1 ], 
          this.player.x + b2[ 0 ],
          this.player.y + b2[ 1 ],
        );
        const normX = Math.cos( normalAngle );
        const normY = Math.sin( normalAngle );

        // console.log( `normX = ${ normX }, normY = ${ normY }` );

        // TODO: Base this on difference between normals? (so top bound won't collide top of block)

        // Attempting to stop properly based on normal
        if ( normY == -1 ) {
          this.player.dy = 0;
          this.player.ay = 0;
        }
        else if ( normY == 1 ) {
          this.player.dy = 0;
        }
        else {
          this.player.dx = 0;
          this.player.ax = 0;
        }

        skipLines.add( closestLine );
      }
      else {
        log( 'collision', `No hits found within dt of ${ dt }, updating rest of way` );
      }

      dt -= closestTime;

      if ( dt <= 0 ) {
        log( 'collision', 'Ending update' );
        break;
      }

    }

  }

  draw( ctx ) {
    this.#level.blocks.forEach( block => Block.draw( ctx, block ) );

    ctx.strokeStyle = 'red';
    this.#lines.forEach( line => line.draw( ctx ) );

    ctx.translate( this.player.x, this.player.y );
    ctx.fillStyle = 'red';
    ctx.strokeStyle = 'black';

    ctx.beginPath();
    
    this.player.bounds.forEach( b => ctx.lineTo( b[ 0 ], b[ 1 ] ) );

    ctx.fill();
    ctx.stroke();
    ctx.translate( -this.player.x, -this.player.y );
  }

  // TODO: Continue to apply left and right 
  // (so they will take effect if we jump over an obstacle that was preventing movement)
  keyDown( e ) {
    if ( e.key == ' ' ) {
      this.player.dy = -Constants.Player.Jump;
    }
    else if ( e.key == 'ArrowLeft' ) {
      this.player.dx = -Constants.Player.Move;
    }
    else if ( e.key == 'ArrowRight' ) {
      this.player.dx =  Constants.Player.Move;
    }
  }

  keyUp( e ) {
    if ( e.key == 'ArrowLeft' || e.key == 'ArrowRight' ) {
      this.player.dx = 0;
    }
  }
}

function log( category, message ) {
  // console.log( `${ category }: ${ message }` );
}