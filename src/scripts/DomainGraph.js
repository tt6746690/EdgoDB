


var proteinDomainGraph = function(data, config){
  this.config = config
  this.data = data
  this.mutation = this.getMutationData()
  this.x = d3.scale.linear()
            .domain([0, this.data.proteinLength])
            .range([0, this.config.width - 3*this.config.xoffset])
  // waste the first color
  var wastedColor = this.config.color('NothingCouldNeverHaveThisName')


  this.createSVG()
  this.markMutations()
  this.drawRegions()
}


proteinDomainGraph.prototype.createSVG = function(){
  var width = this.config.width || 1000
      height = this.config.height || 200

  config = this.config
  x = this.x

  this.svg = d3.select(this.config.targetDOM).append("svg")
      .attr("width", width)
      .attr("height", height);

  this.svg.append('g')
          .attr("transform", "translate(0,0)")
          .attr("class", "pdgraph")

}


proteinDomainGraph.prototype.getMutationData = function(){
  config = this.config
  this.data.mutation.forEach(function(m){
    m.ranHeight = Math.random()*config.yoffset*0.5 + 0.1*config.yoffset
  })
  // sort variant based on mutation position ascending
  this.data.mutation.sort(function(a, b){
    var aInt = parseInt(a.name.match(/\d+/))
    var bInt = parseInt(b.name.match(/\d+/))
    if(aInt < bInt){
      return -1
    }
    if(aInt > bInt){
      return 1
    }
    return 0
  })
  return this.data.mutation
}

proteinDomainGraph.prototype.markMutations = function(){
  var x = this.x
  var config = this.config

  var needles = d3.select(".pdgraph").selectAll()
            .data(this.mutation).enter()
            .append("line")
            .attr("y1", function(d){return d.ranHeight})
            .attr("y2", config.yoffset)
            .attr("x1", function(d){ return x(config.xoffset + parseInt(d.name.replace(/[^0-9\.]/g, '')))})
            .attr("x2", function(d){ return x(config.xoffset + parseInt(d.name.replace(/[^0-9\.]/g, '')))})
            .attr("class", "needle-line")
            .attr("stroke", "lightgrey")
            .attr("stroke-width", 1.5);

  var needleHeads = d3.select(".pdgraph").selectAll()
            .data(this.mutation).enter()
            .append("circle")
            .attr("cy", function(d){return d.ranHeight + config.headRadius})
            .attr("cx", function(d) {return x(config.xoffset+ parseInt(d.name.replace(/[^0-9\.]/g, '')))})
            .attr("r", config.headRadius)
            .attr("class", "needle-head")
            .attr("id", function(d){return d.name + "_needleHead"})
            .classed("active", false)
            .style("stroke-width", 1)
            .style("stroke", 'lightgrey')
            .style("fill", function(d) {
              return config.color(d.name)
            })
            .on("mouseover", function(){
              d3.select(this)
                .transition()
                .duration(200)
                .attr("r", config.headRadius * 2);
            })
            .on("mouseout", needleHeadMouseOut)
            .on("click", function(d){
              var active   = d3.select(this).classed("active") ? false : true,
	                newOpacity = active ? 1 : 0,
                  activeMouseOut = active ? null: needleHeadMouseOut,
                  newTextFontSize = active ? config.headFontSize * 2: config.headFontSize
                  newRadiusFactor = active ? 2 : 0.5
              // domainChart
              d3.select(this).classed("active", active)
              d3.select(this).on("mouseout", activeMouseOut);
              d3.select("#" + d.name + "_needleText")
                .transition()
                .duration(200)
                .attr("font-size", newTextFontSize)
              // radarChart
              d3.select("#" + d.name + '_radarWrapper').style("opacity", newOpacity)

              // expressionChart
              d3.selectAll('.' + d.name + '_expressionDot').attr("r", function(){
                return d3.select(this).attr("r") * newRadiusFactor
              })

            })

  function needleHeadMouseOut(){
      d3.select(this)
        .transition()
        .duration(200)
        .attr("r", config.headRadius);
  }

  var needleText = d3.select(".pdgraph").selectAll()
            .data(this.mutation)
            .enter().append('text')
            .attr("class", "needleText")
            .attr("id", function(d){ return d.name + "_needleText"})
            .attr("text-anchor", "center")
            .attr("fill", "black")
            .attr("opacity", 0.5)
            .attr("x", function(d){ return x(config.xoffset+ parseInt(d.name.replace(/[^0-9\.]/g, '')) + 2)})
            .attr("y", function(d){ return d.ranHeight})
            .attr("dx", "6px")
            .attr("dy", "-2px")
            .attr("font-size", config.headFontSize)
            .text(function(d){return d.name})
}


proteinDomainGraph.prototype.drawRegions = function(){
    var x = this.x
    var color = d3.scale.category20b();
    var xoffset = this.config.xoffset
    var config = this.config

    var regionsBG = d3.select('.pdgraph').selectAll()
                      .data(["dummy"]).enter()
                      .insert("g", ":first-child")
                      .attr("class", "regionsBG")
                      .append("rect")
                      .attr("ry", "3")
                      .attr("rx", "3")
                      .attr("x", x(xoffset))
                      .attr("y", this.config.yoffset)
                      .attr("width", x(this.data.proteinLength))
                      .attr("height", this.config.regionBGHeight)
                      .attr("fill", "lightgrey")

    var regions = d3.select(".pdgraph").selectAll()
                    .data(this.data.region).enter()
                    .append("g")
                    .attr("class", "regionGroup");

    var xAxis = d3.svg.axis()
                  .tickSize(0)
                  .orient('top')
                  .scale(x)

    d3.select('.pdgraph')
      .append("g")
      .attr("class", "axisGroup")
      .attr("transform", "translate(" + x(xoffset) + "," + this.config.axisHeight + ")")
      .style("fill", "lightgrey")
      .call(xAxis);

    d3.select(".axisGroup")
      .selectAll("text")
      .style("font-size","12px");



    regions.append("a")
          .attr("href", function(d){ return 'http://pfam.xfam.org/family/' + d.name})
          .append("rect")
          .attr("class", "region")
          .attr("x", function (d) {
              return x(d.start + xoffset);
          })
          .attr("y", this.config.yoffset - (this.config.regionHeight - this.config.regionBGHeight)/2)
          .attr("ry", "3")
          .attr("rx", "3")
          .attr("width", function (d) {
              return x(d.end) - x(d.start)
          })
          .attr("height", this.config.regionHeight)
          .style("fill", function(d){ return color(d.start)})

    var text = regions.append("text")
          .attr("class", "regionText")
          .attr("text-anchor", "center")
          .attr("fill", "black")
          .attr("opacity", 0.5)
          .attr("x", function (d) { return x(d.start + xoffset)})
          .attr("y", this.config.yoffset + this.config.regionHeight*2)
          .attr("dx", "2px")
          .style("font-size", this.config.regionFontSize)
          .style("text-decoration", "bold")
          .text(function (d) {
              return d.name
          });

}


function propagateUpdates(activeElement){
  var radarChartConfig = {
    w: 220,
    h: 220,
    margin: {top: 40, right: 50, bottom: 40, left: 50},
    maxValue: 0.5,
    levels: 5,
    roundStrokes: true,
    color: d3.scale.category20c()
  };
  visibleElement.push(activeElement)
  var wtRadarData = selectRadarChartData(radarChartData, visibleElement)
  RadarChart("#lumier-interaction", wtRadarData, radarChartConfig);
}



if (typeof window.domainChartData !== 'undefined') {
  //----- Instantiation -----//
  var domainChartConfig = {
    "height": 200,
    "width": 540,
    "targetDOM": "#protein-domain-graph",
    "xoffset": 10,
    "yoffset": 110,
    "regionHeight": 15,
    "regionBGHeight": 10,
    "stickHeight": 20,
    "headRadius": 8,
    "regionFontSize": "10px",
    "headFontSize": "10px",
    "axisHeight": 105,
    "color": d3.scale.category20()
  }

  if (domainChartData !== 0){
    var domainChart = new proteinDomainGraph(domainChartData, domainChartConfig)
  }
}
