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
  findAllMatches: true,
  shouldSort: true,
  // 0 requires an exact match, which switches off the fuzzy matching Fuse
  // exists to provide. .35 tolerates typos and plural/singular mismatches
  // without drifting into unrelated results.
  threshold: .35,
  ignoreLocation: true,
  maxPatternLength: {{ .Site.Params.Search.maxLength | default hugo.Data.default.search.maxLength }},
minMatchCharLength: {{ .Site.Params.Search.minLength | default hugo.Data.default.search.minLength }},
keys: [
  { name: 'title', weight: .4 },
  { name: 'tags', weight: .1 },
  { name: 'description', weight: .2 },
  { name: 'content', weight: .3 }
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

// Build a <p> whose text is set safely, never parsed as HTML
function infoParagraph(text, className) {
  const p = document.createElement('p');
  if (className) { p.className = className }
  p.textContent = text;
  return p
};

// Onward links for dead ends, so a failed search is not the end of the road
function recoveryLinks() {
  const nav = document.createElement('p');
  const posts = document.createElement('a');
  posts.href = '{{ "/posts/" | relURL }}';
  posts.textContent = '{{ T "search_browse_posts" }}';
  const tags = document.createElement('a');
  tags.href = '{{ "/tags/" | relURL }}';
  tags.textContent = '{{ T "search_browse_tags" }}';
  nav.appendChild(posts);
  nav.appendChild(document.createTextNode(' · '));
  nav.appendChild(tags);
  return nav
};

if (searchQuery) {

  // Transfer text to search field
  document.querySelector('section.search-box input')
    .value = searchQuery;

  // Doherty threshold: show progress rather than an empty region while the
  // index is fetched.
  info.replaceChildren(infoParagraph('{{ T "search_searching" }}'));

  executeSearch(searchQuery);
} else {
  info.replaceChildren(infoParagraph('{{ T "search_awaiting_search" }}'))
};


function indexLoadFailed() {
  info.replaceChildren(
    infoParagraph('{{ T "search_index_error" }}', 'error'),
    recoveryLinks()
  )
};

function getJSON(url, fn) {
  const request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.onload = function () {
    if (request.status >= 200 && request.status < 400) {
      let data;
      try {
        data = JSON.parse(request.responseText)
      } catch (e) {
        // A malformed index is an index problem, not an empty result set
        indexLoadFailed();
        return
      }
      fn(data)
    } else {
      indexLoadFailed()
    }
  };
  request.onerror = indexLoadFailed;
  request.send()
};

function executeSearch(searchQuery) {
  getJSON('{{ with .OutputFormats.Get "json" }}{{ .RelPermalink }}{{ else }}index.json{{ end }}', function (data) {

    // Limit results and throw an error if too many pages are found
    const limit = {{ .Site.Params.Search.maxResults | default 30
  }};

const pages = data;
const fuse = new Fuse(pages, fuseOptions);
const result = fuse.search(searchQuery);

// Build the whole status region, then write it in a single replaceChildren so
// the live region announces once instead of once per append. The query is
// user-controlled, so it is set as text and never parsed as HTML.
const infoNodes = [infoParagraph('{{ T "search_results_for" }}: ' + searchQuery)];

if (result.length > 0) {
  if (result.length == 1) {
    infoNodes.push(infoParagraph('{{ T "search_one_page_found" }}.'))
  } else if (1 < result.length && result.length < limit + 1) {
    infoNodes.push(infoParagraph(result.length + ' {{ T "search_pages_found" }}.'))
  } else {
    infoNodes.push(infoParagraph('{{ T "search_too_many" }}', 'error'))
  }
} else {
  infoNodes.push(infoParagraph('{{ T "search_no_page_found" }}', 'error'));
  infoNodes.push(infoParagraph('{{ T "search_no_results_help" }}'));
  infoNodes.push(recoveryLinks())
};

info.replaceChildren(...infoNodes);

if (0 < result.length && result.length < limit + 1) {
  populateResults(result)
}
    })
  };

// Escape a value before it is interpolated into the result template string.
// These come from the site's own index.json rather than from the URL, but
// escaping removes the whole class of problem and fixes titles containing '<'.
function escapeHTML(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
};

// Build a short excerpt around the first content match, with the matched
// substring emphasised, so users can tell why a result matched without
// opening it. Everything is escaped before it reaches the template string.
const SNIPPET_PADDING = 60;

function buildSnippet(value) {
  const matches = value.matches || [];
  const match = matches.find(function (m) { return m.key === 'content' && m.indices && m.indices.length });

  if (!match) {
    // Fall back to the description, which is already a human-written summary
    return value.item.description
      ? '<p class=search-snippet>' + escapeHTML(value.item.description) + '</p>'
      : ''
  }

  const text = value.item.content || '';

  // Fuse returns [start, end] pairs; pick the longest, which is the most
  // meaningful match rather than an incidental single character.
  const indices = match.indices.slice().sort(function (a, b) {
    return (b[1] - b[0]) - (a[1] - a[0])
  });
  const start = indices[0][0];
  const end = indices[0][1] + 1;

  const before = text.slice(Math.max(0, start - SNIPPET_PADDING), start);
  const hit = text.slice(start, end);
  const after = text.slice(end, end + SNIPPET_PADDING);

  const prefix = start - SNIPPET_PADDING > 0 ? '…' : '';
  const suffix = end + SNIPPET_PADDING < text.length ? '…' : '';

  return '<p class=search-snippet>' + prefix + escapeHTML(before) +
    '<mark>' + escapeHTML(hit) + '</mark>' +
    escapeHTML(after) + suffix + '</p>'
};

// Populate results
function populateResults(result) {
  result.forEach(function (value, key) {

    // Date as it should be rendered if not null
    const safeDate = escapeHTML(value.item.date);
    const formatedDate = '<time datetime="' + safeDate + '">' + safeDate + '</time>';

    const readingTime = value.item.readingTime
      ? '<span class=reading-time>' + escapeHTML(value.item.readingTime) + '</span>'
      : '';

    // Pull template from hugo template definition
    const templateDefinition = document.getElementById('search-result-template').innerHTML;

    // Replace values
    const output = render(templateDefinition, {
      link: escapeHTML(value.item.permalink),
      date: value.item.date ? formatedDate : '',
      readingTime: readingTime,
      title: escapeHTML(value.item.title),
      snippet: buildSnippet(value)
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
      copy = copy.replace(conditionalMatches[0], conditionalMatches[2])
    } else {
      //not valid, remove entire section
      copy = copy.replace(conditionalMatches[0], '')
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
