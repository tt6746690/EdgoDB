


var removeSVG = function(target_dom){
  $(target_dom).html("");
}

var Y2hChart = function(target_dom, data, config){
  this.config = config
  config.target_dom = target_dom
  this.data = data
  this.edges = this.getEdges()    // edges data
  this.nodes = this.getNodes()    // nodes data
  this.draw()           // creates this.svg, this.force, and marker
}


subsetY2hData = function(data, selector){
  // clone object
  var dataClone = JSON.parse(JSON.stringify(data))
  dataClone.links = dataClone.links.filter(function(l){
    return l.source.split('_')[1] === selector
  })
  return dataClone
}

Y2hChart.prototype.getEdges = function(){
  var nodes = this.data.nodes
  var links = this.data.links
  var config = this.config

  var edges = []
  links.forEach(function(e) {
      var sourceNode = nodes.filter(function(n) {
          return n.ID === e.source;
      })[0],
          targetNode = nodes.filter(function(n) {
              return n.ID === e.target;
          })[0];

      sourceNode.category = 'source'
      targetNode.category = 'target'

      if(e.score === 0){
        targetNode.category = 'lost'
      }

      edges.push({
          source: sourceNode,
          target: targetNode,
          score: e.score
      });
  });

  return edges
}

Y2hChart.prototype.getNodes = function(){
  var nodes = this.data.nodes
  var links = this.data.links
  var config = this.config

  var nodes_in_links = []
  links.forEach(function(l){
    nodes_in_links.push(l.source)
    nodes_in_links.push(l.target)
  })

  var new_nodes = nodes.filter(function(n){
    return nodes_in_links.indexOf(n.ID) > -1
  })

  return new_nodes
}


Y2hChart.prototype.draw = function(){
  config = this.config
  nodes = this.nodes
  edges = this.edges


  this.svg = d3.select(config.target_dom).append("svg")
      .attr("width", config.width)
      .attr("height", config.height);


  this.force = d3.layout.force()
      .size([config.width, config.height])
      .nodes(nodes)
      .links(edges)
      .linkStrength(0.8)
      .friction(0.6)
      .charge(-250)
      .gravity(0.3)
      .linkDistance(config.height / 2.5)
      .alpha(0)

  this.svg.append("svg:defs").selectAll("marker")
     .data(["end"])      // Different link/path types can be defined here
   .enter().append("svg:marker")    // This section adds in the arrows
     .attr("id", String)
     .attr("viewBox", "0 -5 10 10")
     .attr("refX", 26)
     .attr("refY", 0)
     .attr("markerWidth", 10)
     .attr("markerHeight", 10)
     .attr("orient", "auto")
     .style("fill", "lightgrey")
   .append("svg:path")
     .attr("d", "M0,-5L10,0L0,5")
     .attr("fill", 'lightgrey')


  var link = this.svg.selectAll('.link')
     .data(edges)
     .enter().append('line')
     .attr('class', 'link')
     .attr("marker-end", "url(#end)")
     .style("stroke-width", 1)
     .style("stroke-dasharray", function(d){ if (d.score === 0){ return "5,5"} else {return 'undefined'}})
     .style("stroke", function(d){
       if(d.score === 1){
         return 'lightgrey'
       } else {
         return '#ff4d00'
       }
     })


  var nodeGroup = this.svg.selectAll('.node')
     .data(nodes)
     .enter().append('g')
     .attr('class', 'nodeGroup')
     .on("mouseover", function(d){
      //  d3.select(this).select("text").style("visibility","visible")
     })
     .on("mouseout", function(d){
      //  d3.select(this).select("text").style("visibility","hidden")
     })



  var node = nodeGroup.append('circle')
     .attr('class', 'node')
     .attr("r", function(d){
       if(d.category === 'source'){
         return config.nodeRadius * 1.4
       } else if(d.category === 'target') {
         return config.nodeRadius
       } else {
         return config.nodeRadius
       }
     })
     .style('fill', function(d){
      //  if(d.ID)
     })
     .style("fill", function(d){
       if(d.category === 'source'){
         return config.sourceNodeColor
       } else if (d.category === 'target'){
         return config.targetNodeColor
       } else {
         return config.lostNodeColor
       }
     })
    //  .call(this.force.drag)

  var nodeText = nodeGroup.append('a')
     .attr('href', function(d){
       if(d.category !== 'source'){
         return '/gene/' + d.Name
       }
     })
     .attr("target", "_blank")
     .append('text')
     .attr('class', 'nodeText')
     .attr('text-anchor', 'middle')
     .attr('dy', 2)
     .style("font-size", config.textSize)
     .style("visibility", "visible")
     .text(function(d) { return d.Name; })

  this.force.start()

  var safety = 0
  while(this.force.alpha() > 0.01) { // You'll want to try out different, "small" values for this
    this.force.tick();
    if(safety++ > 500) {
      break;// Avoids infinite looping in case this solution was a bad idea
    }
  }


  this.force.on("tick", function() {
   link.attr("x1", function(d) { return d.source.x; })
       .attr("y1", function(d) { return d.source.y; })
       .attr("x2", function(d) { return d.target.x; })
       .attr("y2", function(d) { return d.target.y; });

   nodeGroup.attr("transform", function(d) {
           return 'translate(' + [d.x, d.y] + ')';
       });

  });


}

if (typeof window.y2hChartData !== 'undefined'){
  //----- Instantiation -----//
  var y2hChartConfig = {
    "height": 250,
    "width": 250,
    "nodeRadius": 16,
    "textSize": 9,
    "color": d3.scale.category20(),
    "sourceNodeColor": 'lightgrey',
    "targetNodeColor": '#e8e8e8',
    "lostNodeColor": "orange"
  }

  if (y2hChartData.nodes.length !== 0 && y2hChartData.links.length) {
    wt_y2hChartData = subsetY2hData(y2hChartData, '0')
    var y2hChart = new Y2hChart("#y2h-interaction", wt_y2hChartData, y2hChartConfig)
  }
}
