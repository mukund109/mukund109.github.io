function visualize(svgContainer, data){

	//THIS IS DANGEROUS
	const totalRedditCommenters = 14150000;

	const width = 1000, height = 600;
	const margin = 50, maxRadius = 50;

	var centerNodeId = data.metadata.subreddit

	const isIntersection = centerNodeId.includes('∩');
	const isSubtraction = centerNodeId.includes('-')
	const isComposite = isIntersection || isSubtraction
	const [compositeSub1, compositeSub2] = isIntersection ? centerNodeId.split(" ∩ ") : centerNodeId.split(" - ");

	function isCompNode(x){ return x==compositeSub1 || x==compositeSub2; }

	var maxD = 1, minD = 1, maxMC = 0;
	for(let i=0; i<data.points.length; i++){
		if(data.points[i].sub2 != centerNodeId && !(isComposite && isCompNode(data.points[i].sub2))){
			maxD = Math.max(data.points[i].metric_2, maxD);
			// minD = Math.min(data.points[i].metric_2, minD);
		}
		if (data.points[i].metric_2<1){
			maxMC = Math.max(data.points[i].unique_commenters, maxMC);
		}
	}
	const minMetric_2 = 0.01;
	const maxMetric_2 = Math.max(200, maxD);
	const maxMinorityCommenters = maxMC;
	const centerNodeX =  3*maxRadius;
	const centerNodeY = height/2;

	/*------SVG Container------*/
	const svg = d3.select(svgContainer)
		.append("svg")
		.attr("fill", "pink")
		.attr("viewBox", "0 0 " + width + " " + height)
		.attr("preserveAspectRatio", "xMidYMid meet")
		.attr("height", "100%")
		.attr("width", "100%")
		.classed("svg-content", true)

	const svg_g = svg.append("g")
	
	/*-----Scales-----*/

	var scaleY = d3.scaleLinear()
		.domain([0, 1])
		.range([0, height]);

	// radius determined by 'metric_1'
	var scaleRadius = d3.scaleSqrt()
		.domain([0, 1])
		.range([0, maxRadius]);

	// distance determined by 'metric_2'
	var scaleDistance = d3.scaleLog()
		.domain([minMetric_2, maxMetric_2])
		.range([width/1.5, maxRadius])

	// font size and visibility
	var scaleFont = function(factor, textLength){
		return Math.floor(1.2*factor/Math.sqrt(textLength))+"px"
	}
	var fontVisibility = function(factor, textLength){
		return (Math.floor(1.2*factor/Math.sqrt(textLength)) < scaleRadius(0.02) ) ? "hidden": "visible";
	}




	/*-----Group Containers for circles, labels, and concentric markers-----*/
	const marker_g = svg_g.append("g");
	const label_marker_g = svg_g.append("g");
	const circle_g = svg_g.append("g");
	const label_g = svg_g.append("g");


	/*----Creating data bindings (nodes) for d3 selections------*/

	//assign radius, random starting positions
	var nodes = data.points.flatMap( function(d){

			if (centerNodeId == d.sub2){ return []; }
	
			if (isComposite && isCompNode(d.sub2)){return [];}

			return [{
			"x": centerNodeX+scaleDistance(Math.max(d.metric_2, minMetric_2)),
			"y": scaleY(Math.random()),
			"radius": (d.metric_2 >= 1) ? scaleRadius(d.metric_1) : 
					scaleRadius(Math.max(0.5*d.unique_commenters/maxMinorityCommenters, 0.5*0.05)),
			"id": d.sub2,
			"proximity": scaleDistance(Math.max(d.metric_2, minMetric_2)),
			"isDisconnected": d.disconnected,
			"isMinority": (d.metric_2 < 1),
			"unique_commenters": d.unique_commenters,
			"p_hat": d.metric_1
			}];
		});

	//center node
	nodes.push({"id": centerNodeId,
				"x": centerNodeX, "y": centerNodeY, 
				"fx": centerNodeX, "fy": centerNodeY, 
				"radius": maxRadius, "proximity": 0, "isDisconnected":false, "isMinority":false,
				"unique_commenters":data.metadata.unique_commenters});




	/*------Circles and Labels------*/
	var circles = circle_g.selectAll("circle").data(nodes);

	circles = circles.enter()
		.append("circle")
		.attr("class","nodes")
		.attr("cx", d => d.x)
		.attr("cy", d => d.y)
		.attr("r", d => d.radius)
		.style("fill", d => (d.id == centerNodeId ? "#ff6666" : (d.isDisconnected ? "#e3e3e3": (d.isMinority ? "#c2c2c2": "#78acff"))))
		.attr("opacity", 0);

	circles.transition()
			.attr("opacity", 1)
			.duration(d => d.proximity * 8 + 400)
			.ease(d3.easeExp);

	// labels
	var labels = label_g.selectAll("text")
					.data(nodes)
					.enter().append("text")
					.attr("class", "labels")
					.attr("dy", ".31em")
					.text( d => d.id )
					.style("text-anchor", "middle")
					.style("font-size", d => scaleFont(d.radius, d.id.length))
					.attr("visibility", d => fontVisibility(d.radius, d.id.length))
					.attr("opacity", 0)

	labels.transition()
			.attr("opacity", 1)
			.duration(d => d.proximity * 8 + 400)
			.ease(d3.easeExp);
	

	/*----------Tooltip----------*/

	let centerNameFormatted;
	
	if (isComposite){
		centerNameFormatted = "r/" + compositeSub1 + 
						(isIntersection ? " ∩ " :" - ") + "r/" + compositeSub2;
	}
	else {
		centerNameFormatted = "r/" + centerNodeId;
	}

	function nodeDescription(d){

		if (d.id == centerNodeId){
			return `<div style="text-align:center">
						<mark class="centerNode">${centerNameFormatted}</mark>
					</div>
					Distinct commenters ~<b>${d.unique_commenters}</b>`;
		}

		if (!d.isMinority && !d.isDisconnected){
			let p_hat = d.p_hat * 100;
			let multiplier = scaleDistance.invert(d.proximity);

			return `<div style="text-align:center">
			<mark class="nonCenterNode">r/${d.id}</mark>
			</div>` +

			`Distinct commenters ~ <b>${d.unique_commenters}</b>` +

			`<br>Multiplier ~ <b>${multiplier.toFixed(2)}</b>` +

			`<br>~<b>${p_hat.toFixed(2)}%</b> of 
			<mark class="centerNode"> ${centerNameFormatted} </mark>
			 users also commented on 
			<mark class="nonCenterNode">r/${d.id}</mark>` +

			`<br>~<b>${(p_hat/multiplier).toFixed(2)}%</b> of active reddit 
			users commented on 
			<mark class="nonCenterNode">r/${d.id}</mark>`;
		}
		else if (d.isMinority && !d.isDisconnected){
			let p = d.unique_commenters/totalRedditCommenters;
			let multiplier = scaleDistance.invert(d.proximity);

			return `<div style="text-align:center">
			<mark class="nonCenterNode">r/${d.id}</mark>
			</div>` +

			`Distinct commenters ~ <b>${d.unique_commenters}</b>` +

			`<br> Multiplier ~ <b>${multiplier.toFixed(2)}</b>` +

			`<br>${(d.p_hat*100<0.005) ? ("< <b>0.005") : "~<b>"+(d.p_hat*100).toFixed(2)}%</b> of 
			<mark class="centerNode"> ${centerNameFormatted} </mark>
			 users also commented on 
			<mark class="nonCenterNode">r/${d.id}</mark>` +

			`<br>~<b>${(p*100).toFixed(2)}%</b> of active reddit 
			users commented on 
			<mark class="nonCenterNode">r/${d.id}</mark>`;

		}
		else {
			let p = d.unique_commenters/totalRedditCommenters;
			return `<div style="text-align:center">
						<mark class="nonCenterNode">r/${d.id}</mark>
					</div>` + 
		
			`Distinct commenters ~ <b>${d.unique_commenters}</b>` +
		
			`<br> No <mark class="centerNode">${centerNameFormatted}</mark>
			 user commented on <mark class="nonCenterNode">r/${d.id}</mark>` +
			
			`<br>~<b>${(p*100).toFixed(2)}%</b> of active reddit 
			users commented on 
			<mark class="nonCenterNode">r/${d.id}</mark>`;
		}
		
	}

	var tooltip = d3.select("body").append("div")	
    	.attr("class", "tooltip")				
    	.style("opacity", 0);

	circles.on("mouseover", function(d) {
        tooltip.style("opacity", 1);
		
        tooltip.html(nodeDescription(d))
			.style("left", (d3.event.pageX+ 10) + "px")		
            .style("top", (d3.event.pageY - 28) + "px");
        });

			
    circles.on("mouseout", function(d) {		
            tooltip.style("opacity", 0);	
        });

	circles.on("click", d => renderVisualization(d.id));


	/*---------Concentric Markers, and Labels-----------*/

	var marker_data = [{"radius": scaleDistance(0.1), "x":centerNodeX, "y":centerNodeY, "offset":"43%"},
					{"radius": scaleDistance(1), "x":centerNodeX, "y":centerNodeY, "offset":"40%"},
					{"radius": scaleDistance(10), "x":centerNodeX, "y":centerNodeY, "offset":"33%"},
					{"radius": scaleDistance(100), "x":centerNodeX, "y":centerNodeY, "offset":"25%"},
					{"radius": scaleDistance(1000), "x":centerNodeX, "y":centerNodeY, "offset":"0%"}]
	
	
	//path for marker labels
	function getPathData(r, h, w) {
		r = 0.99*r;
        let startX = w - r;
        return 'm' + startX + ',' + h + ' ' +
          'a' + r + ',' + r + ' 0 0 0 ' + (2*r) + ',0 ' +
			'a' + r + ',' + r + ' 0 0 0 ' + (-2*r) + ',0';
     }

	var marker_lines = marker_g.selectAll("path")
					.data(marker_data)
					.enter().append("path")
					.attr("d", d => getPathData(d.radius, centerNodeY, centerNodeX))
					.attr("id", (d,i) => ('curvedTextPath'+i))
					.attr("visibility", d => d.radius > 1.5*maxRadius ? "visible" : "hidden")
					.attr("opacity", 0)

	marker_lines.transition()
				.attr("opacity", 1)
				.duration(d => d.radius * 5 + 400)
				.ease(d3.easeExp);

	// marker labels
	var marker_labels = label_marker_g.selectAll("text")
					.data(marker_data)
					.enter().append("text")
					.attr("class", "marker-labels")
					.attr("opacity", 0)
					.attr("dy", "-0.3em");

	marker_labels.append("textPath")
				.attr("startOffset", d => d.offset)
				.attr("xlink:href", (_,i) => '#curvedTextPath'+i)
				.text( d => "multiplier ~ "+scaleDistance.invert(d.radius).toFixed(1))
				.attr("visibility", d => d.radius > 1.5*maxRadius ? "visible" : "hidden")

	marker_labels.transition()
			.attr("opacity", 1)
			.duration(d => d.radius * 5 + 400)
			.ease(d3.easeExp);

	/*--------Forces---------*/

	/*
	Note: Collision force should be > proximity force.
	The central node's 'effective radius' = 'actual radius',
	for the others 'effective radius' > 'actual radius
	*/
	var collisionForce = d3.forceCollide( function(d){
			let rv = d.id == centerNodeId ? d.radius : d.radius*(2/(d.radius+1) + 1);
			return rv;
		 })
		.strength(0.8);

	
	var links = [];
	for (let i=0; i<nodes.length; i++){
		if (nodes[i].id != centerNodeId){
			links.push({"source":centerNodeId, "target":nodes[i].id});
		}
	}
	var proximityForce = d3.forceLink(links)
							.id(node => node.id)
							.distance(link => link.target.proximity)
							.strength(0.2);
	

	var yAxisForce = d3.forceY(height/2)
						.strength(0.02);

	/*var centerNodePull = d3.forceRadial()
						.x(centerNodeX).y(centerNodeY)
						.radius(node => node.proximity)
						.strength(0.1)
*/


	/*------Simulation and callback functions-----*/
	var sim = d3.forceSimulation(nodes)
		.force("proximity", proximityForce)
		.force("collision", collisionForce)
		.force("yAxisForce", yAxisForce)
		.alphaMin(0.01)
		.stop()


	function updatePositions(){
		circles.attr("cx", d => d.x)
			.attr("cy", d => d.y);
		labels.attr("transform", d => "translate(" + d.x + "," + d.y + ")");
	}

  for(var i = 0, n = Math.ceil(Math.log(sim.alphaMin()) / Math.log(1 - sim.alphaDecay())); i < n; ++i) {
    sim.tick();
  }
	updatePositions()

	function endMessage(){
		console.log("Finished Simulation")
	}
	
	/*----- Zoom behaviour-----*/
	svg.call(d3.zoom().on("zoom", function () {

				svg_g.attr("transform", d3.event.transform);

				var zoom = d3.event.transform.k;
				labels.attr("visibility", d => fontVisibility(zoom*d.radius, d.id.length));
				
			})
		)

}

