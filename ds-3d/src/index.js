const dscc = require('@google/dscc');
const viz = require('@google/dscc-scripts/viz/initialViz.js');
const local = require('./localMessage.js');

// change this to 'true' for local development
// change this to 'false' before deploying
export const LOCAL = false;

import {
  MeshBuilder,
  PointLight,
  Vector3,
  Engine,
  Scene,
  SceneLoader,
  ArcRotateCamera,
  HemisphericLight} from 'babylonjs';


var createScene = function(engine, canvas) {
  // Create the scene space
  var scene = new Scene(engine);

  // Add a camera to the scene and attach it to the canvas
  var camera = new ArcRotateCamera(
    "Camera",
    Math.PI / 2,
    Math.PI / 2,
    2,
    Vector3.Zero(),
    scene
  );
  camera.attachControl(canvas, true);

  // Add lights to the scene
  var light1 = new HemisphericLight(
    "light1",
    new Vector3(1, 1, 0),
    scene
  );
  var light2 = new PointLight(
    "light2",
    new Vector3(0, 1, -1),
    scene
  );

  // This is where you create and manipulate meshes
  var sphere = MeshBuilder.CreateSphere(
    "sphere",
    { diameter: 2 },
    scene
  );

  return scene;
};

// write viz code here
const drawViz = (data) => {
  const canvas = document.createElement('canvas');
  canvas.setAttribute('id', 'renderCanvas');
  document.body.appendChild(canvas);

  const engine = new Engine(canvas, true);
  let scene = createScene(engine, canvas);

  engine.runRenderLoop(() => {
    scene.render();
  });
};

// renders locally
if (LOCAL) {
  drawViz(local.message);
} else {
  dscc.subscribeToData(drawViz, {transform: dscc.objectTransform});
}
