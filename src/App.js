import './App.css';
import Circle from './Circle.js';
import { CheckCC, MoveCC, GetCCVel, CheckCW, MoveCW, GetCWVel, GetMagnitude } from './CollisionDetection.js';
import React, { useEffect, useState, useRef, useCallback } from 'react';

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
      velocity: { x: -400.5, y: 0 },
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

  const randomPush = useRef([])

  //const [isPaused, setIsPaused] = useState(false);
  
    useEffect(() => {
      const updateScreenSize = () => {
        screenSize.current = {
          width: window.innerWidth,
          height: window.innerHeight,
        };
      };
      
      
      // Initial update
      updateScreenSize();
  
      // Event listener to update on screen resize
      window.addEventListener('resize', updateScreenSize);
  
      // Clean up the event listener on unmount
      return () => {
        window.removeEventListener('resize', updateScreenSize);
      };
    }, []);

  

  const [circles, setCircles] = useState(baseCircles);

  const animationFrameID = useRef();

  const timeStep = 0.025;

  function Push(id){
    console.log("circle " + id + " was clicked");
          let xVal = Math.random() * 150;
          let yVal = Math.random() * 150;

          const velocity = { x: (Math.round(Math.random()) * 2 - 1)* xVal, y: (Math.round(Math.random()) * 2 - 1) * yVal};

          randomPush.current = {id, velocity};
  }

  const animate = useCallback(() => {
    {
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
            let newVelocity;
            if(circle.id === randomPush.current.id){
              newVelocity = {
                x: randomPush.current.velocity.x * 0.98,
                y: randomPush.current.velocity.y * 0.98,
              };
            } else {
              newVelocity = {
                x: circle.velocity.x * 0.98,
                y: circle.velocity.y * 0.98,
              };
            }
            const newPosition = {
              x: circle.position.x + newVelocity.x * timeStep,
              y: circle.position.y + newVelocity.y * timeStep,
            };
    
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
            }
          }
        }
    
        return newCircles;
      });
      randomPush.current = '';
      animationFrameID.current = requestAnimationFrame(animate);
    };
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
}, [animate, baseCircles]);

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
          onClick={Push}
        />
      ))}
    </div>
  );
}

export default App;
