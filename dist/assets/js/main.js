


var DomainChart = function(data, config){
  this.config = config
  this.data = data
  this.mutation = this.getMutationData()
  this.x = d3.scale.linear()
            .domain([0, this.data.proteinLength])
            .range([0, this.config.width - 5*this.config.xoffset])
  // waste the first color
  var wastedColor = this.config.color('NothingCouldNeverHaveThisName')


  this.createSVG()
  this.markMutations()
  this.drawRegions()
}


DomainChart.prototype.createSVG = function(){
  var width = this.config.width || 1000
      height = this.config.height || 200

  config = this.config
  x = this.x

  this.svg = d3.select(this.config.target_dom).append("svg")
      .attr("width", width)
      .attr("height", height);

  this.svg.append('g')
          .attr("transform", "translate(0,0)")
          .attr("class", "pdgraph")

}


DomainChart.prototype.getMutationData = function(){
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

DomainChart.prototype.markMutations = function(){
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
                  newTextFontSize = active ? config.headFontSize * 2: config.headFontSize,
                  newRadiusFactor = active ? 2 : 0.5,
                  variantTabID = active ? '.nav-tabs a[href="#' + d.name + '_cardbox"]': '.nav-tabs a[href="#wildtype_cardbox"]'
              // domainChart

                  // deselection
              d3.select('.pdgraph').selectAll('circle')
                .classed('active', false)
                .attr("r", function(x){
                  if(x.name !== d.name){
                    return config.headRadius
                  } else {
                    return d3.select(this).attr("r")
                  }
                })
              d3.select(".pdgraph").selectAll('text')
                .transition()
                .duration(200)
                .attr("font-size", function(x){
                  if(x.name !== d.name){
                    return config.headFontSize
                  } else {
                    return d3.select(this).attr("font-size")
                  }
                })

                  // on click behavior
              d3.select(this).classed("active", active)
              d3.select(this).on("mouseout", activeMouseOut)
              d3.select("#" + d.name + "_needleText")
                .transition()
                .duration(200)
                .attr("font-size", newTextFontSize)
              // radarChart
                  // deselection
              d3.select("#radarGroup").selectAll("g.radarWrapper")
                .style("opacity", function(x){
                  if(x[0].grp === gene.symbol){
                    return 1
                  } else if(x.name !== d.name){
                    return 0
                  } else {
                    return d3.select(this).style("opacity")
                  }
                })
                  // on click behavior
              d3.select("#" + d.name + '_radarWrapper').style("opacity", newOpacity)

              // expressionChart
                  // de selection
              d3.selectAll(".expression-dot").attr("r", 2.5) // hard coded 2.5 radius....
                  // on click behavior
              d3.selectAll('.' + d.name + '_expressionDot')
                .attr("r", function(){
                  return d3.select(this).attr("r") * newRadiusFactor
                })
                .transition()
                .duration(200)

              // y2hChart
              if (y2hChartData.nodes.length !== 0 && y2hChartData.links.length) {
                var y2hDataChoice = active ? subsetY2hData(y2hChartData, d.name): subsetY2hData(y2hChartData, '0')
                removeSVG('#y2h-interaction-mut')
                new Y2hChart("#y2h-interaction-mut", y2hDataChoice, y2hChartConfig)
              }
              if (!active){
                removeSVG('#y2h-interaction-mut')
              }

               $(variantTabID).tab('show');

            })
            .on("dblclick", 'undefined')

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


DomainChart.prototype.drawRegions = function(){
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
          .attr("target", "_blank")
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
          .style("fill", "lightgrey")
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
    "height": 240,
    "width": 550,
    "target_dom": "#protein-domain-graph",
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
    var domainChart = new DomainChart(domainChartData, domainChartConfig)
  }
}




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



// reference: http://bl.ocks.org/mattbrehmer/12ea86353bc807df2187

var ExpressionChart = function(target_dom, raw_data, config) {
  this.config = config
  this.target_dom = target_dom
  this.config.width = this.config.w - this.config.margin.left -  this.config.margin.right
  this.config.height = this.config.h - this.config.margin.top -  this.config.margin.bottom
  this.config.color = d3.scale.category20()


  this.yScale = d3.scale.linear()
    .range([this.config.height - this.config.padding, this.config.padding])

  this.xScale = d3.scale.ordinal()
    .rangeBands([this.config.padding, this.config.width - this.config.padding])

  this.data = this.processData(raw_data)
  var numberOfBox = this.data.length

  this.draw()


};


ExpressionChart.prototype.draw = function(){
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
    .style("fill", config.gridColor)
    .call(xAxis);


  d3.select(".y-axis")
    .selectAll("text")
    .style("font-size","10px")
    .style("fill", config.labelColor)

  d3.select(".x-axis")
    .selectAll("text")
    .style("font-size","12px")
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
    .attr("r", config.dotRadius)
    .attr("class", function(d, i){
      var lowerWhisker = d3.select(this.parentNode).datum().lowerWhisker
      var upperWhisker = d3.select(this.parentNode).datum().upperWhisker
      if (d < lowerWhisker || d > upperWhisker){
        return "outlier_point " + (d3.select(this.parentNode).datum().grp + '_expressionDot') + " expression-dot";
      } else {
        return "inlier_point " + (d3.select(this.parentNode).datum().grp + '_expressionDot') + " expression-dot";
      }})
    .attr("cx", function() {
        var parentIndex =  box.data().indexOf(d3.select(this.parentNode).datum())
        var parentData = d3.select(this.parentNode).datum()
        return random_jitter(parentData, parentIndex);
     })
    .attr("cy", function(d) {
      return yScale(d);
    })
    .style("stroke", function() {
      var index =  box.data().indexOf(d3.select(this.parentNode).datum())
      return config.color(index)
    })
    .style("stroke-width", 1)
    .style("fill", "none")


  box.selectAll('.outlier_point')
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
    return xScale(d.grp) + Math.floor((Math.random() * seed) + 1)*0.3;
  }



}

ExpressionChart.prototype.processData = function(data){
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
  // sort variant based on mutation position ascending
  return_data.sort(function(a, b){
    var aInt = parseInt(a.grp.match(/\d+/))
    var bInt = parseInt(b.grp.match(/\d+/))
    if(aInt < bInt){
      return -1
    }
    if(aInt > bInt){
      return 1
    }
    return 0
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
  config.bar_width = config.xScaleIncrement * 0.8


  return(return_data)
}

if (typeof window.expressionChartData !== 'undefined') {
  //----- Instantiation -----//
  var expressionChartConfig = {
    w: 280,
    h: 250,
    margin: {top: 10, right: 10, bottom: 10, left: 10},
    padding: 10,
    bar_width: 15,
    labelColor: "lightgrey",
    gridColor: '#f1f1f1',
    dotRadius: 2.5
  };

  if (expressionChartData.length !== 0) {
    var expressionChart = new ExpressionChart("#elisa-expression", expressionChartData, expressionChartConfig);
  }
}


$(document).ready(function(){

  // scrollspy behaviour
  $("body").scrollspy({
      target: "#target_nav",
      offset: 50
  })


  // tooltip handling
  $('[data-toggle="tooltip"]').tooltip()

  $('#showToolTip').click(function(){
    $('.showToolTip').tooltip('toggle')
  })



  // pv viewer handling
  if(typeof window.pv !== 'undefined' && window.pdbInfo.length !== 0){
    var viewer = pv.Viewer(document.getElementById('pv'), {
      width: 536,
      height: 460,
      antialias: true,
      quality : 'high'
    })
    pv.io.fetchPdb('http://files.rcsb.org/download/' + pdbInfo[0].PDB_ID + '.pdb', function(structure){
          viewer.cartoon('protein', structure, { color : color.ssSuccession()});
          viewer.centerOn(structure);
    });
  }

  $('a.pdb-ajax-link').click(function(e){
    e.preventDefault()
    pv.io.fetchPdb('http://files.rcsb.org/download/' + $(this).attr("id") + '.pdb', function(structure){
          viewer.cartoon('protein', structure, { color : color.ssSuccession()});
          viewer.centerOn(structure);
    });
  })



  // damn definitely use REACT/REDUX for this later. STATE!!!
  // variant.forEach(function(v){
  //   $('.nav-tabs a[href="#' + v.MUT_HGVS_AA + '_cardbox"]').click(function() {
  //     $('#' + v.MUT_HGVS_AA + '_needleHead').d3Click();
  //   });
  // })


  // custom function to transfer click event handling from d3 to jquery
  jQuery.fn.d3Click = function () {
    this.each(function (i, e) {
      var evt = document.createEvent("MouseEvents");
      evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);

      e.dispatchEvent(evt);
    });
  };


  // // not using ajax. bad practice
  // if (typeof window.pv !== 'undefined' && window.pdbInfo.length !== 0){
  //   // ajax call to fetch variant box
  //   variant.forEach(function(v){
  //     var variant_aa_id = v.MUT_HGVS_AA
  //     $.ajax({
  //         url: document.location.protocol +"//"+ document.location.hostname + ':' + document.location.port + document.location.pathname + '/variantBoxAjax',
  //         type: 'GET',
  //         data : {
  //           'variant_aa_id': variant_aa_id
  //         },
  //         success: function(data) {
  //           // console.log(data)
  //           $('#' + variant_aa_id + '_cardbox').html(data);
  //         }
  //     });
  //   })
  // }

})

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
	 color: d3.scale.category20()	//Color function
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
      .attr("id", "radarGroup")
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
	   .attr("fill", "lightgrey")
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
    .style("fill", "lightgrey")
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

  // sort variant based on mutation position ascending
  modData.sort(function(a, b){
    var aInt = parseInt(a[0].grp.match(/\d+/))
    var bInt = parseInt(b[0].grp.match(/\d+/))
    if(aInt < bInt){
      return -1
    }
    if(aInt > bInt){
      return 1
    }
    return 0
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
    roundStrokes: false,
    color: d3.scale.category20()
  };

  if (radarChartData.length !== 0) {
    var garray = variant.map(function(d){return d.MUT_HGVS_AA})
    garray.push(gene.symbol)
    var wtRadarData = selectRadarChartData(radarChartData, garray)
    var radarChart = new RadarChart("#lumier-interaction", wtRadarData, radarChartConfig);
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
