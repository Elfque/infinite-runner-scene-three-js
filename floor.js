import * as three from "three";

let speedZ = 0.03; // small diagonal movement

const textureSize = 1024; // high-res makes edges sharp
const canvas = document.createElement("canvas");
canvas.width = textureSize;
canvas.height = textureSize;
const ctx = canvas.getContext("2d");

// Draw a detailed tile pattern: alternating colored squares + subtle glowing lines
const drawTileTexture = () => {
  const size = textureSize;
  const tileSize = 128; // each tile is 128x128 pixels -> good repeat count
  const cols = size / tileSize;
  const rows = size / tileSize;

  // Background dark metallic
  ctx.fillStyle = "#2a2e45";
  ctx.fillRect(0, 0, size, size);

  // Draw grid lines (bright cyan/blue)
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#4affff";
  ctx.shadowBlur = 0;

  for (let i = 0; i <= cols; i++) {
    const x = i * tileSize;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, size);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, x);
    ctx.lineTo(size, x);
    ctx.stroke();
  }

  // Draw inner diagonal accents for better movement perception
  ctx.lineWidth = 2;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * tileSize;
      const y = row * tileSize;
      // Alternate tile color fill (soft cyan / dark purple)
      if ((row + col) % 2 === 0) {
        ctx.fillStyle = "#3d426b";
        ctx.fillRect(x + 2, y + 2, tileSize - 4, tileSize - 4);
      } else {
        ctx.fillStyle = "#252a47";
        ctx.fillRect(x + 2, y + 2, tileSize - 4, tileSize - 4);
      }
      // Add a small glowing dot in center of each tile (tech style)
      ctx.fillStyle = "#88ccff";
      ctx.shadowBlur = 6;
      ctx.shadowColor = "#00aaff";
      ctx.beginPath();
      ctx.arc(x + tileSize / 2, y + tileSize / 2, 6, 0, Math.PI * 2);
      ctx.fill();
      // Reset shadow
      ctx.shadowBlur = 0;

      // inner border highlight
      ctx.strokeStyle = "#88aaff";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x + 4, y + 4, tileSize - 8, tileSize - 8);
    }
  }

  // Add some thin diagonal lines for a "speed" feel
  ctx.beginPath();
  ctx.strokeStyle = "#ffffff66";
  ctx.lineWidth = 1;
  for (let k = -size; k < size * 2; k += 45) {
    ctx.moveTo(k, 0);
    ctx.lineTo(k + size, size);
    ctx.stroke();
    ctx.moveTo(0, k);
    ctx.lineTo(size, k + size);
    ctx.stroke();
  }
};

drawTileTexture();

const floorTexture = new three.CanvasTexture(canvas);
floorTexture.wrapS = three.RepeatWrapping;
floorTexture.wrapT = three.RepeatWrapping;
const repeatVal = 4.5;
floorTexture.repeat.set(repeatVal, repeatVal);
floorTexture.needsUpdate = true;

const floorMaterial = new three.MeshStandardMaterial({
  map: floorTexture,
  roughness: 0.35,
  metalness: 0.7,
  emissive: new three.Color(0x111122),
  emissiveIntensity: 0.2,
  side: three.DoubleSide, // not really needed, but looks interesting from below if camera goes under
});

// Geometry: a large plane to act as floor
const floorWidth = 20;
const floorDepth = 30;
const floorGeometry = new three.PlaneGeometry(floorWidth, floorDepth);
const floorMesh = new three.Mesh(floorGeometry, floorMaterial);
floorMesh.rotation.x = -Math.PI / 2;
floorMesh.position.y = 0;
floorMesh.position.z = -9;
floorMesh.receiveShadow = true;
floorMesh.castShadow = false; // floor doesn't cast shadow but receives from objects

export { floorMesh, speedZ, floorTexture };
