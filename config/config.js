console.log("✅ Custom YasGUI config loaded");

const DEFAULT_ENDPOINT =
  window.DEFAULT_SPARQL_ENDPOINT ||
  "http://fuseki1.get-it.it/elter"; // fallback

// === EXAMPLE QUERY ===
const PREDEFINED_QUERIES = {
  "List of Sites": `
PREFIX dcterms: <http://purl.org/dc/terms/>
PREFIX ef: <http://www.w3.org/2015/03/inspire/ef#>
SELECT ?site ?siteName ?siteDesc
WHERE {
  ?site a ef:EnvironmentalMonitoringFacility ;
        ef:name ?siteName .
}
LIMIT 10
`,
  "Count of Sites per Network within LTER Europe": `
PREFIX ef: <http://www.w3.org/2015/03/inspire/ef#>
PREFIX dcterms: <http://purl.org/dc/terms/>

SELECT ?network ?networkName (COUNT(DISTINCT ?site) AS ?siteCount)
WHERE {
  # Root network: LTER Europe
  BIND(<https://deims.org/networks/4742ffca-65ac-4aae-815f-83738500a1fc> AS ?lterEurope)

  # Get all networks contained (directly or indirectly) in the LTER Europe network
  ?lterEurope (ef:contains|^ef:belongsTo)* ?network .
  ?network a ef:EnvironmentalMonitoringNetwork ;
           ef:name ?networkName .

  # For each network, find all sub-networks and the sites belonging to them
  OPTIONAL {
    ?network (ef:contains|^ef:belongsTo)* ?subNetwork .
    ?site ef:belongsTo ?subNetwork .
  }

  # Ensure that the resource is indeed a monitoring site
  ?site a ef:EnvironmentalMonitoringFacility .
}
GROUP BY ?network ?networkName
ORDER BY ASC(?siteCount)
`,
 "List of Sensors Associated with Each Site": `
PREFIX ef: <http://www.w3.org/2015/03/inspire/ef#>
PREFIX dcterms: <http://purl.org/dc/terms/>
PREFIX sosa: <http://www.w3.org/ns/sosa/>

SELECT DISTINCT ?site ?siteName ?sensor ?sensorName
WHERE {
  ?site a ef:EnvironmentalMonitoringFacility ;
        ef:name ?siteName .
  {
    ?site ef:narrower ?sensor .
  }
  ?sensor a sosa:Sensor ;
          ef:name ?sensorName .
}
ORDER BY ?siteName ?sensorName
`
};

// === Initialize YasGUI ===
window.addEventListener("load", () => {
  setTimeout(() => {
    const yasgui = new Yasgui(document.getElementById("yasgui"), {
      requestConfig: { endpoint: DEFAULT_ENDPOINT },
      copyEndpointOnNewTab: false
    });

    console.log("🌍 Using endpoint:", DEFAULT_ENDPOINT);

    // Fill dropdown menu
    const select = document.getElementById("querySelect");
    Object.keys(PREDEFINED_QUERIES).forEach(label => {
      const opt = document.createElement("option");
      opt.value = label;
      opt.textContent = label;
      select.appendChild(opt);
    });

    // Load selected query into YasGUI editor
    select.addEventListener("change", () => {
      const selected = select.value;
      if (selected && PREDEFINED_QUERIES[selected]) {
        const currentTab = yasgui.getTab();
        currentTab.setQuery(PREDEFINED_QUERIES[selected]);
      }
    });

    // Toggle documentation overlay
    const docs = document.getElementById("docs");
    const toggleButton = document.getElementById("toggleDocs");
    if (docs && toggleButton) {
      toggleButton.addEventListener("click", () => {
        docs.classList.toggle("visible");
        toggleButton.textContent = docs.classList.contains("visible")
          ? "📕 Hide Documentation"
          : "📘 Show Documentation";
      });
    }
  }, 300);
});
