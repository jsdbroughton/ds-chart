const dscc = require('@google/dscc');
const viz = require('@google/dscc-scripts/viz/initialViz.js');
const local = require('./localMessage.js');

// import * as Materials from 'babylonjs-materials';
// import * as GUI from 'babylonjs-gui';
// import {
//   Engine,
//   Scene,
//   ArcRotateCamera,
//   HemisphericLight,
//   Vector3,
//   MeshBuilder,
//   Mesh,
//   SceneLoader
// } from 'babylonjs';

// change this to 'true' for local development
// change this to 'false' before deploying
export const LOCAL = true;

// function createScene(canvas, engine) {
//   var scene = new Scene(engine);
//   console.log(canvas);
//   var camera = new ArcRotateCamera(
//     'Camera',
//     Math.PI / 2,
//     Math.PI / 2,
//     2,
//     Vector3.Zero(),
//     scene
//   );
//   camera.attachControl(canvas, true);

//   // var light1 = new HemisphericLight('light1', new Vector3(1, 1, 0), scene);

//   // var sphere = MeshBuilder.CreateSphere('sphere', { diameter: 1 }, scene);





//   return scene;
// }

// write viz code here
const drawViz = (data) => {
  const canvas = document.createElement('canvas');
  // canvas.setAttribute('id', 'renderCanvas');
  // document.body.appendChild(canvas);

  // console.log(document, canvas, data);

  // const engine = new Engine(canvas, true);
  // let scene = createScene(canvas, engine);

  // engine.runRenderLoop(() => {
  //   scene.render();
  // });
};

// renders locally
if (LOCAL) {
  drawViz(local.message);
} else {
  dscc.subscribeToData(drawViz, { transform: dscc.objectTransform });
}
