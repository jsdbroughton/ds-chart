const dscc = require('@google/dscc');
// const viz = require('@google/dscc-scripts/viz/initialViz.js');
const local = require('./localMessage.js');

// change this to 'true' for local development
// change this to 'false' before deploying
export const LOCAL = false;

// write viz code here
const drawViz = (data) => {
    console.log({ data });

    const face = document.createElement('i');
    face.classList.add('material-icons');
    face.textContent = 'face';

    document.body.appendChild(face);
};

// renders locally
if (LOCAL) {
    drawViz(local.message);
} else {
    dscc.subscribeToData(drawViz, { transform: dscc.objectTransform });
}
