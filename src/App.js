import './App.css';
import Circle from './Circle.js';
import { CheckCC, MoveCC, GetCCVel, CheckCW, MoveCW, GetCWVel, GetMagnitude, FindCompositeVel, CheckCWTouch } from './CollisionDetection.js';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import FrameQueue from './FrameQueue.js';
import Popup from './Popup.js'
import AnimatedText from './AnimatedText';
import styled from 'styled-components';
import bertLogo from './bert-logo.png'
import cookingKingLogo from './cookingking-logo.PNG'
import hitTraxLogo from './hittrax.png'
import yumeLogo from './yumelogo.png'
import manaclysmLogo from './manaclysm-logo-small.png'
import simchaLogo from './simcha-logo.PNG'
import skaterFrogLogo from './SkaterFrog LogoC.png'
import MurdeerLogo from './m.png'

const ContentContainer = styled.div`
display: flex;
flex-wrap: wrap;
width: 100%;

`;

const UpperLeft = styled.div`
margin-top: 60px;
flex: 1;
padding: 20px;
`;

const UpperRight = styled.div`
display: flex;
justify-content: center;
align-items: center;
flex: 1;
padding: 20px;
& > img {
  max-width: 100%;
}
`;

const Lower = styled.div`
flex-basis: 100%;
padding: 20px;
`;



function App() {

  const screenSize = useRef({ width: window.innerWidth, height: window.innerHeight });

  const baseCircles = [
    {
      id: 0,
      radius: 47,
      position: { x: screenSize.current.width * 0.2, y: screenSize.current.height * 0.3 },
      velocity: { x: 50, y: 12 },
      image: hitTraxLogo
    },
    {
      id: 1,
      radius: 55,
      position: { x: screenSize.current.width * 0.8, y: screenSize.current.height * 0.3 },
      velocity: { x: -500.5, y: 20 },
      image: manaclysmLogo
    },
    {
      id: 2,
      radius: 50,
      position: { x: screenSize.current.width * 0.6, y: screenSize.current.height * 0.6 },
      velocity: { x: -10.5, y: -14 },
      image: cookingKingLogo
    },
    {
      id: 3,
      radius: 44,
      position: { x: screenSize.current.width * 0.1, y: screenSize.current.height * 0.5 },
      velocity: { x: 0, y: -30 },
      image: skaterFrogLogo
    },
    {
      id: 4,
      radius: 58,
      position: { x: screenSize.current.width * 0.3, y: screenSize.current.height * 0.4 },
      velocity: { x: 40, y: 12 },
      image: MurdeerLogo
    },
    {
      id: 5,
      radius: 54,
      position: { x: screenSize.current.width * 0.35, y: screenSize.current.height * 0.2 },
      velocity: { x: -40, y: -12 },
      image: simchaLogo
    },
    {
      id: 6,
      radius: 50,
      position: { x: screenSize.current.width * 0.8, y: screenSize.current.height * 0.1 },
      velocity: { x: 50, y: 0 },
      image: bertLogo
    },
    {
      id: 7,
      radius: 40,
      position: { x: screenSize.current.width * 0.2, y: screenSize.current.height * 0.7 },
      velocity: { x: 10, y: -2 },
      image: yumeLogo
    },
  ];

  const isPaused = useRef(false);

  const mousePosition = useRef({ x: 0, y: 0 });
  const draggedCircle = useRef('');
  const isDragging = useRef(false); //is the mouse dragging a circle?
  const mouseFrameData = useRef(new FrameQueue(7)); //custom data type to hold mouse positions
  const compositeVelocity = useRef({ x: 0, y: 0 }); // use this to store velocity generated by frame data, use it inside of animation to apply new velocity
  const mouseClickedUp = useRef(false); // use this to raise a flag for one frame to apply an updated velocity from the above variable.
  const mouseClickTime = useRef(0); //how long was the mouse clicking for?
  const mouseClickUpID = useRef(0); //using this to store ID of circle that was click and dragged but after they let go (to assign velocity)
  const [isOpen, setIsOpen] = useState(false); //used for controlling portfolio pop up
  const [contentID, setContentID] = useState(); //used for what content is displayed on the popup



  //Add a frame's worth of position data for the mouse along with a timestamp to the FrameQueue.
  const PushFrameData = () => {
    const currentTimestamp = Date.now();

    if (mouseFrameData.current.length === 0) {
      mouseFrameData.current.push([{ x: mousePosition.current.x, y: mousePosition.current.y }, currentTimestamp]);
    }
    // If it's not empty, check the timestamp of the last entry
    else {
      //let testArr = mouseFrameData.current.getframeQueue();
      if (mouseFrameData.current.get(mouseFrameData.current.length - 1)[1] !== currentTimestamp) {
        mouseFrameData.current.push([{ x: mousePosition.current.x, y: mousePosition.current.y }, currentTimestamp]);
      }
    }
  }

  const updateMousePosition = (ev) => {
    let x, y;
    if (ev.type === 'touchmove' || ev.type === 'touchstart') {
      x = ev.touches[0].clientX;
      y = ev.touches[0].clientY;
    } else {
      x = ev.clientX;
      y = ev.clientY;
    }
    mousePosition.current = { x: x, y: y };
  };

  useEffect(() => {
    const updateScreenSize = () => {
      screenSize.current = {
        width: window.innerWidth,
        height: window.innerHeight,
      };
    };



    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        animationFrameID.current = requestAnimationFrame(animate);
      } else {
        cancelAnimationFrame(animationFrameID.current);
      }
    };



    // Initial update
    updateScreenSize();

    // To handle when the user tabs out
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Event listener to update on screen resize
    window.addEventListener('resize', updateScreenSize);
    // Mouse Position/Mobile Tap Position event listeners
    window.addEventListener('mousemove', updateMousePosition);
    window.addEventListener('mousedown', OnMouseDown);
    window.addEventListener('mouseup', OnMouseUp);
    window.addEventListener('touchstart', OnMouseDown);
    window.addEventListener('touchmove', updateMousePosition);
    window.addEventListener('touchcancel', OnMouseUp);
    window.addEventListener('touchend', OnMouseUp);

    // Clean up the event listeners on unmount
    return () => {
      window.removeEventListener('resize', updateScreenSize);
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mousedown', OnMouseDown);
      window.removeEventListener('mouseup', OnMouseUp);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('touchstart', OnMouseDown);
      window.removeEventListener('touchmove', updateMousePosition);
      window.removeEventListener('touchcancel', OnMouseUp);
      window.removeEventListener('touchend', OnMouseUp);
    };
  }, []);

  const [circles, setCircles] = useState(baseCircles);

  const animationFrameID = useRef();

  const timeStep = 0.025;

  const animate = useCallback(() => {
    if (!isPaused.current) {
      if (isDragging.current) {
        PushFrameData();
        //console.log("dragging circle: " + draggedCircle.current);
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

        let collisionDetected = false;
        let dragCollisionID = 0; //this variable holds the ID of the circle that the dragged circle collided with
        let dragCollisionDetected = false;

        for (let step = 0; step < steps; step++) {
          // Update positions for each time step
          newCircles = newCircles.map((circle) => {
            let newPosition = {};

            //update velocities. make 'em wiggle!
            let tempX = circle.velocity.x * 0.98;
            let tempY = circle.velocity.y * 0.98;
            if (Math.abs(tempX) < 2) {
              let sign = Math.round(Math.random()) * 2 - 1;
              tempX = sign * (Math.random() * 10)
            }

            if (Math.abs(tempY) < 2) {
              let sign = Math.round(Math.random()) * 2 - 1;
              tempY = sign * (Math.random() * 10)
            }
            let newVelocity = {
              x: tempX,
              y: tempY
            };

            //if the user was dragging a circle and let go, transfer the mouse's velocity to the circle
            //console.log(mouseClickUpID.current);
            if (mouseClickedUp.current && circle.id === mouseClickUpID.current) {
              console.log("reached");
              newVelocity = {
                x: compositeVelocity.current.x * 98,
                y: compositeVelocity.current.y * 98,
              };
              mouseClickedUp.current = false;
              mouseClickUpID.current = '';
            }
            //if the user is dragging a circle and the circle's ID is the same as the dragged circle
            if (isDragging.current && circle.id === draggedCircle.current) {

              //assign the mouse's position (with an offset) to the circle
              newPosition = { //no offset, because it causes some funky behavior
                x: mousePosition.current.x,
                y: mousePosition.current.y,
              };
            } else {
              //since the circle isn't being dragged, then do standard position/velocity calculation
              newPosition = {
                x: circle.position.x + newVelocity.x * timeStep,
                y: circle.position.y + newVelocity.y * timeStep,
              };
            }

            // Check and resolve Circle-Wall collisions
            if (CheckCW(newPosition, circle.radius, screenSize.current.width, screenSize.current.height)) {
              //console.log("colliding with wall!");
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
                //check collisions for two circles
                CheckCC(
                  newCircles[i].position,
                  newCircles[i].radius,
                  newCircles[j].position,
                  newCircles[j].radius
                )
              ) {
                //if they collided, move them so they're not
                const collisionPositions = MoveCC(
                  newCircles[i].position,
                  newCircles[i].radius,
                  newCircles[j].position,
                  newCircles[j].radius
                );

                let collisionVelocities = [{ x: 0, y: 0 }, { x: 0, y: 0 }];
                if (isDragging.current) {
                  if (i === draggedCircle.current) {
                    collisionVelocities = [{ x: 0, y: 0 }, FindCompositeVel(mouseFrameData.current.getframeQueue())];
                    collisionVelocities[1].x *= 70;
                    collisionVelocities[1].y *= 70;
                    dragCollisionID = j;
                    dragCollisionDetected = true;
                    //console.log(collisionVelocities[1].x + " " + collisionVelocities[1].y);
                  } else if (j === draggedCircle.current) {
                    collisionVelocities = [FindCompositeVel(mouseFrameData.current.getframeQueue()), { x: 0, y: 0 }];
                    collisionVelocities[0].x *= 70;
                    collisionVelocities[0].y *= 70;
                    dragCollisionID = i;
                    dragCollisionDetected = true;
                    //console.log(collisionVelocities[0].x + " " + collisionVelocities[0].y);
                  }
                } else {
                  collisionVelocities = GetCCVel(
                    newCircles[i].position,
                    newCircles[i].velocity,
                    newCircles[j].position,
                    newCircles[j].velocity
                  );
                }

                if (isDragging.current) {
                  if (i === draggedCircle.current) {
                    newCircles[j].position = collisionPositions[1];
                    newCircles[j].velocity = collisionVelocities[1];
                    //set j's position and velocity
                  } else if (j === draggedCircle.current) {
                    newCircles[i].position = collisionPositions[0];
                    newCircles[i].velocity = collisionVelocities[0];
                    //set i's position and velocity
                  }
                } else {
                  //set both position and velocity
                  newCircles[i].position = collisionPositions[0];
                  newCircles[j].position = collisionPositions[1];
                  newCircles[i].velocity = collisionVelocities[0];
                  newCircles[j].velocity = collisionVelocities[1];
                }

              }
            }
          }

          // Check and resolve collisions a second time, ignoring the dragged circle collisions. 
          //this resolves multi-body collisions.

          do {
            //console.log("recursion");
            collisionDetected = false;
            for (let i = 0; i < newCircles.length; i++) {
              for (let j = i + 1; j < newCircles.length; j++) {
                //if not dragging and i or j are not equal to the dragged circle
                //if (!(isDragging.current && (i === draggedCircle.current || j === draggedCircle.current))) {
                if (isDragging.current && (i === draggedCircle.current || j === draggedCircle.current)) {
                  continue;
                }

                if (
                  //check collisions for two circles
                  CheckCC(
                    newCircles[i].position,
                    newCircles[i].radius,
                    newCircles[j].position,
                    newCircles[j].radius
                  )
                ) {
                  collisionDetected = true;
                  //if they collided, move them so they're not
                  const collisionPositions = MoveCC(
                    newCircles[i].position,
                    newCircles[i].radius,
                    newCircles[j].position,
                    newCircles[j].radius
                  );

                  let collisionVelocities = [{ x: 0, y: 0 }, { x: 0, y: 0 }];

                  collisionVelocities = GetCCVel(
                    newCircles[i].position,
                    newCircles[i].velocity,
                    newCircles[j].position,
                    newCircles[j].velocity
                  );

                  //set both position and velocity
                  newCircles[i].position = collisionPositions[0];
                  newCircles[j].position = collisionPositions[1];
                  newCircles[i].velocity = collisionVelocities[0];
                  newCircles[j].velocity = collisionVelocities[1];

                }
              }
            }
          } while (collisionDetected);


          //checking circle-wall collisions a final time prevents circles from being pushed out of bounds from other collisions
          newCircles.forEach((circle) => {
            // Check and resolve Circle-Wall collisions
            if (CheckCW(circle.position, circle.radius, screenSize.current.width, screenSize.current.height)) {
              const [newPos, wallNormal] = MoveCW(circle.position, circle.radius, screenSize.current.width, screenSize.current.height);
              circle.position.x = newPos.x;
              circle.position.y = newPos.y;
              circle.velocity = GetCWVel(circle.position, circle.velocity, wallNormal);
            }
          });

          //compare collided circle and dragged circle to make sure they don't overlap when the collided circle is in the corner
          if (dragCollisionDetected) {
            if (isDragging.current) {
              let newPositions;
              if (CheckCWTouch(newCircles[dragCollisionID].position, newCircles[dragCollisionID].radius, screenSize.current.width, screenSize.current.height)) {
                //console.log("attempting to separate circle in corner.");
                if (CheckCC(newCircles[draggedCircle.current].position, newCircles[draggedCircle.current].radius, newCircles[dragCollisionID].position, newCircles[dragCollisionID].radius)) {
                  newPositions = MoveCC(newCircles[draggedCircle.current].position, newCircles[draggedCircle.current].radius, newCircles[dragCollisionID].position, newCircles[dragCollisionID].radius);
                  newCircles[draggedCircle.current].position = newPositions[0];
                  if (CheckCW(newCircles[draggedCircle.current].position, newCircles[draggedCircle.current].radius, screenSize.current.width, screenSize.current.height)) {
                    newCircles[draggedCircle.current].position = MoveCW(newCircles[draggedCircle.current].position, newCircles[draggedCircle.current].radius, screenSize.current.width, screenSize.current.height);
                  }
                }
              }
            }
          }

        }

        return newCircles;
      });
    }

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

  //used for circle interactions
  const OnMouseClick = (id) => {
    draggedCircle.current = id; //use the flag to move the circle to this position with an offset and ignore velocity, since it's being dragged
    isDragging.current = true; //boolean flag gets set to true here
    PushFrameData();
  }

  //general purpose mouse stuff
  const OnMouseDown = (ev) => {
    updateMousePosition(ev);
    if (ev.type === 'touchstart') {
      PushFrameData();
      //ev.preventDefault();
    }
    mouseClickTime.current = Date.now();
  }

  //triggered whenever the mouse lifts up
  const OnMouseUp = () => {
    if (isDragging.current) {
      isDragging.current = false;

      //log time, was the click long or short?
      if (Date.now() - mouseClickTime.current <= 150) {
        // It was a quick click
        setContentID(draggedCircle.current);
        draggedCircle.current = '';
        isPaused.current = true;
        OpenPopUp();
      } else {
        // It was a drag
        compositeVelocity.current = FindCompositeVel(mouseFrameData.current.getframeQueue());
        mouseClickedUp.current = true;
        mouseClickUpID.current = draggedCircle.current;
        draggedCircle.current = '';
      }
    }

  }

  const OpenPopUp = () => {
    setIsOpen(true)
  }

  const PortfolioContent = () => {
    switch (contentID) {
      default:
        return null;
      case 0: //hittrax remote
        return (
          <div >
            <ContentContainer>
              <UpperLeft>
                <h2>HitTrax Remote</h2>
                <p>A quick serving remote to access fast analytics without breaking away from the action</p>
              </UpperLeft>
              <UpperRight className='video'>
                <iframe width="100%" height="100%" src="https://cdn.hittrax.com/content/corporate/video/Boston_com_hittrax_comp.mp4" title="HitTrax Video" frameborder="0" allow="accelerometer; autoplay:false; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
              </UpperRight>

              <Lower>
                <p>HitTrax Remote was my assignment over the two summers I interned at InMotion Systems LLC. While HitTrax is a full baseball simulation attached to a proprietary camera, the remote is simply there to view session data quickly, without interrupting the users, coach, and spectators from the pitching/hitting action.</p>
                <p>I walked into an existing framework that was mostly UI, which didn't even meet their needs. Really, I was building this app from the ground up.</p>
                <p>This project was largely a solo effort. Over the course of the project, I:
                  <ul>
                    <li>Used Unity engine to build a multi-platform (Windows, Android, Apple) application</li>
                    <li>Communicated with authentication servers for login access, TCP/UDP protocols for network communication between main application and remote</li>
                    <li>Styled UI and screens for better user experience and more stat displays</li>
                    <li>Prepped app for Google Play Store and Apple Store release</li>
                  </ul>
                </p>
                <p>Working for HitTrax inspired a love of baseball I didn't even know I had (go Red Sox!). Please <a href='https://www.hittrax.com/' target="_blank">check out their website.</a></p>
              </Lower>
            </ContentContainer>
          </div>
        );
      case 1: //manaclysm
        return (
          <div>
            <ContentContainer>
              <UpperLeft>
                <h2>Manaclysm</h2>
                <p>A Unity3D card game born out of the research for my MFA Thesis paper about immersion and immersive strategies.</p>
              </UpperLeft>

              <UpperRight className='video'>
                <iframe width="70%" height="40%" src="https://www.youtube.com/embed/yZQiJfqCxxg?si=wgwZqwMGyEpZU13r" title="YouTube video player" frameborder="0" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
              </UpperRight>

              <Lower>
                <p>Manaclysm is a fantasy card game with a board, drawing elements from games like <a href="https://magic.wizards.com/en" target="_blank">Magic: the Gathering</a>, Chess, and <a href="https://store.steampowered.com/app/397060/Faeria/" target="_blank">Faeria</a>, but visually is reminiscent of an older era of games; <a href="https://oldschool.runescape.com/" target="_blank">Old School Runescape</a> and H.R. Giger's <a href="https://en.wikipedia.org/wiki/Dark_Seed_(video_game)" target="_blank">Dark Seed</a> come to mind</p>
                <p>Play as General Dunbar, Master Tinker Taog or Mother Mycelium as you fight for dominion of the mana-laden planet of Ivo!</p>
                <p>As team lead, I created the project, along with the majority of the programming infrastructure. This included lots of procedural animations, custom pathfinding, custom Unity inspector elements and tools, and much more. Over the course of a year and a half, I held sprint meetings and worked with 10+ undergraduate students to consolidate work.</p>
              </Lower>
            </ContentContainer>
          </div>
        );
      case 2: //cooking king (coming soon)
        return (
          <div>
            <ContentContainer>
              <UpperLeft>
                <h2>Cooking King! (Coming Soon)</h2>
                <p>A Unity3D time-mania game where you complete recipes with your smartphone's gyroscope!</p>
              </UpperLeft>

              <UpperRight className='video'>
                <iframe width="70%" height="40%" src="https://www.youtube.com/embed/pZi1aWbS2NY?si=J7O_wDAr8-0avQMb" title="YouTube video player" frameborder="0" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
              </UpperRight>

              <Lower>
                <p>I started Cooking King! in my first year of my MFA after seeing how much fun a <a target="_blank" href='https://www.youtube.com/watch?v=0_kP4h_3ims'>Mario Party minigame</a> was, and wanting to create a full experience from it. I've always loved cooking, so this felt like a very natural progression of development for me.</p>
                <p>Combined with my Year 1 research in mobile game advertisement and microtransactions, I initially scoped Cooking King to feature coins and skins with a robust shop. However, given the popularity of data analytics and mining, I have since decided to use Cooking King! to focus on that.</p>
                <p>This game is still in development. Check back soon!</p>
              </Lower>
            </ContentContainer>
          </div>
        );
      case 3: //skaterfrog
        return (
          <div>
            <ContentContainer>
              <UpperLeft>
                <h2>Skaterfrog</h2>
                <p>A skateboarding frog's adventure, made by Gnarvana Studio, a child of Becker College's Accipiter Studios.</p>
              </UpperLeft>

              <UpperRight className='video'>
                <iframe width="70%" height="40%" src="https://www.youtube.com/embed/opQhuGUkeQo?si=1v86X1nJb8gOpJLH" title="YouTube video player" frameborder="0" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
              </UpperRight>

              <Lower>
                <p>Skaterfrog is a fast-paced 2D platformer about a frog on a mission to reach froggy skateboarding heaven: Gnarvana!</p>
                <p>One of our original goals for Skaterfrog was to partner with Microsoft and put Skaterfrog on the (at the time) new Xbox Creator program. After some major scope revisions, however, we ultimately decided not to, but one feature we kept was a controller, rather than keyboard, based input.</p>
                <p>Everyone on the Skaterfrog team participated in designing the game to some extent: our meetings were often and lengthy. In terms of my programming contributions, I
                  <ul>
                    <li>Mapped joysticks and buttons, as well as combinations, to "tricks" the player can perform to traverse the play area</li>
                    <li>Implemented grind rails and speed ramp in accordance with our custom object detection and physics systems</li>
                    <li>Created object pooling systems for custom Unity tool and in-game resource management</li>
                    <li>Used custom Unity tool to create curated, quasi-random level chunks.</li>
                  </ul>
                </p>

                <p>Skaterfrog was truly a labor of love and everyone who worked on it can attest to the long hours we spent (for many of us, this was our first true experience with a full game development lifecycle) and the genuine surprise and gratitude we felt when it went viral on Twitch. <a href="https://store.steampowered.com/app/1127470/Skater_Frog/" target="_blank">Please check it out on Steam!</a></p>

              </Lower>
            </ContentContainer>
          </div>
        );
      case 4: //two turret terminator
        return (
          <div>
            <ContentContainer>
              <UpperLeft>
                <h2>Murdeer</h2>
                <p>A game made in 10 days for The Big Mode Game Jam with the theme "power"</p>
              </UpperLeft>

              <Lower>
                <p>Murdeer is a silly, high-octane, fast paced first-person shooter where you play as a Deer escaping an R&D laboratory using a stolen PowerGun. Build a ridiculous weapon, buck into enemies, and meet special forest friends along the way!</p>
                <p>Our team comprised 4 people, myself as the team lead/programmer, another programmer, a digital artist, and an audio technician. My role included ensuring we had a finished product for the end of the jam, as well as implementing algorithmic A* pathfinding, enemy AI, animations, and level design. Check out the <a href='https://accipitrade.itch.io/murdeer' target='_blank'>itch page</a>where we have our "alpha" game jam version (we ranked #83 in fun out of 831 entries!) and our <a href='https://swiftstagstudios.org/' target='_blank'>studio website</a>!</p>
              </Lower>
            </ContentContainer>
          </div>
        );
      case 5: //simcha website (coming soon) upscale israeli cuisine with small plates (do better josh)
        return (
          <div>
            <ContentContainer>
              <UpperLeft>
                <h2>Simcha Restaurant Website</h2>
              </UpperLeft>

              <UpperRight className='image'>

              </UpperRight>

              <Lower>
                <p>An upscale restaurant featuring fresh and modern takes on Israeli cuisine. Check them out <a target="_blank" href='https://helpful-narwhal-03ecf3.netlify.app/'>here!</a></p>
                <p>This website comes complete with an auto-mailer for contact, a custom editable pop-up message, auto-updating menu system, and more!</p>
              </Lower>
            </ContentContainer>
          </div>
        );
      case 6: //bert model for steam review analysis
        return (
          <ContentContainer>
            <UpperLeft>
              <h2>Fine-Tuned Bert Model for Steam Review Analysis</h2>
            </UpperLeft>

            <UpperRight className='image'>

            </UpperRight>

            <Lower>
              <p>For a class at BU, I fine-tuned a BERT model on <a>Steam</a> game reviews I caputed from <a target="_blank" href='https://github.com/aesuli/steam-crawler'>Aesuli's Steam Crawler</a>. The newly-tuned BERT then performed a sentiment analysis of different reviews (were they positive of negative?) as well as finding the "strength" of the assessment.</p>
              <p>Using R, I created graphs based on the resulting data. Feel free to look through <a target="_blank" href='https://github.com/Accipitrade/steam-crawler'>my code</a> and generate the graphs for yourself!</p>
            </Lower>
          </ContentContainer>
        );
      case 7: 
        return (
          <ContentContainer>
            <UpperLeft>
              <h2>Yume Wo Katare Website</h2>
            </UpperLeft>

            <UpperRight className='image'>

            </UpperRight>

            <Lower>
              <p>An ecclectic "dream workshop" focused on sharing and achieving one's dreams by eating bowls of ramen.</p>
              <p>This non-traditional restaurant deserved a website that matched the unique vibe they give off. I focused on an intuitive-first design to leave the restaurant shrouded in mystique, but still allow visitors to use their inherent navigation skills to find and disseminate information on the website quickly. Please check them out <a target="_blank" href='https://timely-peony-6bfdc2.netlify.app/'>here!</a></p>
            </Lower>
          </ContentContainer>
        );
    }
  }

  return (
    <div className='app-container'>

      <Popup className="popup" isOpen={isOpen} setIsOpen={() => { setIsOpen(false); isPaused.current = false; }}>
        {PortfolioContent()}
      </Popup>

      <div className="center-container">
        <AnimatedText isPaused={isPaused} />
      </div>
      {circles.map(circle => (
        <Circle className={`circle${circle.id}`}
          key={circle.id}
          id={circle.id}
          radius={circle.radius}
          pos={circle.position}
          onClick={OnMouseClick}
          image={circle.image}
        />
      ))}
    </div>
  );
}

export default App;
