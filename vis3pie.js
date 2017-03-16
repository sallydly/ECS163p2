//PIE CHART

var format = d3.format(",d"); //puts commas in numbers

var p_margin = {top: 20, right: 20, bottom: 30, left: 50}
    p_height =  600 - p_margin.left - p_margin.right,
    p_width = 500 - p_margin.top -p_margin.bottom;
    radius = Math.min(p_width, p_height) / 2; 
    
var p_svg = d3.select("#pie_chart").append("svg")
      .attr("width", p_width)
      .attr("height", p_height)
    .append("g")
      .attr("transform", "translate(" + p_width / 2  + "," + p_height / 2 + ")");
   
var pie = d3.pie() //default value
  .sort(null)
  .value(function(d) { return d.value; }); //edit data to have array format {identifiers:..., type:..., value:...}
  
var arc = d3.arc()
  .innerRadius(radius - 100)
  .outerRadius(radius - 20);
  
var p_legendRectSize = radius * 0.05;
var p_legendSpacing = radius * 0.02;

var p_colors = d3.scaleOrdinal(d3.schemeCategory20);

var p_legend = p_svg.selectAll(".legend")
    .data(["Regular Rate", "Overtime Rate", "Incentive Allowance", "Other"])
  .enter()
    .append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) {
        var height = p_legendRectSize + p_legendSpacing;
        var offset =  height * p_colors.domain().length / 2;
        var horz = -8 *  p_legendRectSize;
        var vert = i * height - offset;
        return "translate(" + horz + "," + vert + ")";
      });
  
  p_legend.append("rect") //the color boxes
    .attr("width", p_legendRectSize)
    .attr("height", p_legendRectSize)
    .attr("x", p_legendRectSize + p_legendSpacing)
    .attr("y", p_legendRectSize - p_legendSpacing - 36)
    .style("fill", function(d, i) { return p_colors(i); }) 
    .style("stroke", function(d, i) { return p_colors(i); });
    
  p_legend.append("text") 
    .style("stroke", function(d, i) { return p_colors(i); })
    .attr("x", p_legendRectSize + p_legendSpacing + 20)
    .attr("y", p_legendRectSize - p_legendSpacing - 25)
    .text(function(d) {return d;});

var p_dataset = [];


function arcTween(d) {
  this._current = this._current || d;
  var interpolate = d3.interpolate(this._current, d);
  this._current = interpolate(0);
  return function(t) {
      return arc(interpolate(t));
  };
}

function change_pie(year, dep, job) {
  var new_data = pie_data_filter(year, dep, job);

  window.path = path.data(pie(new_data));
  window.path.transition().duration(1000).attrTween("d", arcTween); //redraw aarcs
  
} //update pie with every hover

function pie_data_filter(year, dep, job) {
  var arr = [];
  var labels = ["RegularRate", "OvertimeRate", "IncentiveAllowance", "Other"];

  for (var i = 0; i < p_dataset.length; i++) {
    if (p_dataset[i]["Year"] == year && p_dataset[i]["Department"] == dep && p_dataset[i]["JobTitle"] == job) {
      for (var j = 0; j < labels.length; j++) {
        var dict = new Object();
        label = labels[j];
        dict["type"] = label;
        dict["value"] = p_dataset[i][label];
        arr.push(dict);
      }
      break; //only one unique ID  
    }
  }
  return arr;
} //array format {identifiers:..., type:..., value:...}

function p_render(data) {
  p_dataset = data; //use for change function later
  defaultdata = data[0];
  
  filtered_data = pie_data_filter(defaultdata.Year, defaultdata.Department, defaultdata.JobTitle)
  
  window.path = p_svg.datum(data).selectAll("path")
      .data(pie(filtered_data))
    .enter().append("path")
      .attr("fill", function(d, i) {return p_colors(i);}) //fill pie chart with colors
      .attr("d", arc)
      .each(function(d) {this._current = d; }); //store initial angles
}

function p_convert(d) {
	keys = d3.keys(d[0]);
	for (k in keys) {
		if (k != "Department" || k != "JobTitle") {
			d[k] = +d[k];
		}
	}
  
  return d;
}	

d3.csv("SalaryData_pie.csv", p_convert, p_render);