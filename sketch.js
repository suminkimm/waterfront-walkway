let video;
let ripples = [];
let lastRippleTime = 0;
let mouseHoldStart = 0;

async function setup() {
    createCanvas(windowWidth, windowHeight);
    pixelDensity(min(2, window.devicePixelRatio));
    
    video = document.getElementById('bg-video');
    if (video) {
        video.play().catch(err => {
            console.log("Autoplay blocked, waiting for user interaction:", err);
        });
    }
}

function draw() {
    background(220);
    if (video) {
        let ctx = drawingContext;
        ctx.drawImage(video, 0, 0, width, height);
    }
    
    // Soft green light while mouse is held down
    // Soft green bioluminescent glow
    if (mouseIsPressed) {
        let holdTime = millis() - mouseHoldStart;
        let showGlow = mouseIsPressed && holdTime > 150; // 150ms delay
        let ctx = drawingContext;

        if (showGlow) {
            ctx.save();

        ctx.globalCompositeOperation = 'lighter';
        noStroke();

        let x = mouseX;
        let y = mouseY + 10;

        // MUCH slower breathing cycle
        let t = millis() * 0.0012;

        // Smooth “inhale/exhale”
        let breathe = 0.5 + 0.5 * sin(t);

        // Ease the pulse so it lingers at peak (more biological)
        breathe = pow(breathe, 1.6);

        // VERY subtle drift (avoid affecting shape too much)
        let drift = noise(t * 0.3) * 0.08; // tiny only
        breathe += drift;

        let baseSize = 40 + 25 * breathe;

        for (let i = 12; i > 0; i--) {
            let layerT = i / 12;

            let size = baseSize * (1 + layerT * 3.0);

            let alpha = pow(1 - layerT, 2.4) * 130;

            // Keep shimmer but decouple it from size stability
            let shimmer = noise(i * 0.3, t * 0.5) * 18;

            fill(120 + shimmer, 255, 150 + shimmer * 0.2, alpha);

            ellipse(
                x + sin(t * 0.8 + i * 0.4) * 1.5,
                y + cos(t * 0.7 + i * 0.3) * 1.5,
                size,
                size
            );
        }

        ctx.restore();
        }
    }
    // Draw and update ripples
    strokeWeight(2);
    noFill();
    
    for (let i = ripples.length - 1; i >= 0; i--) {
        let ripple = ripples[i];
        
        // Check if ripple should start expanding based on delay
        if (ripple.age >= ripple.delay) {
            ripple.radius += ripple.speed;
        }
        ripple.age += 1;
        
        // Only draw if it has started expanding
        if (ripple.age >= ripple.delay) {
            // Fade out the ripple as it expands
            let alpha = map(ripple.radius, 0, ripple.maxRadius, 255, 50);
            stroke(255, alpha);
            
            // Draw the ripple
            circle(ripple.x, ripple.y, ripple.radius * 2);
        }
        
        // Remove ripple if it's too large
        if (ripple.radius > ripple.maxRadius) {
            ripples.splice(i, 1);
        }
    }
}

function mousePressed() {
    mouseHoldStart = millis();
    // Create ripples
    ripples.push({
        x: mouseX,
        y: mouseY,
        radius: 0,
        maxRadius: 80,
        age: 0,
        delay: 0,
        speed: 0.7
    });
    ripples.push({
        x: mouseX,
        y: mouseY,
        radius: 0,
        maxRadius: 80,
        age: 0,
        delay: 25,
        speed: 1.0
    });
    
    return false;
}
