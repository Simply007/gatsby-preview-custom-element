import './gatsby-preview.css';

var lastModified = null;
var waitTimeout = null;
var urlSlugElement = null;
var config = null;
var language = null;
var codename = null;
var urlSlug = null;
var projectId = null;
var urlSlugRegex = /{urlslug}/ig;
var langRegex = /{lang}/ig;
var gatsbyWebHookUrl = null;


function sendRequestToGatsby() {
  console.log('Sending request to gatsby!');

  // notifying web socket

  fetch(gatsbyWebHookUrl, {
    method: 'POST',
  })
    .then(result => {
      console.log(`Gatsby result is: ${JSON.stringify(result, undefined, 2)}`)
      showReady();
    }).catch(error => {
      console.error(`Gatsby returned error: ${JSON.stringify(error, undefined, 2)}`)
    });
}

function updateSize() {
  // Update the custom element height in the Kentico UI.
  const height = Math.ceil(document.querySelector("html").offsetHeight);
  CustomElement.setHeight(height);
}

function hideAll() {
  document.querySelector('.loader').style.display = 'none';
  document.querySelector('.pending').style.display = 'none';
  document.querySelector('.ready').style.display = 'none';
  document.querySelector('.na').style.display = 'none';
}

function showNA() {
  hideAll();
  document.querySelector('.na').style.display = '';
  updateSize();
}

function showPending(pendingText) {
  document.querySelector('.circle-loader').classList.remove('load-complete')
  document.querySelector('.ready').style.display = 'none';
  document.querySelector('.pending h3').textContent = pendingText;
  document.querySelector('.pending').style.display = '';
  document.querySelector('.loader').style.display = '';
  document.querySelector('.checkmark').style.display = 'none';
  updateSize();
}

function getPreviewUrl() {
  if ((urlSlugElement && !urlSlug) || !projectId) {
    return null;
  }
  return config.previewUrlPattern.replace(urlSlugRegex, urlSlug).replace(langRegex, language);
}

function showReady() {
  document.querySelector('.circle-loader').classList.add('load-complete');
  document.querySelector('.ready').style.display = '';
  document.querySelector('.loader').style.display = '';
  document.querySelector('.pending').style.display = 'none';
  document.querySelector('.checkmark').style.display = '';

  var previewUrl = getPreviewUrl();
  if (previewUrl) {

    document.querySelector('.preview').setAttribute('href', previewUrl)
    document.querySelector('.preview').style.display = '';
  }
  else {
    document.querySelector('.preview').style.display = 'none';
  }
  updateSize();
}


function getItemUrl() {
  if (!codename || !projectId) {
    return null;
  }
  return 'https://preview-deliver.kenticocloud.com/' + projectId + '/items/' + codename;
}

function scheduleWaitForPreview() {
  if (!waitTimeout) {
    showPending("Checking preview availability ...");
    waitTimeout = setTimeout(waitForPreview, 1000);
  }
}

function fetchItem() {
  var itemUrl = getItemUrl();
  console.log(`calling for item: ${itemUrl}`);
  return fetch(itemUrl, {
    headers: new Headers({
      'Authorization': `Bearer ${config.previewApiKey}`
    })
  });
}

function waitForPreview() {
  waitTimeout = null;

  if (lastModified) {
    fetchItem()
      .then((response) => response.json())
      .then(({ item }) => {
        console.log(`defined lastModified: ${lastModified.toISOString()}`);
        console.log(`received item last modified: ${new Date(item.system.last_modified).toISOString()}`);
        if (item && item.system && !lastModified
          || (new Date(item.system.last_modified).getTime() >= lastModified.getTime())) {
          lastModified = new Date(item.system.last_modified);
          showPending("Sending notification to Gatsby...");
          sendRequestToGatsby();
        }
        else {
          scheduleWaitForPreview();
        }
      })
      .catch(_ => {
        console.error(err)
        scheduleWaitForPreview();
      });
  } else { // initial load
    fetchItem()
      .then((response) => response.json())
      .then(({ item }) => {
        lastModified = new Date(item.system.last_modified);
        showReady();
      })
      .catch(err => {
        console.error(err)
        scheduleWaitForPreview();
      });

  }
}

function load(updateUrlSlug) {
  if (updateUrlSlug) {
    CustomElement.getElementValue(urlSlugElement, (value) => {
      urlSlug = value;
      scheduleWaitForPreview();
    });
  }
  else {
    scheduleWaitForPreview();
  }
}

function changed(changedElementCodenames) {
  console.log(`changes: ${changedElementCodenames}`)
  var updateUrlSlug = urlSlugElement && (changedElementCodenames.indexOf(urlSlugElement) >= 0);
  load(updateUrlSlug);
}

function configValid() {
  // TODO extend by the configuation contract
  if (!config.previewApiKey) {
    console.error('Missing preview API key.')
    return false;
  }
  return true;
}

function initCustomElement() {
  try {
    CustomElement.init((element, context) => {
      config = element.config || {};
      if (!configValid()) {
        throw Error('Configuration is not valid.')
      }



      console.log("Connection to gatsby opened...");

      projectId = context.projectId;
      codename = context.item.codename;
      language = context.variant.codename;
      gatsbyWebHookUrl = config.gatsbyWebHookUrl;
      urlSlugElement = config.urlSlugElement;
      if (codename) { // because custom element could be placed to content component - unsupported
        load(!!urlSlugElement);
      }
      else {
        showNA();
      }

      window.addEventListener('resize', updateSize);
      CustomElement.observeElementChanges([], changed);

    });
  }
  catch (err) {
    // Initialization with Kentico Custom element API failed (page displayed outside of the Kentico UI)
    console.error(err);
  }
}

hideAll();
showPending("Checking preview availability ...");

initCustomElement();
