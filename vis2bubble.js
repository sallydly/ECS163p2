//BUBBLE CHART

//set margins, width, and height
var b_margin = {top: 20, right: 20, bottom: 30, left: 50},
  b_height = 600 - b_margin.left - b_margin.right,
  b_width = 700 - b_margin.top - b_margin.bottom;
  
//append svg
var b_svg = d3.select("#bubble_chart").append("svg")
  .attr("width", b_width + b_margin.left + b_margin.right)
  .attr("height", b_height + b_margin.top + b_margin.bottom)

var b_g = b_svg.append("g")
      .attr("transform", "translate(" + b_margin.left + "," + 0 + ")");

var color_scale = d3.scaleOrdinal()
  .range(["orange", "rgb(255, 0, 0)", "rgb(153, 0, 0)"])
  .domain([0, 1, 2]);

var b_tooltip = d3.tip()
  .attr("class", "tooltip")
  .direction("n")
  .offset([10, 0])
  .html(function(d) {
    return d.data.id + "\n $" + format(d.data.data.AveAnnualRate);}); //curr_data is the year we're looking at

//invoke tip library
b_g.call(b_tooltip);    

b_svg.append("text")
  .attr("class", "text")
  .attr("y", 430)
  .text("Number of Employees:");
  
var b_legend = b_svg.selectAll(".legend")
  .data(["1","2-4", "5+"])
    .enter()
      .append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) {
          var height = 15 + 3;
          var offset =  height * color_scale.domain().length / 2;
          var horz =  80 * i;
          var vert =  450;
          return "translate(" + horz + "," + vert + ")";
        });
    
    b_legend.append("rect") //the color boxes
      .data(color_scale.range())
      .attr("width", 15)
      .attr("height", 15)
      .style("fill", function(d) { return d;}) 
      .style("stroke", function(d) { return d;});
      
    b_legend.append("text") 
      .attr("x", 20)
      .attr("y", 13)
      .text(function(d) {return d;});

var bubble = d3.pack()
	.size([b_width, b_height])
	.padding(1.5)
  .radius(function(d) { return d.data.data.AveAnnualRate / 1800 ; });

var b_dataset  = [];

function update_pie(d) {
    change_pie(d.data.data.Year, d.data.data.Department, d.data.data.JobTitle);
}   

function make_hier(data_filtered) {
    
    var stratify = d3.stratify()
      .id(function(d) { return d.JobTitle; })
      .parentId(function(d) { return d.Department; })
      (data_filtered);		
    
    var root = d3.hierarchy(stratify, function(d) { return d.children; })
      .sum(function(d) { return d.NumEmployees; });

    return root;  
} 

function yeardep_filter(year, dep, data) {
		var arr = [];
    var dict = new Object();
    dict["JobTitle"] = dep;
    dict["Department"] = null;
    arr.push(dict);
    
		for (var i = 0; i < data.length; i++) {
			if (data[i]["Year"] == year && data[i]["Department"] == dep) {
				arr.push(data[i]);
			}
		}
		return arr;
} //get rows pertaining to that year only

function change_bubble(year, dep) {
    data_filtered = yeardep_filter(year, dep, b_dataset); //default 
    
    var root = make_hier(data_filtered);
    
    d3.selectAll(".node").remove();
    
    var node = b_g.selectAll(".node")
      .data(bubble(root).leaves())
    .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
      
    node.append("circle")
      .attr("r", function(d) { return d.r; })
      .style("fill", function(d) { 
              var numE = d.data.data.NumEmployees;
              if (numE == 1) {
                return color_scale(0);
              }
              else if (numE > 1 && numE < 5) {
                return color_scale(1);
              }
              else if (numE >= 5){
                return color_scale(2);
              } 
       })
      .on("mouseover", function(d) { b_tooltip.show(d); update_pie(d);})
      .on("mouseout", b_tooltip.hide);

    d3.selectAll("#depName").remove();  
    
    b_svg.append("text")
        .attr("id", "depName")
        .attr("y", 40)
        .text("Department: " + dep);
}  
  
function b_render(data) {
  b_dataset = data;
  
	var data_filtered = yeardep_filter("2008", "Air Pollution Control", data); //default 
 
	var root = make_hier(data_filtered);
  
  var node = b_g.selectAll(".node")
      .data(bubble(root).leaves())
    .enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
  
  node.append("circle")
    .attr("r", function(d) { return d.r; })
    .style("fill", function(d) { 
              var numE = d.data.data.NumEmployees;
              if (numE == 1) {
                return color_scale(0);
              }
              else if (numE > 1 && numE < 5) {
                return color_scale(1);
              }
              else if (numE >= 5) {
                return color_scale(2);
              } 
       })
    .on("mouseover", function(d) { b_tooltip.show(d); update_pie(d);})
    .on("mouseout", b_tooltip.hide);
  
  b_svg.append("text")
    .attr("class", "text")
    .attr("y", 20)
    .style("text-decoration", "underline")
    .text("Avg. Annual Rate of each Job");
  
  b_svg.append("text")
    .attr("id", "depName")
    .attr("y", 40)
    .text("Department: " + "Air Pollution Control");
    
}

function b_convert(d) {
	keys = d3.keys(d[0]);
	for (k in keys) {
		if (k != "Department" || k != "JobTitle") {
			d[k] = +d[k];
		}
	}
  
  return d;
}	
	
d3.csv("SalaryData_bubble.csv", b_convert, b_render);