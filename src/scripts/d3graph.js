
// var data = JSON.parse(data)
// console.log(data.nodes)
var width = 960,
    height = 500;

var color = d3.scale.category20();

var force = d3.layout.force()
    .charge(-120)
    .linkDistance(30)
    .size([width, height])


var svg = d3.select("#interaction-graph").append("svg")
    .attr("width", width)
    .attr("height", height);

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



force.nodes(data.nodes)
     .links(edges)
     .start()


var link = svg.selectAll('.link')
    .data(edges)
    .enter().append('line')
    .attr('class', 'link')
    // .style("stroke-width", function(d) { if (d.score == 1) {return 10} else return 5})

var node = svg.selectAll('.node')
    .data(data.nodes)
    .enter().append('circle')
    .attr('class', 'node')
    .attr("r", 5)
    .call(force.drag)
    // .style("fill", function(d) { return color(d.Name); })


// node.append("title")
//     .text(function(d) {return d.Name})


force.on("tick", function() {
  link.attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

  node.attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; });
});
