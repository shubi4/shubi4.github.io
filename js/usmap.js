
var hmargin = 10,
    vmargin = 10;
var map_width = 900,
    map_height = 500;
var state_width = 350,
	state_height = 300;
var state_bar_width = 330,
	state_bar_height = 400; 
var circscale = d3.scale.sqrt()
				.domain([0, map_height])
				.range([0, 30]);
var path = d3.geo.path();
var map_svg = d3.select("#map_div")
				.append("svg")
				.attr("width", map_width)
				.attr("height", map_height);
var map_g = map_svg.append("g")
				.attr("width", map_width - hmargin)
				.attr("height", map_height - vmargin)
				.attr("transform", "translate(" + hmargin + "," + vmargin + ")");
var state_svg = d3.select("#state_div")
				.append("svg")
				.attr("width", state_width)
				.attr("height", state_height);
var state_g = state_svg
				.append("g")
				.attr("width", state_width - hmargin)
				.attr("height", state_height- vmargin)
				.attr("transform", "translate(" + hmargin + "," + vmargin + ")");
var state_bar_svg = d3.select("#state_bar_div")
					.append("svg")
					.attr("width", state_bar_width)
					.attr("height", state_bar_height);
var state_bar_g = state_bar_svg
					.append("g")
					.attr("width", state_bar_width - hmargin)
					.attr("height", state_bar_height - vmargin)
					.attr("transform", "translate(" + hmargin + "," + vmargin + ")");
var state_stat_off = 40;
var state_stat_line_ht = 30;
/* state bar chart related */
var chartMargin = {top: 20, right: 20, bottom: 30, left: 80};
var chartWidth = state_bar_width - hmargin - chartMargin.left - chartMargin.right;
var chartHeight = state_bar_height - vmargin - chartMargin.top - chartMargin.bottom;
var chartColor = d3.scale.ordinal()
					.domain(["Dems", "Repub"])
					.range(["steelblue", "indianred"]);
var xScale = d3.scale.ordinal()
					.domain(["Dems", "Repub"])
					.rangeRoundBands([0, chartWidth], .1);
var xAxis = d3.svg.axis()
				.scale(xScale)
				.orient("bottom");
queue()
	.defer(d3.json, "us.json")
	.defer(d3.json, "pop.json")
	.defer(d3.json, "center-adj.json")
	.defer(d3.json, "label-adj.json")
	.defer(d3.json, "ptr-adj.json")
	.await(data_loaded);
function zeroPad(num, places) {
	var zero = places - num.toString().length + 1;
	return Array(+(zero > 0 && zero)).join("0") + num;
}
function format_millions(num) {
	var num_mill = Math.floor(num / 1000000);
	var num_hunthou = Math.floor((num - num_mill * 1000000)/1000);
	var num_thou = Math.floor(num - (num_mill * 1000000) - (num_hunthou * 1000));
	num_str = "";
	if (num_mill != 0)
		num_str = num_str + num_mill.toString() + "," ;
	if (num_mill != 0 || num_hunthou != 0)
		num_str = num_str + zeroPad(num_hunthou, 3) + ",";
    	num_str = num_str + zeroPad(num_thou, 3);
	return num_str;
}
function compute_stat_height(line_num) {
	return state_stat_off + (line_num - 1) * state_stat_line_ht;
}
function compute_party_electoral(electoral, pct, complement) {
	pelec = Math.floor(electoral * (pct / 100))
	if (complement) {
		return electoral - pelec;
	} else {
		return pelec;
	}
}
function data_loaded(error, usobj, elvoteobj, centerobj, labelobj, ptrobj) {
	if (error) throw error;
	for (i = 0; i < centerobj.features.length; i++) {
		for (j = 0; j < elvoteobj.features.length; j++) {
			if (elvoteobj.features[j].id == centerobj.features[i].id) {
				if (centerobj.features[i].elvotes != null)
					throw "Data Corruption";
				else
					centerobj.features[i].properties.elvotes = labelobj.features[i].properties.elvotes = Number(elvoteobj.features[j].properties.electoral);
					centerobj.features[i].properties.pop12 = elvoteobj.features[j].properties.pop12;
					console.log(elvoteobj.features[j].properties.name + "," + elvoteobj.features[j].properties.population + "," + elvoteobj.features[j].properties.electoral);
				break;
			}
		}
	}
	map_svg
		.selectAll("path")
		.data(topojson.feature(usobj, usobj.objects.states).features)
		.enter()
		.append("path")
		.attr("class", "state")
		.attr("d", path)
		.on('mouseover', function(d) {d3.select(this).style("cursor", "pointer").classed("distinct", true)})
		.on('mouseout', function(d) {d3.select(this).style("cursor", "default").classed("distinct", false);})
		.on('mousedown', function(d) {
		   d3.selectAll(".state").classed("selected", false);
		   d3.select(this).classed("distinct", false);
		   d3.select(this).classed("selected", true);
		   console.log(d);
		   stateClick(d);
		});
		
	map_svg
		.selectAll(".circle")
		.data(centerobj.features)
		.enter()
		.append("path")
		.attr("class", function(d) { if (d.properties.pop12[0] > d.properties.pop12[1]) {
										return "dem_circle";
									} else {
										return "rep_circle";
									}
								})
		.attr("d", path.pointRadius(function(d) {return circscale(Math.pow(d.properties.elvotes,2)); }))
		.on('mouseover', function(d) {
			d3.select(this).style("cursor", "pointer");
			cur_circle = d;
			cur_state = d3.selectAll(".state").filter(function(d) { return d.id == cur_circle.id; });
			cur_state.classed("distinct", true);
		})
		.on('mouseout', function(d) {
			d3.select(this).style("cursor", "default");
			cur_circle = d;
			cur_state = d3.selectAll(".state").filter(function(d) { return d.id == cur_circle.id; });
			cur_state.classed("distinct", false);
		})
		.on('mousedown', function(d) {
			cur_circle = d;
			d3.selectAll(".state").classed("selected", false);
			cur_state = d3.selectAll(".state").filter(function(d) { return d.id == cur_circle.id; });
			cur_state.classed("distinct", false);
			cur_state.classed("selected", true);
			stateClick(cur_state.data()[0]);
		});
	map_svg.selectAll("text")
		.data(labelobj.features)
		.enter()
		.append("text")
		.attr("class", "label")
		.text(function(d) { return d.properties.abbrev; })
		.attr("x", function(d) { return path.centroid(d)[0]; })
		.attr("y", function(d) { return path.centroid(d)[1]; })
		.on('mouseover', function(d) {
			d3.select(this).style("cursor", "pointer");
			cur_label = d;
			cur_state = d3.selectAll(".state").filter(function(d) { return d.id == cur_label.id; });
			cur_state.classed("distinct", true);
		})
		.on('mouseout', function(d) {
			d3.select(this).style("cursor", "default");
			cur_label = d;
			cur_state = d3.selectAll(".state").filter(function(d) { return d.id == cur_label.id; });
			cur_state.classed("distinct", false);
		})
		.on('mousedown', function(d) {
			cur_label = d;
			d3.selectAll(".state").classed("selected", false);
			cur_state = d3.selectAll(".state").filter(function(d) { return d.id == cur_label.id; });
			cur_state.classed("distinct", false);
			cur_state.classed("selected", true);
			stateClick(cur_state.data()[0]);
		});
	map_svg.selectAll(".ptr")
		.data(ptrobj.features)
		.enter()
		.append("path")
		.attr("class", "ptr")
		.attr("d", path);
	
	function stateClick(stateobj) {
		state_svg
			.selectAll(".ststats")
			.remove();
		state_bar_svg
			.selectAll(".stbar_title")
			.remove();
		state_bar_svg
			.selectAll(".stbar")
			.remove();
		var max_pop = 0;
		
		state_text = state_svg.selectAll(".ststats")
						.data(elvoteobj.features.filter(function (d) { return d.id == stateobj.id;}))
						.enter()
						.append("text")
						.text(null)
						.attr("class", "ststats")
						.attr("x", state_stat_off)
						.attr("y", state_stat_off);
		state_text.
			append("tspan")
			.attr("class", "state_stat_hdr")
			.text(function(d) {
						max_pop = d.properties.pop12[0] + d.properties.pop12[1];
						return d.properties.name;
					})
			.attr("x", state_stat_off)
			.attr("y", compute_stat_height(1));
		state_text.
			append("tspan")
			.attr("class", "state_stat_stats")
			.text(function(d) {
				        return "Democratic Pop Vote: " + format_millions(d.properties.pop12[0]);
					})
			.attr("x", state_stat_off)
			.attr("y", compute_stat_height(2));
		state_text.
			append("tspan")
			.attr("class", "state_stat_stats")
			.text(function(d) {
				        return "Republican Pop Vote: " + format_millions(d.properties.pop12[1]);
					})
			.attr("x", state_stat_off)
			.attr("y", compute_stat_height(3));
			
		state_text.
			append("tspan")
			.attr("class", "state_stat_stats")
			.text(function(d) {
						if (d.properties.pop12[0] > d.properties.pop12[1]) {
				        	return "EC Votes awarded to: Democrats";
				        	d3.selectAll
						} else {
							return "EC Votes awarded to: Republicans";
						}
					})
			.attr("x", state_stat_off)
			.attr("y", compute_stat_height(4));
		state_text.
			append("tspan")
			.attr("class", "state_stat_stats")
			.text(function(d) {
						if (d.properties.pop12[0] > d.properties.pop12[1]) {
				        	return "State Winner: Barack Obama";
						} else {
							return "State Winner: Mitt Romney";
						}
					})
			.attr("x", state_stat_off)
			.attr("y", compute_stat_height(5));
		state_text.
			append("tspan")
			.attr("class", "state_stat_stats")
			.text(function(d) {
				        return "EC Votes awarded: " + d.properties.electoral;
					})
			.attr("x", state_stat_off)
			.attr("y", compute_stat_height(6));		
		/*console.log(stateobj.id); */
		var yScale = d3.scale.linear()
				.domain([0, max_pop])
				.range([chartHeight - 100, 0]);
		var state_pop_ticks = [];
		for (l = 0; l < max_pop; l += 5000000) {
			state_pop_ticks.push(l);
		}
		var yAxis = d3.svg.axis()
						.scale(yScale)
						.orient("left")
						.tickValues(state_pop_ticks)
						.tickFormat(function(d) { return d / 1000000;});
		state_bar_stats = state_bar_g.selectAll(".stbar_title")
						.data(elvoteobj.features.filter(function (d) { return d.id == stateobj.id;}))
						.enter()
						.append("g")
						.attr("class", "stbar_title")
						.attr("transform", "translate(" + 100 + ",0)");
		state_bar_stats.append("text")
						.text("Popular Vote")
						.attr("class", "state_bar_title")
						.attr("x", 30)
						.attr("y", 30)
						.attr("width", 100)
						.attr("height", 100);
		
		state_bar_chart = state_bar_g.selectAll(".stbar")
						.data(elvoteobj.features.filter(function (d) { return d.id == stateobj.id;}))
						.enter()
						.append("g")
						.attr("class", "stbar");
		state_bar_chart.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(100," + chartHeight + ")")
			.call(xAxis);
		state_bar_chart.append("g")
			.attr("class", "y axis")
			.attr("transform", "translate(100," + 100 + ")")
			.call(yAxis);
		cur_state = elvoteobj.features.filter(function (d) { return d.id == stateobj.id;})
		console.log(cur_state[0]);
		state_bar_chart.selectAll(".state_bar")
			.data(cur_state[0].properties.pop12)
			.enter()
			.append("rect")
			.attr("class", "state_bar")
			.attr("x", function(d, i) { if (i == 0) return xScale("Dems"); else return xScale("Repub");})
			.attr("width", xScale.rangeBand())
			.attr("y", function(d) { return yScale(d); })
			.attr("height", function(d) { return chartHeight - yScale(d) - 100; })
			.attr("title", function(d) {return d + " votes"; })
			.style("fill", function(d, i) { if (i == 0) return chartColor("Dems"); else return chartColor("Repub");})
			.attr("transform", "translate(" + 100 + "," + 100 + ")");
 
	}
}