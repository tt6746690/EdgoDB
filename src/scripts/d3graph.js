//
//
// nodeID = []
// data.nodes.forEach(function (n){
//   nodeID.push(n.ID)
// })
// console.log(nodeID.length)
//
// linkID = new Set()
// data.links.forEach(function (l){
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

//
//
// data = {
//   links: [
//     {source: 1, target: 2, score: 1},
//     {source: 1, target: 3, score: 1},
//     {source: 2, target: 1, score: 1},
//     {source: 3, target: 3, score: 1}
//   ],
//   nodes: [
//     {Name: 'node1', ID: 1},
//     {Name: 'node2', ID: 2},
//     {Name: 'node3', ID: 3}
//   ]
// }


var edges = [];
data.links.forEach(function(e) {
    var sourceNode = data.nodes.filter(function(n) {
        return n.ID === e.source;
    })[0],
        targetNode = data.nodes.filter(function(n) {
            return n.ID === e.target;
        })[0];

    edges.push({
        source: sourceNode,
        target: targetNode,
        score: e.score
    });
});

var width = 1200;
    height = 1200;

var color = d3.scale.category20();

var force = d3.layout.force()
    .charge(-70)
    .linkDistance(50)
    .size([width, height])

var svg = d3.select("#interaction-graph").append("svg")
    .attr("width", width)
    .attr("height", height);


force.nodes(data.nodes)
     .links(edges)
     .start()

svg.append("svg:defs").selectAll("marker")
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

var link = svg.selectAll('.link')
    .data(edges)
    .enter().append('line')
    .attr('class', 'link')
    .attr("marker-end", "url(#end)")
    .style("stroke-width", 1)
    .style("stroke-dasharray", function(d){ if (d.score === 0){ return "5,5"} else undefined})

var node = svg.selectAll('.node')
    .data(data.nodes)
    .enter().append('circle')
    .attr('class', 'node')
    .attr("r", 5)
    .call(force.drag)
    .style("fill", function(d) { if (/^NM_[0-9]{5,}/i.test(d.Name)){ return '#5bd0f0'} else return '#d99db5'})

node.on("dblclick.zoom", function(d) { d3.event.stopPropagation();
	var dcx = (window.innerWidth/2-d.x*zoom.scale());
	var dcy = (window.innerHeight/2-d.y*zoom.scale());
	zoom.translate([dcx,dcy]);
	 g.attr("transform", "translate("+ dcx + "," + dcy  + ")scale(" + zoom.scale() + ")");


	});

node.append("title")
    .text(function(d) {return d.Name})


force.on("tick", function() {
  link.attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

  node.attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; });
});
