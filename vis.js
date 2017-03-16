//BAR CHART 

d3.select("input[value=\"2008\"]").property("checked", true); //default

//set margins, width, and height
var margin = {top: 20, right: 20, bottom: 30, left: 50},
  height = 500 - margin.left - margin.right,
  width = 960 - margin.top - margin.bottom;
 
//set ranges
var x = d3.scaleBand() //departments
  .rangeRound([0, width]) //length of x-axis
  .padding(0.1)
  .align(0.5);
  
var y = d3.scaleLinear() //money
  .range([height, 0]);

//append svg
var svg = d3.select("#overview_vis").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + 6* margin.bottom)

var g = svg.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var department_chosen = "Air Pollution Control";

//tooltip
var tooltip = d3.tip()
  .attr("class", "tooltip")
  .direction("n")
  .offset([10, 0])
  .html(function(d) {
    return "<strong>Avg. Annual Rate:</strong> <span>" + "$" + format(d["2008"]) + "</span>";}); //curr_data is the year we're looking at

//invoke tip library
g.call(tooltip);

function render(data) {
	
  //map axis
  x.domain(data.map(function(d) { return d.Department; }));
  y.domain([0, d3.max(data, function(d) { return d.max; } ) ]);
  
  //draw axis
  g.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(0, " + height + ")")
      .call(d3.axisBottom(x))
    .selectAll("text")
      .attr("y", 2)
      .attr("x", 9)
      .attr("dy", ".35em")
      .attr("transform", "rotate(70)")
      .style("text-anchor", "start");

  g.append("text")
    .attr("x", 0 - margin.left)
    .attr("y", height + margin.bottom + margin.top)
    .attr("fill", "#000")
    .attr("font-size", 11)
    .attr("font-weight", "bold")
    .attr("text-anchor", "start")
    .text("Departments->");

  //y-axis
  g.append("g")
      .attr("class", "axis")  
      .call(d3.axisLeft(y))
    .append("text")
      .attr("x", -50)
      .attr("y",-5)
      .attr("fill", "#000")
      .attr("font-weight", "bold")
      .attr("text-anchor", "start")
      .text("Average Annual Rate");
      
  //make rects
  g.selectAll(".rect")
      .data(data)
    .enter().append("rect")
      .attr("class", "rect")
      .attr("x", function(d) { return x(d.Department); })
      .attr("width", x.bandwidth())
      .attr("y", function(d) { return y(d["2008"]); }) //default with 2007=8
      .attr("height", function(d) { return height - y(d["2008"]); })
      .on("mouseover", tooltip.show)
      .on("mouseout", tooltip.hide)
			.on("click", update);
      
  d3.selectAll("input")
    .on("change", change);
  
  function change() {
      
    d3.selectAll(".rect")  
      .exit()
      .transition()
        .duration(500)
      .attr("y", y(0))
      .attr("height", height - y(0))
      .style('fill-opacity', 1e-6)
      .remove();
    
    var val = this.value; //ex. "year"
    var keys = d3.keys(data[0]);
    for (k in keys) {
      if (val == keys[k]) {
        g.selectAll(".rect")
          .enter().append("rect")
            .attr("class", "rect")
            .attr("y", y(0))
            .attr("height", height - y(0));
            
            
        g.selectAll(".rect")
          .transition().duration(500).attr("x", function(d) { return x(d.Department); })
          .attr("width", x.bandwidth())
          .attr("y", function(d) {return y(d[val]); })
          .attr("height", function(d) { return height - y(d[val]); });
        
        tooltip.html(function(d) { 
          return "<strong>Avg. Annual Rate:</strong> <span>" + "$" + d[val] + "</span>";}); //curr_data is the year we're looking at
        break;
      }
    }
    change_bubble(val, department_chosen);
  }
  
  function update(d) {
    department_chosen = d.Department;
    var form = document.getElementsByName('dataset');
    var value;
    for(var i = 0; i < form.length; i++){
        if(form[i].checked){
            value = form[i].value;
        }
    }
    change_bubble(value, d.Department); 
    window.location.href="#bubble_chart";
  } //update bubble chart
}

function convert(d) {
	keys = d3.keys(d[0]);
	for (k in keys) {
		if (k != "Department") {
			d[k] = +d[k];
		}
	}
  
  return d;
}

d3.csv("SalaryData_AvgSalary.csv", convert, render);

