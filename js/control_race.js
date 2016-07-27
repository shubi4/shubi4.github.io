function control_race(id_div, data, title){

	var width = 350,
		height = 200,
		barHeight = 30;

	var x = d3.scale.linear()
		.range([0, width]);

	var object_div = d3.select("#" + id_div);
	var ctrlrace = object_div.append("svg")
				   .attr("class","ctrlrace")
				   .attr("width", width);
				   
	function addValue(d, id, step){
		if (null != id){
			var tmp = id.split("_");
			var myIdNumber = tmp[1];
			var otherId = tmp[0] + "_";
			var myId = tmp[0] + "_";
			if (myIdNumber == '1'){
				otherId += '2';
				myId += '1';
			}
			else{
				otherId += '1';
				myId += '2';
			}
			
			for(var i = 0, m = null; i < data.length; ++i) {
				if((data[i].id == myId) && (data[i].value < 99)){
					data[i].value+=step;
					if (data[i].value > 99){
						data[i].value = 99;
					}
					d3.select('#bar_'+myId).attr("width", function(d) { return d.value * 2;})
					d3.select('#txt_'+myId).attr("x", function(d) { return d.value * 2 + 60; })
					d3.select('#txt_'+myId).text(function(d) { return d.value + "%"; });
				}
				else if((data[i].id == otherId) && (data[i].value > 1)){
					data[i].value-=step;
					if (data[i].value < 1){
						data[i].value = 1;
					}
					d3.select('#bar_'+otherId).attr("width", function(d) { return d.value * 2; })
					d3.select('#txt_'+otherId).attr("x", function(d) { return d.value * 2 + 60; })
					d3.select('#txt_'+otherId).text(function(d) { return d.value + "%"; });
				}
		   
			}
			
			d3.event.stopPropagation();
		}
	}

  x.domain([0, d3.max(data, function(d) { return d.value; })]);

  ctrlrace.attr("height", height);
  ctrlrace.append("line")
	  .attr("class", "sep_line")
	  .attr("x1", 26)
	  .attr("y1", 0)
	  .attr("x2", 26)
      .attr("y2", 80);	
  ctrlrace.append("text")
	  .attr("x", 100)
      .attr("y", 90)
      .attr("dy", ".35em")
	  .attr("class","ctrl_text")
	  .attr("style","text-anchor:middle")
      .text(title);
  
  
  var bar = ctrlrace.selectAll("g")
      .data(data)
      .enter().append("g")
      .attr("transform", function(d, i) { return "translate(0," + i * barHeight + ")"; });
  
  bar.append("rect")
	  .attr("id",function(d) { return 'btn_'+ d.id;})
	  .attr("x", 1)
	  .attr("y", 14)
	  .attr("rx", 5)
	  .attr("yx", 5)
      .attr("width", 18)
      .attr("height", 18)
	  .attr("class", "ctrl_button")
	  .on("mouseover", function(d) {d3.select(this).style("cursor", "pointer");d3.select(this).attr("class", "ctrl_button_selected")})
	  .on("mouseout", function(d) {d3.select(this).style("cursor", "default");d3.select(this).attr("class", "ctrl_button")})
	  .on("click", function(d) {addValue(d, d.id, 1)});
	  
  bar.append("line")
	  .attr("id",function(d) { return 'ln1_'+ d.id;})
      .attr("x1", 5)
	  .attr("y1", 23)
	  .attr("x2", 15)
      .attr("y2", 23)
	  .attr("class", "ctrl_line")
	  .on("mouseover", function(d) {d3.select(this).style("cursor", "pointer")})
	  .on("mouseout", function(d) {d3.select(this).style("cursor", "default")})
	  .on("click", function(d) {addValue(d, d.id, 1)});
  bar.append("line")
	  .attr("id",function(d) { return 'ln2_'+ d.id;})
      .attr("x1", 10)
	  .attr("y1", 18)
	  .attr("x2", 10)
      .attr("y2", 28)
	  .attr("class", "ctrl_line")
	  .on("mouseover", function(d) {d3.select(this).style("cursor", "pointer")})
	  .on("mouseout", function(d) {d3.select(this).style("cursor", "default")})
	  .on("click", function(d) {addValue(d, d.id, 1)});
	  
  bar.append("rect")
	  .attr("class",function(d) { return d.class; })
	  .attr("id",function(d) { return 'bar_'+ d.id; })
	  .attr("x", 28)
	  .attr("y", 10)
      .attr("width", function(d) { return d.value * 2; })
      .attr("height", barHeight - 5);
    
  bar.append("text")
	  .attr("id",function(d) { return 'txt_'+ d.id; })
      .attr("x", function(d) { return d.value * 2 + 60; })
      .attr("y", 10 + barHeight / 2)
      .attr("dy", ".35em")
	  .attr("class","ctrl_text")
      .text(function(d) { return d.value + "%"; });
  
	  
	function type(d) {
	  d.value = +d.value; 
	  return d;
	}

}
	var data_hispanic = [
	  {id: "grp1_1", value:  50, class: "rect_dem"},
	  {id: "grp1_2", value:  50, class: "rect_rep"}
	];

	var data_afro = [
	  {id: "grp2_1", value:  50, class: "rect_dem"},
	  {id: "grp2_2", value:  50, class: "rect_rep"}
	];
	
	var data_college = [
	  {id: "grp3_1", value:  50, class: "rect_dem"},
	  {id: "grp3_2", value:  50, class: "rect_rep"}
	];
	
	var data_non_college = [
	  {id: "grp4_1", value:  50, class: "rect_dem"},
	  {id: "grp4_2", value:  50, class: "rect_rep"}
	];
	
	control_race("hispanic", data_hispanic,"Hispanic");
	control_race("afro", data_afro,"Afro American");
	control_race("college", data_college,"College educated white");
	control_race("no_college", data_non_college,"Non college educated white");