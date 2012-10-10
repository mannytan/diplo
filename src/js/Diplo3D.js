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
	this.cheekLeft = null;
	this.cheekRight = null;
	this.sphere = null;
	this.sphereSegmentsWidth = 20;
	this.sphereSegmentsHeight = 10;

	this.originPoints = null;
	this.activePoints = null;
	this.plotterPoints = null;
	this.pointData = null;

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

		var i, x, y, z, 
			point,
			faceNormal,
			geometry,
			vertex,
			material,
			plotter;

		this.originPoints = [];
		this.activePoints = [];
		this.plotterPoints = [];
		this.pointData = [];

		// VECTOR
		this.rotationVectorNormal = new THREE.Vector3();
		this.rotationVector = new THREE.Vector3(0,4,10);
		this.rotationVector.normalize();
		this.rotationVector.multiplyScalar(100);
		this.centerVector = new THREE.Vector3(80,0);
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
		geometry =  new THREE.SphereGeometry( 100, this.sphereSegmentsWidth, this.sphereSegmentsHeight );
		material = new THREE.MeshBasicMaterial({color:0x000000, opacity:0.125, wireframe:true});
		this.sphere = new THREE.Mesh( geometry, material);
		// this.base.add(this.sphere);

		//this.total = this.sphere.geometry.vertices.length;
		this.total = (this.sphereSegmentsWidth + 1) * (this.sphereSegmentsHeight + 1);

		// CHEEK LEFT
		geometry =  new THREE.SphereGeometry( 100, this.sphereSegmentsWidth, this.sphereSegmentsHeight );
		material = new THREE.MeshBasicMaterial({color:0x000000, opacity:0.125, wireframe:true});
		this.cheekLeft = new THREE.Mesh( geometry, material);
		this.base.add(this.cheekLeft);

		// CHEEK RIGHT
		geometry =  new THREE.SphereGeometry( 100, this.sphereSegmentsWidth, this.sphereSegmentsHeight );
		material = new THREE.MeshBasicMaterial({color:0x000000, opacity:0.125, wireframe:true});
		this.cheekRight = new THREE.Mesh( geometry, material);
		this.base.add(this.cheekRight);


		// PARTICLES
		for(i=0;i<this.total;i++){
			geometry = new THREE.Geometry();
			vertex = new THREE.Vector3();
			geometry.vertices.push( vertex );

			material = new THREE.ParticleBasicMaterial( { size: 4,color: 0x00FF00	} );
			particle = new THREE.ParticleSystem( geometry, material );
			this.originPoints.push(particle);
			// this.base.add(particle);

			material = new THREE.ParticleBasicMaterial( { size: 4,color: 0x0000FF	} );
			particle = new THREE.ParticleSystem( geometry, material );
			this.activePoints.push(particle);
			// this.base.add(particle);

			material = new THREE.ParticleBasicMaterial( { size: 4,color: 0xFF0000	} );
			particle = new THREE.ParticleSystem( geometry, material );
			this.plotterPoints.push(particle);
			// this.base.add(particle);

			this.pointData.push({ distance:1, maxDistance:1.0, minDistance:1.0, normal:0.0, inverseNormal:1.0 });

		}

		for(i=0;i<this.total;i++){
			this.originPoints[i].position.copy(this.sphere.geometry.vertices[i]);
			this.activePoints[i].position.copy(this.sphere.geometry.vertices[i]);
			this.plotterPoints[i].position.copy(this.sphere.geometry.vertices[i]);
			
			plotter = { 
				a:this.sphere.geometry.vertices[i].clone(),
				b:this.sphere.geometry.vertices[i].clone(),
				c:this.sphere.geometry.vertices[i].clone(),
				d:this.sphere.geometry.vertices[i].clone(),
				e:this.sphere.geometry.vertices[i].clone(),
				f:this.sphere.geometry.vertices[i].clone()
			};

			this.plotters.push(plotter);
			
		}

		this.setDistances();
		return this;
	};

	this.parse = function() {

	
		this.rotationVector.y = DIPLO.Params.lift;
		

		this.setDistances();
		
		var a,b,c,e,f;
		var originParticle, activeParticle, tVector,rotationAmount;
		var currentFoldAmount = DIPLO.Params.currentFoldAmount;
		var smoothnessAmount = DIPLO.Params.smoothness;
		var elasticityAmount = DIPLO.Params.elasticity;

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


		for(i=0;i<this.total;i++){
			activeParticle = this.activePoints[i];
			plotterParticle = this.plotterPoints[i];
			a = this.plotters[i].a;
			b = this.plotters[i].b;
			c = this.plotters[i].c;
			d = this.plotters[i].d;
			e = this.plotters[i].e;
			f = this.plotters[i].f;
			elasticity = smoothnessAmount*this.pointData[i].normal + .01;
			smoothness = elasticityAmount*this.pointData[i].normal;

			a = activeParticle.position.clone();
			b.copy(e);
			c.copy(f);

			// d = ((a-b)*(ELASTICITY)) + b;
			d.sub(a,b);
			d.multiplyScalar(elasticity);
			d.addSelf(b);

			// e = b-(b-c)-(b-d);
			// e = c+d-b;
			e.add(c,d);
			e.subSelf(b);

			// f = e-((b-e)*SMOOTHNESS);
			f.sub(b,e);
			f.multiplyScalar(smoothness);
			f.multiplyScalar(-1);
			f.addSelf(e);

			this.plotterPoints[i].position.copy(f);

		}

		var leftOffset = new THREE.Vector3(0,0,80);
		var rightOffset = new THREE.Vector3(0,0,-80);
		for(i=0;i<this.total;i++){
			this.sphere.geometry.vertices[i].copy(this.plotterPoints[i].position);
			this.cheekLeft.geometry.vertices[i].add(this.sphere.geometry.vertices[i], leftOffset);
			this.cheekRight.geometry.vertices[i].copy(this.cheekLeft.geometry.vertices[i]);
			this.cheekRight.geometry.vertices[i].z = -1*this.cheekLeft.geometry.vertices[i].z
		}

		return this;
	};


	this.draw = function() {
		var i;

		for(i=0;i<this.total;i++){
			this.activePoints[i].geometry.vertices.verticesNeedUpdate = true;
			this.originPoints[i].geometry.vertices.verticesNeedUpdate = true;
			this.plotterPoints[i].geometry.vertices.verticesNeedUpdate = true;
		}
		
		this.vectorLine.geometry.verticesNeedUpdate = true;

		this.cheekLeft.geometry.verticesNeedUpdate = true;
		this.cheekRight.geometry.verticesNeedUpdate = true;
		this.sphere.geometry.verticesNeedUpdate = true;

		this.trackball.update();
		this.renderer.render(this.scene, this.camera);

		return this;
	};


	// SET DISTANCES DATA BASED ON PROXIMITY TO FOLD
	this.setDistances = function(){
		var distance;
		var maxDistance = 0;
		var minDistance = 10000;
		var foldDampened = DIPLO.Params.foldDampened;

		for(i=0;i<this.total;i++){
			distance = this.originPoints[i].position.distanceTo(this.centerVector);
			if(distance > maxDistance){
				maxDistance = distance;
			}
			if(distance < minDistance){
				minDistance = distance;
			}
			this.pointData[i].distance = distance;
		}

		for(i=0;i<this.total;i++){
			this.pointData[i].maxDistance = maxDistance;
			this.pointData[i].minDistance = minDistance;
			this.pointData[i].normal = (this.pointData[i].distance - minDistance) / (maxDistance - minDistance) + foldDampened;
			this.pointData[i].normal = clamp(0,1,this.pointData[i].normal);
			this.pointData[i].normal -= foldDampened
			this.pointData[i].normal *= 1/(1-foldDampened);
			this.pointData[i].inverseNormal = 1 - this.pointData[i].normal;
		}

		return this;
	};


};

DIPLO.Diplo3D.prototype = new DIPLO.BoilerPlate3D();
DIPLO.Diplo3D.prototype.constructor = DIPLO.Diplo3D;