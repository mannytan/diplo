/**
 * Created by unctrl.com
 * User: mannytan
 * Date: 8/22/11
 */


DIPLO.BoilerPlate3D = function(name) {
	var scope = this;

	UNCTRL.BoilerPlate.call(this);

	this.name = 'BoilerPlate3D';

	// 2d rars
	this.stageWidth = 0;
	this.stageHeight = 0;
	this.stageOffsetX = 0;
	this.stageOffsetY = 0;

	// 3d vars
	this.container = null;
	this.projector = null;
	this.camera = null;
	this.scene = null;
	this.trackball = null;
	this.cube = null;

	this.init = function() {

		this.traceFunction("init");

		return this;

	};

	this.createEnvironment = function(obj){
		obj = (obj) ? obj : {};
		obj.bgColor = (obj.bgColor !== undefined) ? obj.bgColor : 0xEEEEEE;

		this.projector = new THREE.Projector(); // used for mouse position in 3d space
		this.scene = new THREE.Scene();
		this.base = new THREE.Object3D();
		this.scene.add(this.base);

		this.camera = new THREE.CombinedCamera(this.stageWidth / 2, this.stageHeight / 2, 70, 1, 2000, -2000, 2000, 2000);
		this.camera.position.x = 400;
		this.camera.position.y = 200;
		this.camera.position.z = 400;
		this.camera.toPerspective();
		this.scene.add(this.camera);

		this.renderer = new THREE.WebGLRenderer({
			antialias: true
		});

		this.renderer.setClearColorHex(0xEEEEEE, 1);
		this.renderer.setSize(this.stageWidth, this.stageHeight);

		this.container = document.getElementById('container3D');
		this.container.appendChild(this.renderer.domElement);

		// controls
		this.trackball = new THREE.TrackballControls(this.camera, this.container);
		this.trackball.rotateSpeed = 1.0;
		this.trackball.noZoom = true;
		this.trackball.noPan = true;
		this.trackball.staticMoving = false;
		this.trackball.dynamicDampingFactor = 0.2;
		this.trackball.keys = [65, 83, 68];

		return this;
	}


	this.createLights = function() {

		var pointLight = new THREE.PointLight(0xFFFFFF);
		pointLight.position.set(200,200,200);
		this.scene.add(pointLight);

		return this;

	};
	
	this.createBackgroundElements = function() {
		// create box
		var color = 0x000000;
		var width = 600;
		var height = 600;
		var depth = 600;
		//  -------------------------------------
		//  draw cube
		//  -------------------------------------
		this.base.remove(this.cube);
		material = new THREE.MeshBasicMaterial({
			color: color,
			opacity: 0.05,
			wireframe:true
		});
		geometry = new THREE.CubeGeometry(width, height, depth);
		this.cube = new THREE.Mesh(geometry, material);

		this.base.add(this.cube);


		//  -------------------------------------
		//  draw center line
		//  -------------------------------------
		material = new THREE.LineBasicMaterial({
			color: 0x000000,
			lineWidth: 1
		});
		geometry = new THREE.Geometry();
		geometry.vertices.push(
			new THREE.Vector3(-200, 0, 0), new THREE.Vector3(200, 0, 0)
		);
		this.base.remove(this.line);
		var line = new THREE.Line(geometry, material);
		line.type = THREE.Lines;
		this.base.add(line);

	};

	

	this.createListeners = function() {
		this.container.addEventListener('mousedown', function(event) {
			scope.mouseDown(event);
		}, false);
	};

	this.rotateAroundAxis = function(currentVector, vectorAxis, theta){
		var ax = vectorAxis.x,
			ay = vectorAxis.y,
			az = vectorAxis.z,

			ux = ax * currentVector.x,
			uy = ax * currentVector.y,
			uz = ax * currentVector.z,

			vx = ay * currentVector.x,
			vy = ay * currentVector.y,
			vz = ay * currentVector.z,

			wx = az * currentVector.x,
			wy = az * currentVector.y,
			wz = az * currentVector.z;

			si = Math.sin(theta);
			co = Math.cos(theta);

			var xx = (ax * (ux + vy + wz) + (currentVector.x * (ay * ay + az * az) - ax * (vy + wz)) * co + (-wy + vz) * si);
			var yy = (ay * (ux + vy + wz) + (currentVector.y * (ax * ax + az * az) - ay * (ux + wz)) * co + (wx - uz) * si);
			var zz = (az * (ux + vy + wz) + (currentVector.z * (ax * ax + ay * ay) - az * (ux + vy)) * co + (-vx + uy) * si);

		return (new THREE.Vector3(xx,yy,zz));

	};



	this.mouseDown = function(event) {

		if (event.target === this.renderer.domElement) {
			// this.traceFunction("mouseDown");
			// created a ray that has the same vector as the camera and position of the cursor
			var x = event.clientX - this.stageOffsetX;
			var y = event.clientY - this.stageOffsetY;
			var v = new THREE.Vector3((x / this.stageWidth) * 2 - 1, -(y / this.stageHeight) * 2 + 1, 0.5);

			this.projector.unprojectVector(v, this.camera);
			var ray = new THREE.Ray(this.camera.position, v.subSelf(this.camera.position).normalize());
			var isNotTouching = (ray.intersectObject(this.base).length < 1);

			if (!isNotTouching) {
				// trace("isTouching");
			}
		}
	};

	this.hideElements = function(){

	};

	this.enableTrackBall = function() {
		this.trackball.enabled = true;
	};

	this.disableTrackBall = function() {
		this.trackball.enabled = false;
	};

	this.setDimensions = function(w, h) {
		this.stageWidth = w || 600;
		this.stageHeight = h || 600;

	};

	this.toPerspective = function() {
		this.camera.toPerspective();
	};

	this.toOrthographic = function() {
		this.camera.toOrthographic();
	};

	this.resize = function(width, height) {

		this.container.style.left = 0 + 'px';
		this.container.style.top = 0 + 'px';
		this.renderer.setSize( this.stageWidth,this.stageHeight );
		this.renderer.setViewport( 0, 0, this.stageWidth, this.stageHeight );
		this.container.appendChild(this.renderer.domElement);
	};

};

DIPLO.BoilerPlate3D.prototype = new UNCTRL.BoilerPlate();
DIPLO.BoilerPlate3D.prototype.constructor = DIPLO.BoilerPlate3D;