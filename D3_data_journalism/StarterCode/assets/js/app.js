var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(healthData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(healthData, d => d[chosenXAxis]) * 0.8,
      d3.max(healthData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;

}


// function used for updating y-scale var upon click on axis label
function YScale(healthData, chosenYAxis) {
  // create scales
  var YLinearScale = d3.scaleLinear()
    .domain([d3.min(healthData, d => d[chosenYAxis]) * 0.8,
      d3.max(healthData, d => d[chosenYAxis]) * 1.2
    ])
    .range([height,0]);

  return YLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, XAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  XAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return XAxis;
}


// function used for updating YAxis var upon click on axis label
function renderYAxes(newYScale, YAxis) {
  var leftAxis = d3.axisBottom(newYScale);

  YAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return YAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}

// // function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis,chosenYAxis, circlesGroup) {
  var  Xlabel;
  var  Ylabel;

  if (chosenXAxis === "poverty") {
  Xlabel = "In Poverty";
  }
  else if (chosenXAxis ==="age"){
  Xlabel = "Age";
  }
  else {
  Xlabel = "Household Income"
  }

  if (chosenYAxis === "healthcare") {
  Ylabel = "Lacks Health Care";
    }
    else if (chosenYAxis ==="Smokes"){
  Ylabel = "Smokes";
    }
    else {
  Ylabel = "Obese";
    }
  


  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${Xlabel} ${d[chosenXAxis]}<br> ${Ylabel} ${d[chosenYAxis]}`);

    });


  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
//(async function(){
  //var heathData = await 
  
  d3.csv("assets/data/data.csv").then(function(heathData){



  // parse data
    heathData.forEach(function(data) {
    data.poverty = +data.poverty;
    data.age = +data.age;
    data.income = +data.income;
    data.healthcare = +data.healthcare;
    data.smokes = +data.smokes;
    data.obesity = +data.obesity;
  });


// xLinearScale function above csv import
  var xLinearScale = xScale(heathData, chosenXAxis);


// YLinearScale function above csv import
var YLinearScale = YScale(heathData, chosenYAxis);

  // Create y scale function
  var yLinearScale = d3.scaleLinear()
    .domain([0, d3.max(heathData, d => d.poverty)])
    .range([height, 0]);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(YLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  chartGroup.append("g")
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(heathData)
    .enter()
    .append("circle")
    //.text(abbr)
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => YLinearScale(d[chosenYAxis]))
    .attr("r", 20)
    .attr("fill", "pink")
    .attr("opacity", ".5");

    
    // appand abbreviation label for states
   chartGroup.selectAll("text")
  .data(heathData)
  .enter()
  .append("text")
  .attr("x", d => xLinearScale(d[chosenXAxis]))
  .attr("y", d => YLinearScale(d[chosenYAxis]))
  .attr("text-anchor", "middle")
  .text(d => d.abbr)
  .classed("stateText", true)
  ;


  // Create group for three x-axis and three y-axis labels
  var XlabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);
  var YlabelsGroup = chartGroup.append("g")
   .attr("transform", `translate(${width / 2}, ${height + 20})`);


  var povertyLabel = XlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In poverty(%)");

  var ageLabel = XlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age (Median)");

    var incomeLabel = XlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Age (Median)");

  // append y axis
    //var healthLabel = YlabelsGroup.
    chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0-30)
    .attr("x", 0- (height /2))
    .attr("value", "Lacks Health Care") // value to grab for event listener
    .classed("active", true)
    .text("Lack of Healthcare (%)");
  
    var SmokeLabel = YlabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("value", "Smokes") // value to grab for event listener
    .classed("inactive", true)
    .text("Smokes (%)");

    var ObeseLabel = YlabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .classed("axis-text", true)
    .text("Obese(%)");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis,chosenYAxis, circlesGroup);

  // x axis labels event listener
  XlabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(healthData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, YLinearScale, chosenYAxis);

//         // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "poverty") {
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
          .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis === "age"){
        povertyLabel
        .classed("active", false)
        .classed("inactive", True);
      ageLabel
        .classed("active", True)
        .classed("inactive", False);
      incomeLabel
        .classed("active", false)
        .classed("inactive", true);
        }
        else {
          povertyLabel
          .classed("active", false)
          .classed("inactive", True);
        ageLabel
          .classed("active", False)
          .classed("inactive", true);
        incomeLabel
          .classed("active", True)
          .classed("inactive", False);
        }
      }
    });

     // Y axis labels event listener
  YlabelsGroup.selectAll("text")
  .on("click", function() {
    // get value of selection
    var value = d3.select(this).attr("value");
    if (value !== chosenYAxis) {

      // replaces chosenXAxis with value
      chosenYAxis = value;

      console.log(chosenYAxis)

      // functions here found above csv import
      // updates Y scale for new data
      YLinearScale = YScale(healthData, chosenYAxis);

      // updates Y axis with transition
      YAxis = renderAxes(YLinearScale, YAxis);

      // updates circles with new x values
      circlesGroup = renderCircles(circlesGroup, xLinearScale, YLinearScale, chosenYAxis);

//       // updates tooltips with new info
      circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

      // changes classes to change bold text
      if (chosenYAxis === "healthcare") {
        healthLabel
         .classed("active", true)
          .classed("inactive", false);
          SmokeLabel
          .classed("active", false)
          .classed("inactive", true);
        ObeseLabel
        .classed("active", false)
          .classed("inactive", true);
      }
      else if (chosenYAxis === "Smokes"){
        healthLabel
      .classed("active", false)
      .classed("inactive", true);
      SmokeLabel
      .classed("active", true)
      .classed("inactive", false);
      ObeseLabel
      .classed("active", false)
      .classed("inactive", true);
      }
      else {
        healthLabel
        .classed("active", false)
        .classed("inactive", true);
        SmokeLabel
        .classed("active", false)
        .classed("inactive", true);
        ObeseLabel
        .classed("active", true)
        .classed("inactive", false);
      }
    }
  
  });
})

  