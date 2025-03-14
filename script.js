const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const controls = document.getElementById("controls");

let objects = [];
let objectCount = 3;
let speed = 50;
let uploadedImage = null;
let imageUploaded = false;
let hideControlClicks = 0;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

function createObject() {
    return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * speed * 0.1,
        vy: (Math.random() - 0.5) * speed * 0.1,
        size: 40,
        respawnTimer: 0,
    };
}

function updateObjectCount(event) {
    objectCount = parseInt(event.target.value);
    document.getElementById("objectCountLabel").textContent = objectCount;
    objects = [];
    for (let i = 0; i < objectCount; i++) {
        objects.push(createObject());
    }
}

document.getElementById("objectSlider").addEventListener("input", updateObjectCount);

function updateSpeed(event) {
    speed = parseInt(event.target.value);
    document.getElementById("speedLabel").textContent = speed;
    objects.forEach(obj => {
        obj.vx = (Math.random() - 0.5) * speed * 0.1;
        obj.vy = (Math.random() - 0.5) * speed * 0.1;
    });
}

document.getElementById("speedSlider").addEventListener("input", updateSpeed);

function setBackgroundColor(color) {
    document.body.style.backgroundColor = color;
}

function loadImage(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            uploadedImage = new Image();
            uploadedImage.onload = () => {
                imageUploaded = true;
                update();
            };
            uploadedImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

document.getElementById("imageUpload").addEventListener("change", loadImage);

function clearImage() {
    uploadedImage = null;
    imageUploaded = false;
    document.getElementById("imageUpload").value = "";
    update();
}

document.getElementById("clearImageButton").addEventListener("click", clearImage);

canvas.addEventListener("click", (event) => {
    const clickX = event.clientX;
    const clickY = event.clientY;
    objects.forEach(obj => {
        const dx = clickX - obj.x;
        const dy = clickY - obj.y;
        if (Math.sqrt(dx * dx + dy * dy) < 50) {
            obj.respawnTimer = 120; // 2 seconds (120 frames at 60 FPS)
        }
    });
});

// Full Screen Mode
function toggleFullScreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.log(`Error attempting full-screen: ${err.message}`);
        });
    } else {
        document.exitFullscreen();
    }
}

// Hide Controls
function hideControls() {
    controls.style.display = "none";
}

// Restore Controls with Triple Click
document.addEventListener("click", () => {
    hideControlClicks++;
    if (hideControlClicks >= 3) {
        controls.style.display = "flex";
        hideControlClicks = 0;
    }
});

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    objects.forEach(obj => {
        if (obj.respawnTimer > 0) {
            obj.respawnTimer--;
            if (obj.respawnTimer === 0) {
                obj.x = Math.random() * canvas.width;
                obj.y = Math.random() * canvas.height;
            }
            return;
        }

        obj.x += obj.vx;
        obj.y += obj.vy;

        if (obj.x < -50) obj.x = canvas.width + 50;
        if (obj.x > canvas.width + 50) obj.x = -50;
        if (obj.y < -50) obj.y = canvas.height + 50;
        if (obj.y > canvas.height + 50) obj.y = -50;

        if (imageUploaded && uploadedImage) {
            ctx.drawImage(uploadedImage, obj.x - 20, obj.y - 20, obj.size, obj.size);
        } else {
            ctx.fillStyle = "red";
            ctx.beginPath();
            ctx.arc(obj.x, obj.y, 20, 0, Math.PI * 2);
            ctx.fill();
        }
    });
    requestAnimationFrame(update);
}

// Initialize with floating dots
updateObjectCount({ target: { value: 3 } });
updateSpeed({ target: { value: 50 } });
update();
