/**
 * Created by unctrl.com
 * User: mannytan
 * Date: 03/20/12
 */

var DIPLO = DIPLO || {};

DIPLO.Params = {};
DIPLO.Sliders = {};

DIPLO.Main = function(name) {
	var scope = this;

	UNCTRL.BoilerPlate.call(this);

	this.name = 'Main';
	this.isPaused = false;

	// dat.gui
	this.gui = null;
	this.guiWidth = 300;
	this.guiContainer = null;

	// stage
	this.stageWidth = window.innerWidth - this.guiWidth;
	this.stageHeight = window.innerHeight;
	this.stageOffsetX = ((window.innerWidth - this.stageWidth) * 0.5) | 0;
	this.stageOffsetY = ((window.innerHeight - this.stageHeight) * 0.5) | 0;

	// stats
	this.stats = new Stats();

	// 3d
	this.diplo3D = null;

	this.count = 0;
	this.init = function() {
		this.traceFunction("init");
		this.createListeners();
		this.createGui();

		this.diplo3D = new DIPLO.Diplo3D("Diplo3D");
		this.diplo3D.init();
		this.diplo3D.setDimensions(this.stageWidth,this.stageHeight);
		this.diplo3D.createEnvironment(0xEEEEEE);
		this.diplo3D.createLights();
		this.diplo3D.createBackgroundElements();
		this.diplo3D.createForegroundElements();
		this.diplo3D.hideElements();
		this.diplo3D.createListeners();

		this.loader = document.getElementById('loader');

		document.body.appendChild(this.stats.domElement);

		// stop the user getting a text cursor
		document.onselectStart = function() {
			return false;
		};

		this.resize();
		this.play();

		return this;
	};

	this.createGui = function() {

		DIPLO.Params = {
			speed: 0.025,
			range: 0.1,
			orbitSpeed: 0.0001,
			currentFoldAmount: 0.0001,
			elasticity: 0.75,
			smoothness: 0.25,
			foldDampened: .125,
		};

		this.gui = new dat.GUI({
			width: this.guiWidth,
			autoPlace: false
		});
		this.guiContainer = this.gui.domElement;
		DIPLO.Sliders.currentFoldAmount = this.gui.add(DIPLO.Params, 'currentFoldAmount', -1.0, 1.0).step(0.0005);
		this.gui.add(DIPLO.Params, 'range', -0.25, 0.25).step(0.0001).name('range');
		this.gui.add(DIPLO.Params, 'speed', -0.1, 0.1).step(0.0001).name('speed');
		this.gui.add(DIPLO.Params, 'foldDampened', 0.0, .99).step(0.0005).name('foldDampened');
		this.gui.add(DIPLO.Params, 'elasticity', 0.0, .99).step(0.0005).name('elasticity');
		this.gui.add(DIPLO.Params, 'smoothness', 0.0, .99).step(0.0005).name('smoothness');
		this.guiContainer = document.getElementById('guiContainer');
		this.guiContainer.appendChild(this.gui.domElement);

		return this;

	};

	this.update = function() {

		this.count+=DIPLO.Params.speed;
		var percentage = this.count*Math.PI*2;

		DIPLO.Sliders.currentFoldAmount.setValue(Math.cos(percentage)*DIPLO.Params.range);

		this.diplo3D.parse();
		this.diplo3D.draw();

		return this;
	};

	this.loop = function() {

		this.stats.update();
		this.update();
		if (this.isPaused) {
			return this;
		}
		requestAnimationFrame(function() {
			scope.loop();
		});

		return this;

	};

	this.perspectiveToggle = function() {

		if (DIPLO.Params.perspective === false) {
			DIPLO.Params.perspective = true;
			this.diplo3D.toPerspective();
		} else {
			DIPLO.Params.perspective = false;
			this.diplo3D.toOrthographic();
		}

		return this;
	};

	this.pausePlayToggle = function() {

		if (scope.isPaused) {
			this.play();
		} else {
			this.pause();
		}
	};

	this.play = function() {

		this.isPaused = false;
		this.diplo3D.enableTrackBall();
		this.loop();

		return this;
	};

	this.pause = function() {

		this.isPaused = true;
		this.diplo3D.disableTrackBall();
		if (this.source) this.source.disconnect();

		return this;
	};

	this.createListeners = function() {

		window.addEventListener('keydown', function() {
			scope.keyDown(event);
		}, false);

		window.addEventListener('resize', function() {
			scope.resize(event);
		}, false);

		return this;
	};

	this.keyDown = function(event) {

		if (event.keyCode === 32) {
			this.pausePlayToggle();
		}

		return this;
	};

	this.resize = function() {

		this.stageWidth = window.innerWidth - this.guiWidth;
		this.stageHeight = window.innerHeight;

		this.diplo3D.setDimensions(this.stageWidth,this.stageHeight);
		this.diplo3D.resize();

		return this;
	};

};

DIPLO.Main.prototype = new UNCTRL.BoilerPlate();
DIPLO.Main.prototype.constructor = DIPLO.Main;