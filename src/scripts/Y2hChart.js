
var Y2hChart = function(target_dom, data, config){
  this.config = config
  config.target_dom = target_dom
  this.data = data
  this.edges = this.getEdges()    // edges data
  this.nodes = this.getNodes()    // nodes data
  this.draw()           // creates this.svg, this.force, and marker
}

Y2hChart.prototype.getData = function(data){
  data.links = data.links.filter(function(l){
    return l.score ===1
  })
  return data
}

Y2hChart.prototype.getEdges = function(){
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

Y2hChart.prototype.getNodes = function(){
  return this.data.nodes
}


Y2hChart.prototype.draw = function(){
  config = this.config

  this.svg = d3.select(config.target_dom).append("svg")
      .attr("width", config.width)
      .attr("height", config.height);

  this.force = d3.layout.force()
      .size([config.width, config.height])
      .nodes(this.nodes)
      .links(this.edges)
      .linkStrength(0.1)
      .friction(0.9)
      .linkDistance(function(d){ if(d.score === 1){return 150} else {return 250}})
      .charge(-150)
      .charge(-30)
      .gravity(0.1)
      .theta(0.8)
      .alpha(0.1)
      .start();

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


  var link = this.svg.selectAll('.link')
     .data(this.edges)
     .enter().append('line')
     .attr('class', 'link')
     .attr("marker-end", "url(#end)")
     .style("stroke-width", 1)
     .style("stroke-dasharray", function(d){ if (d.score === 0){ return "5,5"} else {return undefined}})
     .style("stroke", function(d){ if (d.score === 0){ return '#ff6300'} else {return '#96e6ff'}})


  var nodeGroup = this.svg.selectAll('.node')
     .data(this.nodes)
     .enter().append('g')
     .attr('class', 'nodeGroup')
     .on("mouseover", function(d){
       d3.select(this).select("text").style("visibility","visible")
     })
     .on("mouseout", function(d){
       d3.select(this).select("text").style("visibility","hidden")
     })


  var node = nodeGroup.append('a')
     .attr('href', function(d){if (/^NM_[0-9]{5,}/i.test(d.Name)){ return "/variant/"+d.Name} else {return "/gene/" + d.Name}})
     .append('circle')
     .attr('class', 'node')
     .attr("r", this.config.nodeRadius)
     // .style('fill', function(d){ return color(d.Name)})
     .style("fill", function(d) { if (/^NM_[0-9]{5,}/i.test(d.Name)){ return '#7ec1ff'} else {return '#ff7eb2'}})
     .call(this.force.drag)

  var nodeText = nodeGroup.append('text')
     .attr('class', 'nodeText')
     .attr('dx', 7)
     .attr('dy', 10)
     .style("font-size", "10px")
     .style("visibility", "hidden")
     .text(function(d) { return d.Name; })


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
    "height": 333,
    "width": 333,
    "nodeRadius": 5,
    "textSize": 12,
    "color": d3.scale.category20()
  }

  if (y2hChartData.nodes.length !== 0 && y2hChartData.links.length) {
    var y2hy2hChart = new Y2hChart("#y2h-interaction", y2hChartData, y2hChartConfig)
  }
}
