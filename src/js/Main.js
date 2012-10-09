/**
 * Created by unctrl.com
 * User: mannytan
 * Date: 03/20/12
 */

var DIPLO = DIPLO || {};

DIPLO.Params = {};

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
			speed: 4.0,
			orbitSpeed: 0.0001,
			perlinSize: 2,
			perlinSpeed: .01,
			perlinRange: 100,
			currentFoldAmount: 0.0,
		};

		this.gui = new dat.GUI({
			width: this.guiWidth,
			autoPlace: false
		});
		this.guiContainer = this.gui.domElement;

		this.gui.add(DIPLO.Params, 'perlinSize', 0.0, 10).step(0.0005);
		this.gui.add(DIPLO.Params, 'perlinSpeed', -0.1, 0.1).step(0.0005);
		this.gui.add(DIPLO.Params, 'perlinRange', 0, 300).step(1);
		this.gui.add(DIPLO.Params, 'currentFoldAmount', 0.0, 1.0).step(0.0005);

		this.guiContainer = document.getElementById('guiContainer');
		this.guiContainer.appendChild(this.gui.domElement);
	};

	this.update = function() {

		this.diplo3D.parse();
		this.diplo3D.draw();

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

	this.slider = function(gui, startValue, endValue, delayer) {
		var obj = {
			time: delayer,
			duration: DIPLO.Params.speed,
			effect: 'easeOut',
			start: startValue,
			stop: endValue,
			onFrame: function(element, state) {
				gui.setValue(state.value);
			}
		};
		return obj;
	};

	this.perspectiveToggle = function() {
		if (DIPLO.Params.perspective === false) {
			DIPLO.Params.perspective = true;
			this.diplo3D.toPerspective();
		} else {
			DIPLO.Params.perspective = false;
			this.diplo3D.toOrthographic();
		}
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

	};

	this.createListeners = function() {
		window.addEventListener('keydown', function() {
			scope.keyDown(event);
		}, false);

		window.addEventListener('resize', function() {
			scope.resize(event);
		}, false);

	};

	this.keyDown = function(event) {
		if (event.keyCode === 32) {
			this.pausePlayToggle();
		}
	};

	this.resize = function() {
		this.stageWidth = window.innerWidth - this.guiWidth;
		this.stageHeight = window.innerHeight;

		this.diplo3D.setDimensions(this.stageWidth,this.stageHeight);
		this.diplo3D.resize();


	};

};

DIPLO.Main.prototype = new UNCTRL.BoilerPlate();
DIPLO.Main.prototype.constructor = DIPLO.Main;