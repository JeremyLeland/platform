import { Line } from './common/Line.js';
import * as Block from './Block.js';

export const Constants = {
  Gravity: 0.0003,
  Player: {
    Radius: 0.5,
    Move: 0.0075,
    Jump: 0.04,
  },
}

export class World {
  player = {
    x: -1,
    y: 0,
    dx: 0,
    dy: 0,
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

    let closestLine = null, closestTime = dt;

    this.#lines.forEach( line => {
      const time = line.timeToHit( this.player.x, this.player.y, this.player.dx, this.player.dy, Constants.Player.Radius );

      if ( 0 <= time && time < closestTime ) {
        closestLine = line;
        closestTime = time;

        // console.log( `${ JSON.stringify( this.player ) } will hit line ${ JSON.stringify( line ) } at ${ time }` );
      }
    } );

    this.player.x += this.player.dx * closestTime;
    this.player.y += this.player.dy * closestTime;// + 0.5 * Constants.Gravity * closestTime ** 2;
    this.player.dy += Constants.Gravity * closestTime;

    if ( closestLine ) {
      this.player.dy = 0;
    }

    // TODO: Rest of update?

  }

  draw( ctx ) {
    this.#level.blocks.forEach( block => Block.draw( ctx, block ) );

    ctx.strokeStyle = 'red';
    this.#lines.forEach( line => line.draw( ctx ) );

    ctx.translate( this.player.x, this.player.y );
    ctx.fillStyle = 'red';
    ctx.strokeStyle = 'black';

    ctx.beginPath();
    ctx.arc( 0, 0, Constants.Player.Radius, 0, Math.PI * 2 );

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