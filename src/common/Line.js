export class Line {
  constructor( x1, y1, x2, y2 ) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
  }
  
  length() {
    return Math.hypot( this.x2 - this.x1, this.y2 - this.y1 );
  }

  slopeAngle() {
    return Math.atan2( this.y2 - this.y1, this.x2 - this.x1 );
  }

  normalAngle() {
    return Math.atan2( this.x1 - this.x2, this.y2 - this.y1 );
  }

  draw( ctx ) {
    ctx.beginPath();
    ctx.moveTo( this.x1, this.y1 );
    ctx.lineTo( this.x2, this.y2 );
    // ctx.lineWidth = 1;
    ctx.stroke();

    const midX = ( this.x1 + this.x2 ) / 2;
    const midY = ( this.y1 + this.y2 ) / 2;
    const normalAngle = this.normalAngle();
    const NORM_LEN = 0.5;

    ctx.beginPath();
    ctx.moveTo( midX, midY );
    ctx.lineTo( 
      midX + Math.cos( normalAngle ) * NORM_LEN, 
      midY + Math.sin( normalAngle ) * NORM_LEN,
    );
    ctx.lineWidth /= 2;
    ctx.stroke();
    ctx.lineWidth *= 2;
  }

  distanceFrom( x, y, radius ) {
    const px = this.x2 - this.x1;
    const py = this.y2 - this.y1;
    const D = ( px * px ) + ( py * py );

    const len = Math.sqrt( D );
    const normX = py / len;
    const normY = -px / len;
    
    const u = ( ( x - this.x1 ) * px + ( y - this.y1 ) * py ) / D;
    const offset = radius / len;

    if ( u + offset <= 0 ) {
      return Math.hypot( x - this.x1, y - this.y1 ) - radius;
    }
    else if ( 1 <= u - offset ) {
      return Math.hypot( x - this.x2, y - this.y2 ) - radius;
    }
    else {
      return ( x - this.x1 ) * normX + ( y - this.y1 ) * normY - radius;
    }
  }

  getOverlap( x1, y1, x2, y2 ) {
    const px = this.x2 - this.x1;
    const py = this.y2 - this.y1;
    const D = ( px * px ) + ( py * py );

    const len = Math.sqrt( D );
    const normX = py / len;
    const normY = -px / len;
    
    // const u = ( ( x - this.x1 ) * px + ( y - this.y1 ) * py ) / D;

    const A = ( x1 - this.x1 ) * normX + ( y1 - this.y1 ) * normY;
    const B = ( x2 - this.x1 ) * normX + ( y2 - this.y1 ) * normY;
  }

  timeToHitLine( x1, y1, x2, y2, dx, dy, ax, ay ) {

    const px = this.x2 - this.x1;
    const py = this.y2 - this.y1;

    const len = Math.hypot( px, py );
    const normX = py / len;
    const normY = -px / len;
    
    // Don't consider it a hit if we are moving away
    const vDotN = dx * normX + dy * normY;
    if ( vDotN > 0 ) {
      return Infinity;
    }

    // TODO: Already colliding? (do we care for this game?)

    const A = timeToPointHitLineAccel( x1, y1, dx, dy, ax, ay, this.x1, this.y1, this.x2, this.y2 );
    const B = timeToPointHitLineAccel( x2, y2, dx, dy, ax, ay, this.x1, this.y1, this.x2, this.y2 );

    const C = timeToPointHitLineAccel( this.x1, this.y1, -dx, -dy, -ax, -ay, x1, y1, x2, y2 );
    const D = timeToPointHitLineAccel( this.x2, this.y2, -dx, -dy, -ax, -ay, x1, y1, x2, y2 );

    let closestTime = Infinity;
    
    if ( 0 <= A && A < closestTime )  closestTime = A;
    if ( 0 <= B && B < closestTime )  closestTime = B;
    if ( 0 <= C && C < closestTime )  closestTime = C;
    if ( 0 <= D && D < closestTime )  closestTime = D;
    
    return closestTime;
  }

  timeToHitCircle( x, y, dx, dy, radius ) {
    const px = this.x2 - this.x1;
    const py = this.y2 - this.y1;
    const D = ( px * px ) + ( py * py );

    const len = Math.sqrt( D );
    const normX = py / len;
    const normY = -px / len;
    
    // Don't consider it a hit if we are moving away
    const vDotN = dx * normX + dy * normY;
    if ( vDotN > 0 ) {
      return Infinity;
    }

    const distFromLine = ( this.x1 - x ) * normX + ( this.y1 - y ) * normY;
    
    const hitTime = ( distFromLine + radius ) / vDotN;

    const hitX = x + dx * hitTime;
    const hitY = y + dy * hitTime;

    const closestOnLine = ( ( hitX - this.x1 ) * px + ( hitY - this.y1 ) * py ) / D;

    if ( closestOnLine <= 0 ) {
      return timeToCircleHitPoint( x, y, dx, dy, radius, this.x1, this.y1 );
    }
    else if ( 1 <= closestOnLine ) {
      return timeToCircleHitPoint( x, y, dx, dy, radius, this.x2, this.y2 );
    }
    else {
      return hitTime;
    }
  }
}

function timeToPointHitLineAccel( sx, sy, vx, vy, ax, ay, px, py, qx, qy ) {
  const w = qx - px;
  const h = qy - py;

  // TODO: The cross-product bit doesn't work for vertical lines...how to handle?
  // Maybe see https://www.nagwa.com/en/explainers/516147029054/
  // "Suppose that we are given parametric equations 𝑥=𝑓(𝑡), 𝑦=𝑔(𝑡) of a curve and the equation of a 
  // horizontal line 𝑦=𝑎 (𝑎 is a constant) or a vertical line 𝑥=𝑏 (𝑏 is a constant). In this case, 
  // we can directly set the relevant parametric coordinate equation equal to the constant: 
  // either 𝑓(𝑡)=𝑏 or 𝑔(𝑡)=𝑎. In both cases, we have a single equation that we can solve for 𝑡 as before."

  const A = 0.5 * ( ( ax*qy - ay*qx ) - ( ax*py - ay*px ) );
  const B = ( ( vx*qy - vy*qx ) - ( vx*py - vy*px ) );
  const C = ( ( sx*qy - sy*qx ) - ( sx*py - sy*px ) - ( px*qy - py*qx ) );

  const lineTime = solveQuadratic( A, B, C );

  const lineX = sx + vx * lineTime + 0.5 * ax * lineTime * lineTime;
  const lineY = sy + vy * lineTime + 0.5 * ay * lineTime * lineTime;
  const closestOnLine = ( ( lineX - px ) * w + ( lineY - py ) * h ) / ( w * w + h * h );

  if ( 0 <= closestOnLine && closestOnLine <= 1 ) {
    return lineTime;
  }
  else {
    return Infinity;
  }
}

function timeToCircleHitPoint( x, y, dx, dy, radius, cx, cy ) {
  const dX = dx;
  const dY = dy;
  const fX = x - cx;
  const fY = y - cy;

  const a = dX * dX + dY * dY;
  const b = 2 * ( fX * dX + fY * dY ); 
  const c = ( fX * fX + fY * fY ) - Math.pow( radius, 2 );

  return solveQuadratic( a, b, c );
}

const EPSILON = 1e-6;

function solveQuadratic( A, B, C ) {
  if ( Math.abs( A ) < EPSILON ) {
    return -C / B;
  }
  else {
    const disc = B * B - 4 * A * C;

    let closest = Infinity;

    if ( disc >= 0 ) {
      const t0 = ( -B - Math.sqrt( disc ) ) / ( 2 * A );
      const t1 = ( -B + Math.sqrt( disc ) ) / ( 2 * A );
      
      if ( 0 <= t0 && t0 < closest )   closest = t0;
      if ( 0 <= t1 && t1 < closest )   closest = t1;
    }

    return closest;
  }
}