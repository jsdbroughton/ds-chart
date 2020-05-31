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

const quadrantClick = (...args) => {
    // this is the interactionId defined in the config
    const interactionId = 'onClick';

    const [concepts, event] = args;

    let c1Concept, c2Concept;

    console.log(concepts);

    if (concepts && concepts.concept.c1) c1Concept = concepts.concept.c1.type;
    if (concepts && concepts.concept.c2) c2Concept = concepts.concept.c2.type;

    const {
        target: { attributes },
    } = event;

    const {
        c1Id: { value: c1 },
        c2Id: { value: c2 },
    } = attributes;

    const interactionData = { concepts: [c1, c2], values: [[], []] };

    interactionData.values[0][0] = c1Concept ? [...concepts.set] : [];
    interactionData.values[0][1] = c2Concept ? [...concepts.set] : [];

    console.log(interactionData);

    const FILTER = dscc.InteractionType.FILTER;

    dscc.sendInteraction(interactionId, FILTER, interactionData);
};

const node = (sourceNode, { attributes, classes, text, handlers }) => {
    const node = sourceNode.cloneNode();
    attributes && Object.entries(attributes).forEach(([key, val]) => node.setAttribute(key, val));
    classes && classes.forEach((clas) => node.classList.add(clas));

    handlers &&
        handlers.forEach((handler) => {
            const key = Object.keys(handler)[0];
            if (key && handler[key]) {
                const { fn, context } = handler[key];
                node.addEventListener(
                    key,
                    (e) => {
                        fn(context, e);
                    },
                    false
                );
            }
        });

    node.textContent = text;
    return node;
};

const svgNode = (name, ns) => {
    return document.createElementNS(ns || 'http://www.w3.org/2000/svg', name);
};

function drawViz(data) {
    const {
        style,
        tables: { DEFAULT: results },
        fields: { criteria: criteria },
        interactions,
    } = data;

    const scale = 100;
    // const dataSets = message.tables.DEFAULT.map((dataSet) => {
    // return { label: dataSet.dimID, data: dataSet.metricID };
    // });

    console.log(data, interactions, results, data.fields.criteria);

    const count = () => results.length;

    const documentFragment = document.createDocumentFragment();
    const svg = svgNode('svg');
    const defs = svgNode('defs');
    const radialGradient = svgNode('radialGradient');
    const stop = svgNode('stop');
    const g = svgNode('g');
    const rect = svgNode('rect');
    const title = svgNode('title');
    const text = svgNode('text');
    const svgStyle = svgNode('style');
    const line = svgNode('line');

    const graph = node(document.createElement('div'), { classes: ['graph'] });

    const C1 = (criteria && criteria[0]) || 'Criterion 1';
    const C2 = (criteria && criteria[1]) || 'Criterion 2';

    const quadrants = [
        { criteria: { C1, C2 }, color: 'lowRiskColor', class: 'full', position: 'top-left' },
        { criteria: { C2 }, color: 'medRiskColor', class: 'partial', position: 'top-right' },
        { criteria: { C1 }, color: 'medRiskColor', class: 'partial', position: 'bottom-left' },
        { criteria: {}, color: 'highRiskColor', class: 'empty', position: 'bottom-right' },
    ];
    const titles = [`${C1} and ${C2}`, `${C2} Only`, `${C1} Only`, 'No Matches'];
    const classes = { 0: 'empty', 1: 'partial', 2: 'full' };

    const m = quadrants.map((quad) => {
        return results.reduce((count, issue) => {
            const {
                criteria: { C1: c1, C2: c2 },
            } = quad;
            const [c_1, c_2] = issue.criteria;

            if (c1 && c2 && c_1 && c_2) count += 1;
            if (c1 && !c2 && c_1 && !c_2) count += 1;
            if (!c1 && c2 && !c_1 && c_2) count += 1;
            if (!c1 && !c2 && !c_1 && !c_2) count += 1;

            return count;
        }, 0);
    });

    const issues = quadrants.map((quad) => {
        return results.reduce(
            (issues, issue) => {
                const {
                    criteria: { C1: c1, C2: c2 },
                } = quad;
                const [c_1, c_2] = issue.criteria;

                if (c1 && c2 && c_1 && c_2) {
                    issues.set.add(issue);
                    issues.concept = { c1, c2 };
                }
                if (c1 && !c2 && c_1 && !c_2) {
                    issues.set.add(issue);
                    issues.concept = { c1, c2 };
                }
                if (!c1 && c2 && !c_1 && c_2) {
                    issues.set.add(issue);
                    issues.concept = { c1, c2 };
                }
                if (!c1 && !c2 && !c_1 && !c_2) {
                    issues.set.add(issue);
                    issues.concept = { c1, c2 };
                }

                return issues;
            },
            { concept: {}, set: new Set() }
        );
    });

    const resultsMatrix = [
        [m[0], m[1]],
        [m[2], m[3]],
    ];

    const issuesMatrix = [
        [issues[0], issues[1]],
        [issues[2], issues[3]],
    ];

    const flat = (matrix) => {
        return matrix.reduce((a, v) => a.concat(v), []);
    };

    const graphData = quadrants.map((quad, i) => {
        const row = flat(resultsMatrix)[i];
        const issues = flat(issuesMatrix)[i];
        const size = Math.sqrt(row / count(resultsMatrix));

        return {
            title: titles[i],
            class: `${classes[Object.keys(quad.criteria).length]} ${quad.position.replace('-', ' ')}`,
            count: row,
            color: quad.color,
            issues,
            size: size * scale,
            x: 1 * scale - (quad.position.includes('right') ? 0 : size) * scale,
            y: 1 * scale - (quad.position.includes('bottom') ? 0 : size) * scale,
        };
    });

    const chart = node(svg, {
        attributes: { viewBox: `0 0 ${2 * scale} ${2 * scale}` },
        classes: ['quadrantGraph'],
    });

    const gradient = node(radialGradient, {
        attributes: { id: 'baseline', cx: 1 * scale, cy: 1 * scale, r: 2.5 * scale },
    });

    const midStop = node(stop, {
        attributes: {
            offset: '0%',
            'stop-color': styleVal(data, 'stopColor').color,
            'stop-opacity': styleVal(data, 'stopColor').opacity,
        },
        classes: ['stop'],
    });

    const endStop = node(stop, {
        attributes: {
            offset: '100%',
            'stop-color': styleVal(data, 'endColor').color,
            'stop-opacity': styleVal(data, 'endColor').opacity,
        },
        classes: ['stop'],
    });

    gradient.appendChild(midStop);
    gradient.appendChild(endStop);

    const roboto = node(svgStyle, {
        attributes: { type: 'text/css' },
        text: `@import url('https://fonts.googleapis.com/css?family=Roboto:200,300,300italic');`,
    });

    defs.appendChild(gradient);
    defs.appendChild(roboto);

    chart.append(defs);

    // if there is a greater than zero results set.
    const conditional = node(g, { classes: ['conditional'] });
    const quadBaseline = node(g, { classes: ['quad', 'baseline'] });

    graphData.forEach((quadrant, idx) => {
        const quad = node(g, {
            attributes: { key: `quad_${idx}` },
            classes: ['quad'],
        });

        const square = node(rect, {
            attributes: {
                c1Id: C1.id,
                c2Id: C2.id,
                c1Type: C2.type,
                c2Type: C2.type,
                x: quadrant.x,
                y: quadrant.y,
                width: quadrant.size,
                height: quadrant.size,
                fill: style[quadrant.color].value.color,
            },
            classes: ['quadrant', quadrant.class.split(' ')],
            handlers: [
                {
                    click: {
                        fn: quadrantClick,
                        context: quadrant.issues,
                    },
                },
            ],
        });

        const label = node(title, {
            text: `${quadrant.title} - ${quadrant.count}`,
        });
        square.appendChild(label);
        quad.appendChild(square);
        quadBaseline.appendChild(quad);
    });

    graphData.forEach((quadrant, idx) => {
        const label = node(text, {
            attributes: {
                'pointer-events': 'none',
                key: `text_${idx}`,
                'data-position': 1 - quadrant.count / count(),
                x: quadrant.x + quadrant.size / 2,
                y: quadrant.y + quadrant.size / 2,
                'dominant-baseline': 'middle',
                dy: 0.0125 * scale,
                'font-size': `${0.085 * scale}px`,
                classes: ['count'],
            },
            classes: ['count', quadrant.class.split(' ')],
            text: `${Math.sqrt(quadrant.count / count()) > 0.1 ? quadrant.count : ''}`,
        });
        quadBaseline.appendChild(label);
    });

    const total = node(text, {
        attributes: {
            x: (2 - 0.0125) * scale,
            y: (2 - 0.0125) * scale,
            'font-size': `${0.1 * scale}px`,
        },
        classes: ['total', 'count'],
        text: `${count() || ''}`,
    });

    const xAxis = node(line, {
        attributes: {
            x1: 0,
            x2: 2 * scale,
            y1: 1 * scale,
            y2: 1 * scale,
            stroke: '#222222',
            'stroke-width': '0.125px',
            'stroke-dasharray': '1 1 0.5 1',
        },
    });
    const yAxis = node(line, {
        attributes: {
            y1: 0,
            y2: 2 * scale,
            x1: 1 * scale,
            x2: 1 * scale,
            stroke: '#222222',
            'stroke-width': '0.125px',
            'stroke-dasharray': '1 1 0.5 1',
        },
    });

    const criteriaLabelX = node(text, {
        text: C2.name,
        classes: ['axes', 'x-axis'],
        attributes: {
            x: 0.0125 * scale,
            y: 1.025 * scale,
            'font-size': `${0.065 * scale}px`,
            transform: `rotate(270 0, ${1 * scale})`,
        },
    });

    const criteriaLabelY = node(text, {
        text: C1.name,
        classes: ['axes', 'y-axis'],
        attributes: {
            x: (1 - 0.025) * scale,
            y: 0.0125 * scale,
            'font-size': `${0.065 * scale}px`,
        },
    });

    quadBaseline.appendChild(total);
    quadBaseline.appendChild(criteriaLabelX);
    quadBaseline.appendChild(xAxis);
    quadBaseline.appendChild(criteriaLabelY);
    quadBaseline.appendChild(yAxis);

    conditional.appendChild(quadBaseline);
    chart.appendChild(conditional);

    graph.appendChild(chart);
    documentFragment.appendChild(graph);

    // remove the svg if it already exists
    if (document.querySelector('svg')) {
        const oldSvg = document.querySelector('svg');
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
