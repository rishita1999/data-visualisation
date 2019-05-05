// "use strict"
var svgWidth = window.innerWidth-50,svgHeight =window.innerHeight-120;

var margin = {                                                                          //MIN 
    top:    20, 
    right:  20, 
    bottom: 5, 
    left:   50
};
var planeWidth = svgWidth - margin["left"] - margin["right"];
var planeHeight = svgHeight-margin["bottom"] - margin["top"];

var svg = d3.select('#app')
            .append("svg")
            .attr("width",svgWidth)
            .attr("height",svgHeight)
            // .style("background-color","#353232");
            .style("background-color","#333");
svg.append("g").classed("axes",true)
var barGroup = svg.append("g");
var yAxis = svg.select(".axes")
            .append("g")                                                                 //Y-Axis
            .attr("class","y-axis");
var xAxis = svg.select(".axes")
            .append("g")                                                                 //X-Axis
            .attr("class","x-axis");
var toolTipSelection = d3.select("body").append("div")	                                // ToolTip
        .attr("class", "tooltip")				
        .style("opacity", 0);
var data,
line,
pointLineColor = "#FF3F80",
pointLineOpacity = 0.5,
toolTipOpacityIndex = 0.8;

d3.csv("result_day.csv",function(error,resdata){
    if(error)
    {
        console.log("Error");
        return;
    }
    data = resdata;
    console.log(data[0])
    draw("Hindi");
});
$('#filter').on('change', function() {
    draw( this.value );
});

function draw(val)
{
    var barArea = planeWidth/data.length;
    var barWidth = barArea * 0.8;
    var barMargin = barArea * 0.1;

    barGroup.attr("transform",( "translate(" + (margin.left+barMargin ) +","+ margin.top + ")" )); 
    svg.select(".axes").attr("transform",( "translate(" + margin.left +","+ margin.top + ")" )); 
    
    var avg = [parseInt(data[0][val])];
    var maxVal =  Math.max.apply(Math, data.map(function(o,i) { if(i) avg.push( ( (avg[i-1] * (i) ) + parseInt(o[val]) ) / (i+1) ); return o[val]; }));       //Calculate Max Data

    var totalAverage = avg[data.length-1];

    var scaleHeight = d3.scaleLinear()                                                      // Heights Scale ( based on relative data values)
            .domain([0,100])
            .range([0,planeHeight])
 
    var u = barGroup.selectAll("rect")
            .data(data,function(d){ return d.Name});
    u.transition()
        .duration(1500)
        .attr("y",function(d){ return planeHeight - scaleHeight(d[val]) } )
        .attr("height",function(d){ return scaleHeight(d[val]) } )
        .attr("fill",function(d,i){return d[val] > totalAverage ? "#3E50B4" : "#FF3F80"})

    var v = u.enter()
            .append("rect")
            .attr("height",0)
            .attr("y",function(d){ return planeHeight})
            .attr("x",function(d,i){return i*barArea})
            .attr("width",barWidth)

    v.transition()
            .duration(1500)
            .ease(d3.easeElastic ) 
            .delay(function(d,i){return i*300})
            .attr("y",function(d){ return planeHeight - scaleHeight(d[val]) } )
            .attr("height",function(d){ return scaleHeight(d[val]) } )        
            .attr("fill",function(d,i){return d[val] > totalAverage ? "#3E50B4" : "#FF3F80"});

//     // ALL BARS : 
    v.merge(u)
    .on("mouseover", function(d,i) {
        d3.select(this)                                                                 // Adding Bar Highlight
            .style("stroke-width","1")
        line = barGroup.append("line")                                                   //Pointing line visible on hover
            .attr("class","linePoint") 
            .attr("stroke-width", 1)                                                    //Pointing Line
            .attr("stroke", pointLineColor)
            .attr("x1",-barMargin)
            .attr("x2",(barArea * i) )
            .attr("y1", planeHeight - scaleHeight(d[val]) )
            .attr("y2", planeHeight - scaleHeight(d[val]) )
            .style("opacity", pointLineOpacity);
        toolTipSelection.style("opacity", toolTipOpacityIndex)                          // ToolTip
            .html("<b>" + d.Name + "</b><br/>Marks in "+val+": <b>" +d[val]+"</b>" )	
            .style("left", (d3.event.pageX) + "px")		
            .style("top", (d3.event.pageY - 28) + "px");	
        })
    // CANCELLING HOVER : 
    .on("mouseout", function(d) {	                                                    
        d3.select(this )	                                                                // Removing Bar Highlight
            .style("opacity", 1);	        
            toolTipSelection.style("opacity", 0);                                              // Hiding ToolTip
            line.remove();	                                                                   // Hiding Pointing Line	
    })

    
    // Y-AXIS BELOW    
    var yScale = d3.scaleLinear()                                                          //Scale Definition on the basis of data(Y)
                .domain([0,maxVal])
                .range([planeHeight,0]);

    var y_axis = d3.axisLeft()                                                             //Axis definition(Y)
                .scale(yScale)
                .ticks(8)
                .tickSize(- planeWidth)
                .tickSizeOuter(0)

    yAxis.transition().duration(1500).call(y_axis);                                         //Generating Axis(Y)

}