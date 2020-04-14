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

// Retrieve data from the CSV file and execute everything below
d3.csv("../../assets/data/data.csv").then(function(censusData) {
  // parse data
  censusData.forEach(function(data) {
      data.poverty = +data.poverty;
    //   data.smokes = +data.smokes;
      data.obesity = +data.obesity});
  // Create scale functions
  var yLinearScale = d3.scaleLinear()
    .domain([0,d3.max(censusData, d => d.obesity)])
    .range([height, 0])
  var xLinearScale = d3.scaleLinear()
    .domain(d3.extent(censusData, d => d.poverty))
    .range([0, width]);
  // Create axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);
  // append axes
  var xAxis = chartGroup.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);
  var yAxis = chartGroup.append("g")
    .call(leftAxis);
  // append circles
  /* Initialize tooltip */
  var tip = d3.tip().attr('class', 'd3-tip').html(function(d) {return (`${d.abbr}<br>Obesity(%): ${d.obesity}<br>Poverty(%): ${d.poverty}`)});

/* Invoke the tip in the context of your visualization */
  var circlesGroup = chartGroup.selectAll('circle')
  chartGroup.call(tip)
  circlesGroup.data(censusData).enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d.poverty))
    .attr("cy", d => yLinearScale(d.obesity))
    .attr("r", 15)
    .attr("fill", "lightblue")
    .attr("opacity", ".75")
    .on('mouseover', tip.show)
    .on('mouseout', tip.hide);
  // add text to circles
  circlesGroup.data(censusData)
    .enter()
    .append('text')
    .text(d => d.abbr)
    .attr("dx", d => xLinearScale(d.poverty))
    .attr('dy', d => yLinearScale(d.obesity -.25))
    .attr('font-size', '10px')
    .attr('stroke', 'peach')
    .attr('class', 'stateText');
  // // add tool tip
  // var toolTip = d3.tip()
  //   .attr("class", "tooltip")
  //   .offset([80, -60])
  //   .html(function(d) {
  //       return (`${d.abbr}<br>Obesity(%): ${d.obesity}<br>Poverty(%): ${d.poverty}`)});
  // // set mouseover and mouseout functions for tooltip
  // //circlesGroup.call(toolTip);
  // chartGroup
  //   .on('mouseover', function(d) {
  //       toolTip.show(d)})
  //   .on('mouseout', function(d) {
  //       toolTip.hide(d)});
  // create axis labels
  var yLabel = chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .classed("axis-text", true)
    .text("Obese(%)");
  var xLabel = chartGroup.append("text")
    .attr("transform", `translate(${width / 2}, ${height + 20})`)
    .attr("x", 0)
    .attr("y", 20)
    .classed("axis-text", true)
    .text("Population living in Poverty (%)");
   
})