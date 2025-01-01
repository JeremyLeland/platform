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

export class World {
  player = {
    x: 0,
    y: 0,
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
      this.#lines.push( 
        new Line( b.bounds[ 0 ], b.bounds[ 1 ], b.bounds[ 2 ] + 1, b.bounds[ 1 ] ) 
      );

      if ( b.type == 'stoneBrick' ) {
        this.#lines.push( 
          new Line( b.bounds[ 2 ] + 1, b.bounds[ 1 ], b.bounds[ 2 ] + 1, b.bounds[ 3 ] + 1 ) 
        );
        this.#lines.push( 
          new Line( b.bounds[ 2 ] + 1, b.bounds[ 3 ] + 1, b.bounds[ 0 ], b.bounds[ 3 ] + 1 )
        );
        this.#lines.push( 
          new Line( b.bounds[ 0 ], b.bounds[ 3 ] + 1, b.bounds[ 0 ], b.bounds[ 1 ] ) 
        );
      }
    } );
  }

  update( dt ) {
    // TODO: Figure out best method below
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

    // TODO: These names are terribly confusing. Need a better term for this. LineDistance?
    let leastOverlap = -Infinity, leastLine = null;

    this.#lines.forEach( line => {
      let worstOverlap = Infinity;

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
      const normalAngle = leastLine.getNormalAngle();
      const normX = Math.cos( normalAngle );
      const normY = Math.sin( normalAngle );

      this.player.x -= normX * leastOverlap;
      this.player.y -= normY * leastOverlap;

      // TODO: Base on normal
      // this.player.dx = 0;
      this.player.dy = 0;
    }
  }

  //
  // Try sweep tests to see when player would hit ground
  //

  updateSweep( dt ) {
    // console.log( `updateSweep( ${ dt } )` );

    this.player.ax = 0;
    this.player.ay = Constants.Gravity;

    const skipLines = new Set();

    for ( let tries = 0; tries < 5; tries ++ ) {
      // console.log( JSON.stringify( this.player ) );

      let closestLine = null, closestTime = dt, closestBoundsIndex = -1;

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

          // console.log( `---Bounds ${ i } will hit line ${ JSON.stringify( line ) } at ${ time }` );

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
        // console.log( `Bounds ${ closestBoundsIndex } will hit line ${ JSON.stringify( closestLine ) } at ${ closestTime }` );

        this.player.dy = 0;
        this.player.ay = 0;

        skipLines.add( closestLine );
      }
      else {
        // console.log( `No hits found within dt of ${ dt }, updating rest of way` );
      }

      dt -= closestTime;

      if ( dt <= 0 ) {
        // console.log( 'Ending update' );
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