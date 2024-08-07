'use strict';

// =================================================
// Basic search functionality via Fuse.js
// Based on: https://gist.github.com/eddiewebb/735feb48f50f0ddd65ae5606a1cb41ae#gistcomment-2987774
// =================================================

{{ if eq .Layout "search" }}

  // Get latest Fuse.js (basic build) available
  {{ (index (last 1 (resources.Match "libs/fuse.js@*/dist/fuse.basic.min.js")) 0).Content | safeJS }}

  const fuseOptions = {
    includeMatches: true,
    findAllMatches:true,
    shouldSort: true,
    threshold: 0,
    ignoreLocation: true,
    maxPatternLength: {{ .Site.Params.Search.maxLength | default .Site.Data.default.search.maxLength }},
    minMatchCharLength: {{ .Site.Params.Search.minLength | default .Site.Data.default.search.minLength }},
    keys: [
      { name: 'title',        weight: .4 },
      { name: 'tags',         weight: .1 },
      { name: 'description',  weight: .2 },
      { name: 'content',      weight: .3 }
    ]
  };

  // Sanitize
  function param(name) {
    return decodeURIComponent((location.search.split(name + '=')[1] || '').split('&')[0]).replace(/\+/g, ' ');
  }
  
  // Capture input
  let searchQuery = param('q');
  
  // Search info section
  const info = document.getElementById('search-info');

  if (searchQuery) {
  
    // Transfer text to search field
    document.querySelector('section.search-box input')
      .value = searchQuery;
    
    executeSearch(searchQuery);
  } else {
    info.innerHTML = '<p>{{ T "search_awaiting_search" }}</p>'
  };
  

  function getJSON(url, fn) {
    const request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.onload = function () {
      if (request.status >= 200 && request.status < 400) {
        const data = JSON.parse(request.responseText);
        fn(data)
      }
    };
    request.send()
  };

  function executeSearch(searchQuery) {
    getJSON('index.json', function (data) {
      
      // Limit results and throw an error if too many pages are found
      const limit = {{ .Site.Params.Search.maxResults | default 30 }};
      
      const pages = data;
      console.log("Data: " + data);
      const fuse = new Fuse(pages, fuseOptions);
      console.log("Fuse: " + fuse);
      const result = fuse.search(searchQuery);
      console.log("Result: " + result);

      // Reset info regarding the search
      info.innerHTML = '';
      
      info.innerHTML = '<p>{{ T "search_results_for" }}: ' + searchQuery + '</p>';
      
      if (result.length > 0) {
        if (result.length == 1) {
          info.innerHTML += '<p>{{ T "search_one_page_found" }}.</p>'
        } else if (1 < result.length && result.length < limit + 1) {
          info.innerHTML += '<p>' + result.length + ' {{ T "search_pages_found" }}.</p>'
        } else {
          info.innerHTML += '<p class=error>{{ T "search_too_many" }}</p>'
        }
      } else {
        info.innerHTML += '<p class=error>{{ T "search_no_page_found" }}</p>'
      };
      
      if (0 < result.length && result.length < limit + 1) {
        populateResults(result)
      }
    })
  };

  // Populate results
  function populateResults(result) {
    result.forEach(function (value, key) {
      const content = value.item.content;
      
      // Date as it should be rendered if not null
      const formatedDate = '<time datetime=' + value.item.date + '>' + value.item.date + '</time>';

      // Pull template from hugo template definition
      const templateDefinition = document.getElementById('search-result-template').innerHTML;

      // Replace values
      const output = render(templateDefinition, {
        link  : value.item.permalink,
        date  : value.item.date ? formatedDate : '',
        title : value.item.title
      });
      document.getElementById('search-results').appendChild(htmlToElement(output))
    })
  };

  function render(templateString, data) {
    let conditionalMatches, conditionalPattern, copy;
    
    conditionalPattern = /\$\{\s*isset ([a-zA-Z]*) \s*\}(.*)\$\{\s*end\s*}/g;
    
    //since loop below depends on re.lastInxdex, we use a copy to capture any manipulations whilst inside the loop
    copy = templateString;
    while ((conditionalMatches = conditionalPattern.exec(templateString)) !== null) {
      if (data[conditionalMatches[1]]) {
        //valid key, remove conditionals, leave content.
        copy = copy.replace(conditionalMatches[0],conditionalMatches[2])
      } else {
        //not valid, remove entire section
        copy = copy.replace(conditionalMatches[0],'')
      }
    };
    templateString = copy;
    //now any conditionals removed we can do simple substitution
    let key, find, re;
    for (key in data) {
      find = '\\$\\{\\s*' + key + '\\s*\\}';
      re = new RegExp(find, 'g');
      templateString = templateString.replace(re, data[key])
    };
    return templateString
  };


  function htmlToElement(html) {
    const template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild
  };
  
{{ end }}
