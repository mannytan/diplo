/**
 * Created by unctrl.com
 * User: mannytan
 * Date: 8/22/11
 */


DIPLO.Diplo3D = function(name) {
	var scope = this;
	var supeScope = DIPLO.Diplo3D.prototype;

	DIPLO.BoilerPlate3D.call(this);

	this.name = 'Diplo3D';

	// vars specific to Pinecone
	this.sphere = null;
	this.sphereSegmentsWidth = 30;
	this.sphereSegmentsHeight = 15;

	this.originPoints = null;
	this.activePoints = null;

	// ROTATION AXIS
	this.rotationVector = null;
	this.centerVector = null;
	this.vectorLine = null;
	this.offsetRotationVector = null;

	this.count = 0;

	this.plotters = [];

	this.init = function() {

		this.traceFunction("init");

		return this;
	};

	this.createForegroundElements = function() {

		var i,
			point,
			faceNormal,
			geometry,
			vertex,
			material,
			plotter;

		this.originPoints = [];
		this.activePoints = [];

		// VECTOR
		this.rotationVectorNormal = new THREE.Vector3();
		this.rotationVector = new THREE.Vector3(0,50,50);
		this.centerVector = new THREE.Vector3(180,0,50);
		this.offsetRotationVector = new THREE.Vector3();

		geometry = new THREE.Geometry();
		geometry.vertices.push(
			this.centerVector.clone(),
			this.rotationVector.clone()
		);
		material = new THREE.LineBasicMaterial({ color: 0x009900, lineWidth: 1 });
		this.vectorLine = new THREE.Line(geometry, material);
		this.base.add(this.vectorLine);

		// BASE SPHERE
		geometry =  new THREE.SphereGeometry( 200, this.sphereSegmentsWidth, this.sphereSegmentsHeight );
		material = new THREE.MeshBasicMaterial({color:0x000000, opacity:0.125, wireframe:true});
		this.sphere = new THREE.Mesh( geometry, material);
		this.base.add(this.sphere);

		//this.total = this.sphere.geometry.vertices.length;
		
		this.total = (this.sphereSegmentsWidth + 1) * (this.sphereSegmentsHeight + 1);

		// PARTICLES
		for(i=0;i<this.total;i++){
			geometry = new THREE.Geometry();
			vertex = new THREE.Vector3();
			geometry.vertices.push( vertex );

			material = new THREE.ParticleBasicMaterial( { size: 4,color: 0xFF0000	} );
			particle = new THREE.ParticleSystem( geometry, material );
			this.originPoints.push(particle);
			// this.base.add(particle);

			material = new THREE.ParticleBasicMaterial( { size: 4,color: 0x0000FF	} );
			particle = new THREE.ParticleSystem( geometry, material );
			this.activePoints.push(particle);

			this.base.add(particle);

			plotter = {}
			this.plotters.push(plotter);
		}

		for(i=0;i<this.total;i++){
			this.originPoints[i].position.copy(this.sphere.geometry.vertices[i]);
			this.activePoints[i].position.copy(this.sphere.geometry.vertices[i]);
		}

		return this;
	};

	this.parse = function() {

		/*
		this.count+=.01;
		var percentage = this.count*Math.PI*2;
		this.rotationVector.x = Math.cos(percentage)*100;
		this.rotationVector.y = Math.sin(percentage)*100;
		*/

		var originParticle, activeParticle, tVector,rotationAmount;
		var currentFoldAmount = DIPLO.Params.currentFoldAmount;

		this.vectorLine.geometry.vertices[0].copy(this.centerVector);
		this.offsetRotationVector.add(this.rotationVector,this.centerVector);
		this.vectorLine.geometry.vertices[1].copy(this.offsetRotationVector);

		this.rotationVectorNormal.copy(this.rotationVector);
		this.rotationVectorNormal.normalize();

		for(i=0;i<this.total;i++){
			originParticle = this.originPoints[i];
			activeParticle = this.activePoints[i];

			originParticle.position.subSelf(this.centerVector);
			activeParticle.position.subSelf(this.centerVector);

			tVector = this.rotateAroundAxis(originParticle.position, this.rotationVectorNormal, currentFoldAmount*Math.PI*2);
			activeParticle.position.copy(tVector);
			
			originParticle.position.addSelf(this.centerVector);
			activeParticle.position.addSelf(this.centerVector);
		}


d = ((a-b)*(ELASTICITY +tempFloat))+b;
e = b-(b-c)-(b-d);
f = e-((b-e)*SMOOTHNESS + tempFloat);

a = b[i-1];
b = e;
c = f;



		return this;
	};

	this.draw = function() {
		var i;

		
		for(i=0;i<this.total;i++){

			this.activePoints[i].geometry.vertices.verticesNeedUpdate = true;
			this.originPoints[i].geometry.vertices.verticesNeedUpdate = true;
		}
		
		this.vectorLine.geometry.verticesNeedUpdate = true;

		this.sphere.geometry.verticesNeedUpdate = true;

		this.trackball.update();
		this.renderer.render(this.scene, this.camera);

		return this;
	};

};

DIPLO.Diplo3D.prototype = new DIPLO.BoilerPlate3D();
DIPLO.Diplo3D.prototype.constructor = DIPLO.Diplo3D;