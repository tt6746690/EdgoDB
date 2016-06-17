
var forceGraph = function(data, config){
  this.config = config
  this.data = data
  this.edges = this.getEdges()    // edges data
  this.nodes = this.getNodes()    // nodes data
  this.createElements()           // creates this.svg, this.force, and marker


  var link = this.svg.selectAll('.link')
      .data(this.edges)
      .enter().append('line')
      .attr('class', 'link')
      .attr("marker-end", "url(#end)")
      .style("stroke-width", 1)
      .style("stroke-dasharray", function(d){ if (d.score === 0){ return "5,5"} else {return undefined}})


  var node = this.svg.selectAll('.node')
      .data(data.nodes)
      .enter().append('circle')
      .attr('class', 'node')
      .attr("r", 5)
      .call(this.force.drag)
      .style("fill", function(d) { if (/^NM_[0-9]{5,}/i.test(d.Name)){ return '#5bd0f0'} else {return '#d99db5'}})

  node.on("dblclick.zoom", function(d) { d3.event.stopPropagation();
  	var dcx = (window.innerWidth/2-d.x*zoom.scale());
  	var dcy = (window.innerHeight/2-d.y*zoom.scale());
  	zoom.translate([dcx,dcy]);
  	 g.attr("transform", "translate("+ dcx + "," + dcy  + ")scale(" + zoom.scale() + ")");


  	});

  node.append("title")
      .text(function(d) {return d.Name})


  this.force.on("tick", function() {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
  });

}

forceGraph.prototype.getData = function(data){
  data.links = data.links.filter(function(l){
    return l.score ===1
  })
  console.log(data.links.length)
  return data
}



forceGraph.prototype.getEdges = function(){
  var nodes = this.data.nodes
  var links = this.data.links

  var edges = []
  links.forEach(function(e) {
      var sourceNode = nodes.filter(function(n) {
          return n.ID === e.source;
      })[0],
          targetNode = nodes.filter(function(n) {
              return n.ID === e.target;
          })[0];

      edges.push({
          source: sourceNode,
          target: targetNode,
          score: e.score
      });
  });
  return edges
}

forceGraph.prototype.getNodes = function(){
  return this.data.nodes
}


forceGraph.prototype.createElements = function(){
  var width = this.config.width || 1000
      height = this.config.height || 800
  var color = d3.scale.category20();

  this.svg = d3.select(this.config.targetDOM).append("svg")
      .attr("width", width)
      .attr("height", height);

  this.force = d3.layout.force()
      .charge(-70)
      .linkDistance(50)
      .size([width, height])
      .nodes(this.nodes)
      .links(this.edges)
      .start()

  this.svg.append("svg:defs").selectAll("marker")
     .data(["end"])      // Different link/path types can be defined here
   .enter().append("svg:marker")    // This section adds in the arrows
     .attr("id", String)
     .attr("viewBox", "0 -5 10 10")
     .attr("refX", 20)
     .attr("refY", 0)
     .attr("markerWidth", 6)
     .attr("markerHeight", 6)
     .attr("orient", "auto")
   .append("svg:path")
     .attr("d", "M0,-5L10,0L0,5");
}

//
//
// nodeID = []
// this.data.nodes.forEach(function (n){
//   nodeID.push(n.ID)
// })
// console.log(nodeID.length)
//
// linkID = new Set()
// `data`.links.forEach(function (l){
//   linkID.add(l.source)
//   linkID.add(l.target)
//
// })
//
// linkID.forEach(function (id){
//   if (nodeID.indexOf(id) == -1){
//     console.log(id)
//   }
// })
//




var proteinDomainGraph = function(data, config){
  this.config = config
  this.data = data
  this.createSVG()
  this.x = d3.scale.linear()
            .domain([0, this.data.length])
            .range([0, this.config.width])

  this.markMutations()
  this.drawRegions()
}


proteinDomainGraph.prototype.createSVG = function(){
  var width = this.config.width || 1000
      height = this.config.height || 200

  this.svg = d3.select(this.config.targetDOM).append("svg")
      .attr("width", width)
      .attr("height", height);

  this.svg.append('g')
          .attr("class", "pdgraph")

}


proteinDomainGraph.prototype.markMutations = function(){
  var x = this.x
  var color = d3.scale.category20c()

  var needles = d3.select(".pdgraph").selectAll()
            .data(this.data.mutation).enter()
            .append("line")
            .attr("y1", this.config.stickHeight)
            .attr("y2", this.config.yoffset)
            .attr("x1", function(d){ return x(parseInt(d.name.replace(/[^0-9\.]/g, '')))})
            .attr("x2", function(d){ return x(parseInt(d.name.replace(/[^0-9\.]/g, '')))})
            .attr("class", "needle-line")
            .attr("stroke", "lightgrey")
            .attr("stroke-width", 1.5);

  var needleHeads = d3.select(".pdgraph").selectAll()
            .data(this.data.mutation)
            .enter().append("a")
            .attr("href", function(d){ return '#' + d.name})

  needleHeads.append("circle")
            .attr("cy", this.config.stickHeight + this.config.headRadius)
            .attr("cx", function(d) {return x(parseInt(d.name.replace(/[^0-9\.]/g, '')))})
            .attr("r", this.config.headRadius)
            .attr("class", "needle-head")
            .style("fill", function(d) { return color(d.name)})

  var needleText = d3.select(".pdgraph").selectAll()
            .data(this.data.mutation)
            .enter().append('text')
            .attr("class", "needleText")
            .attr("text-anchor", "center")
            .attr("fill", "black")
            .attr("opacity", 0.5)
            .attr("x", function(d){ return x(parseInt(d.name.replace(/[^0-9\.]/g, '')) + 6)})
            .attr("y", this.config.stickHeight + this.config.headRadius)
            .attr("dx", "3px")
            .attr("font-size", this.config.headFontSize)
            .text(function(d){return d.name})
}


proteinDomainGraph.prototype.drawRegions = function(){
    var x = this.x
    var color = d3.scale.category20();

    var regionsBG = d3.select('.pdgraph').selectAll()
                      .data(["dummy"]).enter()
                      .insert("g", ":first-child")
                      .attr("class", "regionsBG")
                      .append("rect")
                      .attr("ry", "3")
                      .attr("rx", "3")
                      .attr("x", 0)
                      .attr("y", this.config.yoffset)
                      .attr("width", x(this.data.length))
                      .attr("height", this.config.regionBGHeight)
                      .attr("fill", "lightgrey")

    var regions = d3.select(".pdgraph").selectAll()
                    .data(this.data.region).enter()
                    .append("g")
                    .attr("class", "regionGroup");


    regions.append("rect")
                .attr("class", "region")
                .attr("x", function (d) {
                    return x(d.start);
                })
                .attr("y", this.config.yoffset - (this.config.regionHeight - this.config.regionBGHeight)/2)
                .attr("ry", "3")
                .attr("rx", "3")
                .attr("width", function (d) {
                    return x(d.end) - x(d.start)
                })
                .attr("height", this.config.regionHeight)
                .style("fill", function(d){ return color(d.start)})

    var text = regions.append("a")
          .attr("href", function(d){ return 'http://pfam.xfam.org/family/' + d.name})
          .append("text")
          .attr("class", "regionText")
          .attr("text-anchor", "center")
          .attr("fill", "black")
          .attr("opacity", 0.5)
          .attr("x", function (d) { return x(d.start)})
          .attr("y", this.config.yoffset + this.config.regionHeight*2)
          .attr("dx", "2px")
          .style("font-size", this.config.regionFontSize)
          .style("text-decoration", "bold")
          .text(function (d) {
              return d.name
          });
}

$(document).ready(function(){
    $("body").scrollspy({
        target: "#target_nav",
        offset: 50
    })
});

'use strict';

$(document).ready(function(){
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
