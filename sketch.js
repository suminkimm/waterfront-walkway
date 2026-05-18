// Paint-stamp canvas: click to create ephemeral stamped shapes
let stamps = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  background(255);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(255);
}

function draw() {
  background(255);

  const now = millis();

  for (let i = stamps.length - 1; i >= 0; i--) {
    const s = stamps[i];

    let alpha = 255;

    // ONLY fade after mouseReleased()
    if (s.isFading) {

      // start fade timer once
      if (s.fadeStartTime === null) {
        s.fadeStartTime = now;
      }

      const age = now - s.fadeStartTime;

      if (age > s.lifespan) {
        stamps.splice(i, 1);
        continue;
      }

      alpha = map(age, 0, s.lifespan, 255, 0);
    }

    // draw pre-rendered graphic with tint alpha
    push();
    translate(s.x, s.y);
    rotate(s.rot);

    tint(255, alpha);

    imageMode(CENTER);
    image(s.gfx, 0, 0, s.size, s.size);

    noTint();
    pop();
  }
}

// create a stamped paint shape at the click point
function mousePressed() {

  const x = mouseX;
  const y = mouseY;

  // pick a random shape type
  const types = ['blob','roughCircle','roughRect','star','splotch','oval'];
  const type = random(types);

  const size = random(40, 180);

  // use vibrant HSB colors: high saturation and brightness
  const color = {
    mode: 'HSB',
    h: floor(random(0, 360)),
    s: floor(random(80, 100)),
    b: floor(random(75, 100))
  };

  const gfx = createStampGraphic(size, color, type);
  const rot = random(TWO_PI);
  const lifespan = 5000;

  stamps.push({
    gfx,
    x,
    y,
    rot,
    size,
    created: millis(),
    lifespan,

    // NEW
    isFading: false,
    fadeStartTime: null
  });

  return false;
}

function touchStarted() {
  mousePressed();
  return false;
}

function mouseReleased() {

  // begin fading all stamps once released
  for (let s of stamps) {
    s.isFading = true;
  }

  return false;
}

// Create a p5.Graphics containing a stamped shape
function createStampGraphic(size, color, type) {
  const g = createGraphics(size, size);
  g.pixelDensity(1);
  g.clear();
  g.noStroke();

  // center
  const cx = size/2;
  const cy = size/2;

  g.push();
  g.translate(cx, cy);

  // set color mode and convert to array expected by helpers
  let colorArr = color;

  if (color && color.mode === 'HSB') {
    g.colorMode(HSB, 360, 100, 100);
    colorArr = [color.h, color.s, color.b];
  } else {
    g.colorMode(RGB, 255);
  }

  if (type === 'roughCircle') {
    drawRoughCircle(g, 0, 0, size*0.8, colorArr);

  } else if (type === 'roughRect') {
    drawRoughRect(g, -size*0.35, -size*0.25, size*0.7, size*0.5, colorArr);

  } else if (type === 'star') {
    drawStar(g, 0, 0, size*0.18, size*0.4, 5, colorArr);

  } else if (type === 'splotch') {
    drawSplotch(g, 0, 0, size*0.45, colorArr);

  } else if (type === 'oval') {
    drawRoughEllipse(g, 0, 0, size*0.6, size*0.35, colorArr);

  } else {
    drawSplotch(g, 0, 0, size*0.45, colorArr);
  }

  g.pop();
  return g;
}

// helpers to draw rough hand-painted shapes onto a graphics buffer
function drawRoughCircle(g, x, y, d, color) {
  g.fill(color[0], color[1], color[2]);

  g.beginShape();

  const r = d/2;

  for (let a = 0; a < TWO_PI; a += radians(10)) {
    const rr = r + random(-r*0.12, r*0.12);

    g.vertex(
      x + cos(a)*rr,
      y + sin(a)*rr
    );
  }

  g.endShape(CLOSE);
}

function drawRoughEllipse(g, x, y, w, h, color) {
  g.fill(color[0], color[1], color[2]);

  g.beginShape();

  for (let a = 0; a < TWO_PI; a += radians(8)) {

    const rx = w/2 + random(-w*0.06, w*0.06);
    const ry = h/2 + random(-h*0.06, h*0.06);

    g.vertex(
      x + cos(a)*rx,
      y + sin(a)*ry
    );
  }

  g.endShape(CLOSE);
}

function drawRoughRect(g, x, y, w, h, color) {
  g.fill(color[0], color[1], color[2]);

  g.beginShape();

  const steps = 20;

  for (let i = 0; i <= steps; i++) {
    const t = i/steps;

    const px = lerp(x, x+w, t) + random(-w*0.04, w*0.04);
    const py = y + random(-h*0.05, h*0.05);

    g.vertex(px, py);
  }

  for (let i = 0; i <= steps; i++) {
    const t = i/steps;

    const px = x + w + random(-w*0.04, w*0.04);
    const py = lerp(y, y+h, t) + random(-h*0.05, h*0.05);

    g.vertex(px, py);
  }

  for (let i = 0; i <= steps; i++) {
    const t = i/steps;

    const px = lerp(x+w, x, t) + random(-w*0.04, w*0.04);
    const py = y + h + random(-h*0.05, h*0.05);

    g.vertex(px, py);
  }

  for (let i = 0; i <= steps; i++) {
    const t = i/steps;

    const px = x + random(-w*0.04, w*0.04);
    const py = lerp(y+h, y, t) + random(-h*0.05, h*0.05);

    g.vertex(px, py);
  }

  g.endShape(CLOSE);
}

function drawStar(g, x, y, r1, r2, npoints, color) {

  g.fill(color[0], color[1], color[2]);

  g.beginShape();

  const angle = TWO_PI / npoints;

  for (let a = 0; a < TWO_PI; a += angle) {

    const ax = x + cos(a) * (r2 + random(-r2*0.08, r2*0.08));
    const ay = y + sin(a) * (r2 + random(-r2*0.08, r2*0.08));

    g.vertex(ax, ay);

    const bx = x + cos(a + angle/2) * (r1 + random(-r1*0.08, r1*0.08));
    const by = y + sin(a + angle/2) * (r1 + random(-r1*0.08, r1*0.08));

    g.vertex(bx, by);
  }

  g.endShape(CLOSE);
}

function drawSplotch(g, x, y, size, color) {

  g.fill(color[0], color[1], color[2]);

  const steps = 18;

  g.beginShape();

  for (let i = 0; i < steps; i++) {

    const a = map(i, 0, steps, 0, TWO_PI);

    const r = size * 0.5 * (
      0.6 + noise(i*0.3, millis()*0.0005)
    );

    const rr = r + random(-size*0.06, size*0.06);

    g.vertex(
      x + cos(a) * rr,
      y + sin(a) * rr
    );
  }

  g.endShape(CLOSE);
}