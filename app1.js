// Load the Handpose model
let model;
async function loadModel() {
    model = await handpose.load();
    console.log("Handpose model loaded.");
    detectHands();
}

// Start detecting hands
async function detectHands() {
    const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
    const video = document.getElementById('media-player'); // Use the existing video element
    video.srcObject = videoStream;
    video.play();

    const detect = async () => {
        const predictions = await model.estimateHands(video);
        if (predictions.length > 0) {
            handleGesture(predictions[0].landmarks);
        }
        requestAnimationFrame(detect);
    };
    detect();
}

// Handle detected gestures
function handleGesture(landmarks) {
    const thumbUp = landmarks[4][1] < landmarks[3][1] && // Thumb is above the index finger
                    landmarks[4][0] > landmarks[3][0] && // Thumb is to the right of the index finger
                    landmarks[1][1] < landmarks[0][1] && // Index finger is down
                    landmarks[2][1] < landmarks[1][1] && // Middle finger is down
                    landmarks[3][1] < landmarks[2][1] && // Ring finger is down
                    landmarks[4][1] < landmarks[3][1]; // Pinky finger is down

    const openHand = landmarks[8][1] < landmarks[7][1] && // Open hand gesture
                     landmarks[12][1] < landmarks[11][1] &&
                     landmarks[16][1] < landmarks[15][1] &&
                     landmarks[20][1] < landmarks[19][1];

    const swipeRight = landmarks[4][0] > landmarks[3][0]; // Swipe Right
    const swipeLeft = landmarks[4][0] < landmarks[3][0]; // Swipe Left
    const twoFingers = landmarks[8][1] < landmarks[7][1] && landmarks[12][1] < landmarks[11][1]; // Two Fingers
    const fist = landmarks[4][1] > landmarks[3][1] && landmarks[8][1] > landmarks[7][1]; // Fist

    if (thumbUp) {
        mediaPlayer.play();
        console.log("Thumbs Up detected."); // Debugging output
    } else if (openHand) {
        mediaPlayer.pause();
        console.log("Open Hand detected."); // Debugging output
    } else if (swipeRight) {
        mediaPlayer.currentTime += 10; // Skip forward 10 seconds
        console.log("Swipe Right detected."); // Debugging output
    } else if (swipeLeft) {
        mediaPlayer.currentTime -= 10; // Skip backward 10 seconds
        console.log("Swipe Left detected."); // Debugging output
    } else if (twoFingers) {
        mediaPlayer.volume = Math.min(mediaPlayer.volume + 0.1, 1); // Increase volume
        console.log("Two Fingers detected."); // Debugging output
    } else if (fist) {
        mediaPlayer.volume = Math.max(mediaPlayer.volume - 0.1, 0); // Decrease volume
        console.log("Fist detected."); // Debugging output
    }
}

// Initialize the application
loadModel();