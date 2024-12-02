// Voice-Controlled To-Do List
const taskList = document.getElementById('task-list');
const startVoiceButton = document.getElementById('start-voice-button');

let recognition;

if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = function(event) {
        const command = event.results[0][0].transcript.toLowerCase();
        handleVoiceCommand(command);
    };

    recognition.onerror = function(event) {
        console.error('Speech recognition error:', event.error);
        alert('Speech recognition error: ' + event.error);
    };
} else {
    alert('Your browser does not support speech recognition. Please use Chrome or Firefox.');
}

startVoiceButton.addEventListener('click', function() {
    recognition.start();
});

function handleVoiceCommand(command) {
    if (command.includes('add task')) {
        const task = command.replace('add task', '').trim();
        addTask(task);
    } else if (command.includes('remove task')) {
        const task = command.replace('remove task', '').trim();
        removeTask(task);
    } else if (command.includes('show tasks')) {
        showTasks();
    } else {
        alert('Command not recognized. Please say "add task", "remove task", or "show tasks".');
    }
}

function addTask(task) {
    const listItem = document.createElement('li');
    listItem.textContent = task;
    taskList.appendChild(listItem);
    alert(`Task "${task}" added.`);
}

function removeTask(task) {
    const items = taskList.getElementsByTagName('li');
    for (let i = 0; i < items.length; i++) {
        if (items[i].textContent.toLowerCase() === task.toLowerCase()) {
            taskList.removeChild(items[i]);
            alert(`Task "${task}" removed.`);
            return;
        }
    }
    alert(`Task "${task}" not found.`);
}

function showTasks() {
    const tasks = Array.from(taskList.getElementsByTagName('li')).map(item => item.textContent);
    alert(`Your tasks: ${tasks.join(', ')}`);
}

// Gesture-Controlled Media Player
const video = document.getElementById('media-player');
let model;

// Load TensorFlow Handpose model
async function loadModel() {
    model = await handpose.load();
    console.log('Handpose model loaded.');
}

// Detect gestures using the webcam feed
async function detectGesture() {
    const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
    const webcam = document.getElementById('webcam-feed');
    webcam.srcObject = videoStream;
    webcam.play();

    const processGestures = async () => {
        const predictions = await model.estimateHands(webcam);
        if (predictions.length > 0) {
            const gesture = classifyGesture(predictions[0].landmarks);
            handleGesture(gesture);
        }
        requestAnimationFrame(processGestures);
    };
    processGestures();
}

function classifyGesture(landmarks) {
    // Thumb Up Gesture
    if (landmarks[4][1] < landmarks[3][1] && landmarks[4][0] > landmarks[3][0]) {
        return 'thumbs_up';
    }

    // Open Hand Gesture
    if (
        landmarks[8][1] < landmarks[7][1] && // Index finger is extended
        landmarks[12][1] < landmarks[11][1] && // Middle finger is extended
        landmarks[16][1] < landmarks[15][1] && // Ring finger is extended
        landmarks[20][1] < landmarks[19][1] // Pinky is extended
    ) {
        return 'open_hand';
    }

    // Swipe Right Gesture
    if (landmarks[4][0] > landmarks[3][0] + 50) { // Thumb moves significantly to the right
        return 'swipe_right';
    }

    // Swipe Left Gesture
    if (landmarks[4][0] < landmarks[3][0] - 50) { // Thumb moves significantly to the left
        return 'swipe_left';
    }

    // Fist Gesture
    if (
        landmarks[4][1] > landmarks[3][1] && // Thumb is down
        landmarks[8][1] > landmarks[7][1] && // Index finger is curled
        landmarks[12][1] > landmarks[11][1] && // Middle finger is curled
        landmarks[16][1] > landmarks[15][1] && // Ring finger is curled
        landmarks[20][1] > landmarks[19][1] // Pinky is curled
    ) {
        return 'fist';
    }

    // No recognized gesture
    return null;
}

function handleGesture(gesture) {
    switch (gesture) {
        case 'thumbs_up':
            playMedia();
            break;
        case 'open_hand':
            pauseMedia();
            break;
        case 'swipe_right':
            skipForward();
            break;
        case 'swipe_left':
            skipBackward();
            break;
        case 'fist':
            toggleMute();
            break;
        default:
            console.log('Gesture not recognized.');
            break;
    }
}

function skipForward() {
    video.currentTime += 10; // Skip forward 10 seconds
    console.log('Skipped forward 10 seconds');
}

function skipBackward() {
    video.currentTime -= 10; // Skip backward 10 seconds
    console.log('Skipped backward 10 seconds');
}

function toggleMute() {
    video.muted = !video.muted; // Toggle mute
    console.log(video.muted ? 'Muted video' : 'Unmuted video');
}


function playMedia() {
    video.play();
    console.log('Playing media');
}

function pauseMedia() {
    video.pause();
    console.log('Pausing media');
}

// API Integration for News and Weather
document.getElementById('get-news-button').addEventListener('click', fetchNews);
async function fetchNews() {
    try {
        const response = await fetch('https://newsapi.org/v2/top-headlines?country=us&apiKey=11aa3f1c73d74270aafe81aa3a73c5e8');
        const data = await response.json();
        if (data.status !== 'ok') {
            console.error('Error fetching news:', data.message);
            alert('Error fetching news: ' + data.message);
            return;
        }
        document.getElementById('news-output').innerHTML = data.articles
            .slice(0, 5)
            .map(article => `<p>${article.title}</p>`)
            .join('');
    } catch (error) {
        console.error('Error fetching news:', error);
        alert('Unable to fetch news. Check your internet connection.');
    }
}

document.getElementById('get-weather-button').addEventListener('click', fetchWeather);
async function fetchWeather() {
    try {
        const response = await fetch('https://api.openweathermap.org/data/2.5/weather?q=Sydney&appid=4883442c22830b74a2c6c9c18e13f648');
        const data = await response.json();
        if (!data.main) {
            console.error('Error fetching weather:', data.message);
            alert('Error fetching weather: ' + data.message);
            return;
        }
        document.getElementById('weather-output').innerHTML = `
            <p>Temperature: ${(data.main.temp - 273.15).toFixed(1)}°C</p>
            <p>Weather: ${data.weather[0].description}</p>
        `;
    } catch (error) {
        console.error('Error fetching weather:', error);
        alert('Unable to fetch weather. Check your internet connection.');
    }
}

// Initialize the application
window.onload = async () => {
    await loadModel();
    detectGesture();
};
