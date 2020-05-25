function drawViz(data) {

  // set margins + canvas size
  const margin = { top: 10, bottom: 50, right: 10, left: 10 };
  const height = dscc.getHeight() - margin.top - margin.bottom;
  const width = dscc.getWidth() - margin.left - margin.right;

  // remove the svg if it already exists
  if (document.querySelector("svg")) {
    let oldSvg = document.querySelector("svg");
    oldSvg.parentNode.removeChild(oldSvg);
  }

	const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");

	svg.setAttribute("class", "quadrantGraph")
	svg.setAttribute("viewBox", "0 0 2 2");

	const defs = document.createElement('defs');
	const rGradient = document.createElement('radialGradient')
		rGradient.setAttribute('id', 'baseline');
		rGradient.setAttribute('cx', '1');
		rGradient.setAttribute('cy', '1');
		rGradient.setAttribute('r', '2.5');

	const stop = document.createElement('stop');
		stop.setAttribute('offset', '0%')
		stop.setAttribute('stop-color', 'rgba(220, 220, 235, 0.1)')

	rGradient.appendChild(stop);
		stop.setAttribute('offset', '100%')
		stop.setAttribute('stop-color', 'rgba(220, 220, 235, 1)')

	defs.appendChild(defs);

	const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  rect.setAttribute('width', `${width/2}px`);
  rect.setAttribute('height', `${height/2}px`);
  rect.style.fill =  'blue';

	svg.append(defs);
  svg.append(rect);

  document.body.appendChild(svg);
}
// subscribe to data and style changes
dscc.subscribeToData(drawViz, { transform: dscc.objectTransform });
