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

    this.player.ax = 0;
    this.player.ay = Constants.Gravity;

    // TODO: Look for overlaps and back out of them instead of of timeToHit?
    
    this.player.x += this.player.dx * closestTime + 0.5 * this.player.ax * closestTime ** 2;
    this.player.y += this.player.dy * closestTime + 0.5 * this.player.ay * closestTime ** 2;
    this.player.dx += this.player.ax * closestTime;
    this.player.dy += this.player.ay * closestTime;

    this.#lines.forEach( line => {
      
    } );

    // for ( let tries = 0; tries < 5; tries ++ ) {

    //   let closestLine = null, closestTime = dt;

    //   this.#lines.forEach( line => {

    //     for ( let i = 0; i < this.player.bounds.length; i ++ ) {
    //       const current = this.player.bounds[ i ];
    //       const next = this.player.bounds[ ( i + 1 ) % this.player.bounds.length ];

    //       const time = line.timeToHitLine( 
    //         this.player.x + current[ 0 ], 
    //         this.player.y + current[ 1 ], 
    //         this.player.x + next[ 0 ], 
    //         this.player.y + next[ 1 ],
    //         this.player.dx, 
    //         this.player.dy, 
    //         this.player.ax, 
    //         this.player.ay,
    //       );

    //       // Exclude zero so we aren't stopped by lines we already stopped at
    //       if ( 0 <= time && time < closestTime ) {
    //         closestLine = line;
    //         closestTime = time;
    
    //         // console.log( `${ JSON.stringify( this.player ) } will hit line ${ JSON.stringify( line ) } at ${ time }` );
    //       }
    //     }

    //   } );

    //   this.player.x += this.player.dx * closestTime + 0.5 * this.player.ax * closestTime ** 2;
    //   this.player.y += this.player.dy * closestTime + 0.5 * this.player.ay * closestTime ** 2;
    //   this.player.dx += this.player.ax * closestTime;
    //   this.player.dy += this.player.ay * closestTime;


    //   // TODO: Only vertical lines should stop player. Take normal into account?
    //   if ( closestLine ) {
    //     this.player.dy = 0;
    //     this.player.ay = 0;
    //   }

    //   dt -= closestTime;

    //   if ( dt <= 0 ) {
    //     break;
    //   }

    // }

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