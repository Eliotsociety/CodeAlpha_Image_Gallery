// Select the image track element
const track = document.getElementById("image-track");

// Flag to keep track of whether auto-scrolling is active
let isAutoScrolling = false;

// Handles the start of a drag action
const handleOnDown = e => {
  // Save the initial mouse position when the drag starts
  track.dataset.mouseDownAt = e.clientX;

  // If auto-scrolling is active, cancel it
  if (isAutoScrolling) {
    cancelAnimationFrame(isAutoScrolling);
    isAutoScrolling = false;
  }
};

// Handles the end of a drag action
const handleOnUp = () => {
  // Reset the mouseDownAt value and save the current scroll percentage
  track.dataset.mouseDownAt = "0";  
  track.dataset.prevPercentage = track.dataset.percentage;
};

// Handles the movement during a drag action
const handleOnMove = e => {
  // If no dragging is happening, exit the function
  if(track.dataset.mouseDownAt === "0") return;
  
  // Calculate the distance moved by the mouse
  const mouseDelta = parseFloat(track.dataset.mouseDownAt) - e.clientX;
  const maxDelta = window.innerWidth / 2;
  
  // Convert the mouse movement into a percentage for scrolling
  const percentage = (mouseDelta / maxDelta) * -100;
  const nextPercentageUnconstrained = parseFloat(track.dataset.prevPercentage) + percentage;
  
  // Constrain the percentage between -100% and 0%
  const nextPercentage = Math.max(Math.min(nextPercentageUnconstrained, 0), -100);
  
  // Update the track's percentage and reposition it
  track.dataset.percentage = nextPercentage;
  updateTrackPosition(nextPercentage);
};

// Updates the track position with animation
const updateTrackPosition = (percentage) => {
  track.animate({
    transform: `translate(${percentage}%, -50%)`
  }, { duration: 1200, fill: "forwards" });
  
  // Animate the position of each image inside the track
  for(const image of track.getElementsByClassName("image")) {
    image.animate({
      objectPosition: `${100 + percentage}% center`
    }, { duration: 1200, fill: "forwards" });
  }
};

// Automatically scrolls the track back to the beginning
const autoScrollToBeginning = () => {
  let currentPercentage = parseFloat(track.dataset.percentage) || 0;
  const scrollStep = () => {
    currentPercentage += 1; // Adjust this value to change scroll speed
    
    // Stop auto-scrolling if the track reaches the start
    if (currentPercentage > 0) {
      currentPercentage = 0;
      track.dataset.percentage = "0";
      track.dataset.prevPercentage = "0";
      updateTrackPosition(0);
      isAutoScrolling = false;
      return;
    }
    
    // Update the track's percentage and continue scrolling
    track.dataset.percentage = currentPercentage;
    updateTrackPosition(currentPercentage);
    isAutoScrolling = requestAnimationFrame(scrollStep);
  };
  
  // Start the auto-scrolling process
  isAutoScrolling = requestAnimationFrame(scrollStep);
};

// Checks the scroll position and triggers auto-scrolling if needed
const checkScrollPosition = () => {
  const currentPercentage = parseFloat(track.dataset.percentage) || 0;
  
  // If the track is scrolled past a certain point, start auto-scrolling
  if (currentPercentage <= -80) { // 20% from the right side
    autoScrollToBeginning();
  }
};

// Event listeners for mouse and touch events
window.onmousedown = e => handleOnDown(e);
window.ontouchstart = e => handleOnDown(e.touches[0]);
window.onmouseup = e => { handleOnUp(); checkScrollPosition(); };
window.ontouchend = e => { handleOnUp(); checkScrollPosition(); };
window.onmousemove = e => handleOnMove(e);
window.ontouchmove = e => handleOnMove(e.touches[0]);