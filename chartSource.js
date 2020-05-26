/*global dscc */

function node(sourceNode, { attributes, classes }) {
    let node = sourceNode.cloneNode();
    attributes && Object.entries(attributes).forEach(([key, val]) => node.setAttribute(key, val));
    classes && classes.forEach((clas) => node.classList.add(clas));
    return node;
}
function drawViz(data) {
    let { style } = data;

    let resultsMatrix = [
        [0, 0],
        [0, 0],
    ];
    let C1 = 'Criterion 1';
    let C2 = 'Criterion 2';

    let quadrants = [
        { criteria: { C1, C2 }, class: 'full', position: 'top-left' },
        { criteria: { C2 }, class: 'partial', position: 'top-right' },
        { criteria: { C1 }, class: 'partial', position: 'bottom-left' },
        { criteria: {}, class: 'empty', position: 'bottom-right' },
    ];
    let titles = [`${C1} and ${C2}`, `${C2} Only`, `${C1} Only`, 'No Matches'];
    let classes = { 0: 'empty', 1: 'partial', 2: 'full' };

    const flat = (matrix) => {
        console.log(matrix);
        matrix.reduce((a, v) => a.concat(v), []);
    };
    const count = (matrix) => {
        flat(matrix).reduce((a, v) => a + v, 0);
    };

    let graphData = quadrants.map((quad, i) => {
        let rows = flat(resultsMatrix);

        console.log(rows);

        // let row = rows[i];

        // const size = Math.sqrt(row / count(resultsMatrix));

        // return {
        //     title: titles[i],
        //     class: `${classes[Object.keys(quad.criteria).length]} ${quad.position.replace('-', ' ')}`,
        //     count: row,
        //     size,
        //     x: quad.position.includes('right') ? 1 : 1 - size,
        //     y: quad.position.includes('bottom') ? 1 : 1 - size,
        // };
    });

    let documentFragment = document.createDocumentFragment();

    // set margins + canvas size
    const margin = { top: 10, bottom: 50, right: 10, left: 10 };
    const height = dscc.getHeight() - margin.top - margin.bottom;
    const width = dscc.getWidth() - margin.left - margin.right;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

    let chart = node(svg, { attributes: { viewBox: '0 0 2 2' }, classes: ['quadrantGraph'] });

    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const radialGradient = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient');
    const stop = document.createElementNS('http://www.w3.org/2000/svg', 'stop');

    let gradient = node(radialGradient, {
        attributes: { id: 'baseline', cx: 1, cy: 1, r: 2.5 },
    });

    let midStop = node(stop, {
        attributes: { offset: '0%', 'stop-color': style.stopColor.value.color },
        classes: ['stop'],
    });

    let endStop = node(stop, {
        attributes: { offset: '100%', 'stop-color': style.endColor.value.color },
        classes: ['stop'],
    });

    gradient.appendChild(midStop);
    gradient.appendChild(endStop);

    defs.appendChild(gradient);
    chart.append(defs);

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');

    // if there is a greater than zero results set.
    let conditional = node(g, { classes: ['conditional'] });
    let quadBaseline = node(g, { classes: ['quad', 'baseline'] });

    graphData.forEach((quadrant, id) => {
        let quad = node(g, {
            attributes: { key: `quad_${id}` },
            classes: ['quad'],
        });

        let square = node(rect, {
            attributes: {
                x: quadrant.x,
                y: quadrant.y,
                width: quadrant.size,
                height: quadrant.size,
            },
            classes: ['quadrant', quadrant.class],
        });

        let label = node(title, { text: `${quadrant.title} - ${quadrant.count}` });

        square.appendChild(label);
        quad.appendChild(square);

        quadBaseline.appendChild(quad);
    });

    conditional.appendChild(quadBaseline);
    chart.appendChild(conditional);
    documentFragment.appendChild(chart);

    // remove the svg if it already exists
    if (document.querySelector('svg')) {
        let oldSvg = document.querySelector('svg');
        document.body.replaceChild(documentFragment, oldSvg);
    } else {
        document.body.appendChild(documentFragment);
    }
}
// subscribe to data and style changes
dscc.subscribeToData(drawViz, { transform: dscc.objectTransform });
