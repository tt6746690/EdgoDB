


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
