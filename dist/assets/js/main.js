

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
  this.mutation =this.getMutationData()
  this.createSVG()
  this.x = d3.scale.linear()
            .domain([0, this.data.proteinLength])
            .range([0, this.config.width - 3*this.config.xoffset])

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
          .attr("transform", "translate(-10,0)")
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
                  newStroke = active ? '#76b2e9' : 'lightgrey',
                  activeMouseOut = active ? null: needleHeadMouseOut,
                  newTextFontSize = active ? config.headFontSize * 2: config.headFontSize;
              d3.select("#" + d.name + '_radarWrapper').style("opacity", newOpacity)
              d3.select(this).classed("active", active)

              d3.select(this).style("stroke", newStroke)
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
    w: 220,
    h: 220,
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
            console.log(data)
            $('#' + variant_aa_id + '_cardbox').html(data);
          }
      });
    })

  // });
})
