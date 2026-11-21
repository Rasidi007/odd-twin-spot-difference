// Small canvas drawing helpers shared by every scene. All of the game's art is drawn
// with these primitives in code, so the game ships no image files at all.

/** Fill a rounded rectangle. */
export function roundRect(ctx, x, y, w, h, r, fill) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
}

/** Fill a circle. */
export function circle(ctx, x, y, r, fill) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
}

/** Fill an ellipse. */
export function ellipse(ctx, x, y, rx, ry, fill, rotation = 0) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, rotation, 0, Math.PI * 2);
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
}

/** Fill a triangle from three points. */
export function triangle(ctx, x1, y1, x2, y2, x3, y3, fill) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x3, y3);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

/** Fill a star with `points` spikes, outer radius r and inner radius r * 0.45. */
export function star(ctx, x, y, r, fill, points = 5) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i += 1) {
    const radius = i % 2 === 0 ? r : r * 0.45;
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const px = x + Math.cos(angle) * radius;
    const py = y + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

/** Fill a vertical gradient rectangle. */
export function vGradient(ctx, x, y, w, h, top, bottom) {
  const gradient = ctx.createLinearGradient(x, y, x, y + h);
  gradient.addColorStop(0, top);
  gradient.addColorStop(1, bottom);
  ctx.fillStyle = gradient;
  ctx.fillRect(x, y, w, h);
}

/** Fill a radial glow centred at (x, y). */
export function glow(ctx, x, y, r, color) {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

/** Draw a soft drop shadow under a shape by stroking a blurred copy first. */
export function withShadow(ctx, blur, color, draw) {
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = blur;
  draw();
  ctx.restore();
}

/** A puffy cloud made of overlapping circles. */
export function cloud(ctx, x, y, scale, fill = '#ffffff') {
  ctx.fillStyle = fill;
  circle(ctx, x, y, 22 * scale, fill);
  circle(ctx, x + 22 * scale, y - 8 * scale, 18 * scale, fill);
  circle(ctx, x + 44 * scale, y, 20 * scale, fill);
  circle(ctx, x + 22 * scale, y + 8 * scale, 18 * scale, fill);
}

/** A simple bird: two curved wing strokes. */
export function bird(ctx, x, y, scale, stroke = '#2b3a55') {
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 2.5 * scale;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 12 * scale, y);
  ctx.quadraticCurveTo(x - 5 * scale, y - 8 * scale, x, y);
  ctx.quadraticCurveTo(x + 5 * scale, y - 8 * scale, x + 12 * scale, y);
  ctx.stroke();
}

/** A pine tree: stacked triangles on a trunk. */
export function pine(ctx, x, y, scale, foliage = '#1f6b3a') {
  ctx.fillStyle = '#6b4a2f';
  ctx.fillRect(x - 4 * scale, y - 6 * scale, 8 * scale, 12 * scale);
  triangle(ctx, x, y - 58 * scale, x - 26 * scale, y - 12 * scale, x + 26 * scale, y - 12 * scale, foliage);
  triangle(ctx, x, y - 78 * scale, x - 20 * scale, y - 34 * scale, x + 20 * scale, y - 34 * scale, foliage);
  triangle(ctx, x, y - 96 * scale, x - 14 * scale, y - 56 * scale, x + 14 * scale, y - 56 * scale, foliage);
}

/** A five-petalled flower on a stem. */
export function flower(ctx, x, y, petal, scale = 1) {
  ctx.strokeStyle = '#2f7a3d';
  ctx.lineWidth = 3 * scale;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + 16 * scale);
  ctx.stroke();
  ctx.fillStyle = petal;
  for (let i = 0; i < 5; i += 1) {
    const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
    circle(ctx, x + Math.cos(angle) * 8 * scale, y + Math.sin(angle) * 8 * scale, 6 * scale, petal);
  }
  circle(ctx, x, y, 5 * scale, '#ffd94d');
}
