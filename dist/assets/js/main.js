(function() {

// Inspired by http://informationandvisualization.de/blog/box-plot
d3.box = function() {
  var width = 1,
      height = 1,
      duration = 0,
      domain = null,
      value = Number,
      whiskers = boxWhiskers,
      quartiles = boxQuartiles,
      tickFormat = null;

  // For each small multiple…
  function box(g) {
    g.each(function(d, i) {
      d = d.map(value).sort(d3.ascending);
      var g = d3.select(this),
          n = d.length,
          min = d[0],
          max = d[n - 1];

      // Compute quartiles. Must return exactly 3 elements.
      var quartileData = d.quartiles = quartiles(d);

      // Compute whiskers. Must return exactly 2 elements, or null.
      var whiskerIndices = whiskers && whiskers.call(this, d, i),
          whiskerData = whiskerIndices && whiskerIndices.map(function(i) { return d[i]; });

      // Compute outliers. If no whiskers are specified, all data are "outliers".
      // We compute the outliers as indices, so that we can join across transitions!
      var outlierIndices = whiskerIndices
          ? d3.range(0, whiskerIndices[0]).concat(d3.range(whiskerIndices[1] + 1, n))
          : d3.range(n);

      // Compute the new x-scale.
      var x1 = d3.scale.linear()
          .domain(domain && domain.call(this, d, i) || [min, max])
          .range([height, 0]);

      // Retrieve the old x-scale, if this is an update.
      var x0 = this.__chart__ || d3.scale.linear()
          .domain([0, Infinity])
          .range(x1.range());

      // Stash the new scale.
      this.__chart__ = x1;

      // Note: the box, median, and box tick elements are fixed in number,
      // so we only have to handle enter and update. In contrast, the outliers
      // and other elements are variable, so we need to exit them! Variable
      // elements also fade in and out.

      // Update center line: the vertical line spanning the whiskers.
      var center = g.selectAll("line.center")
          .data(whiskerData ? [whiskerData] : []);

      center.enter().insert("line", "rect")
          .attr("class", "center")
          .attr("x1", width / 2)
          .attr("y1", function(d) { return x0(d[0]); })
          .attr("x2", width / 2)
          .attr("y2", function(d) { return x0(d[1]); })
          .style("opacity", 1e-6)
        .transition()
          .duration(duration)
          .style("opacity", 1)
          .attr("y1", function(d) { return x1(d[0]); })
          .attr("y2", function(d) { return x1(d[1]); });

      center.transition()
          .duration(duration)
          .style("opacity", 1)
          .attr("y1", function(d) { return x1(d[0]); })
          .attr("y2", function(d) { return x1(d[1]); });

      center.exit().transition()
          .duration(duration)
          .style("opacity", 1e-6)
          .attr("y1", function(d) { return x1(d[0]); })
          .attr("y2", function(d) { return x1(d[1]); })
          .remove();

      // Update innerquartile box.
      var box = g.selectAll("rect.box")
          .data([quartileData]);

      box.enter().append("rect")
          .attr("class", "box")
          .attr("x", 0)
          .attr("y", function(d) { return x0(d[2]); })
          .attr("width", width)
          .attr("height", function(d) { return x0(d[0]) - x0(d[2]); })
        .transition()
          .duration(duration)
          .attr("y", function(d) { return x1(d[2]); })
          .attr("height", function(d) { return x1(d[0]) - x1(d[2]); });

      box.transition()
          .duration(duration)
          .attr("y", function(d) { return x1(d[2]); })
          .attr("height", function(d) { return x1(d[0]) - x1(d[2]); });

      // Update median line.
      var medianLine = g.selectAll("line.median")
          .data([quartileData[1]]);

      medianLine.enter().append("line")
          .attr("class", "median")
          .attr("x1", 0)
          .attr("y1", x0)
          .attr("x2", width)
          .attr("y2", x0)
        .transition()
          .duration(duration)
          .attr("y1", x1)
          .attr("y2", x1);

      medianLine.transition()
          .duration(duration)
          .attr("y1", x1)
          .attr("y2", x1);

      // Update whiskers.
      var whisker = g.selectAll("line.whisker")
          .data(whiskerData || []);

      whisker.enter().insert("line", "circle, text")
          .attr("class", "whisker")
          .attr("x1", 0)
          .attr("y1", x0)
          .attr("x2", width)
          .attr("y2", x0)
          .style("opacity", 1e-6)
        .transition()
          .duration(duration)
          .attr("y1", x1)
          .attr("y2", x1)
          .style("opacity", 1);

      whisker.transition()
          .duration(duration)
          .attr("y1", x1)
          .attr("y2", x1)
          .style("opacity", 1);

      whisker.exit().transition()
          .duration(duration)
          .attr("y1", x1)
          .attr("y2", x1)
          .style("opacity", 1e-6)
          .remove();

      // Update outliers.
      var outlier = g.selectAll("circle.outlier")
          .data(outlierIndices, Number);

      outlier.enter().insert("circle", "text")
          .attr("class", "outlier")
          .attr("r", 5)
          .attr("cx", width / 2)
          .attr("cy", function(i) { return x0(d[i]); })
          .style("opacity", 1e-6)
        .transition()
          .duration(duration)
          .attr("cy", function(i) { return x1(d[i]); })
          .style("opacity", 1);

      outlier.transition()
          .duration(duration)
          .attr("cy", function(i) { return x1(d[i]); })
          .style("opacity", 1);

      outlier.exit().transition()
          .duration(duration)
          .attr("cy", function(i) { return x1(d[i]); })
          .style("opacity", 1e-6)
          .remove();

      // Compute the tick format.
      var format = tickFormat || x1.tickFormat(8);

      // Update box ticks.
      var boxTick = g.selectAll("text.box")
          .data(quartileData);

      boxTick.enter().append("text")
          .attr("class", "box")
          .attr("dy", ".3em")
          .attr("dx", function(d, i) { return i & 1 ? 6 : -6 })
          .attr("x", function(d, i) { return i & 1 ? width : 0 })
          .attr("y", x0)
          .attr("text-anchor", function(d, i) { return i & 1 ? "start" : "end"; })
          .text(format)
        .transition()
          .duration(duration)
          .attr("y", x1);

      boxTick.transition()
          .duration(duration)
          .text(format)
          .attr("y", x1);

      // Update whisker ticks. These are handled separately from the box
      // ticks because they may or may not exist, and we want don't want
      // to join box ticks pre-transition with whisker ticks post-.
      var whiskerTick = g.selectAll("text.whisker")
          .data(whiskerData || []);

      whiskerTick.enter().append("text")
          .attr("class", "whisker")
          .attr("dy", ".3em")
          .attr("dx", 6)
          .attr("x", width)
          .attr("y", x0)
          .text(format)
          .style("opacity", 1e-6)
        .transition()
          .duration(duration)
          .attr("y", x1)
          .style("opacity", 1);

      whiskerTick.transition()
          .duration(duration)
          .text(format)
          .attr("y", x1)
          .style("opacity", 1);

      whiskerTick.exit().transition()
          .duration(duration)
          .attr("y", x1)
          .style("opacity", 1e-6)
          .remove();
    });
    d3.timer.flush();
  }

  box.width = function(x) {
    if (!arguments.length) return width;
    width = x;
    return box;
  };

  box.height = function(x) {
    if (!arguments.length) return height;
    height = x;
    return box;
  };

  box.tickFormat = function(x) {
    if (!arguments.length) return tickFormat;
    tickFormat = x;
    return box;
  };

  box.duration = function(x) {
    if (!arguments.length) return duration;
    duration = x;
    return box;
  };

  box.domain = function(x) {
    if (!arguments.length) return domain;
    domain = x == null ? x : d3.functor(x);
    return box;
  };

  box.value = function(x) {
    if (!arguments.length) return value;
    value = x;
    return box;
  };

  box.whiskers = function(x) {
    if (!arguments.length) return whiskers;
    whiskers = x;
    return box;
  };

  box.quartiles = function(x) {
    if (!arguments.length) return quartiles;
    quartiles = x;
    return box;
  };

  return box;
};

function boxWhiskers(d) {
  return [0, d.length - 1];
}

function boxQuartiles(d) {
  return [
    d3.quantile(d, .25),
    d3.quantile(d, .5),
    d3.quantile(d, .75)
  ];
}

})();



// reference: http://bl.ocks.org/mattbrehmer/12ea86353bc807df2187

var expressionChart = function(target_dom, raw_data, config) {
  this.config = config
  this.target_dom = target_dom
  this.config.width = this.config.w - this.config.margin.left -  this.config.margin.right
  this.config.height = this.config.h - this.config.margin.top -  this.config.margin.bottom
  this.config.color = d3.scale.category20c()


  this.yScale = d3.scale.linear()
    .range([this.config.height - this.config.padding, this.config.padding])

  this.xScale = d3.scale.ordinal()
    .rangeBands([this.config.padding, this.config.width - this.config.padding])

  this.data = this.processData(raw_data)
  var numberOfBox = this.data.length
  this.config.midLineMultiplier = (this.config.width - this.config.padding) / numberOfBox

  this.draw()


};


expressionChart.prototype.draw = function(){
  var config = this.config
  var yScale = this.yScale
  var xScale = this.xScale
  var data = this.data
  var target_dom = this.target_dom

  var svg = d3.select(target_dom)
              .append("svg")
              .attr("width", config.w)
              .attr("height", config.h);

  var yAxis = d3.svg.axis()
    .scale(yScale)
    .tickSize(1)
    .ticks(5)
    .tickFormat(d3.format('.01f'))
    .orient("left");

  var xAxis = d3.svg.axis()
    .tickSize((-config.height + 2 * config.padding))
    .scale(xScale)
    .orient("bottom")

  var y_axis = svg.append("g")
     .attr("class", "y-axis")
     .attr("transform", "translate(" + 2 * config.padding + ", 0)")
     .style("fill", "#fbfbfb")
     .call(yAxis);

  var x_axis = svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", "translate(" + 1*config.padding + ", " + (config.height - config.padding) + ")")
    .style("fill", "#fbfbfb")
    .call(xAxis);


  d3.select(".y-axis")
    .selectAll("text")
    .style("font-size","9px")
    .style("fill", config.labelColor)

  d3.select(".x-axis")
    .selectAll("text")
    .style("font-size","9px")
    .style("fill", config.labelColor)

  var boxGroup = svg.append('g')
     .attr("transform", "translate(" + (1*config.padding + config.xScaleIncrement/2 + config.padding)+ ",0)")
     .attr("class", "boxGroup")

  var box = d3.select('.boxGroup').selectAll()
    .data(data).enter()
    .append("g")
    .attr("class", "box")
// return xScale(d.grp) - (config.bar_width / 2)
  box.append("line")
    .attr("class", "lowerWhisker")
    .attr("x1", function(d, i){
      return xScale(d.grp) - (config.bar_width / 2)
    })
    .attr("x2", function(d, i){ return xScale(d.grp) + (config.bar_width / 2)})
    .attr("stroke", "black")
    .attr("y1", function(d){ return yScale(d.lowerWhisker)})
    .attr("y2", function(d){ return yScale(d.lowerWhisker)})
    .style("stroke", function(i){
      return "lightgrey"
    })

  box.append("line")
    .attr("class", "upperWhisker")
    .attr("x1", function(d){ return xScale(d.grp) - (config.bar_width / 2)})
    .attr("x2", function(d){ return xScale(d.grp) + (config.bar_width / 2)})
    .attr("y1", function(d){ return yScale(d.upperWhisker)})
    .attr("y2", function(d){ return yScale(d.upperWhisker)})
    .style("stroke", "lightgrey")

  box.append("line")
     .attr("class", "whiskerDash")
     .attr("y1",  function(d){return yScale(d.lowerWhisker)})
     .attr("y2",  function(d){return yScale(d.upperWhisker)})
     .attr("stroke", "black")
     .attr("x1", function(d){ return xScale(d.grp)})
     .attr("x2", function(d){ return xScale(d.grp)})
     .style("stroke", "lightgrey")

  box.append("rect")
    .attr("class", "boxRect")
    .attr("stroke", "lightgrey")
    .attr("fill", "lightgrey")
    .attr("x", function(d, i){
      return xScale(d.grp)- (config.bar_width / 2)
    })
    .attr("y", function(d){
      return yScale(d.q3Val)
    })
    .attr("width", config.bar_width)
    .attr("height", function(d){
      return yScale(d.q1Val) - yScale(d.q3Val)
    });

  box.append("line")
    .attr("class", "median")
    .attr("stroke", "black")
    .attr("x1", function(d, i){ return xScale(d.grp) - (config.bar_width / 2)})
    .attr("x2", function(d, i){ return xScale(d.grp) + (config.bar_width / 2)})
    .attr("y1", function(d){ return yScale(d.medianVal)})
    .attr("y2", function(d){ return yScale(d.medianVal)})
    .style("stroke", "#838383")

  var dataPoint = box.selectAll('circle')
    .data(function(d){ return d.values}).enter()
    .append("circle")
    .attr("r", 1.5)
    .attr("class", function(d, i){
      var lowerWhisker = d3.select(this.parentNode).datum().lowerWhisker
      var upperWhisker = d3.select(this.parentNode).datum().upperWhisker
      if (d < lowerWhisker || d > upperWhisker){
        return "outlier_point";
      } else {
        return "inlier_point";
      }})
    .attr("cx", function() {
        var parentIndex =  box.data().indexOf(d3.select(this.parentNode).datum())
        var parentData = d3.select(this.parentNode).datum()
        return random_jitter(parentData, parentIndex);
     })
    .attr("cy", function(d) {
      return yScale(d);
    })
    .style("fill", function() {
      var index =  box.data().indexOf(d3.select(this.parentNode).datum())
      return config.color(index)
    })

  function random_jitter(d, i) {
    if (Math.round(Math.random() * 1) == 0){
      var seed = - (config.bar_width / 2);
    } else {
      var seed = (config.bar_width / 2);
    }
    return xScale(d.grp) + Math.floor((Math.random() * seed) + 1);
  }



}

expressionChart.prototype.processData = function(data){
  var config = this.config
  var xScale = this.xScale
  var yScale = this.yScale

  new_data = {}
  data.forEach(function(d){
    if(!(d.grp in new_data)){
      new_data[d.grp] = {}
      new_data[d.grp].values = []
      new_data[d.grp].grp = d.grp
    }
    new_data[d.grp].values.push(d.expression)
  })

  Object.keys(new_data).forEach(function(k){
    var col = new_data[k]
    grpVal = col.values.sort(d3.ascending)

    col.minVal = grpVal[0]
    col.q1Val = d3.quantile(grpVal, .25)
    col.medianVal = d3.quantile(grpVal, .5)
    col.q3Val = d3.quantile(grpVal, .75)
    col.iqr = col.q3Val - col.q1Val
    col.maxVal = grpVal[grpVal.length - 1];
    col.lowerWhisker = d3.max([col.minVal, col.q1Val - col.iqr])
    col.upperWhisker = d3.min([col.maxVal, col.q3Val + col.iqr]);
    col.outliers = []

    var index = 0;
    //search for the lower whisker, the mininmum value within q1Val - 1.5*iqr
    while (index < grpVal.length && col.lowerWhisker == Infinity) {
      if (grpVal[index] >= (col.q1Val - 1.5*col.iqr)){
        col.lowerWhisker = grpVal[index];
      } else {
        col.outliers.push(grqVal[index]);
      }
      index++;
    }
    index = grpVal.length-1; // reset index to end of array

    //search for the upper whisker, the maximum value within q1Val + 1.5*iqr
    while (index >= 0 && col.upperWhisker == -Infinity) {
      if (grpVal[index] <= (col.q3Val + 1.5*col.iqr)){
          col.upperWhisker = grpVal[index];
      } else {
        col.outliers.push(grpVal[index]);
      }
      index--;
    }
  })

  // convert object to array
  return_data = Object.keys(new_data).map(function(k){
    return new_data[k]
  })

  // setting x and y scale domain
  var mmax = Object.keys(new_data).map(function(k){
    return new_data[k].maxVal
  })
  var mmin = Object.keys(new_data).map(function(k){
    return new_data[k].minVal
  })

  var spaceMultiplier = 1.10
  var minValue = d3.min(mmin)
  var maxValue = d3.max(mmax)
  var lowerBound = minValue >= 0 ? minValue / spaceMultiplier : minValue * spaceMultiplier
  var upperBound = maxValue >= 0 ? maxValue * spaceMultiplier : maxValue / spaceMultiplier

  yScale.domain([lowerBound, upperBound]);
  xScale.domain(return_data.map(function(d){
    return d.grp
  }))

  var xScalePool = return_data.map(function(d){
    return xScale(d.grp)
  })
  config.xScaleIncrement = (d3.max(xScalePool) - d3.min(xScalePool)) / xScalePool.length
  console.log(config.xScaleIncrement)

  return(return_data)
}

if (typeof window.expressionChartData !== 'undefined' &&
  typeof window.gene !== 'undefined' &&
  typeof window.variant !== 'undefined') {
  //----- Instantiation -----//
  var expressionChartConfig = {
    w: 280,
    h: 250,
    margin: {top: 10, right: 10, bottom: 10, left: 10},
    padding: 10,
    bar_width: 15,
    labelColor: "#818181"
  };

  if (expressionChartData.length !== 0) {
    ex = new expressionChart("#elisa-expression", expressionChartData, expressionChartConfig);
  }
}



// force directed graph
//- var y2hInteractionConfig = {
//-   "height": 333,
//-   "width": 333,
//-   "targetDOM": "#y2h-interaction",
//-   "nodeRadius": 5,
//-   "textSize": 12
//- }
//- var y2hInteractionData =!{JSON.stringify(forceGraphData)}
//- if(y2hInteractionData.links.length !== 0 && y2hInteractionData.nodes.length !== 0){
//-   var y2hForceGraph = new forceGraph(y2hInteractionData, y2hInteractionConfig)
//- }
//--- protein Domain chart ----//
//- var proteinDomainConfig = {
//-   "height": 125,
//-   "width": 460,
//-   "targetDOM": "#protein-domain-graph",
//-   "xoffset": 10,
//-   "yoffset": 90,
//-   "regionHeight": 15,
//-   "regionBGHeight": 10,
//-   "stickHeight": 20,
//-   "headRadius": 5,
//-   "regionFontSize": "10px",
//-   "headFontSize": "10px"
//- }
//- var proteinDomainData =!{JSON.stringify(proteinDomainData)}
//- if(proteinDomainData.region.length !== 0 && proteinDomainData.mutation.length !== 0){
//-   var pg = new proteinDomainGraph(proteinDomainData, proteinDomainConfig)
//- }

var forceGraph = function(data, config){
  this.config = config
  this.data = data
  this.edges = this.getEdges()    // edges data
  this.nodes = this.getNodes()    // nodes data
  this.createElements()           // creates this.svg, this.force, and marker
  color = d3.scale.category20()

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

forceGraph.prototype.getData = function(data){
  data.links = data.links.filter(function(l){
    return l.score ===1
  })
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
      .size([width, height])
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
  this.mutation = this.getMutationData()
  this.x = d3.scale.linear()
            .domain([0, this.data.proteinLength])
            .range([0, this.config.width - 3*this.config.xoffset])
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
  return this.data.mutation
}

proteinDomainGraph.prototype.markMutations = function(){
  var x = this.x
  var color = d3.scale.category20c()
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
              return color(d.name)
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
                  newTextFontSize = active ? config.headFontSize * 2: config.headFontSize;
              d3.select("#" + d.name + '_radarWrapper').style("opacity", newOpacity)
              d3.select(this).classed("active", active)

              d3.select(this).on("mouseout", activeMouseOut);
              d3.select("#" + d.name + "_needleText")
                .transition()
                .duration(200)
                .attr("font-size", newTextFontSize)
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
    var color = d3.scale.category20();
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
    color: d3.scale.category20()
  };
  visibleElement.push(activeElement)
  var wtRadarData = selectRadarChartData(radarChartData, visibleElement)
  RadarChart("#lumier-interaction", wtRadarData, radarChartConfig);
}


if(typeof window.pv !== 'undefined'){
  // override the default options with something less restrictive.
  var options = {
    width: 600,
    height: 600,
    antialias: true,
    quality : 'medium'
  };
  var viewer = pv.Viewer(document.getElementById('pv'), options);
  function loadMethylTransferase() {
    // asynchronously load the PDB file for the dengue methyl transferase
    // from the server and display it in the viewer.
    pv.io.fetchPdb('http://files.rcsb.org/download/5CEA.pdb', function(structure) {
        // display the protein as cartoon, coloring the secondary structure
        // elements in a rainbow gradient.
        viewer.cartoon('protein', structure, { color : color.ssSuccession() });
        // there are two ligands in the structure, the co-factor S-adenosyl
        // homocysteine and the inhibitor ribavirin-5' triphosphate. They have
        // the three-letter codes SAH and RVP, respectively. Let's display them
        // with balls and sticks.
        var ligands = structure.select({ rnames : ['SAH', 'RVP'] });
        viewer.ballsAndSticks('ligands', ligands);
        viewer.centerOn(structure);
    });
  }
  // load the methyl transferase once the DOM has finished loading. That's
  // the earliest point the WebGL context is available.
  document.addEventListener('DOMContentLoaded', loadMethylTransferase);

}

// taken from web thanks for the code...
var RadarChart = function(id, data, options) {
	var cfg = {
	 w: 600,				//Width of the circle
	 h: 600,				//Height of the circle
	 margin: {top: 20, right: 20, bottom: 20, left: 20}, //The margins of the SVG
	 levels: 3,				//How many levels or inner circles should there be drawn
   minValue: -7,
	 maxValue: 27, 			//What is the value that the biggest circle will represent
	 labelFactor: 1.25, 	//How much farther than the radius of the outer circle should the labels be placed
	 wrapWidth: 60, 		//The number of pixels after which a label needs to be given a new line
	 opacityArea: 0.35, 	//The opacity of the area of the blob
	 dotRadius: 3, 			//The size of the colored circles of each blog
	 opacityCircles: 0.1, 	//The opacity of the circles of each blob
	 strokeWidth: 1, 		//The width of the stroke around each blob
	 roundStrokes: true,	//If true the area and stroke will follow a round path (cardinal-closed)
	 color: d3.scale.category10()	//Color function
	};

	//Put all of the options into a variable called cfg
	if('undefined' !== typeof options){
	  for(var i in options){
		if('undefined' !== typeof options[i]){ cfg[i] = options[i]; }
	  }//for i
	}//if

	//If the supplied maxValue is smaller than the actual one, replace by the max in the data
	var maxValue = Math.max(cfg.maxValue, d3.max(data, function(i){return d3.max(i.map(function(o){return o.value;}))}));
  var minValue = Math.min(cfg.minValue, d3.min(data, function(i){ return d3.min(i.map(function(o){return o.value}))}));
  var differenceValue = maxValue - minValue

	var allAxis = (data[0].map(function(i, j){return i.axis})),	//Names of each axis
		total = allAxis.length,					//The number of different axes
		radius = Math.min(cfg.w/2, cfg.h/2), 	//Radius of the outermost circle
		Format = d3.format('.0f'),			 	//Percentage formatting
		angleSlice = Math.PI * 2 / total;		//The width in radians of each "slice"

	//Scale for the radius
	var rScale = d3.scale.linear()
		.range([0, radius])
		.domain([minValue, maxValue]);

	/////////////////////////////////////////////////////////
	//////////// Create the container SVG and g /////////////
	/////////////////////////////////////////////////////////

	//Remove whatever chart with the same id/class was present before
	d3.select(id).select("svg").remove();

	//Initiate the radar chart SVG
	var svg = d3.select(id).append("svg")
			.attr("width",  cfg.w + cfg.margin.left + cfg.margin.right)
			.attr("height", cfg.h + cfg.margin.top + cfg.margin.bottom)
			.attr("class", "radar"+id);
	//Append a g element
	var g = svg.append("g")
			.attr("transform", "translate(" + (cfg.w/2 + cfg.margin.left) + "," + (cfg.h/2 + cfg.margin.top) + ")");

	/////////////////////////////////////////////////////////
	////////// Glow filter for some extra pizzazz ///////////
	/////////////////////////////////////////////////////////

	//Filter for the outside glow
	var filter = g.append('defs').append('filter').attr('id','glow'),
		feGaussianBlur = filter.append('feGaussianBlur').attr('stdDeviation','2.5').attr('result','coloredBlur'),
		feMerge = filter.append('feMerge'),
		feMergeNode_1 = feMerge.append('feMergeNode').attr('in','coloredBlur'),
		feMergeNode_2 = feMerge.append('feMergeNode').attr('in','SourceGraphic');

	/////////////////////////////////////////////////////////
	/////////////// Draw the Circular grid //////////////////
	/////////////////////////////////////////////////////////

	//Wrapper for the grid & axes
	var axisGrid = g.append("g").attr("class", "axisWrapper");

	//Draw the background circles
	axisGrid.selectAll(".levels")
	   .data(d3.range(1,(cfg.levels+1)).reverse())
	   .enter()
		.append("circle")
		.attr("class", "gridCircle")
		.attr("r", function(d, i){return radius/cfg.levels*d;})
		.style("fill", "#CDCDCD")
		.style("stroke", "#CDCDCD")
		.style("fill-opacity", cfg.opacityCircles)
		.style("filter" , "url(#glow)");


	//Text indicating at what % each level is
	axisGrid.selectAll(".axisLabel")
	   .data(d3.range(1,(cfg.levels+1)).reverse())
	   .enter().append("text")
	   .attr("class", "axisLabel")
	   .attr("x", 4)
	   .attr("y", function(d){return -d*radius/cfg.levels;})
	   .attr("dy", "0.4em")
	   .style("font-size", "10px")
	   .attr("fill", "#737373")
	   .text(function(d,i) { return Format(differenceValue * d/cfg.levels + minValue); });

	/////////////////////////////////////////////////////////
	//////////////////// Draw the axes //////////////////////
	/////////////////////////////////////////////////////////

	//Create the straight lines radiating outward from the center
	var axis = axisGrid.selectAll(".axis")
		.data(allAxis)
		.enter()
		.append("g")
		.attr("class", "axis");
	//Append the lines
	axis.append("line")
		.attr("x1", 0)
		.attr("y1", 0)
		.attr("x2", function(d, i){ return rScale(maxValue*1.1) * Math.cos(angleSlice*i - Math.PI/2); })
		.attr("y2", function(d, i){ return rScale(maxValue*1.1) * Math.sin(angleSlice*i - Math.PI/2); })
		.attr("class", "line")
		.style("stroke", "white")
		.style("stroke-width", "2px");

	//Append the labels at each axis
	axis.append("text")
		.attr("class", "legend")
		.style("font-size", "11px")
		.attr("text-anchor", "middle")
		.attr("dy", "0.35em")
		.attr("x", function(d, i){ return rScale(maxValue * cfg.labelFactor) * Math.cos(angleSlice*i - Math.PI/2); })
		.attr("y", function(d, i){ return rScale(maxValue * cfg.labelFactor) * Math.sin(angleSlice*i - Math.PI/2); })
		.text(function(d){return d})
		.call(wrap, cfg.wrapWidth);

	/////////////////////////////////////////////////////////
	///////////// Draw the radar chart blobs ////////////////
	/////////////////////////////////////////////////////////

	//The radial line function
	var radarLine = d3.svg.line.radial()
		.interpolate("linear-closed")
		.radius(function(d) { return rScale(d.value); })
		.angle(function(d,i) {	return i*angleSlice; });

	if(cfg.roundStrokes) {
		radarLine.interpolate("cardinal-closed");
	}

	//Create a wrapper for the blobs
	var blobWrapper = g.selectAll(".radarWrapper")
		.data(data)
		.enter().append("g")
		.attr("class", "radarWrapper")
    .attr("id", function(d){return d[0].grp + '_radarWrapper'})
    .style("opacity", 0)

  blobWrapper.filter(function (d, i) {  // make only the first element visible on start
    if(i === 0){
      d3.select(this).style("opacity", 1)
    }
  })


// .append("a")
//   .attr("href", function(d){ return '#' + d[0].link})
	//Append the backgrounds
	blobWrapper
		.append("path")
		.attr("class", "radarArea")
		.attr("d", function(d,i) { return radarLine(d); })
		.style("fill", function(d,i) { return cfg.color(i); })
		.style("fill-opacity", cfg.opacityArea)
		.on('mouseover', function (d,i){
			//Dim all blobs
			d3.selectAll(".radarArea")
				.transition().duration(200)
				.style("fill-opacity", 0.1);
			//Bring back the hovered over blob
			d3.select(this)
				.transition().duration(200)
				.style("fill-opacity", 0.7);
		})
		.on('mouseout', function(){
			//Bring back all blobs
			d3.selectAll(".radarArea")
				.transition().duration(200)
				.style("fill-opacity", cfg.opacityArea);
		});

	//Create the outlines
	blobWrapper.append("path")
		.attr("class", "radarStroke")
		.attr("d", function(d,i) { return radarLine(d); })
		.style("stroke-width", cfg.strokeWidth + "px")
		.style("stroke", function(d,i) { return cfg.color(i); })
		.style("fill", "none")
		.style("filter" , "url(#glow)");

	//Append the circles
	blobWrapper.selectAll(".radarCircle")
		.data(function(d,i) { return d; })
		.enter().append("circle")
		.attr("class", "radarCircle")
		.attr("r", cfg.dotRadius)
		.attr("cx", function(d,i){ return rScale(d.value) * Math.cos(angleSlice*i - Math.PI/2); })
		.attr("cy", function(d,i){ return rScale(d.value) * Math.sin(angleSlice*i - Math.PI/2); })
		.style("fill", function(d,i,j) { return cfg.color(j); })
		.style("fill-opacity", 0.8);

	/////////////////////////////////////////////////////////
	//////// Append invisible circles for tooltip ///////////
	/////////////////////////////////////////////////////////

	//Wrapper for the invisible circles on top
	var blobCircleWrapper = g.selectAll(".radarCircleWrapper")
		.data(data)
		.enter().append("g")
		.attr("class", "radarCircleWrapper");

	//Append a set of invisible circles on top for the mouseover pop-up
	blobCircleWrapper.selectAll(".radarInvisibleCircle")
		.data(function(d,i) { return d; })
		.enter().append("circle")
		.attr("class", "radarInvisibleCircle")
		.attr("r", cfg.dotRadius*1.5)
		.attr("cx", function(d,i){ return rScale(d.value) * Math.cos(angleSlice*i - Math.PI/2); })
		.attr("cy", function(d,i){ return rScale(d.value) * Math.sin(angleSlice*i - Math.PI/2); })
		.style("fill", "none")
		.style("pointer-events", "all")
		.on("mouseover", function(d,i) {
			newX =  parseFloat(d3.select(this).attr('cx')) - 10;
			newY =  parseFloat(d3.select(this).attr('cy')) - 10;

			tooltip
				.attr('x', newX)
				.attr('y', newY)
				.text(Format(d.value))
				.transition().duration(200)
				.style('opacity', 1);
		})
		.on("mouseout", function(){
			tooltip.transition().duration(200)
				.style("opacity", 0);
		});

	//Set up the small tooltip for when you hover over a circle
	var tooltip = g.append("text")
		.attr("class", "tooltip")
		.style("opacity", 0);

	/////////////////////////////////////////////////////////
	/////////////////// Helper Function /////////////////////
	/////////////////////////////////////////////////////////

	//Taken from http://bl.ocks.org/mbostock/7555321
	//Wraps SVG text
	function wrap(text, width) {
	  text.each(function() {
		var text = d3.select(this),
			words = text.text().split(/\s+/).reverse(),
			word,
			line = [],
			lineNumber = 0,
			lineHeight = 1.4, // ems
			y = text.attr("y"),
			x = text.attr("x"),
			dy = parseFloat(text.attr("dy")),
			tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");

		while (word = words.pop()) {
		  line.push(word);
		  tspan.text(line.join(" "));
		  if (tspan.node().getComputedTextLength() > width) {
			line.pop();
			tspan.text(line.join(" "));
			line = [word];
			tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
		  }
		}
	  });
	}//wrap

}//RadarChart


var selectRadarChartData = function(rcdata, grpArray){
  // create a object and map to a list[list]
  var modData = {}
  rcdata.forEach(function(d){
    if (grpArray.indexOf(d.grp) !== -1){
      if ( !(typeof modData[d.grp] !== 'undefined' && modData[d.grp] instanceof Array) ) {
        modData[d.grp] = []
      }
      // adding link ... to data
      if (/^NP_[0-9]{5,}/i.test(d.link)){  // this is to extract AA change for DOM ID redirection
        d.link = d.link.split('.').pop(-1)
      }
      modData[d.grp].push(d)
    }
  })
  modData = Object.keys(modData).map(function(key){
      return modData[key]
  })
  return modData
}


if (typeof window.variant !== 'undefined' && typeof window.gene !== 'undefined' && typeof window.radarChartData !== 'undefined'){
  //----- Instantiation -----//
  var radarChartConfig = {
    w: 170,
    h: 170,
    margin: {top: 40, right: 50, bottom: 40, left: 50},
    maxValue: 28,   // greatest number expression z score can get for lumier data in db
    levels: 5,
    roundStrokes: true,
    color: d3.scale.category20()
  };

  if (radarChartData.length !== 0) {
    var garray = variant.map(function(d){return d.MUT_HGVS_AA})
    garray.push(gene.symbol)
    var wtRadarData = selectRadarChartData(radarChartData, garray)
    RadarChart("#lumier-interaction", wtRadarData, radarChartConfig);
  }
}

'use strict';

$(document).ready(function(){


  var genes = new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.whitespace,
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    // url points to a json file that contains an array of country names, see
    // https://github.com/twitter/typeahead.js/blob/gh-pages/data/countries.json
    prefetch: '../data/Gene.HUGO_GENE_SYMBOL.json'
  });

  var variants = new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.whitespace,
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    // url points to a json file that contains an array of country names, see
    // https://github.com/twitter/typeahead.js/blob/gh-pages/data/countries.json
    prefetch: '../data/Variant.MUT_HGVS_NT_ID.json'
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

'use strict';

$(document).ready(function(){

  $('form#advanceSearch').submit(function (e) {
    e.preventDefault();
    $.ajax({
        url: '/search',
        type: 'POST',
        data : $('#advanceSearch').serialize(),
        success: function(data) {
          console.log(data)
           $('#searchResult').html(data);
        }
    });
  });
//http://stackoverflow.com/questions/1200266/submit-a-form-using-jquery

  var chromosomeLocation= new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.whitespace,
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    prefetch: '../data/Gene.CHROMOSOME_NAME.json'
  });

  var inPfam = new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.whitespace,
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    prefetch: '../data/VariantProperty.IN_PFAM.json'
  });

  var inMotif = new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.whitespace,
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    prefetch: '../data/VariantProperty.IN_MOTIF.json'
  });

  var clinVarSig= new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.whitespace,
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    prefetch: '../data/VariantProperty.CLINVAR_CLINICAL_SIGNIFICANCE.json'
  });

  var hgmdVariantClass = new Bloodhound({
    datumTokenizer: Bloodhound.tokenizers.whitespace,
    queryTokenizer: Bloodhound.tokenizers.whitespace,
    prefetch: '../data/Variant.HGMD_VARIANT_CLASS.json'
  });


  $('input.chrName-typeahead').typeahead({
    highlight: true
  }, {
    name: 'chromosomeLocation',
    source: chromosomeLocation
  });


  $('input.inPfam-typeahead').typeahead({
    highlight: true
  }, {
    name: 'inPfam',
    source: inPfam
  })

  $('input.inMotif-typeahead').typeahead({
    highlight: true
  }, {
    name: 'inMotif',
    source: inMotif
  })

  $('input.clinVarSig-typeahead').typeahead({
    highlight: true
  }, {
    name: 'clinVarSig',
    source: clinVarSig
  })

  $('input.hgmdVariantClass-typeahead').typeahead({
    highlight: true
  }, {
    name: 'hgmdVariantClass',
    source: hgmdVariantClass
  });

});

//
// $(document).ready(function(){
//   $('input.typeahead').bind('typeahead:select', function(ev, suggestion) {
//
//   });
// });

$(document).ready(function(){
    $("body").scrollspy({
        target: "#target_nav",
        offset: 50
    })
});


$(document).ready(function(){
  // $(c).one('click', function (e) {
    // e.preventDefault();
    // $.trim($('a#variantBoxAjax').text())
    variant.forEach(function(v){
      var variant_aa_id = v.MUT_HGVS_AA
      $.ajax({
          url: document.location.protocol +"//"+ document.location.hostname + ':' + document.location.port + document.location.pathname + '/variantBoxAjax',
          type: 'GET',
          data : {
            'variant_aa_id': variant_aa_id
          },
          success: function(data) {
            // console.log(data)
            $('#' + variant_aa_id + '_cardbox').html(data);
          }
      });
    })

  // });
})
