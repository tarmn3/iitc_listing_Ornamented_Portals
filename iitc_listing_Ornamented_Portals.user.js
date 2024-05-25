// ==UserScript==
// @id             iitc-plugin-list-ornamented-portals
// @name           IITC plugin: List Ornamented Portals
// @category       Info
// @version        0.1.2
// @namespace      https://github.com/tarmn3/iitc_listing_Ornamented_Portals/
// @updateURL      https://github.com/tarmn3/iitc_listing_Ornamented_Portals/blob/main/iitc_listing_Ornamented_Portals.user.js
// @downloadURL    https://github.com/tarmn3/iitc_listing_Ornamented_Portals/blob/main/iitc_listing_Ornamented_Portals.user.js
// @description    List all ornamented portals in the current map view
// @include        https://intel.ingress.com/*
// @match          https://intel.ingress.com/*
// @grant          none
// ==/UserScript==

function wrapper(plugin_info) {
  // ensure plugin framework is there, even if iitc is not yet loaded
  if (typeof window.plugin !== 'function') window.plugin = function() {};

  // PLUGIN START ////////////////////////////////////////////////////////

  // use own namespace for plugin
  window.plugin.listOrnamentedPortals = function() {};

  window.plugin.listOrnamentedPortals.setup = function() {
    // Create a new button in the IITC toolbox
    var link = document.createElement('a');
    link.textContent = 'List Ornamented Portals';
    link.addEventListener('click', window.plugin.listOrnamentedPortals.listPortals, false);
    document.getElementById('toolbox').appendChild(link);
  };

  window.plugin.listOrnamentedPortals.listPortals = function() {
    var bounds = map.getBounds();
    var ornamentedPortals = [];

    // Iterate through all portals in the current map view
    $.each(window.portals, function(guid, portal) {
      var latLng = portal.getLatLng();
      if (bounds.contains(latLng) && portal.options.data.ornaments && portal.options.data.ornaments.length > 0) {
        var portalName = portal.options.data.title;
        var portalURL = `https://intel.ingress.com/intel?ll=${latLng.lat},${latLng.lng}&pll=${latLng.lat},${latLng.lng}`;
        var ornaments = portal.options.data.ornaments.join(', ');
        ornamentedPortals.push({name: portalName, url: portalURL, ornaments: ornaments});
      }
    });

    // Display the list of ornamented portals
    var html = '<button id="copy-ornamented-portals">Copy to Clipboard</button>';
    html += '<table><tr><th>Portal Name</th><th>Portal URL</th><th>Ornament Type</th></tr>';
    var textList = "";
    ornamentedPortals.forEach(function(portal) {
      html += `<tr><td>${portal.name}</td><td><a href="${portal.url}" target="_blank">${portal.url}</a></td><td>${portal.ornaments}</td></tr>`;
      textList += `${portal.name}\t${portal.url}\t${portal.ornaments}\n`;
    });
    html += '</table>';

    var dialog = window.dialog({
      html: html,
      title: 'Ornamented Portals',
      id: 'ornamented-portals-list'
    });
    dialog.dialog('option', 'width', 400);

    // Copy to Clipboard functionality
    document.getElementById('copy-ornamented-portals').addEventListener('click', function() {
      var textarea = document.createElement('textarea');
      textarea.value = textList;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      alert('Copied to clipboard!');
    });
  };

  var setup = window.plugin.listOrnamentedPortals.setup;

  // PLUGIN END //////////////////////////////////////////////////////////

  setup.info = plugin_info; //add the script info data to the function as a property
  if (!window.bootPlugins) window.bootPlugins = [];
  window.bootPlugins.push(setup);
  if (window.iitcLoaded && typeof setup === 'function') setup();
}

// inject code into site context
var script = document.createElement('script');
var info = {};
if (typeof GM_info !== 'undefined' && GM_info && GM_info.script) {
  info.script = {
    version: GM_info.script.version,
    name: GM_info.script.name,
    description: GM_info.script.description
  };
}
script.appendChild(document.createTextNode('(' + wrapper + ')(' + JSON.stringify(info) + ');'));
(document.body || document.head || document.documentElement).appendChild(script);
