import './App.css';
import Circle from './Circle.js';
import { CheckCC, MoveCC, GetCCVel, CheckCW, MoveCW, GetCWVel, GetMagnitude } from './CollisionDetection.js';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import FrameQueue from './FrameQueue';

function App() {

  const screenSize = useRef({ width: window.innerWidth, height: window.innerHeight });

  const baseCircles = [
    {
      id: 0,
      radius: 47,
      position: { x: screenSize.current.width * 0.2, y: screenSize.current.height * 0.3 },
      velocity: { x: 50, y: 12 },
    },
    {
      id: 1,
      radius: 25,
      position: { x: screenSize.current.width * 0.8, y: screenSize.current.height * 0.3 },
      velocity: { x: -500.5, y: 20 },
    },
    {
      id: 2,
      radius: 30,
      position: { x: screenSize.current.width * 0.6, y: screenSize.current.height * 0.6 },
      velocity: { x: -10.5, y: -14 },
    },
    {
      id: 3,
      radius: 36,
      position: { x: screenSize.current.width * 0.1, y: screenSize.current.height * 0.5 },
      velocity: { x: 0, y: -30 },
    },
    {
      id: 4,
      radius: 58,
      position: { x: screenSize.current.width * 0.3, y: screenSize.current.height * 0.4 },
      velocity: { x: 40, y: 12 },
    }
  ];

  const [isPaused, setIsPaused] = useState(false);


  //context provider / context for this?
  const mousePosition = useRef({ x: 0, y: 0 });
  const draggedCircle = useRef('');
  const isDragging = useRef(false);
  const mouseFrameData = useRef(new FrameQueue(7));

  useEffect(() => {
    const updateScreenSize = () => {
      screenSize.current = {
        width: window.innerWidth,
        height: window.innerHeight,
      };
    };

    const updateMousePosition = ev => {
      mousePosition.current = { x: ev.clientX, y: ev.clientY };
    };

    // Initial update
    updateScreenSize();

    // Event listener to update on screen resize
    window.addEventListener('resize', updateScreenSize);
    window.addEventListener('mousemove', updateMousePosition);
    window.addEventListener('mousedown', OnMouseDown);
    window.addEventListener('mouseup', OnMouseUp);

    // Clean up the event listeners on unmount
    return () => {
      window.removeEventListener('resize', updateScreenSize);
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mousedown', OnMouseDown);
      window.removeEventListener('mouseup', OnMouseUp);
    };
  }, []);

  const [circles, setCircles] = useState(baseCircles);

  const animationFrameID = useRef();

  const timeStep = 0.025;

  const animate = useCallback(() => {

    if(isDragging.current){
      mouseFrameData.current.push({x: mousePosition.current.x, y: mousePosition.current.y})
    }


    setCircles((prevCircles) => {
      let newCircles = [...prevCircles];

      // Calculate the maximum velocity magnitude among all circles
      let maxVelocityMagnitude = 0;
      prevCircles.forEach((circle) => {
        const velocityMagnitude = GetMagnitude(circle.velocity);
        if (velocityMagnitude > maxVelocityMagnitude) {
          maxVelocityMagnitude = velocityMagnitude;
        }
      });

      // Calculate the number of steps needed for this frame
      const steps = Math.ceil(maxVelocityMagnitude * timeStep);

      for (let step = 0; step < steps; step++) {
        // Update positions for each time step
        newCircles = newCircles.map((circle) => {
          let newPosition = {};
          let newVelocity = {
            x: circle.velocity.x * 0.98,
            y: circle.velocity.y * 0.98,
          };
          if (isDragging.current && circle.id === draggedCircle.current) {
            newPosition = { //this is where the offset will need to go
              x: mousePosition.current.x,
              y: mousePosition.current.y,
            };
          } else {
            newPosition = {
              x: circle.position.x + newVelocity.x * timeStep,
              y: circle.position.y + newVelocity.y * timeStep,
            };
          }
          
        // Check and resolve Circle-Wall collisions
        if (CheckCW(newPosition, circle.radius, screenSize.current.width, screenSize.current.height)) {
          console.log("colliding with wall!");
          const [newPos, wallNormal] = MoveCW(newPosition, circle.radius, screenSize.current.width, screenSize.current.height);
          newPosition.x = newPos.x;
          newPosition.y = newPos.y;
          newVelocity = GetCWVel(newPosition, newVelocity, wallNormal);
        }

          return {
            ...circle,
            position: newPosition,
            velocity: newVelocity,
          };
        });

        // Check and resolve collisions after each time step
        for (let i = 0; i < newCircles.length; i++) {
          for (let j = i + 1; j < newCircles.length; j++) {
            //if not dragging and i or j are not equal to the dragged circle
            //if (!(isDragging.current && (i === draggedCircle.current || j === draggedCircle.current))) {
              if (
                CheckCC(
                  newCircles[i].position,
                  newCircles[i].radius,
                  newCircles[j].position,
                  newCircles[j].radius
                )
              ) {
                const collisionPositions = MoveCC(
                  newCircles[i].position,
                  newCircles[i].radius,
                  newCircles[j].position,
                  newCircles[j].radius
                );
                
                const collisionVelocities = GetCCVel(
                  newCircles[i].position,
                  newCircles[i].velocity,
                  newCircles[j].position,
                  newCircles[j].velocity
                );

                newCircles[i].position = collisionPositions[0];
                newCircles[j].position = collisionPositions[1];
                newCircles[i].velocity = collisionVelocities[0];
                newCircles[j].velocity = collisionVelocities[1];
              }
            //}
          }
        }
      }

      return newCircles;
    });
    animationFrameID.current = requestAnimationFrame(animate);
  }, []);


  useEffect(() => {

    setCircles(baseCircles);

    const startAnimation = () => {
      // Pause the animation for 5 seconds using setTimeout
      setTimeout(() => {
        animationFrameID.current = requestAnimationFrame(animate);
      }, 1000);
    };

    // If document has already been loaded, start the animation
    if (document.readyState === 'complete') {
      startAnimation();
    } else {
      // If not, wait for the 'load' event before starting
      window.addEventListener('load', startAnimation);
    }

    return () => {
      window.removeEventListener('load', startAnimation);
    };
  }, []);

  const OnMouseClick = (id) => {
    draggedCircle.current = id; //use the flag to move the circle to this position with an offset and ignore velocity, since it's being dragged
  }

  const OnMouseDown = () => {
    //console.log("clicking circle " + id + " with position " + mousePosition.current.x + ", " + mousePosition.current.y);
    isDragging.current = true; //boolean flag gets set to true here
    mouseFrameData.current.push({ x: mousePosition.current.x, y: mousePosition.current.y});
  }

  const OnMouseUp = () => {

    isDragging.current = false;
    draggedCircle.current = '';
    //check mouse position buffer to check if it's full of data or if it's not. If it's full, assume that it is dragging and has moved
    //a lot, then calculate vector that is direction * magnitude based on those mouse positions
    //apply the vector (or modify a variable to be used inside of animate) to the relevant circle, so you'll also need id
    //if the mouse buffer isn't full, then do the framer motion window thing based on the id, because the user clicked.

    //something else to consider is that if the user just holds still for 5 frames worth of data then this program will think that
    //they weren't clicking and dragging, and instead were clicking. You should set a boolean if they start dragging to prevent this.

    //adding the boolean will make it really difficult to know when the user is clicking vs dragging. need to use buffer with maybe 7 frames worth of data? or 5?
    //point is that each frame is time. so if the click is really fast then I'll be able to know that it was a click and not a drag.

    //actually, you still need the boolean flag, because animate is the place where you'll need to get the mousePosition to push to the buffer.
    //remember that the buffer will only get updated once per frame this way.
    //this is where you'll need to 
  }

  return (
    <div className='app-container'>
      <div class="center-container">
        <h1>GO</h1>
        <h1>WILD!!!!</h1>
      </div>
      {circles.map(circle => (
        <Circle className={`circle${circle.id}`}
          key={circle.id}
          id={circle.id}
          radius={circle.radius}
          pos={circle.position}
          onClick={OnMouseClick}  
        />
      ))}
    </div>
  );
}

export default App;
