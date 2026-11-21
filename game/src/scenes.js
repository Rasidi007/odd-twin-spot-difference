// The four scenes of Odd Twin, each drawn in code with canvas primitives: no image files.
// A scene is a base picture plus a list of differences. Each difference draws its detail
// twice: drawA on the left panel, drawB on the right. A difference can change a colour, move
// a detail, or remove it entirely (drawB draws nothing). Panel-local coordinates are 560 x 400.

import { bird, circle, cloud, ellipse, flower, glow, pine, roundRect, star, triangle, vGradient } from './draw.js';

// ---------------------------------------------------------------------------
// Small scene-local helpers
// ---------------------------------------------------------------------------

function butterfly(ctx, x, y, wing) {
  ellipse(ctx, x - 10, y - 6, 10, 13, wing, -0.5);
  ellipse(ctx, x + 10, y - 6, 10, 13, wing, 0.5);
  ellipse(ctx, x - 8, y + 8, 7, 9, wing, 0.4);
  ellipse(ctx, x + 8, y + 8, 7, 9, wing, -0.4);
  ctx.strokeStyle = '#33302e';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y - 12);
  ctx.lineTo(x, y + 12);
  ctx.stroke();
}

function sunRays(ctx, x, y, count, length) {
  ctx.strokeStyle = '#ffcf3d';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  for (let i = 0; i < count; i += 1) {
    const angle = (i * Math.PI * 2) / count;
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(angle) * 40, y + Math.sin(angle) * 40);
    ctx.lineTo(x + Math.cos(angle) * (40 + length), y + Math.sin(angle) * (40 + length));
    ctx.stroke();
  }
}

function flame(ctx, x, y, scale, color) {
  ctx.beginPath();
  ctx.moveTo(x, y - 26 * scale);
  ctx.quadraticCurveTo(x + 14 * scale, y - 6 * scale, x + 8 * scale, y + 6 * scale);
  ctx.quadraticCurveTo(x, y + 12 * scale, x - 8 * scale, y + 6 * scale);
  ctx.quadraticCurveTo(x - 14 * scale, y - 6 * scale, x, y - 26 * scale);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

function clockHands(ctx, x, y, hourAngle, minuteAngle) {
  ctx.strokeStyle = '#2b2118';
  ctx.lineCap = 'round';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + Math.cos(hourAngle) * 12, y + Math.sin(hourAngle) * 12);
  ctx.stroke();
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + Math.cos(minuteAngle) * 19, y + Math.sin(minuteAngle) * 19);
  ctx.stroke();
  circle(ctx, x, y, 3, '#2b2118');
}

// ---------------------------------------------------------------------------
// Scene 1 — Sunny Garden (easy, 6 differences)
// ---------------------------------------------------------------------------

function drawGardenBase(ctx) {
  vGradient(ctx, 0, 0, 560, 400, '#6ec1f5', '#dff3ff');
  glow(ctx, 80, 70, 70, 'rgba(255, 217, 77, 0.55)');
  circle(ctx, 80, 70, 34, '#ffd94d');
  cloud(ctx, 250, 55, 1);
  cloud(ctx, 440, 40, 0.8);
  // Rolling lawn.
  ctx.fillStyle = '#79c25e';
  ctx.fillRect(0, 280, 560, 120);
  ellipse(ctx, 120, 292, 220, 26, '#8ed06e');
  ellipse(ctx, 450, 296, 200, 24, '#8ed06e');
  // Cottage.
  ctx.fillStyle = '#f7ead2';
  ctx.fillRect(110, 205, 150, 115);
  triangle(ctx, 100, 208, 185, 140, 270, 208, '#c65b4e');
  ctx.fillStyle = '#7a4a2b';
  ctx.fillRect(168, 255, 34, 65);
  circle(ctx, 196, 288, 3, '#ffd94d');
  ctx.fillStyle = '#bfe6f7';
  ctx.fillRect(128, 225, 28, 28);
  ctx.strokeStyle = '#7a4a2b';
  ctx.lineWidth = 3;
  ctx.strokeRect(128, 225, 28, 28);
  // Garden path.
  ctx.fillStyle = '#e8d9b8';
  ctx.beginPath();
  ctx.moveTo(168, 320);
  ctx.lineTo(202, 320);
  ctx.lineTo(216, 400);
  ctx.lineTo(154, 400);
  ctx.closePath();
  ctx.fill();
  // Tree.
  ctx.fillStyle = '#6b4a2f';
  ctx.fillRect(452, 235, 18, 85);
  circle(ctx, 430, 200, 34, '#3f8f4f');
  circle(ctx, 480, 195, 36, '#3f8f4f');
  circle(ctx, 458, 168, 32, '#4da85e');
  // Fence with a gap at x = 336 where a post may appear.
  ctx.fillStyle = '#a98052';
  ctx.fillRect(0, 338, 560, 6);
  ctx.fillRect(0, 360, 560, 6);
  for (let x = 48; x <= 528; x += 48) {
    if (x === 336) continue;
    ctx.fillRect(x - 4, 328, 8, 46);
  }
  // Base flowers.
  flower(ctx, 80, 368, '#ff6b81');
  flower(ctx, 200, 378, '#ffb347');
  flower(ctx, 420, 372, '#ff6b81');
  flower(ctx, 520, 356, '#ffb347');
  // Grass tufts.
  ctx.strokeStyle = '#4c9a45';
  ctx.lineWidth = 2;
  for (const [x, y] of [[40, 330], [290, 310], [360, 380], [500, 330], [150, 350]]) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x - 4, y - 10);
    ctx.moveTo(x + 4, y);
    ctx.lineTo(x + 6, y - 9);
    ctx.stroke();
  }
}

const GARDEN_DIFFERENCES = [
  {
    name: 'A bird in the sky',
    x: 380, y: 80, r: 26,
    drawA: (ctx) => bird(ctx, 380, 80, 1.2),
    drawB: () => {},
  },
  {
    name: 'Rays around the sun',
    x: 80, y: 70, r: 30,
    drawA: (ctx) => sunRays(ctx, 80, 70, 8, 14),
    drawB: (ctx) => sunRays(ctx, 80, 70, 4, 14),
  },
  {
    name: 'The colour of a flower',
    x: 310, y: 335, r: 24,
    drawA: (ctx) => flower(ctx, 310, 335, '#e63946'),
    drawB: (ctx) => flower(ctx, 310, 335, '#7c4dff'),
  },
  {
    name: 'The colour of a butterfly',
    x: 430, y: 190, r: 26,
    drawA: (ctx) => butterfly(ctx, 430, 190, '#ff8c42'),
    drawB: (ctx) => butterfly(ctx, 430, 190, '#4da6ff'),
  },
  {
    name: 'Apples on the tree',
    x: 458, y: 195, r: 30,
    drawA: (ctx) => {
      circle(ctx, 438, 190, 7, '#e63946');
      circle(ctx, 476, 205, 7, '#e63946');
      circle(ctx, 458, 168, 7, '#e63946');
    },
    drawB: (ctx) => circle(ctx, 438, 190, 7, '#e63946'),
  },
  {
    name: 'A missing fence post',
    x: 336, y: 350, r: 22,
    drawA: (ctx) => { ctx.fillStyle = '#a98052'; ctx.fillRect(332, 328, 8, 46); },
    drawB: () => {},
  },
];

// ---------------------------------------------------------------------------
// Scene 2 — Harbor at Dusk (medium, 7 differences)
// ---------------------------------------------------------------------------

function drawHarborBase(ctx) {
  vGradient(ctx, 0, 0, 560, 230, '#2c3e6b', '#f7a86b');
  glow(ctx, 420, 150, 80, 'rgba(255, 166, 88, 0.6)');
  circle(ctx, 420, 150, 30, '#ff9e57');
  // Sea.
  vGradient(ctx, 0, 230, 560, 170, '#2b5d7a', '#16324a');
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = 2;
  for (const [x, y, len] of [[40, 260, 60], [180, 300, 80], [320, 265, 70], [440, 320, 60], [120, 350, 90], [300, 360, 70]]) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + len, y);
    ctx.stroke();
  }
  // Sun glitter on the water.
  ctx.fillStyle = 'rgba(255, 180, 110, 0.35)';
  for (const [x, y, w] of [[400, 240, 70], [410, 255, 50], [395, 272, 60]]) ctx.fillRect(x, y, w, 4);
  // Lighthouse.
  ctx.fillStyle = '#e8e4da';
  ctx.fillRect(70, 95, 52, 185);
  ctx.fillStyle = '#c65b4e';
  ctx.fillRect(70, 130, 52, 22);
  ctx.fillRect(70, 195, 52, 22);
  ctx.fillStyle = '#2b3a55';
  ctx.fillRect(66, 78, 60, 20);
  circle(ctx, 96, 88, 9, '#ffe08a');
  triangle(ctx, 64, 78, 96, 58, 128, 78, '#2b3a55');
  // Rocks under the lighthouse.
  ctx.fillStyle = '#5b6b7a';
  ellipse(ctx, 60, 285, 46, 16, '#5b6b7a');
  ellipse(ctx, 130, 288, 40, 14, '#4c5b68');
  // Dock.
  ctx.fillStyle = '#8a6a45';
  ctx.fillRect(0, 330, 260, 70);
  ctx.strokeStyle = '#6b4f31';
  ctx.lineWidth = 2;
  for (let x = 26; x < 260; x += 26) {
    ctx.beginPath();
    ctx.moveTo(x, 330);
    ctx.lineTo(x, 400);
    ctx.stroke();
  }
  // Sailboat hull and mast (the sail is a difference).
  ctx.fillStyle = '#7a4a2b';
  ctx.beginPath();
  ctx.moveTo(285, 275);
  ctx.lineTo(385, 275);
  ctx.lineTo(365, 300);
  ctx.lineTo(305, 300);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#5b3a22';
  ctx.fillRect(332, 180, 5, 96);
  // Boathouse on stilts.
  ctx.fillStyle = '#7a4a2b';
  ctx.fillRect(445, 250, 8, 60);
  ctx.fillRect(525, 250, 8, 60);
  ctx.fillStyle = '#d9c7a7';
  ctx.fillRect(435, 175, 105, 80);
  triangle(ctx, 428, 178, 487, 138, 547, 178, '#8a4a3b');
  ctx.strokeStyle = '#7a4a2b';
  ctx.lineWidth = 3;
  ctx.strokeRect(472, 198, 30, 30);
  // Two gulls in the base picture; a third may join them.
  bird(ctx, 200, 60, 1);
  bird(ctx, 255, 92, 0.85);
}

const HARBOR_DIFFERENCES = [
  {
    name: 'The lighthouse beam',
    x: 180, y: 100, r: 30,
    drawA: (ctx) => {
      const gradient = ctx.createLinearGradient(105, 88, 300, 88);
      gradient.addColorStop(0, 'rgba(255, 224, 138, 0.85)');
      gradient.addColorStop(1, 'rgba(255, 224, 138, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(105, 82);
      ctx.lineTo(300, 55);
      ctx.lineTo(300, 125);
      ctx.closePath();
      ctx.fill();
    },
    drawB: () => {},
  },
  {
    name: 'The colour of the sail',
    x: 335, y: 225, r: 30,
    drawA: (ctx) => triangle(ctx, 337, 185, 337, 270, 385, 270, '#fdf6e3'),
    drawB: (ctx) => triangle(ctx, 337, 185, 337, 270, 385, 270, '#c65b4e'),
  },
  {
    name: 'A third gull',
    x: 330, y: 55, r: 24,
    drawA: (ctx) => bird(ctx, 330, 55, 0.9),
    drawB: () => {},
  },
  {
    name: 'The flag on the lighthouse',
    x: 108, y: 66, r: 20,
    drawA: (ctx) => triangle(ctx, 96, 58, 96, 74, 124, 66, '#e63946'),
    drawB: (ctx) => triangle(ctx, 96, 58, 96, 74, 68, 66, '#4da6ff'),
  },
  {
    name: 'A crate on the dock',
    x: 150, y: 312, r: 26,
    drawA: (ctx) => {
      ctx.fillStyle = '#c99a5b';
      ctx.fillRect(130, 292, 40, 40);
      ctx.strokeStyle = '#8a6a45';
      ctx.lineWidth = 3;
      ctx.strokeRect(130, 292, 40, 40);
      ctx.beginPath();
      ctx.moveTo(130, 292);
      ctx.lineTo(170, 332);
      ctx.moveTo(170, 292);
      ctx.lineTo(130, 332);
      ctx.stroke();
    },
    drawB: () => {},
  },
  {
    name: 'A buoy in the water',
    x: 250, y: 350, r: 24,
    drawA: (ctx) => {
      circle(ctx, 250, 352, 12, '#e63946');
      ctx.fillStyle = '#ffd94d';
      ctx.fillRect(247, 330, 6, 14);
    },
    drawB: () => {},
  },
  {
    name: 'Light in the boathouse window',
    x: 487, y: 213, r: 22,
    drawA: (ctx) => { ctx.fillStyle = '#ffe08a'; ctx.fillRect(472, 198, 30, 30); },
    drawB: (ctx) => { ctx.fillStyle = '#2b3a55'; ctx.fillRect(472, 198, 30, 30); },
  },
];

// ---------------------------------------------------------------------------
// Scene 3 — Moonlit Library (hard, 8 differences)
// ---------------------------------------------------------------------------

function drawLibraryBase(ctx) {
  ctx.fillStyle = '#3a2f4d';
  ctx.fillRect(0, 0, 560, 400);
  ctx.fillStyle = '#6b4a2f';
  ctx.fillRect(0, 330, 560, 70);
  ctx.fillStyle = '#5b3d26';
  for (let x = 0; x < 560; x += 70) ctx.fillRect(x, 330, 3, 70);
  // Window with night sky (the moon is a difference).
  ctx.fillStyle = '#16233f';
  ctx.fillRect(400, 55, 125, 130);
  star(ctx, 425, 80, 5, '#fff7c0');
  star(ctx, 495, 70, 4, '#fff7c0');
  star(ctx, 510, 120, 4, '#fff7c0');
  star(ctx, 430, 150, 3, '#fff7c0');
  ctx.strokeStyle = '#8a6a45';
  ctx.lineWidth = 6;
  ctx.strokeRect(400, 55, 125, 130);
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(462, 55);
  ctx.lineTo(462, 185);
  ctx.moveTo(400, 120);
  ctx.lineTo(525, 120);
  ctx.stroke();
  // Bookshelf with one empty slot on the middle shelf.
  ctx.fillStyle = '#7a4a2b';
  ctx.fillRect(35, 50, 170, 260);
  ctx.fillStyle = '#5b3a22';
  ctx.fillRect(45, 60, 150, 240);
  const bookColors = ['#c65b4e', '#4da6ff', '#ffd94d', '#7c4dff', '#ff8c42', '#3f8f4f'];
  for (let shelf = 0; shelf < 3; shelf += 1) {
    const y = 70 + shelf * 80;
    for (let i = 0; i < 7; i += 1) {
      if (shelf === 1 && i === 3) continue; // the difference book's slot
      ctx.fillStyle = bookColors[(shelf * 7 + i) % bookColors.length];
      ctx.fillRect(52 + i * 20, y, 15, 55);
    }
    ctx.fillStyle = '#7a4a2b';
    ctx.fillRect(45, y + 55, 150, 8);
  }
  // Wall clock (the hands are a difference).
  circle(ctx, 285, 95, 30, '#2b2118');
  circle(ctx, 285, 95, 26, '#f7ead2');
  // Desk.
  ctx.fillStyle = '#8a6a45';
  ctx.fillRect(320, 260, 210, 12);
  ctx.fillRect(330, 272, 12, 58);
  ctx.fillRect(508, 272, 12, 58);
  // Lamp on the desk (its glow is a difference).
  ctx.fillStyle = '#2b3a55';
  ctx.fillRect(348, 252, 26, 8);
  ctx.fillRect(359, 205, 4, 48);
  triangle(ctx, 340, 208, 361, 178, 382, 208, '#c65b4e');
  circle(ctx, 361, 212, 6, '#ffe08a');
  // Teacup (its steam is a difference).
  ctx.fillStyle = '#fdf6e3';
  roundRect(ctx, 472, 238, 26, 20, 4, '#fdf6e3');
  ctx.strokeStyle = '#fdf6e3';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(500, 248, 7, -Math.PI / 2, Math.PI / 2);
  ctx.stroke();
  // Rug (its pattern is a difference).
  ellipse(ctx, 210, 350, 130, 26, '#8a3b3b');
  // Cat sitting on the rug (its tail is a difference).
  ctx.fillStyle = '#2b2b33';
  ellipse(ctx, 200, 322, 26, 30, '#2b2b33');
  circle(ctx, 200, 282, 17, '#2b2b33');
  triangle(ctx, 188, 272, 192, 258, 198, 270, '#2b2b33');
  triangle(ctx, 202, 270, 208, 258, 212, 272, '#2b2b33');
  circle(ctx, 194, 280, 2.5, '#ffd94d');
  circle(ctx, 206, 280, 2.5, '#ffd94d');
}

const LIBRARY_DIFFERENCES = [
  {
    name: 'The time on the clock',
    x: 285, y: 95, r: 28,
    drawA: (ctx) => clockHands(ctx, 285, 95, 0, -Math.PI / 2),
    drawB: (ctx) => clockHands(ctx, 285, 95, Math.PI / 2, -Math.PI / 2),
  },
  {
    name: "The cat's tail",
    x: 232, y: 300, r: 24,
    drawA: (ctx) => {
      ctx.strokeStyle = '#2b2b33';
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(224, 330);
      ctx.quadraticCurveTo(248, 320, 240, 292);
      ctx.stroke();
    },
    drawB: (ctx) => {
      ctx.strokeStyle = '#2b2b33';
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(224, 338);
      ctx.quadraticCurveTo(250, 348, 262, 338);
      ctx.stroke();
    },
  },
  {
    name: 'The colour of one book',
    x: 119, y: 177, r: 20,
    drawA: (ctx) => { ctx.fillStyle = '#3f8f4f'; ctx.fillRect(112, 150, 15, 55); },
    drawB: (ctx) => { ctx.fillStyle = '#c65b4e'; ctx.fillRect(112, 150, 15, 55); },
  },
  {
    name: 'A globe on the desk',
    x: 430, y: 232, r: 26,
    drawA: (ctx) => {
      ctx.fillStyle = '#5b3a22';
      ctx.fillRect(426, 250, 8, 10);
      circle(ctx, 430, 232, 18, '#4da6ff');
      ellipse(ctx, 424, 228, 8, 6, '#3f8f4f', 0.5);
      ellipse(ctx, 436, 240, 6, 5, '#3f8f4f', -0.4);
    },
    drawB: () => {},
  },
  {
    name: 'The lamp is lit',
    x: 361, y: 205, r: 28,
    drawA: (ctx) => {
      glow(ctx, 361, 210, 60, 'rgba(255, 224, 138, 0.5)');
      circle(ctx, 361, 212, 6, '#fff3b0');
    },
    drawB: (ctx) => circle(ctx, 361, 212, 6, '#8a8a92'),
  },
  {
    name: 'Steam over the teacup',
    x: 485, y: 222, r: 20,
    drawA: (ctx) => {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      for (const x of [480, 490]) {
        ctx.beginPath();
        ctx.moveTo(x, 236);
        ctx.quadraticCurveTo(x - 5, 226, x, 216);
        ctx.quadraticCurveTo(x + 5, 208, x, 200);
        ctx.stroke();
      }
    },
    drawB: () => {},
  },
  {
    name: 'The phase of the moon',
    x: 462, y: 95, r: 24,
    drawA: (ctx) => circle(ctx, 462, 95, 17, '#fdf6e3'),
    drawB: (ctx) => {
      circle(ctx, 462, 95, 17, '#fdf6e3');
      circle(ctx, 470, 90, 15, '#16233f');
    },
  },
  {
    name: 'The pattern on the rug',
    x: 210, y: 350, r: 30,
    drawA: (ctx) => {
      ctx.strokeStyle = 'rgba(255, 217, 77, 0.8)';
      ctx.lineWidth = 4;
      for (const x of [150, 190, 230, 270]) {
        ctx.beginPath();
        ctx.moveTo(x, 332);
        ctx.lineTo(x, 368);
        ctx.stroke();
      }
    },
    drawB: (ctx) => {
      ctx.fillStyle = 'rgba(255, 217, 77, 0.8)';
      for (const [x, y] of [[150, 345], [185, 358], [220, 342], [255, 358], [130, 358], [275, 345]]) {
        circle(ctx, x, y, 4, 'rgba(255, 217, 77, 0.8)');
      }
    },
  },
];

// ---------------------------------------------------------------------------
// Scene 4 — Mountain Camp (expert, 8 differences)
// ---------------------------------------------------------------------------

function drawCampBase(ctx) {
  vGradient(ctx, 0, 0, 560, 280, '#0e1830', '#274b73');
  // Stars (one more may appear).
  const stars = [[60, 50], [130, 80], [200, 40], [250, 110], [350, 60], [410, 120], [520, 90], [90, 140], [180, 150], [470, 160], [320, 140], [30, 200]];
  for (const [x, y] of stars) star(ctx, x, y, 4, '#fff7c0');
  // Mountains.
  triangle(ctx, 0, 280, 130, 120, 280, 280, '#33456b');
  triangle(ctx, 100, 280, 140, 165, 180, 280, '#e8eef7');
  triangle(ctx, 200, 280, 330, 100, 470, 280, '#2a3a5e');
  triangle(ctx, 295, 280, 330, 150, 365, 280, '#e8eef7');
  triangle(ctx, 400, 280, 500, 150, 560, 280, '#33456b');
  // Ground.
  ctx.fillStyle = '#1e4632';
  ctx.fillRect(0, 280, 560, 120);
  ellipse(ctx, 150, 292, 240, 22, '#26573e');
  ellipse(ctx, 450, 296, 220, 20, '#26573e');
  // Tent (its door is a difference).
  triangle(ctx, 110, 330, 185, 215, 260, 330, '#e8722a');
  triangle(ctx, 110, 330, 185, 215, 185, 330, '#d95f1e');
  ctx.strokeStyle = '#8a4a1a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(185, 215);
  ctx.lineTo(185, 330);
  ctx.stroke();
  // Campfire stones and logs (flames and smoke are differences).
  ctx.fillStyle = '#5b6b7a';
  for (const [x, y] of [[310, 352], [330, 358], [352, 356], [368, 348], [300, 340]]) circle(ctx, x, y, 7, '#5b6b7a');
  ctx.strokeStyle = '#6b4a2f';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(312, 344);
  ctx.lineTo(362, 336);
  ctx.moveTo(360, 346);
  ctx.lineTo(314, 336);
  ctx.stroke();
  // Lantern pole (the lantern's glow is a difference).
  ctx.strokeStyle = '#4c3a28';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(470, 300);
  ctx.lineTo(470, 210);
  ctx.lineTo(500, 210);
  ctx.stroke();
  ctx.strokeStyle = '#2b2b33';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(500, 210);
  ctx.lineTo(500, 224);
  ctx.stroke();
  ctx.fillStyle = '#2b2b33';
  roundRect(ctx, 490, 224, 20, 26, 4, '#2b2b33');
  ctx.fillStyle = '#ffe08a';
  ctx.fillRect(494, 228, 12, 18);
  // Base pine trees.
  pine(ctx, 60, 320, 1);
  pine(ctx, 300, 300, 0.7);
  // Backpack (its pocket is a difference).
  roundRect(ctx, 238, 330, 44, 52, 12, '#4a6b8a');
  ctx.fillStyle = '#3a5570';
  ctx.fillRect(238, 348, 44, 8);
  ctx.strokeStyle = '#2b3a55';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(246, 330);
  ctx.lineTo(246, 318);
  ctx.moveTo(274, 330);
  ctx.lineTo(274, 318);
  ctx.stroke();
}

const CAMP_DIFFERENCES = [
  {
    name: 'The tent door',
    x: 185, y: 300, r: 28,
    drawA: (ctx) => triangle(ctx, 168, 330, 185, 272, 202, 330, '#3a2418'),
    drawB: (ctx) => {
      triangle(ctx, 168, 330, 185, 272, 202, 330, '#e8722a');
      ctx.strokeStyle = '#8a4a1a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(185, 272);
      ctx.lineTo(185, 330);
      ctx.stroke();
    },
  },
  {
    name: 'The flames of the fire',
    x: 336, y: 322, r: 28,
    drawA: (ctx) => {
      flame(ctx, 322, 336, 0.9, '#ff8c42');
      flame(ctx, 336, 330, 1.1, '#ff6b35');
      flame(ctx, 350, 336, 0.9, '#ff8c42');
      flame(ctx, 336, 340, 0.6, '#ffd94d');
    },
    drawB: (ctx) => {
      flame(ctx, 326, 336, 0.9, '#ff8c42');
      flame(ctx, 346, 336, 0.9, '#ff8c42');
    },
  },
  {
    name: 'An extra star',
    x: 300, y: 50, r: 22,
    drawA: (ctx) => star(ctx, 300, 50, 6, '#fff7c0'),
    drawB: () => {},
  },
  {
    name: "The lantern's glow",
    x: 500, y: 237, r: 28,
    drawA: (ctx) => glow(ctx, 500, 237, 55, 'rgba(255, 224, 138, 0.55)'),
    drawB: () => {},
  },
  {
    name: 'An extra pine tree',
    x: 525, y: 310, r: 28,
    drawA: (ctx) => pine(ctx, 525, 310, 0.8),
    drawB: () => {},
  },
  {
    name: 'A pocket on the backpack',
    x: 260, y: 366, r: 22,
    drawA: (ctx) => roundRect(ctx, 248, 356, 24, 18, 5, '#3a5570'),
    drawB: () => {},
  },
  {
    name: 'The moon',
    x: 490, y: 55, r: 26,
    drawA: (ctx) => {
      circle(ctx, 490, 55, 18, '#fdf6e3');
      circle(ctx, 497, 50, 15, '#16233f');
    },
    drawB: () => {},
  },
  {
    name: 'Smoke from the fire',
    x: 336, y: 290, r: 26,
    drawA: (ctx) => {
      ctx.fillStyle = 'rgba(200, 200, 210, 0.4)';
      circle(ctx, 332, 300, 9, 'rgba(200, 200, 210, 0.4)');
      circle(ctx, 340, 282, 12, 'rgba(200, 200, 210, 0.3)');
      circle(ctx, 330, 264, 14, 'rgba(200, 200, 210, 0.22)');
    },
    drawB: () => {},
  },
];

// ---------------------------------------------------------------------------
// The level list, easiest first.
// ---------------------------------------------------------------------------

export const SCENES = [
  {
    id: 'garden',
    name: 'Sunny Garden',
    tagline: 'A cottage, a tree, a very suspicious flower.',
    difficulty: 'Easy',
    timeLimit: 120,
    drawBase: drawGardenBase,
    differences: GARDEN_DIFFERENCES,
  },
  {
    id: 'harbor',
    name: 'Harbor at Dusk',
    tagline: 'The lighthouse keeper swears nothing changed.',
    difficulty: 'Medium',
    timeLimit: 120,
    drawBase: drawHarborBase,
    differences: HARBOR_DIFFERENCES,
  },
  {
    id: 'library',
    name: 'Moonlit Library',
    tagline: 'The cat knows. The cat is not telling.',
    difficulty: 'Hard',
    timeLimit: 150,
    drawBase: drawLibraryBase,
    differences: LIBRARY_DIFFERENCES,
  },
  {
    id: 'camp',
    name: 'Mountain Camp',
    tagline: 'Something moved while the fire burned low.',
    difficulty: 'Expert',
    timeLimit: 150,
    drawBase: drawCampBase,
    differences: CAMP_DIFFERENCES,
  },
];

/** Draw one panel of a scene: the base, then that side's version of every difference. */
export function drawScenePanel(ctx, scene, side) {
  scene.drawBase(ctx);
  for (const difference of scene.differences) {
    if (side === 'A') difference.drawA(ctx);
    else difference.drawB(ctx);
  }
}
