// svg dimensions
var svgWidth = 1200;
var svgHeight = 600;
// define margins
var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100};
// chartGroup dimensions
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;
// Create an SVG wrapper
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);
// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);
// Initial Params
var chosenYAxis = "obesity";

// function used for updating x-scale var upon click on axis label
function yScale(censusData, chosenYAxis) {
  var yLinearScale = d3.scaleLinear()
    .domain([0, d3.max(censusData, d => d[chosenYAxis])])
    .range([height, 0]);
  return yLinearScale}

// function used for updating yAxis var upon click on axis label
function renderAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);
  yAxis.transition()
    .duration(1000)
    .call(leftAxis);
  return yAxis}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newYScale, chosenYAxis) {
  circlesGroup.transition()
    .duration(1000)
    .attr("cy", d => newYScale(d[chosenYAxis]));
  return circlesGroup}

// function used for updating circles group with new tooltip
function updateToolTip(chosenYAxis, circlesGroup) {
  var label;
  if (chosenYAxis === "obesity") {
    label = "Obesity(%):"}
  else {
    label = "Smokers(%):"}
  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${label} ${d[chosenYAxis]}`)});
  circlesGroup.call(toolTip);
  circlesGroup
    .on("mouseover", function(data) {
      toolTip.show(data)})
    .on("mouseout", function(data) {
      toolTip.hide(data)});
  return circlesGroup}

// Retrieve data from the CSV file and execute everything below
d3.csv("../../assets/data/data.csv").then(function(censusData) {
  // parse data
  censusData.forEach(function(data) {
    data.poverty = +data.poverty;
    data.smokes = +data.smokes;
    data.obesity = +data.obesity});
  // yLinearScale function above csv import
  var yLinearScale = yScale(censusData, chosenYAxis);
  // Create x scale function
  var xLinearScale = d3.scaleLinear()
    .domain(d3.extent(censusData, d => d.poverty))
    .range([0, width]);
  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);
  // append x axis
  var xAxis = chartGroup.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);
  // append y axis
  var yAxis = chartGroup.append("g")
    .call(leftAxis);
  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(censusData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d.poverty))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 10)
    .attr("fill", "lightblue")
    .attr("opacity", ".75")
    .text(d => d.abbr);
  // add text to circles
  // circlesGroup
  //   .data(censusData)
  //   .enter()
  //   .append('text')
  //   .text(d => d.abbr)
  //   .attr("dx", d => xLinearScale(d.poverty))
  //   .attr('dy', d => yLinearScale(d[chosenYAxis]))
  //   .attr("class", "stateText")
  // // Create group for  2 y- axis labels
  var labelsGroup = chartGroup.append("g")
    .attr("transform", "rotate(-90)")
  // create y-axis labels
  var obeseLabel = labelsGroup.append("text")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("value", "obesity")
    .classed("axis-text", true)
    .text("Obese(%)");
  var smokesLabel = labelsGroup.append("text")
    .attr("y", 0 - (margin.left/2))
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("value", "smokes")
    .classed("axis-text", true)
    .text("Smokers(%)");
  
  // append x axis label
  chartGroup.append("text")
    .attr("transform", `translate(${width / 2}, ${height + 20})`)
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("Population living in Poverty (%)");
    
  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenYAxis, circlesGroup);

  // x axis labels event listener
  labelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenYAxis) {
        // replaces chosenXAxis with value
        chosenYAxis = value;
        // updates x scale for new data
        yLinearScale = yScale(censusData, chosenYAxis);
        // updates x axis with transition
        yAxis = renderAxes(yLinearScale, yAxis);
        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, yLinearScale, chosenYAxis);
        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenYAxis, circlesGroup);
        // changes classes to change bold text
        if (chosenYAxis === "obesity") {
          obeseLabel
            .classed("active", true)
            .classed("inactive", false);
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          obeseLabel
            .classed("active", false)
            .classed("inactive", true);
          smokesLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
})
.catch(function(error) {
  console.log(error);
});
