/***
 * Check Circle Collision:
 * Returns a boolean that evaluates to true if the two given circles are colliding and false if they are not.
 */
function CheckCC(c1Position, c1r, c2Position, c2r) {
    
    const c1x = c1Position.x;
    const c1y = c1Position.y;
    const c2x = c2Position.x;
    const c2y = c2Position.y;
    
    //we do this calculation squared since square root is a more expensive operation
    const distanceBetweenCirclesSquared =
        (c2x - c1x) * (c2x - c1x) +
        (c2y - c1y) * (c2y - c1y);

    const radiusSquared = (c1r + c2r) * (c1r + c2r);

    //if(distanceBetweenCirclesSquared > radiusSquared) console.log("Collision detected"); else console.log("No collision");
    return (distanceBetweenCirclesSquared < radiusSquared);
}

/***
 * Move Circle Collision:
 * Returns an object with an x and y coordinate at which two colliding circles will only be overlapping at one point.
 */

function MoveCC(c1Position, c1r, c2Position, c2r) {
    const c1x = c1Position.x;
    const c1y = c1Position.y;
    const c2x = c2Position.x;
    const c2y = c2Position.y;

    const angle = Math.atan2((c2y - c1y), (c2x - c1x));
    const distanceBetweenCircles = 
     Math.sqrt(
     (c2x - c1x) * (c2x - c1x) + 
     (c2y - c1y) * (c2y - c1y));
    
    const buffer = 0;
    const moveDist = (c2r + c1r) - distanceBetweenCircles + buffer;

    const c1Pos = {x: c1x - Math.cos(angle) * moveDist, 
                   y: c1y - Math.sin(angle) * moveDist};

    const c2Pos = {x: c2x + Math.cos(angle) * moveDist, 
                   y: c2y + Math.sin(angle) * moveDist};

    return ([c1Pos, c2Pos]);
}


function GetMagnitude(v) {
    return Math.sqrt(
        (v.x * v.x) + (v.y * v.y)
    );

}

function Normalize(v) {
    const magnitude = GetMagnitude(v);
    const newX = v.x / magnitude;
    const newY = v.y / magnitude;
    return ({
        x: newX,
        y: newY
    });
}

function DotProduct(v1, v2) {
    return (v1.x * v2.x) + (v1.y * v2.y);
}

/***
 * Get Circle Collision Velocity:
 * Assuming two circles have collided, this will return the velocity vectors for both circles post-collision.
 */

function GetCCVel(c1Position, c1Vel, c2Position, c2Vel, getOneVel = false) {
    const c1x = c1Position.x;
    const c1y = c1Position.y;
    const c2x = c2Position.x;
    const c2y = c2Position.y;

    // Compute the unit vector in the direction of the collision.
    let dx = c2x - c1x;
    let dy = c2y - c1y;
    let collisionNormal = {x: dx, y: dy};

    // Unit vector in the direction of the collision.
    collisionNormal = Normalize(collisionNormal);

    // Compute relative velocity.
    let rv = { x: c1Vel.x - c2Vel.x, y: c1Vel.y - c2Vel.y };

    // Velocity along the normal direction (dot product).
    let velocityOnNormalScalar = DotProduct(rv, collisionNormal);
    let velocityOnNormal = { x: collisionNormal.x * velocityOnNormalScalar, y: collisionNormal.y * velocityOnNormalScalar};

    // Component of velocity perpendicular to collision normal.
    let velocityPerpendicularToNormal = { x: rv.x - velocityOnNormal.x, y: rv.y - velocityOnNormal.y};

    // Check if velocityPerpendicularToNormal is zero
    if (GetMagnitude(velocityPerpendicularToNormal) === 0) {
        // If it's zero, return the original velocities, reversed
        return [{x: -c1Vel.x, y: -c1Vel.y}, {x: -c2Vel.x, y: -c2Vel.y}];  
    }

    //velocityPerpendicularToNormal = {x:velocityPerpendicularToNormal.x * 2, y: velocityPerpendicularToNormal.y * 2};

    let c1VelNew = { x: c1Vel.x - velocityPerpendicularToNormal.x, y: c1Vel.y - velocityPerpendicularToNormal.y };
    let c2VelNew = { x: c2Vel.x + velocityPerpendicularToNormal.x, y: c2Vel.y + velocityPerpendicularToNormal.y };

    return([c1VelNew, c2VelNew]);
}

function CheckCW(cPosition, cr, screenW, screenH) {
    const cx = cPosition.x;
    const cy = cPosition.y;

    // Adjusted x and y positions, considering the radius of the circle
    const adjustedXRight = cx + cr;
    const adjustedXLeft = cx - cr;
    const adjustedYBottom = cy + cr;
    const adjustedYTop = cy - cr;

    return (adjustedXRight > screenW || adjustedXLeft < 0 || adjustedYBottom > screenH || adjustedYTop < 0);
}



//change this to take whole position object
function MoveCW(cPosition, cr, screenW, screenH) {
    const cx = cPosition.x;
    const cy = cPosition.y;
    let newX = cx;
    let newY = cy;
    let wallNormal = { x: 0, y: 0 };
  
    if (cx + cr > screenW) {
      newX = screenW - cr;
      wallNormal = { x: -1, y: 0 }; // Wall normal pointing left
    } else if (cx - cr < 0) {
      newX = cr;
      wallNormal = { x: 1, y: 0 }; // Wall normal pointing right
    }
  
    if (cy + cr > screenH) {
      newY = screenH - cr;
      if (wallNormal.x !== 0) {
        wallNormal = { x: wallNormal.x, y: 1 }; // Wall normal pointing diagonally
      } else {
        wallNormal = { x: 0, y: 1 }; // Wall normal pointing downward
      }
    } else if (cy - cr < 0) {
      newY = cr;
      if (wallNormal.x !== 0) {
        wallNormal = { x: wallNormal.x, y: -1 }; // Wall normal pointing diagonally
      } else {
        wallNormal = { x: 0, y: -1 }; // Wall normal pointing upward
      }
    }
  
    const newPos = { x: newX, y: newY };
  
    return [newPos, wallNormal];
  }
  



  function GetCWVel(cPosition, cVel, wallNormal, e = 0.8) { // Set e as per your need
    // Compute the unit vector of the wall normal.
    const wallNormalUnit = Normalize(wallNormal);

    // Compute velocity along the normal direction (dot product).
    const velocityOnNormalScalar = DotProduct(cVel, wallNormalUnit);

    // Reflect the velocity on the wall's normal
    const reflectedVelocity = {
        x: cVel.x - 2 * velocityOnNormalScalar * wallNormalUnit.x,
        y: cVel.y - 2 * velocityOnNormalScalar * wallNormalUnit.y
    };

    // Apply the restitution coefficient to the reflected velocity
    const cVelNew = {
        x: e * reflectedVelocity.x,
        y: e * reflectedVelocity.y
    };

    return cVelNew;
}





export { CheckCC, MoveCC, GetCCVel, GetMagnitude, CheckCW, MoveCW, GetCWVel }