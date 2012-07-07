//Global objects
var container = null,
	main_canvas = null,
	loop = null,
	init_intvl = null,
	nParticles = 150,
	nFrames = 40,
	particles = [],
	fps = 30,
	selected_effect = "fire",
	stage = {
		w: jQuery(window).width(),
		h: jQuery(window).height(),
		center: {x: jQuery(window).width()*0.5, y: jQuery(window).height()*0.5}
	},
	rgba_table = {
		fire: ['rgba(255,255,0,1)', 'rgba(255,215,0,1)', 'rgba(218,165,32,1)', 'rgba(255,0,0,1)', 'rgba(255,99,71,1)', 'rgba(255,140,0,1)'],
		ice: ['rgba(79,148,205,1)', 'rgba(198,226,255,1)', 'rgba(176,226,255,1)', 'rgba(30,144,255,1)', 'rgba(24,116,205,1)', 'rgba(99,184,255,1)']
	};

// Main functions
var initParticles = function() {
	var counter = 0;
		
	if (selected_effect != "explosion_spread") {
		init_intvl = setInterval(function() {
			if (counter <= nParticles) {
				addNewParticle();
			} else {
				clearInterval(init_intvl);
			}
			counter++;
		}, 1000 / fps*0.25);
	} else {
		for (var i = 0; i < nParticles; i++) {
			addNewParticle();
		}
	}
};

var addNewParticle = function() {
	if (selected_effect == "fire" || selected_effect == "ice") {
		particles.push({
			frames: nFrames,
			radius: 2,
			initial_pos: {x: 0, y: 0},
			current_pos: {x: 0, y: 0},
			step: {x: 0, y: 0, i: 0},
			final_pos: {
				x: Math.random()*2 > 1 ? parseInt(Math.random()*40) : parseInt(Math.random()*40)*-1, 
				y: (parseInt(Math.random()*160) + 160)*-1
			},
			rgba: rgba_table[selected_effect][Math.floor(Math.random()*rgba_table[selected_effect].length)]
		});
	} else if (selected_effect == "explosion") {
		particles.push({
			frames: 12,
			radius: 12,
			initial_pos: {x: 0, y: 0},
			current_pos: {x: 0, y: 0},
			step: {x: 0, y: 0, i: 0},
			final_pos: {
				x: 0, 
				y: -300
			}
		});
	} else if (selected_effect == "explosion_spread") {
		particles.push({
			frames: nFrames,
			radius: 6,
			initial_pos: {x: 0, y: -300},
			current_pos: {x: 0, y: -300},
			step: {x: 0, y: 0, i: 0},
			final_pos: {
				x: Math.random()*2 > 1 ? parseInt(Math.random()*100) : parseInt(Math.random()*100)*-1, 
				y: (Math.random()*2 > 1 ? parseInt(Math.random()*100) : parseInt(Math.random()*100)*-1)-300
			},
			rgba: rgba_table['fire'][Math.floor(Math.random()*rgba_table['fire'].length)]
		});
	}
};

var draw = function() {
	var ctx = main_canvas.getContext('2d'),
		radgrad = null,
		draw = {x: 0, y: 0};

	ctx.clearRect(0, 0, main_canvas.width, main_canvas.height);

	ctx.globalCompositeOperation = "source-over";
	ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
	ctx.fillRect(0, 0, main_canvas.width, main_canvas.height);
	ctx.globalCompositeOperation = "lighter";


	if (selected_effect == "fire" || selected_effect == "ice" || selected_effect == "explosion_spread") {
		for (var i = 0; i < particles.length; i++) {
			particles[i].step.x = (particles[i].initial_pos.x + particles[i].final_pos.x) / particles[i].frames;
			if (selected_effect == "explosion_spread") {
				particles[i].step.y = (particles[i].initial_pos.y - particles[i].final_pos.y) / particles[i].frames;
			} else {
				particles[i].step.y = (particles[i].initial_pos.y + particles[i].final_pos.y) / particles[i].frames;	
			}
			particles[i].step.i++;

			particles[i].current_pos.x = particles[i].current_pos.x + particles[i].step.x;
			particles[i].current_pos.y = particles[i].current_pos.y + particles[i].step.y;

			draw.x = stage.center.x + particles[i].current_pos.x;
			draw.y = stage.center.y  + particles[i].current_pos.y + 200;

			if (particles[i].step.i <= particles[i].frames-10) {
				ctx.fillStyle = particles[i].rgba;
			} else {
				ctx.fillStyle = particles[i].rgba.replace("1)", "0."+ parseInt((particles[i].frames - particles[i].step.i)) +")");
			}

			ctx.beginPath();
			ctx.arc(draw.x, draw.y, particles[i].radius, 0, Math.PI*2, true);
			ctx.fill();

			if (selected_effect != "explosion_spread") { 
				if (Math.round(particles[i].current_pos.x) == particles[i].final_pos.x && Math.round(particles[i].current_pos.y) == particles[i].final_pos.y) {
					particles.splice(i, 1);
					addNewParticle();
				}
			} else {
				if (particles[i].step.i >= particles[i].frames) {
					particles.splice(i, 1);

					if (particles.length == 0) {
						selected_effect = "explosion";
						addNewParticle();
					};
				}
			}

		}
	} else if (selected_effect == "explosion") {
		particles[0].step.y = (particles[0].initial_pos.y + particles[0].final_pos.y) / particles[0].frames;
		particles[0].current_pos.y = particles[0].current_pos.y + particles[0].step.y;
		
		draw.x = stage.center.x - particles[0].radius;
		draw.y = stage.center.y  + particles[0].current_pos.y + 200;

		radgrad = ctx.createRadialGradient(draw.x+10, draw.y+10, 1, draw.x+17, draw.y+15, particles[0].radius);
		
		radgrad.addColorStop(0, 'yellow');
		radgrad.addColorStop(0.9, 'red');
		radgrad.addColorStop(1, 'rgba(1,159,98,0)');
		ctx.fillStyle = radgrad;
		ctx.arc(draw.x+10, draw.y+10, particles[0].radius, Math.PI*2, false);
		ctx.fill();

  		if (Math.round(particles[0].current_pos.y) == particles[0].final_pos.y) {
			particles = [];
			selected_effect = "explosion_spread";
			initParticles();
		}
	}
};

var restart = function() {
	clearInterval(init_intvl);
	particles = [];

	if (selected_effect == "fire" || selected_effect == "ice" || selected_effect == "explosion_spread") {
		initParticles();
	} else if (selected_effect == "explosion") {
		addNewParticle();
	}
};

//Document loaded
jQuery(document).ready(function() {
	//Align viewport
	container = jQuery('#container');
	container.css({
		'width': stage.w,
		'height': stage.h
	});

	//Create the particles canvas
	main_canvas = document.createElement('canvas');
	main_canvas.width = stage.w;
	main_canvas.height = stage.h;
	document.getElementById('canvas-stage').appendChild(main_canvas);

	//Init first particles
	initParticles();

	//Main draw loop
	loop = setInterval(function() {
		draw();
	}, 1000 / fps);

	//Effects select
	jQuery('#effects').change(function(ev) {
		selected_effect = this.value;
		
		if (selected_effect == "fire" || selected_effect == "ice") {
			nParticles = 150;
			nFrames = 40;
			jQuery("#particles-amount").slider("option", "value", 150);
			jQuery("#particles-speed").slider("option", "value", 60);
		} else if (selected_effect == "explosion") {
			nParticles = 100;
			nFrames = 15;
			jQuery("#particles-amount").slider("option", "value", 100);
			jQuery("#particles-speed").slider("option", "value", 85);
		}
		restart();
	});

	//Demo sliders
	jQuery("#particles-amount").slider({
		value: 150,
		min: 50,
		max: 600,
		slide: function(event, ui) {
			nParticles = ui.value;
			restart();
		}
	});
	jQuery("#particles-speed").slider({
		value: 60,
		min: 10,
		max: 100,
		slide: function(event, ui) {
			nFrames = 110 - ui.value;
		}
	});

	//On-resize updates
	window.onresize = function() {
		stage.w = window.innerWidth;
		stage.h = window.innerHeight;

		container.css({
			'width': stage.w,
			'height': stage.h
		});
		main_canvas.width = stage.w;
		main_canvas.height = stage.h;
	};
});