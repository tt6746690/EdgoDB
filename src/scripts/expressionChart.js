

var expressionChart = function(target_dom, raw_data, config) {
  this.config = config
  this.target_dom = target_dom
  this.config.width = this.config.w - this.config.margin.left -  this.config.margin.right
  this.config.height = this.config.h - this.config.margin.top -  this.config.margin.bottom

  this.xScale = d3.scale.linear()
    .range([this.config.padding, this.config.width - this.config.padding])


  // this.data = this.processData(data)
  var data = this.processData(raw_data)
  console.log(data)


};


expressionChart.prototype.createSVG = function(){
  config = this.config
  xScale = this.xScale
  data = this.data
  target_dom = this.target_dom

  var svg = d3.select(target_dom)
              .append("svg")
              .attr("width", config.w)
              .attr("height", config.h);

  var xAxis = d3.svg.axis()
    .scale(xScale)
    .orient("bottom");

  svg.append("g")
     .attr("class", "axis")
     .attr("transform", "translate(0, " + (config.height - config.padding) + ")")
     .call(xAxis);

  var boxGroup = svg.append('g')
     .attr("transform", "translate(0,0)")
     .attr("class", "boxGroup")

  console.log(data)
  var box = d3.select('.boxGroup').selectAll()
    .data(data).enter()
    .append("line")
    .attr("class", "whisker")
    .attr("x1", function(d){ return xScale(d.lowerWhisker)})
    .attr("x2", function(d){ return xScale(d.lowerWhisker)})
    .attr("stroke", "black")
    .attr("y1", function(d){ return 30})
    .attr("y2", function(d){ return 30})

  //draw vertical line for upperWhisker
  // svg.append("line")
  //    .attr("class", "whisker")
  //    .attr("x1", xScale(upperWhisker))
  //    .attr("x2", xScale(upperWhisker))
  //    .attr("stroke", "black")
  //    .attr("y1", midline - 10)
  //    .attr("y2", midline + 10);


}

expressionChart.prototype.processData = function(data){
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

  mmax = Object.keys(new_data).map(function(k){
    return new_data[k].maxVal
  })
  mmin = Object.keys(new_data).map(function(k){
    return new_data[k].minVal
  })
  this.xScale.domain([d3.min(mmin)*1.10, d3.max(mmax)*1.10]);

  return_data = Object.keys(new_data).map(function(k){
    return new_data[k]
  })

  return(return_data)
}

if (typeof window.expressionChartData !== 'undefined' &&
  typeof window.gene !== 'undefined' &&
  typeof window.variant !== 'undefined') {
  //----- Instantiation -----//
  var expressionChartConfig = {
    w: 220,
    h: 220,
    margin: {top: 10, right: 10, bottom: 10, left: 10},
    padding: 10
  };

  if (expressionChartData.length !== 0) {
    ex = new expressionChart("#elisa-expression", expressionChartData, expressionChartConfig);
  }
}
