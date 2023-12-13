import React from 'react';
import {
  withStyles
} from 'material-ui';

import * as THREE from 'three';
import * as BAS from 'three-bas';

import * as POP from 'popmotion';

import stepsConfig from './stepsConfig';
import doAnimations from './stepAnimation';

const global = process.env.BROWSER ? window : {};

const font = require('src/assets/fonts/RobotoThin.json');

// if (process.env.BROWSER) {
//   // Add Plugins to client only
//   window.THREE = THREE;
//   window.POP = POP;
//   require('three/examples/js/controls/OrbitControls.js');
//   require('three/examples/js/controls/TrackballControls');
// }

import utils from 'js/utils';

const styles = theme => ({
  canvas: {
    position: 'absolute',
    zIndex: 0,
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    // backgroundColor: theme.palette.common.black
  }
});

// PureComponent Help Remount Component more effectively on the change of
// anything inside Component while we are editing
class ThreeRenderer extends React.PureComponent {
  static defaultProps = {
    particleCount: 1000,
    lineLengthLimit: 79,
    clearColor: 0x000000,
    fov: 45,
    alias: (global.devicePixelRatio === 1),
    resolution: global.devicePixelRatio || 1,
    fps: 60, // Our Desire Framerate // How many 'updates' per 1 real second
    speed: 0.5 // Animation speed related to fps
  };
  state = {};
  animationHandlers = {};
  // We dont need this in state so we can mutate it
  timing = {
    frame: 0,
    lastTime: Date.now(),
    currentTime: Date.now(),
    deltaTime: 0,
    totalTime: 0
  };

  canvas = React.createRef();
  renderer = null;
  stage = null;
  camera = null;
  cameraController = null;

  init = () => {
    let self = this;
    let canvas = self.canvas.current;

    // RENDERER
    self.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: self.state.antialias,
      alpha: true
    });

    self.renderer.setClearColor( self.state.clearColor, 1 );
    self.renderer.setSize(canvas.clientWidth,canvas.clientHeight);
    self.renderer.setPixelRatio(self.state.resolution);

    // CAMERA
    self.camera = new THREE.PerspectiveCamera(self.state.fov,canvas.clientWidth/canvas.clientHeight,1,1000000);
    self.camera.position.set(0,0,0.001);
    // self.cameraController = new THREE.TrackballControls(self.camera);
    // self.cameraController.update();

    // CAMERA CONTROL EVENT
    // self.cameraController.addEventListener('start',function(e){
    //   // console.log(e);
    // });
    // self.cameraController.addEventListener('end',function(e){
    //   // console.log(e);
    // });
    // self.cameraController.addEventListener('change',function(e){
    //   console.log(self.camera.position);
    // });

    // STAGE - ROOT SCENE
    self.stage = new THREE.Scene();

    let material = new THREE.MeshNormalMaterial({
      wireframe: true
    });

    let cloudTextGeometry = new THREE.TextGeometry('Software Development',{
      font: new THREE.Font(font),
      size: window.innerWidth / 10,
      height: 10
    }).center();
    console.log(cloudTextGeometry);

    // Cloud Vertex Geometry
    let cloudVertexGeometry = self.createBufferSphereGeometry(self.state.particleCount);

    // Prepare the endPosition for Vertices in Cloud
    let o = () => new THREE.Vector3(0,0,0);
    let faceAreas = cloudTextGeometry.faces.map((face,index) => {
      let a = cloudTextGeometry
        .vertices[cloudTextGeometry.faces[index].a]
        .distanceTo(
          cloudTextGeometry
            .vertices[cloudTextGeometry.faces[index].b]
        );
      let b = cloudTextGeometry
        .vertices[cloudTextGeometry.faces[index].a]
        .distanceTo(
          cloudTextGeometry
            .vertices[cloudTextGeometry.faces[index].c]
        );
      let c = cloudTextGeometry
        .vertices[cloudTextGeometry.faces[index].b]
        .distanceTo(
          cloudTextGeometry
            .vertices[cloudTextGeometry.faces[index].c]
        );
      let p = (a + b + c)/2;
      let area = Math.sqrt(p*(p-a)*(p-b)*(p-c));
      return {
        index,
        area
      };
    });

    let weightedArray = [];
    faceAreas.forEach(area => {
      for (let i=0;i<Math.ceil(area.area);i++) {
        weightedArray.push(area.index);
      }
    });

    // Random pick a face in Text Geometry
    for (let i=0;i<self.state.particleCount;i++) {
      // Now pick a random position in the face
      let r1 = Math.random();
      let r2 = (1.0 - r1) * Math.random();

      let randomFaceIndex = weightedArray[Math.floor(Math.random()*weightedArray.length)];
      let randomFace = [
        cloudTextGeometry.vertices[cloudTextGeometry.faces[randomFaceIndex].a],
        cloudTextGeometry.vertices[cloudTextGeometry.faces[randomFaceIndex].b],
        cloudTextGeometry.vertices[cloudTextGeometry.faces[randomFaceIndex].c]
      ];

      let AB = o().subVectors(randomFace[1],randomFace[0]);
      let AC = o().subVectors(randomFace[2],randomFace[0]);

      let eAB = new THREE.Vector3(AB.x,AB.y,AB.z);
      let eAC = new THREE.Vector3(AC.x,AC.y,AC.z);
      let randomPoint = o().addVectors(
        randomFace[0],
        o().addVectors(
          eAB.multiplyScalar(r1),
          eAC.multiplyScalar(r2)
        )
      );
      randomPoint.toArray(cloudVertexGeometry.attributes.endPosition.array,i*3);
    }

    // LineSegment is lines made by 2 adjacent points [0,1] [2,3] [4,5]
    // Thus, we have to put a double number of counting to the buffer array
    let cloudLineGeometry = self.createLinesGeometryFrom(cloudVertexGeometry,self.state.lineLengthLimit);

    let cloudVertexTexture = (new THREE.TextureLoader()).load(require('images/circle.png'));
    let cloudMaterial = new THREE.ShaderMaterial({
      blending: THREE.NormalBlending,
      depthTest: false,
      alphaTest: 0.1,
      transparent: true,
      uniforms: {
				resolution:   { value: window.devicePixelRatio },
        time:         { value: 0. },
        size:         { value: 0. },
        rotationSpeed:     { value: 0. },
        pointOpacity: { value: 0. },
        lineOpacity:  { value: 0. },
        step1:        { value: 0. },
        step2:        { value: 0. },
        step3:        { value: 0. },
        texture:      { value: cloudVertexTexture }
      },
      vertexShader: `
				uniform float resolution;
        uniform float time;
        uniform float rotationSpeed;
        uniform float size;
        uniform float step1;
        uniform float step2;
        uniform float step3;
        
        attribute vec3 endPosition;
        
        attribute float vertexIndex;
        
        attribute float vertexIndexPercent;
        varying float fVertexIndexPercent;
        
        attribute float vertexSpeed;
        attribute float motionRange;
        
        attribute float angle;
        varying float fAngle;
        
        attribute float isLine;
        varying float fIsLine;

				varying vec3 fMotionVector;
        
        const float PI = 3.1415926535897932384626433832795;
        
        vec4 quat_from_axis_angle(vec3 axis, float angle) { 
          vec4 qr;
          float half_angle = (angle * 0.5) * PI / 180.0;
          qr.x = axis.x * sin(half_angle);
          qr.y = axis.y * sin(half_angle);
          qr.z = axis.z * sin(half_angle);
          qr.w = cos(half_angle);
          return qr;
        }
        
        vec4 quat_conj(vec4 q) { 
          return vec4(-q.x, -q.y, -q.z, q.w); 
        }
          
        vec4 quat_mult(vec4 q1, vec4 q2) { 
          vec4 qr;
          qr.x = (q1.w * q2.x) + (q1.x * q2.w) + (q1.y * q2.z) - (q1.z * q2.y);
          qr.y = (q1.w * q2.y) - (q1.x * q2.z) + (q1.y * q2.w) + (q1.z * q2.x);
          qr.z = (q1.w * q2.z) + (q1.x * q2.y) - (q1.y * q2.x) + (q1.z * q2.w);
          qr.w = (q1.w * q2.w) - (q1.x * q2.x) - (q1.y * q2.y) - (q1.z * q2.z);
          return qr;
        }
       
        
        vec3 rotate_vertex_position(vec3 position, vec3 axis, float angle) { 
          vec4 q = quat_from_axis_angle(axis, angle);
          vec3 v = position.xyz;
          return v + 2.0 * cross(q.xyz, cross(q.xyz, v) + q.w * v);
        }

				vec3 calcPosition(vec3 originPosition, vec3 originEndPosition, float time, float step1, float step2, float step3, float rotationSpeed) {
          // Step 1
          vec3 scene1 = step1 * (originPosition * (motionRange/distance(vec3(0.0),originPosition)) * sin(angle*vertexSpeed*time*0.05));
          
          // Step 2
          vec3 scene2 = step2 * originPosition;
          
          // Step 3
          vec3 scene3 = -0.9*step3*scene1 + -1.0*step3*scene2 + step3 * originEndPosition;
         
          // Combine All Scenes
          vec3 currentPosition = scene1 + scene2 + scene3; //scene1 + scene2 + scene3;
          
          // Rotation
          return rotate_vertex_position(currentPosition,vec3(0,1,0),rotationSpeed*360.);
				}
        
        void main() {
          fVertexIndexPercent = vertexIndexPercent;
          fIsLine = isLine;
          fAngle = angle;

					float delta = 1./60.;

					vec3 lastPosition = calcPosition(position,endPosition,time-delta,step1,step2,step3,rotationSpeed);
					vec3 currentPosition = calcPosition(position,endPosition,time,step1,step2,step3,rotationSpeed);

					// Calc motion vector
					fMotionVector = currentPosition - lastPosition;

          // Size
          gl_PointSize = size*resolution;
          
          // Transform Position to Our World
          gl_Position = projectionMatrix * modelViewMatrix * vec4(currentPosition,1.0);        
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform float pointOpacity;
        uniform float lineOpacity;
        uniform sampler2D texture;
				varying vec3 fMotionVector;
        varying float fVertexIndexPercent;
        varying float fIsLine;
        varying float fAngle;
        
        float rand(float n){return fract(sin(n) * 43758.5453123);}
            
        float noise(float p){
          float fl = floor(p);
          float fc = fract(p);
          return mix(rand(fl), rand(fl + 1.0), fc);
        }
        
        float avoidDivideByZero (float value) {
          float signValue = sign(value);
          return (1. * abs(sign(value))) / (value + (abs(sign(value)) - 1.));
        }
      
        void main() {
          vec3 currentColor = clamp(fIsLine + vec3(
            fract(abs(sin(fAngle))*10.),
            fract(abs(sin(fAngle))*100.),
            fract(abs(sin(fAngle))*1000.)
          ),0.,1.);

					// point UV
					// Since point is square so no need to stretch
					vec2 pUV = vec2(gl_PointCoord.x,1.-gl_PointCoord.y);
					pUV = pUV*2. - 1.;

					// !!! IMPORTANT From this, we can draw anything to UV of each point

					// Texture
					float uvAlpha = smoothstep(0.5,0.4,distance(vec2(0.,0.),pUV));

					// Motion Blur
					// The Motion vector we have is with the direction of motion,
					// We have to create motion is the reverse direction of that motion vector by multiply with -1.
					float motionLength = clamp(length(fMotionVector.xy),-1.,1.);
					vec2 motionVector = -0.5 * clamp(fMotionVector.xy,-1.,1.);
					uvAlpha += smoothstep(0.5,0.49,distance(motionVector*1.0,pUV))*0.25;
					uvAlpha += smoothstep(0.5,0.49,distance(motionVector*0.6,pUV))*0.25;
					uvAlpha += smoothstep(0.5,0.49,distance(motionVector*0.3,pUV))*0.25;

					// Make sure this only work with point not line
					uvAlpha = clamp(fIsLine + uvAlpha,0.,1.);
          
          // Alpha of Points and Lines
          float alpha = 0.;
          
          // fIsLine*showLine* 0.05 for Line only
          alpha += fIsLine*smoothstep(fVertexIndexPercent,fVertexIndexPercent+0.05,lineOpacity)*0.1;
          
          // (1.0-fIsLine)*showPoint/2.0 for Point only
          alpha += (1.0-fIsLine)*smoothstep(fVertexIndexPercent,fVertexIndexPercent+0.05,pointOpacity)/2.;
          
          // Make Texture only effect points not lines
          // vec4 currentTexture = clamp(fIsLine + texture2D(texture,gl_PointCoord),0.,1.);
          gl_FragColor = vec4(currentColor,alpha) * vec4(1.,1.,1.,uvAlpha); //vec4(currentColor,alpha) * currentTexture;
        }
      `
    });

    let cloudPoints = new THREE.Points(cloudVertexGeometry,cloudMaterial);
    let cloudLines = new THREE.LineSegments(cloudLineGeometry,cloudMaterial);

    self.cloudLines = cloudLines;
    self.cloudPoints = cloudPoints;
    self.cloudMaterial = cloudMaterial;

    window.cloudMaterial = cloudMaterial;
    window.self = self;

    self.stage.add(cloudLines);
    self.stage.add(cloudPoints);
    // let text = new THREE.Mesh( cloudTextGeometry, material );
    // self.stage.add(text);
    self.updateTiming();

    self.doAnimations(self.props.step);
  };

  animateStep = (step,from,to,duration = 1000) => {
    let self = this;
    self.animationHandlers['animation-' + utils.uniqueId()] = POP.tween({
      from,
      to,
      velocity: 10,
      stiffness: 100,
      duration,
      ease: POP.easing.cubicBezier(0,.7,.55,1.13)
    }).start(function(interpolate){
      step.value = interpolate
    });
  };

  doAnimations = (stepIndex,options) => {
    let self = this;
    doAnimations(self,stepsConfig,stepIndex,options);
  };

  updateRenderer = () => {
    let self = this;

    // Update time
    self.cloudMaterial.uniforms.time.value += (1/self.state.fps)*self.state.speed;

    // Update Camera Controller
    // self.cameraController.update();
  };

  renderRenderer = () => {
    let self = this;
    self.renderer.render(self.stage,self.camera);
  };

  updateTiming = () => {
    let self = this;
    self.timing.currentTime = Date.now();
    self.timing.deltaTime = self.timing.currentTime - self.timing.lastTime;
    self.timing.totalTime += self.timing.deltaTime;

    // If the scene is heavy, thus the rendering will be lagged
    // The lag will be resulted as long deltaTime
    // We need to do more than one time updating per frame
    // So the updating (positions,states) need to be keep on with real-time and our desire fps
    // While the rendering just need to run when it can do
    while (self.timing.totalTime > 1000/self.state.fps) {
      self.timing.totalTime -= 1000/self.state.fps;
      // When TotalTime is more than our step amount
      // (1000/self.state.fps millisecond)
      // We shall do the update
      self.timing.frame++;
      self.updateRenderer();
    }
    self.timing.lastTime = self.timing.currentTime;

    // While the rendering just need to run when it can do
    self.renderRenderer();

    // Loop the update by Request Animation Frame
    self.updateHandle = global.requestAnimationFrame(self.updateTiming);
  };

  createBufferSphereGeometry = (cloudVertexCount) => {
    let cloudVertexIndex = new Float32Array(cloudVertexCount);
    let cloudVertexStartPosition = new Float32Array(cloudVertexCount * 3);
    let cloudVertexEndPosition = new Float32Array(cloudVertexCount * 3);
    let cloudVertexMotionRange = new Float32Array(cloudVertexCount);
    let cloudVertexSpeed = new Float32Array(cloudVertexCount);
    let cloudVertexAngle = new Float32Array(cloudVertexCount);

    // Create Cloud of Vertices
    for (let i = 0; i < cloudVertexCount; i++) {
      // Index
      cloudVertexIndex[i] = i;

      // Random it on the surface of a sphere
      let radius = 500;
      let angle = Math.random() * 2 * Math.PI;
      let z = Math.random() * 2 * radius - radius;
      let x = Math.sqrt(radius * radius - z * z) * Math.cos(angle);
      let y = Math.sqrt(radius * radius - z * z) * Math.sin(angle);
      let vertexPosition = new THREE.Vector3(
        x,
        y,
        z
      );
      vertexPosition.toArray(cloudVertexStartPosition, i * 3);

      // Random Motion Range
      cloudVertexMotionRange[i] = 10 + Math.random() * 50;

      // Random Speed
      cloudVertexSpeed[i] = Math.random() * 40 - 20;

      // Random Angle
      cloudVertexAngle[i] = Math.random() * 2 * Math.PI;
    }

    let cloudVertexGeometry = new THREE.BufferGeometry();
    cloudVertexGeometry.addAttribute('vIsLine', new THREE.BufferAttribute((new Float32Array(cloudVertexCount)).fill(0.0), 1));
    cloudVertexGeometry.addAttribute('position', new THREE.BufferAttribute(cloudVertexStartPosition, 3));
    cloudVertexGeometry.addAttribute('endPosition', new THREE.BufferAttribute(cloudVertexEndPosition, 3));
    cloudVertexGeometry.addAttribute('vertexIndex', new THREE.BufferAttribute(cloudVertexIndex, 1));
    cloudVertexGeometry.addAttribute('vertexIndexPercent', new THREE.BufferAttribute(cloudVertexIndex.map(index => index/cloudVertexCount), 1));
    cloudVertexGeometry.addAttribute('motionRange', new THREE.BufferAttribute(cloudVertexMotionRange, 1));
    cloudVertexGeometry.addAttribute('vertexSpeed', new THREE.BufferAttribute(cloudVertexSpeed, 1));
    cloudVertexGeometry.addAttribute('angle', new THREE.BufferAttribute(cloudVertexAngle, 1));

    return cloudVertexGeometry;
  };

  createLinesGeometryFrom = (cloudVertexGeometry,lineLength = 10) => {
    let cloudVertexCount = cloudVertexGeometry.attributes.position.count;
    let cloudVertexIndex = cloudVertexGeometry.attributes.vertexIndex.array;
    let cloudVertexIndexPercent = cloudVertexGeometry.attributes.vertexIndexPercent.array;

    let cloudVertexStartPosition = cloudVertexGeometry.attributes.position.array;
    let cloudVertexEndPosition = cloudVertexGeometry.attributes.endPosition.array;

    let cloudVertexMotionRange = cloudVertexGeometry.attributes.motionRange.array;
    let cloudVertexSpeed = cloudVertexGeometry.attributes.vertexSpeed.array;
    let cloudVertexAngle = cloudVertexGeometry.attributes.angle.array;

    let cloudLineIndex = [];
    let cloudLineIndexPercent = [];
    let cloudLineStartPosition = [];
    let cloudLineEndPosition = [];
    let cloudLineMotionRange = [];
    let cloudLineSpeed = [];
    let cloudLineAngle = [];

    // Create Line Segment base on the Cloud Vertices
    for (let i=0;i<cloudVertexCount;i++) {
      // Random a start Vertices
      let startPointIndex = cloudVertexIndex[i];
      let startPointVertex = new THREE.Vector3(
        cloudVertexStartPosition[i*3],
        cloudVertexStartPosition[i*3+1],
        cloudVertexStartPosition[i*3+2]
      );
      for (let j=0;j<cloudVertexCount;j++) {
        if (i !== j) {
          let endPointIndex = cloudVertexIndex[j];
          let endPointVertex = new THREE.Vector3(
            cloudVertexStartPosition[j*3],
            cloudVertexStartPosition[j*3+1],
            cloudVertexStartPosition[j*3+2]
          );

          if (startPointVertex.distanceTo(endPointVertex) <= lineLength) {
            // We take all the information of verties from the cloudVertex above
            // Index
            cloudLineIndex.push(
              cloudVertexIndex[startPointIndex],
              cloudVertexIndex[endPointIndex]
            );

            // Index Percent
            cloudLineIndexPercent.push(
              cloudVertexIndexPercent[startPointIndex],
              cloudVertexIndexPercent[endPointIndex]
            );

            // Motion Range
            cloudLineMotionRange.push(
              cloudVertexMotionRange[startPointIndex],
              cloudVertexMotionRange[endPointIndex]
            );

            // Speed
            cloudLineSpeed.push(
              cloudVertexSpeed[startPointIndex],
              cloudVertexSpeed[endPointIndex]
            );

            // Angle
            cloudLineAngle.push(
              cloudVertexAngle[startPointIndex],
              cloudVertexAngle[endPointIndex]
            );

            // StartPosition
            cloudLineStartPosition.push(
              cloudVertexStartPosition[startPointIndex*3],
              cloudVertexStartPosition[startPointIndex*3+1],
              cloudVertexStartPosition[startPointIndex*3+2],
              cloudVertexStartPosition[endPointIndex*3],
              cloudVertexStartPosition[endPointIndex*3+1],
              cloudVertexStartPosition[endPointIndex*3+2]
            );

            // EndPosition
            cloudLineEndPosition.push(
              cloudVertexEndPosition[startPointIndex*3],
              cloudVertexEndPosition[startPointIndex*3+1],
              cloudVertexEndPosition[startPointIndex*3+2],
              cloudVertexEndPosition[endPointIndex*3],
              cloudVertexEndPosition[endPointIndex*3+1],
              cloudVertexEndPosition[endPointIndex*3+2]
            );
          }
        }
      }
    }


    let cloudLineGeometry = new THREE.BufferGeometry();
    cloudLineGeometry.addAttribute('isLine',     new THREE.BufferAttribute( (new Float32Array(cloudLineIndex.length)).fill(1.0), 1 ));
    cloudLineGeometry.addAttribute('position',    new THREE.BufferAttribute( Float32Array.from(cloudLineStartPosition), 3 ));
    cloudLineGeometry.addAttribute('endPosition',    new THREE.BufferAttribute( Float32Array.from(cloudLineEndPosition), 3 ));
    cloudLineGeometry.addAttribute('vertexIndex', new THREE.BufferAttribute( Float32Array.from(cloudLineIndex), 1 ));
    cloudLineGeometry.addAttribute('vertexIndexPercent', new THREE.BufferAttribute( Float32Array.from(cloudLineIndexPercent), 1 ));
    cloudLineGeometry.addAttribute('motionRange', new THREE.BufferAttribute( Float32Array.from(cloudLineMotionRange), 1 ));
    cloudLineGeometry.addAttribute('vertexSpeed', new THREE.BufferAttribute( Float32Array.from(cloudLineSpeed), 1 ));
    cloudLineGeometry.addAttribute('angle',       new THREE.BufferAttribute( Float32Array.from(cloudLineAngle), 1 ));

    return cloudLineGeometry;
  };

  resizeHandler = () => {
    let self = this;
    self.camera.aspect = window.innerWidth / window.innerHeight;
    self.camera.updateProjectionMatrix();
    self.renderer.setSize( window.innerWidth, window.innerHeight );
  }

  static getDerivedStateFromProps(nextProps,prevState) {
    return {
      ...prevState,
      ...nextProps
    };
  }

  componentDidMount() {
    this.init();
    window.addEventListener('resize',this.resizeHandler);
  }

  componentDidUpdate() {
    this.doAnimations(this.props.step);
  }

  componentWillUnmount() {
    window.removeEventListener('resize',this.resizeHandler);
  }

  render() {
    const { props } = this;
    const { id,classes } = props;
    return (
      <canvas id={id} className={classes.canvas} ref={this.canvas}>
        {/* WEBGL CANVAS */}
      </canvas>
    )
  }

}

export default withStyles(styles,{withTheme: true})(ThreeRenderer);