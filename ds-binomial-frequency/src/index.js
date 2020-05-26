const dscc = require('@google/dscc');
// const viz = require('@google/dscc-scripts/viz/initialViz.js');
const local = require('./localMessage.js');

// change this to 'true' for local development
// change this to 'false' before deploying
export const LOCAL = false;

// parse the style value
const styleVal = (message, styleId) => {
    return message.style[styleId].value !== undefined
        ? message.style[styleId].value
        : message.style[styleId].defaultValue;
};

function node(sourceNode, { attributes, classes, text }) {
    let node = sourceNode.cloneNode();
    attributes && Object.entries(attributes).forEach(([key, val]) => node.setAttribute(key, val));
    classes && classes.forEach((clas) => node.classList.add(clas));
    node.textContent = text;
    return node;
}

function svgNode(name, ns) {
    return document.createElementNS(ns || 'http://www.w3.org/2000/svg', name);
}

function drawViz(message) {
    let {
        style,
        tables: { DEFAULT: results },
    } = message;

    console.log({ message });

    const count = () => results.length;

    let documentFragment = document.createDocumentFragment();
    const svg = svgNode('svg');
    const defs = svgNode('defs');
    const radialGradient = svgNode('radialGradient');
    const stop = svgNode('stop');
    const g = svgNode('g');
    const rect = svgNode('rect');
    const title = svgNode('title');
    const text = svgNode('text');

    let graph = node(document.createElement('div'), { classes: ['graph'] });

    let resultsMatrix = [
        [50, 70],
        [90, 30],
    ];

    let C1 = 'Criterion 1';
    let C2 = 'Criterion 2';

    let quadrants = [
        { criteria: { C1, C2 }, color: 'lowRiskColor', class: 'full', position: 'top-left' },
        { criteria: { C2 }, color: 'medRiskColor', class: 'partial', position: 'top-right' },
        { criteria: { C1 }, color: 'medRiskColor', class: 'partial', position: 'bottom-left' },
        { criteria: {}, color: 'highRiskColor', class: 'empty', position: 'bottom-right' },
    ];
    let titles = [`${C1} and ${C2}`, `${C2} Only`, `${C1} Only`, 'No Matches'];
    let classes = { 0: 'empty', 1: 'partial', 2: 'full' };

    let m = quadrants.map((quad) => {
        return results.reduce((count, issue) => {
            let {
                criteria: { C1: c1, C2: c2 },
            } = quad;
            let [c_1, c_2] = issue.criteria;

            if (c1 && c2 && c_1 && c_2) count += 1;
            if (c1 && !c2 && c_1 && !c_2) count += 1;
            if (!c1 && c2 && !c_1 && c_2) count += 1;
            if (!c1 && !c2 && !c_1 && !c_2) count += 1;

            return count;
        }, 0);
    });

    resultsMatrix = [
        [m[0], m[1]],
        [m[2], m[3]],
    ];

    const flat = (matrix) => {
        return matrix.reduce((a, v) => a.concat(v), []);
    };

    let graphData = quadrants.map((quad, i) => {
        let row = flat(resultsMatrix)[i];

        const size = Math.sqrt(row / count(resultsMatrix));

        return {
            title: titles[i],
            class: `${classes[Object.keys(quad.criteria).length]} ${quad.position.replace('-', ' ')}`,
            count: row,
            color: quad.color,
            size,
            x: quad.position.includes('right') ? 1 : 1 - size,
            y: quad.position.includes('bottom') ? 1 : 1 - size,
        };
    });

    // set margins + canvas size
    // const margin = { top: 10, bottom: 10, right: 10, left: 10 };
    // const height = dscc.getHeight() - margin.top - margin.bottom;
    // const width = dscc.getWidth() - margin.left - margin.right;

    let chart = node(svg, {
        attributes: { viewBox: '0 0 2 2' },
        classes: ['quadrantGraph'],
    });

    let gradient = node(radialGradient, {
        attributes: { id: 'baseline', cx: 1, cy: 1, r: 2.5 },
    });

    let midStop = node(stop, {
        attributes: {
            offset: '0%',
            'stop-color': styleVal(message, 'stopColor').color,
            'stop-opacity': styleVal(message, 'stopColor').opacity,
        },
        classes: ['stop'],
    });

    let endStop = node(stop, {
        attributes: {
            offset: '100%',
            'stop-color': styleVal(message, 'endColor').color,
            'stop-opacity': styleVal(message, 'endColor').opacity,
        },
        classes: ['stop'],
    });

    gradient.appendChild(midStop);
    gradient.appendChild(endStop);

    defs.appendChild(gradient);
    chart.append(defs);

    // if there is a greater than zero results set.
    let conditional = node(g, { classes: ['conditional'] });
    let quadBaseline = node(g, { classes: ['quad', 'baseline'] });

    graphData.forEach((quadrant, idx) => {
        let quad = node(g, {
            attributes: { key: `quad_${idx}` },
            classes: ['quad'],
        });

        let square = node(rect, {
            attributes: {
                x: quadrant.x,
                y: quadrant.y,
                width: quadrant.size,
                height: quadrant.size,
                fill: style[quadrant.color].value.color,
            },
            classes: ['quadrant', quadrant.class.split(' ')],
        });

        let label = node(title, { text: `${quadrant.title} - ${quadrant.count}` });
        square.appendChild(label);
        quad.appendChild(square);
        quadBaseline.appendChild(quad);
    });

    graphData.forEach((quadrant, idx) => {
        let label = node(text, {
            attributes: {
                key: `text_${idx}`,
                'data-position': 1 - quadrant.count / count(resultsMatrix),
                x: quadrant.x + quadrant.size / 2,
                y: quadrant.y + quadrant.size / 2,
                dy: 0.018,
            },
            classes: ['count', quadrant.class.split(' ')],
            text: `${Math.sqrt(quadrant.count / count(resultsMatrix)) > 0.1 ? quadrant.count : ''}`,
        });
        quadBaseline.appendChild(label);
    });

    let total = node(text, {
        attributes: { x: 1.85, y: 1.9 },
        classes: ['total', 'count'],
        text: `${count(resultsMatrix) || ''}`,
    });
    quadBaseline.appendChild(total);

    conditional.appendChild(quadBaseline);
    chart.appendChild(conditional);

    graph.appendChild(chart);
    documentFragment.appendChild(graph);

    // remove the svg if it already exists
    if (document.querySelector('svg')) {
        let oldSvg = document.querySelector('svg');
        oldSvg.parentNode.replaceChild(documentFragment, oldSvg);
    } else {
        document.body.appendChild(documentFragment);
    }
}

if (LOCAL) {
    drawViz(local.message);
} else {
    dscc.subscribeToData(drawViz, { transform: dscc.objectTransform });
}
