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

  constructor( level ) {
    this.#level = level;
  }

  update( dt ) {

    // TODO: Time until parabola hits top or bottom edges?
    // TODO: Use existing lines tests for collision?
    
    this.player.x += this.player.dx * dt;

    let aboveBlock = null, aboveDist = Infinity;

    this.#level.blocks.forEach( block => {
      const dist = block.bounds[ 1 ] - this.player.y - Constants.Player.Radius;

      if ( this.player.x + Constants.Player.Radius > block.bounds[ 0 ] &&
           this.player.x - Constants.Player.Radius < block.bounds[ 2 ] + 1 &&
           -Constants.Player.Radius < dist && dist < aboveDist ) {
        aboveBlock = block;
        aboveDist = dist;
      }
    } );

    const fallDist = this.player.dy * dt + 0.5 * Constants.Gravity * dt ** 2;

    if ( aboveDist <= fallDist ) {
      this.player.y += aboveDist;
      this.player.dy = 0;

      // debugger;
    }
    else {
      this.player.y += fallDist;
      this.player.dy += Constants.Gravity * dt;
    }
  }

  draw( ctx ) {
    this.#level.blocks.forEach( block => Block.draw( ctx, block ) );

    ctx.translate( this.player.x, this.player.y );
    ctx.fillStyle = 'red';
    ctx.strokeStyle = 'black';

    const rad = Constants.Player.Radius;

    ctx.fillRect( -rad, -rad, rad * 2, rad * 2 );
    ctx.strokeRect( -rad, -rad, rad * 2, rad * 2 );
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