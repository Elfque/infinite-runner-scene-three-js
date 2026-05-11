import * as three from "three";

const pointsGeometry = new three.BufferGeometry();
const pointCount = 2000;
const pointsArray = new Float32Array(pointCount * 3);

for (let i = 0; i < pointCount; i++) {
  pointsArray[i * 3] = (Math.random() - 0.5) * 20;
  pointsArray[i * 3 + 1] = (Math.random() - 0.5) * 20;
  pointsArray[i * 3 + 2] = (Math.random() - 0.5) * 20;
}

pointsGeometry.setAttribute(
  "position",
  new three.BufferAttribute(pointsArray, 3),
);
const pointMaterial = new three.PointsMaterial({
  size: 0.02,
  sizeAttenuation: true,
  color: "#14FF09",
  transparent: true,
  opacity: 0.5,
});

const pointMesh = new three.Points(pointsGeometry, pointMaterial);
export { pointMesh };
