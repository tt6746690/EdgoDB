

// reference: http://bl.ocks.org/mattbrehmer/12ea86353bc807df2187

var expressionChart = function(target_dom, raw_data, config) {
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
    .style("fill", config.gridColor)
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
    .attr("r", config.dotRadius)
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
    return xScale(d.grp) + Math.floor((Math.random() * seed) + 1)*0.3;
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
  // sort variant based on mutation position ascending
  return_data.sort(function(a, b){
    var aInt = parseInt(a.grp.match(/\d+/))
    var bInt = parseInt(b.grp.match(/\d+/))
    console.log(aInt, bInt, aInt > bInt)
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
    labelColor: "#818181",
    gridColor: '#f4f4f4',
    dotRadius: 2.5
  };

  if (expressionChartData.length !== 0) {
    var expressionChart = new expressionChart("#elisa-expression", expressionChartData, expressionChartConfig);
  }
}
