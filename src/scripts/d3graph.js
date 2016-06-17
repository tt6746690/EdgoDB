
var forceGraph = function(data, config){
  this.config = config
  this.data = data
  // this.data = this.getData(data)                // raw data
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
  var edges = []
  this.data.links.forEach(function(e) {
      var sourceNode = this.data.nodes.filter(function(n) {
          return n.ID === e.source;
      })[0],
          targetNode = this.data.nodes.filter(function(n) {
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
