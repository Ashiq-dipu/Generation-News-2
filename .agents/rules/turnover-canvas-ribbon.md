# TurnOver 3D Canvas Spiral Ribbon Architecture & Implementation Guide

## Overview
The TurnOver 3D spiral ribbon effect wraps around a central portrait/bust using a dual-canvas render loop, cubic Bézier arc-length parameterization, tangent-angle alignment, and horizontal foreshortening.

## Key Architecture Principles

### 1. Geometry & Depth Sorting (4 Bézier Sections)
The spiral is defined by 4 cubic Bézier sections with alternating `front` depth flags:
```javascript
const sections = [
  // 1. Upper-right diagonal tail behind avatar
  { front: false, points: [[980, 145], [740, 215], [62, 365], [82, 435]], colors: ["#ffc456", "#ff9939", "#fa7a2b"] },
  // 2. Left-hand curl sweeping in front of chest
  { front: true, points: [[82, 435], [99, 495], [330, 540], [465, 507]], colors: ["#ffb36a", "#ff7e35", "#ed5b20"] },
  // 3. Middle return loop hidden behind neck
  { front: false, points: [[465, 507], [600, 474], [836, 451], [840, 500]], colors: ["#ffbe51", "#ffa135", "#f78a26"] },
  // 4. Broad lower sweep across the foreground
  { front: true, points: [[840, 500], [844, 560], [385, 730], [190, 667]], colors: ["#ffb941", "#ff8b29", "#f1641b"] }
];
```

### 2. Pre-calculated Arc Length Sampling
Sample each Bézier curve (240 samples per section) and record cumulative distances `d`:
```javascript
function bezier(points, t) {
  const u = 1 - t;
  return {
    x: u*u*u*points[0][0] + 3*u*u*t*points[1][0] + 3*u*t*t*points[2][0] + t*t*t*points[3][0],
    y: u*u*u*points[0][1] + 3*u*u*t*points[1][1] + 3*u*t*t*points[2][1] + t*t*t*points[3][1]
  };
}
```
Binary search with `atDistance(section, d)` provides exact $(x, y)$ coordinates and tangent vectors $(\Delta x, \Delta y)$ for uniform text motion speed regardless of curvature.

### 3. Layered Render Pipeline
1. Draw cached `rearSurface` (all `front: false` ribbons + 3D stroke bevels).
2. Render rear section text (`paintText`).
3. Draw Avatar (`ctx.drawImage(avatar, 20, -35, 860, 860 * ratio)`).
4. Draw cached `frontSurface` (all `front: true` ribbons + 3D stroke bevels).
5. Render front section text (`paintText`).

### 4. Text Perspective & Tangent Alignment
- Compute tangent angle: `let angle = Math.atan2(p.dy, p.dx)`.
- Reverse angle if $dx < 0$ (`angle += Math.PI`) to ensure lettering is always upright.
- Foreshorten width based on tilt: `scale = Math.max(0.25, Math.abs(p.dx) / Math.hypot(p.dx, p.dy))`.
- Clip text strictly within the ribbon bounds: `[p.y - half, p.y + half]`.
