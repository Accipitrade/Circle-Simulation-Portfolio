import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Popup from './Popup'; // Ensure the path is correct
import resume from './SlavinResume2022.pdf';
import pic from './headshot.png';
import './AnimatedText.css';

const FadeInChunk = ({ chunk, delay, isLink, onClick, href }) => {
  const variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const content = isLink ? (
    <motion.div onClick={onClick} href={href} target={href ? "_blank" : undefined} rel="noopener noreferrer" style={{ textDecoration: 'underline', cursor: 'pointer', display:'inline-block' }}
    whileHover={{scale: 1.1}} whileTap={{scale: .8}}>
      {chunk}
    </motion.div>
  ) : chunk;

  return (
    <motion.span
      variants={variants}
      initial="hidden"
      animate="visible"
      transition={{ delay }}
    >
      {content}{' '}
    </motion.span>
  );
};

const AnimatedText = ({isPaused}) => {
  const [isPopupOpen, setPopupOpen] = useState(false);

  const sentences = [
    ['Hey!'],
    ["I'm Josh Slavin"],
    ["I'm a Software Engineer and Game Developer"],
    ['Click', {chunk: 'here', isLink: true, onClick: () => {setPopupOpen(true); isPaused.current = true;}}, 'to learn more about me'],
    ['and', {chunk: 'here', isLink: true, href: resume}, 'to view my full resume.'],
    ['Or,', 'click a circle to find out more about my projects.'],
    ['This page is a full physics simulation. Have fun!'],
  ];

  let cumulativeDelay = 0;

  return (
    <div className="center-container">
      {sentences.map((chunks, i) => {
        const renderedChunks = chunks.map((chunk, j) => {
          const chunkProps = typeof chunk === 'object' ? chunk : {chunk};
          const chunkDelay = cumulativeDelay;
          cumulativeDelay += 1.2; // Increment delay for next chunk
          return <FadeInChunk key={j} {...chunkProps} delay={chunkDelay} />;
        });

        return (
          <h1 key={i} style={{ userSelect: 'none' }}>
            {renderedChunks}
          </h1>
        );
      })}
      <Popup className='popup' isOpen={isPopupOpen} setIsOpen={() => { setPopupOpen(false); isPaused.current = false;}}>
        <img className='headshot' src={pic} alt="Josh Slavin" />
        <div className='text-container'>

                  <h2>A little about me:</h2>
<div className='first-paragraph'>
<p> I'm a programmer and artist who thrives on crafting one-of-a-kind experiences. While I definitely have a soft spot for AI, VR, and projects grounded in math and physics, what truly drives me is creative problem solving.</p>

<p>My academic journey began at Becker College, where I achieved both my Bachelor's and Master's of Fine Arts in Interactive Media and Design by 2021. During and out of college, I dove into the freelance world, working on multiple game titles featured in this portfolio. Yet, the desire to further hone my skills brought me back to the academic world. As of now, I'm studying at Boston University and am currently enrolled in their Graduate Certification program -- which I am eagerly looking forward to wrapping up this December!</p>
</div>
<p>My passion for learning is equally matched by my enthusiasm for collaboration. Here's a glimpse into some of the languages and frameworks I'm currently using:</p>
<ul>
  <li>C</li>
  <li>C++</li>
  <li>C#</li>
  <li>Javascript</li>
  <li>HTML/CSS</li>
  <li>Python</li>
  <li>R</li>
  <li>React</li>
  <li>Angular</li>
  <li>Node.js</li>
</ul>

<p>...and that's just scratching the surface! If you feel we'd make a great team, don't hesitate to get in touch: <strong>[Insert Email Link Here]</strong></p>

<p>Some fun facts about me:</p>
<ul>
  <li>Though self taught, I had a stent working in a modern restaurant as a Chef!</li>
  <li>When I'm not behind the screen, you'll find me exploring hiking trails, cities or floating on my OneWheel.</li>
  <li>I have a fiery passion (pun intended!) for blacksmithing and knife making, although it's been a while since I've been at the forge.</li>
  <li>My favorite card game is Magic: The Gathering, which I've been playing for nearly two decades now.</li>
</ul>

        </div>

      </Popup>
    </div>
  );
};

export default AnimatedText;