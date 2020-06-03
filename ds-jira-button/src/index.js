const dscc = require('@google/dscc');
const local = require('./localMessage.js');

// change this to 'true' for local development
// change this to 'false' before deploying
export const LOCAL = false;

const limit = 200;

// write viz code here
const drawViz = (data) => {
  // console.log(data);

  LOCAL && console.log(data);

  const {
    tables: { DEFAULT: issueKey },
    theme: { themeFontFamily: fontFamily },
    style: {
      buttonMode: { value: buttonMode },
      linkOn: { value: linkMode },
      rootUrl: { value: rootUrl },
      fontSize: { value: overrideFontSize },
      overrideTheme: { value: overrideTheme },
      overrideColor: {
        value: { color: overrideColor },
      },
      linkColor: {
        value: { color: linkColor },
      },
    },
  } = data;
  let {
    theme: {
      themeFontColor: { color: fontColor },
    },
  } = data;
  let fontSize = 12;

  if (overrideTheme) {
    fontColor = overrideColor;
    fontSize = overrideFontSize;
  }

  const issueKeys = issueKey.reduce((keys, row) => {
    return [...keys, row.issueId[0]];
  }, []);

  const linkArgs = [
    { issueKeys, issueKey },
    { fontColor, fontSize, fontFamily, linkColor },
    { rootUrl, linkMode },
  ];

  const anchorLink =
    buttonMode === 'total' ? totalLink(...linkArgs) : buttonLink(...linkArgs);

  const jiraLink = document.body.querySelector('.jiraLink');
  if (jiraLink) jiraLink.parentNode.replaceChild(anchorLink, jiraLink);

  return document.body.appendChild(anchorLink);
};

const buttonLink = (
  { issueKeys, issueKey },
  { linkColor, fontColor, fontSize },
  { rootUrl, linkMode }
) => {
  const count = issueKeys.length;

  LOCAL && console.debug('BUTTON');

  const disabled = count === 0 || count > limit || !linkMode;
  const action = disabled
    ? '#'
    : `${rootUrl}browse/${issueKey[0].issueKey}?jql=id in(${issueKeys.join(
        ','
      )})`;

  if (disabled) {
    return document.createRange().createContextualFragment(`
				<button	class="gmat-button mat-flat-button jiraLink disabled"
								style="background-color: #dedad5ff; opacity:0.3; font-size: ${fontSize}px "
								title="${
                  !linkMode
                    ? count
                    : count
                    ? 'Jira links limited to ' +
                      limit +
                      ' issues. Refine your search.'
                    : 'No Issues'
                }">
					<a target="_blank" style="color:${fontColor}"
						>&nbsp;</a>
				</button>
			`);
  }

  return document.createRange().createContextualFragment(`
				<button	class="gmat-button mat-flat-button jiraLink
        }" style="background-color: ${linkColor}; font-size: ${fontSize}px">
					<a target="_blank" href="${action}" style="color:${fontColor}">View ${count} Issues in Jira</a>
				</button>
			`);
};

const totalLink = (
  { issueKeys, issueKey },
  { fontColor, fontSize, fontFamily, linkColor },
  { rootUrl, linkMode }
) => {
  const count = issueKeys.length;

  if (count === 0 || count > limit || !linkMode) {
    return document.createRange().createContextualFragment(
      `<span class="jiraLink"
						title="${
              !linkMode
                ? count
                : count
                ? 'Jira links limited to ' +
                  limit +
                  ' issues. Refine your search.'
                : 'No Issues'
            }"
						style="color:${fontColor}; font-family:${fontFamily}; font-size: ${fontSize}px">${
        issueKeys.length
      }</span>`
    );
  }

  return document.createRange().createContextualFragment(
    `<a title="View ${issueKeys.length} Issues in Jira"
			target="_blank" class="jiraLink"
			href="${rootUrl}browse/${issueKey[0].issueKey}?jql=id in(${issueKeys.join(
      ','
    )})"
			style="color:${linkColor}; font-family:${fontFamily};  font-size: ${fontSize}px /*border-color:${linkColor};*/" >${
      issueKeys.length
    }</a>`
  );
};

if (LOCAL) {
  drawViz(local.message);
} else {
  dscc.subscribeToData(drawViz, { transform: dscc.objectTransform });
}
