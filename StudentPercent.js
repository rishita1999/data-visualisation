const express=require('express');
const app=express();
const mongoose=require('mongoose');
const passport=require('passport');
//var User = require("./user.js");


app.get("/",function(req,res){
  res.send("hello from md");
});

function draw(id,percent)
{
    var pie=d3.layout.pie()
            .value(function(d){return d})
            .sort(null);

    var w=300,h=320;

    var outerRadius=(w/2)-10;
    var innerRadius=outerRadius-8;


    var color = ['#ec1561','#2a3a46','#202b33'];

    var arc=d3.svg.arc()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius)
            .startAngle(0)
            .endAngle(2*Math.PI);

    //The circle is following this
    var arcDummy=d3.svg.arc()
            .innerRadius((outerRadius-innerRadius)/2+innerRadius)
            .outerRadius((outerRadius-innerRadius)/2+innerRadius)
            .startAngle(0);


    var arcLine=d3.svg.arc()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius)
            .startAngle(0);

    var svg=d3.select(id)
            .html("")
            .append("svg")
            .attr({
                width:w,
                height:h,
                class:'shadow'
            }).append('g')
            .attr({
                transform:'translate('+w/2+','+h/2+')'
            });


    //background
    var path=svg.append('path')
            .attr({
                d:arc
            })
            .style({
                fill:color[1]
            });


    var pathForeground=svg.append('path')
            .datum({endAngle:0})
            .attr({
                d:arcLine
            })
            .style({
                fill:color[0]
            });

    //Dummy Arc for Circle
    var pathDummy=svg.append('path')
            .datum({endAngle:0})
            .attr({
                d:arcDummy
            }).style({
                fill:color[0]
            });

    var endCircle=svg.append('circle')
            .attr({
                r:12,
                transform:'translate(0,'+ (-outerRadius+15) +')'
            })
            .style({
                stroke:color[0],
                'stroke-width':8,
                fill:color[2]
            });

    var middleTextCount=svg.append('text')
            .datum(0)
            .text(function(d){
                return d+'%';
            })

            .attr({
                class:'middleText',
                'text-anchor':'middle',
                dy:25,
                dx:0
            })
            .style({
                fill:'#ec1561',
                'font-size':'80px'

            });


    var arcTweenOld=function(transition, percent,oldValue) {
        transition.attrTween("d", function (d) {

            var newAngle=(percent/100)*(2*Math.PI);

            var interpolate = d3.interpolate(d.endAngle, newAngle);

            var interpolateCount = d3.interpolate(oldValue, percent);


            return function (t) {
                d.endAngle = interpolate(t);
                var pathForegroundCircle = arcLine(d);

                middleTextCount.text(Math.floor(interpolateCount(t))+'%');

                var pathDummyCircle = arcDummy(d);
                var coordinate = pathDummyCircle.split("L")[1].split("A")[0];

                endCircle.attr('transform', 'translate(' + coordinate+ ')');

                return pathForegroundCircle;
            };
        });
    };

    var oldValue=0;

    var animate=function(){

        pathForeground.transition()
                .duration(750)
                .ease('cubic')
                .call(arcTweenOld,percent,oldValue);

        oldValue=percent;
    };
    setTimeout(animate,10);
}
// draw();
var data;
d3.csv("result_day.csv",function(error,resdata){
    if(error)
    {
        console.log("Error");
        return;
    }
    data = resdata;
    console.log(data);
    data.forEach( (x)=>{
        d3.select("#filter")
            .append("option")
            .html(x["Name"]);
    });
    apply(data[0]["Name"]);
});
function apply(val)
{
    console.log(val);
    d3.select("#Name")
        .html(val.toUpperCase());

    var x = data.filter(i => i["Name"] === val)

    x = x[0];
    
    draw("#chart1",parseInt(x["Eng"]));
    draw("#chart2",parseInt(x["Hindi"]));
    draw("#chart3",parseInt(x["Maths"]));
    draw("#chart4",parseInt(x["Sci"]));
    draw("#chart5",parseInt(x["Sst"]));
}
$('#filter').on('change', function() {
    apply( this.value );
});



//============================mongodb================================================
mongoose.connect("mongodb://rishu:rishu123@ds151486.mlab.com:51486/visualization" ,{useNewUrlParser:true});


var db = mongoose.connection;
db.on('error',function(err){
    console.log("connection error",err);
});

db.once('open',function(){
    console.log("database connected");
});


app.listen(process.env.PORT || 3000,function()
{
    console.log('server is up and running on port 3000');
});

