var width = 960,
    height = 500;

var color = d3.scale.category20();

var force = d3.layout.force()
    .charge(-120)
    .linkDistance(30)
    .size([width, height]);

var svg = d3.select("#interaction-graph").append("svg")
    .attr("width", width)
    .attr("height", height);

d3.json("../miserables.json", function(error, graph) {
  if (error) throw error;

  force
      .nodes(graph.nodes)
      .links(graph.links)
      .start();

  var link = svg.selectAll(".link")
      .data(graph.links)
    .enter().append("line")
      .attr("class", "link")
      .style("stroke-width", function(d) { return Math.sqrt(d.value); });

  var node = svg.selectAll(".node")
      .data(graph.nodes)
    .enter().append("circle")
      .attr("class", "node")
      .attr("r", 5)
      .style("fill", function(d) { return color(d.group); })
      .call(force.drag);

  node.append("title")
      .text(function(d) { return d.name; });

  force.on("tick", function() {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
  });
});

'use strict';

var genes = new Bloodhound({
  datumTokenizer: Bloodhound.tokenizers.whitespace,
  queryTokenizer: Bloodhound.tokenizers.whitespace,
  // url points to a json file that contains an array of country names, see
  // https://github.com/twitter/typeahead.js/blob/gh-pages/data/countries.json
  prefetch: '../data/genes.json'
});

var variants = new Bloodhound({
  datumTokenizer: Bloodhound.tokenizers.whitespace,
  queryTokenizer: Bloodhound.tokenizers.whitespace,
  // url points to a json file that contains an array of country names, see
  // https://github.com/twitter/typeahead.js/blob/gh-pages/data/countries.json
  prefetch: '../data/variants.json'
});

$(document).ready(function(){
  $('input.typeahead').typeahead({
      highlight: true
    }, {
      name: 'genes',
      source: genes,
      templates: {
        header: '<h3 class="searchbar-header-genes">Genes</h3>'
      }
    }, {
      name: 'variants',
      source: variants,
      templates: {
        header: '<h3 class="searchbar-header-variants">Variants</h3>'
    }
  });
});


$(document).ready(function(){
  $('input.typeahead').bind('typeahead:select', function(ev, suggestion) {
    if (/^NM_[0-9]{5,}/i.test(suggestion)) {
      window.location.href = '/variant/' + suggestion;
    }
    else {
      window.location.href = '/gene/' + suggestion;
    }
  });
});



$(document).ready(function(){
    $("body").scrollspy({
        target: "#target_nav",
        offset: 50
    })
});
