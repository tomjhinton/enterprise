import './style.scss'



import * as THREE from 'three'
import * as CANNON from 'cannon-es'
import cannonDebugger from 'cannon-es-debugger'
import { gsap } from 'gsap'

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

//Shaders

import lightsVertexShader from './shaders/lights/vertex.glsl'
import lightsFragmentShader from './shaders/lights/fragment.glsl'


import thrustersVertexShader from './shaders/thrusters/vertex.glsl'
import thrustersFragmentShader from './shaders/thrusters/fragment.glsl'


import windowVertexShader from './shaders/window/vertex.glsl'
import windowFragmentShader from './shaders/window/fragment.glsl'

import groundVertexShader from './shaders/ground/vertex.glsl'
import groundFragmentShader from './shaders/ground/fragment.glsl'




const canvas = document.querySelector('canvas.webgl')

const scene = new THREE.Scene()
scene.background = new THREE.Color( 0xffffff )


const loadingBarElement = document.querySelector('.loading-bar')
const loadingBarText = document.querySelector('.loading-bar-text')
const textureLoader = new THREE.TextureLoader()
const loadingManager = new THREE.LoadingManager(
  // Loaded
  () =>{
    window.setTimeout(() =>{
      gsap.to(overlayMaterial.uniforms.uAlpha, { duration: 3, value: 0, delay: 1 })

      loadingBarElement.classList.add('ended')
      loadingBarElement.style.transform = ''

      loadingBarText.classList.add('fade-out')

    }, 500)
  },

  // Progress
  (itemUrl, itemsLoaded, itemsTotal) =>{
    const progressRatio = itemsLoaded / itemsTotal
    loadingBarElement.style.transform = `scaleX(${progressRatio})`

  }
)

const gtlfLoader = new GLTFLoader(loadingManager)

const bakedTexture = textureLoader.load('ship.jpg')

bakedTexture.flipY = false
bakedTexture.encoding = THREE.sRGBEncoding

/**
 * Overlay
 */
const overlayGeometry = new THREE.PlaneGeometry(2, 2, 1, 1)
const overlayMaterial = new THREE.ShaderMaterial({
  depthWrite: false,
  uniforms:
    {
      uAlpha: { value: 1 }
    },
  transparent: true,
  vertexShader: `
        void main()
        {
            gl_Position = vec4(position, 1.0);
        }
    `,
  fragmentShader: `
  uniform float uAlpha;
        void main()
        {
            gl_FragColor = vec4(0.0, 0.0, 0.0, uAlpha);
        }
    `
})

const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial)
scene.add(overlay)




//Materials


const bakedMaterial = new THREE.MeshBasicMaterial({ map: bakedTexture})

const lightsMaterial  = new THREE.ShaderMaterial({
  depthWrite: true,
  uniforms: {
    uTime: { value: 0},
    uResolution: { type: 'v2', value: new THREE.Vector2() }
  },
  vertexShader: lightsVertexShader,
  fragmentShader: lightsFragmentShader,
  transparent: true,
  side: THREE.DoubleSide
})

const thrustersMaterial  = new THREE.ShaderMaterial({
  depthWrite: true,
  uniforms: {
    uTime: { value: 0},
    uResolution: { type: 'v2', value: new THREE.Vector2() }
  },
  vertexShader: thrustersVertexShader,
  fragmentShader: thrustersFragmentShader,
  transparent: true,
  side: THREE.DoubleSide
})

const windowMaterial  = new THREE.ShaderMaterial({
  depthWrite: true,
  uniforms: {
    uTime: { value: 0},
    uResolution: { type: 'v2', value: new THREE.Vector2() }
  },
  vertexShader: windowVertexShader,
  fragmentShader: windowFragmentShader,
  transparent: true,
  side: THREE.DoubleSide
})

const groundMaterial  = new THREE.ShaderMaterial({
  depthWrite: true,
  uniforms: {
    uTime: { value: 0},
    uResolution: { type: 'v2', value: new THREE.Vector2() }
  },
  vertexShader: groundVertexShader,
  fragmentShader: groundFragmentShader,
  transparent: true,
  side: THREE.DoubleSide
})


let bakedMesh, thrustersMesh, windowMesh, lightsMesh, shipGroup


gtlfLoader.load(
  'ship.glb',
  (gltf) => {
    console.log(gltf)
    //gltf.scene.scale.set(.5,.5,.5)
    shipGroup = gltf.scene
    scene.add(shipGroup)



    bakedMesh = gltf.scene.children.find((child) => {
      return child.name === 'ship'
    })

    lightsMesh = gltf.scene.children.find((child) => {
      return child.name === 'lights'
    })

    thrustersMesh = gltf.scene.children.find((child) => {
      return child.name === 'thrusters'
    })

    windowMesh = gltf.scene.children.find((child) => {
      return child.name === 'window'
    })





    bakedMesh.material = bakedMaterial
    lightsMesh.material = lightsMaterial
    thrustersMesh.material = thrustersMaterial
    windowMesh.material = windowMaterial


  }
)

//CANNON
const world = new CANNON.World({
  gravity: new CANNON.Vec3(0, -9.82, 0) // m/s²
})

let boxesC = []
let boxes3 = []
function createCube(z){

const groundMaterialCannon = new CANNON.Material('ground')

// Create a static plane for the ground
const groundBody = new CANNON.Body({
  mass: 0, // can also be achieved by setting the mass to 0
  shape: new CANNON.Box(new CANNON.Vec3(10, 10, 5)),
  material: groundMaterialCannon
})
groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
groundBody.position.x = -z
groundBody.position.y = -9.5
world.addBody(groundBody)
boxesC.push(groundBody)
const groundGeometry = new THREE.BoxGeometry(20,20,10)
const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial)

groundMesh.rotation.x = - Math.PI / 2
groundMesh.position.x = -z
groundMesh.position.y = -9.5
scene.add(groundMesh)

boxes3.push(groundMesh)
}

for(let i = 0; i < 10; i++){
  createCube(i*20)
}





const chassisShape = new CANNON.Box(new CANNON.Vec3(5, 0.25, 1.25))
const chassisBody = new CANNON.Body({ mass: 2 })
const centerOfMassAdjust = new CANNON.Vec3(0, -1, 0)
chassisBody.addShape(chassisShape, centerOfMassAdjust)
world.addBody(chassisBody)

// // Create the vehicle
// const vehicle = new CANNON.RigidVehicle({
//   chassisBody
// })
//
// const mass = 4
// const axisWidth = 2.
// const radiusTop = .4
// const radiusBottom = .4
// const height = .4
// const numSegments = 96
// //const wheelShape = new CANNON.Cylinder(radiusTop, radiusBottom, height, numSegments)
// const wheelShape = new CANNON.Sphere(1)
// console.log(wheelShape.faces)
// var q = new CANNON.Quaternion();
// q.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2);
// console.log(wheelShape)
//
// const wheelMaterial = new CANNON.Material('wheel')
// const down = new CANNON.Vec3(0, -1, 0)
//
// const wheelBody1 = new CANNON.Body({ mass, material: wheelMaterial })
// wheelBody1.addShape(wheelShape,new CANNON.Vec3(), q)
// vehicle.addWheel({
//   body: wheelBody1,
//   position: new CANNON.Vec3(-5, 0, axisWidth / 2).vadd(centerOfMassAdjust),
//   axis: new CANNON.Vec3(0, 0, 1),
//   direction: down
// })
//
// const wheelBody2 = new CANNON.Body({ mass, material: wheelMaterial })
// wheelBody2.addShape(wheelShape,new CANNON.Vec3(), q)
// vehicle.addWheel({
//   body: wheelBody2,
//   position: new CANNON.Vec3(-5, 0, -axisWidth / 2).vadd(centerOfMassAdjust),
//   axis: new CANNON.Vec3(0, 0, -1),
//   direction: down
// })
//
// const wheelBody3 = new CANNON.Body({ mass, material: wheelMaterial })
// wheelBody3.addShape(wheelShape,new CANNON.Vec3(), q)
// vehicle.addWheel({
//   body: wheelBody3,
//   position: new CANNON.Vec3(5, 0,axisWidth * 1.2).vadd(centerOfMassAdjust),
//   axis: new CANNON.Vec3(0, 0, 1),
//   direction: down
// })
//
// const wheelBody4 = new CANNON.Body({ mass, material: wheelMaterial })
// wheelBody4.addShape(wheelShape,new CANNON.Vec3(), q)
// vehicle.addWheel({
//   body: wheelBody4,
//   position: new CANNON.Vec3(5, 0, -axisWidth * 1.2).vadd(centerOfMassAdjust),
//   axis: new CANNON.Vec3(0, 0, -1),
//   direction: down
// })

// const wheelBody5 = new CANNON.Body({ mass, material: wheelMaterial })
// wheelBody5.addShape(wheelShape)
// vehicle.addWheel({
//   body: wheelBody5,
//   position: new CANNON.Vec3(1.5, 0, axisWidth * 1.2).vadd(centerOfMassAdjust),
//   axis: new CANNON.Vec3(0, 0, 1),
//   direction: down
// })
//
// const wheelBody6 = new CANNON.Body({ mass, material: wheelMaterial })
// wheelBody6.addShape(wheelShape)
// vehicle.addWheel({
//   body: wheelBody6,
//   position: new CANNON.Vec3(1.5, 0, -axisWidth * 1.2).vadd(centerOfMassAdjust),
//   axis: new CANNON.Vec3(0, 0, -1),
//   direction: down
// })

// vehicle.wheelBodies.forEach((wheelBody) => {
//   // Some damping to not spin wheels too fast
//   wheelBody.angularDamping = 0.4
//
//
// })
//
// const wheel_ground = new CANNON.ContactMaterial(wheelMaterial, groundMaterial, {
//   friction: 0.3,
//   restitution: 0,
//   contactEquationStiffness: 1000
// })
// world.addContactMaterial(wheel_ground)

// vehicle.chassisBody.position. = 5
// vehicle.addToWorld(world)

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

window.addEventListener('resize', () =>{

  lightsMaterial.uniforms.uResolution.value.x = renderer.domElement.width
  lightsMaterial.uniforms.uResolution.value.y = renderer.domElement.height


  thrustersMaterial.uniforms.uResolution.value.x = renderer.domElement.width
  thrustersMaterial.uniforms.uResolution.value.y = renderer.domElement.height


  windowMaterial.uniforms.uResolution.value.x = renderer.domElement.width
  windowMaterial.uniforms.uResolution.value.y = renderer.domElement.height




  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2 ))


})


/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 10
camera.position.y = -10
camera.position.z = 15
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.maxPolarAngle = Math.PI / 2 - 0.1
//controls.enableZoom = false;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true
})
renderer.outputEncoding = THREE.sRGBEncoding
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))


// const light = new THREE.AmbientLight( 0x404040 ) // soft white light
// scene.add( light )


/**
 * Animate
 */



const timeStep = 1 / 60 // seconds
let lastCallTime

document.addEventListener('keydown', (event) => {
  event.preventDefault()
// var direction = new THREE.Vector3( 0, 0, -1 ).applyQuaternion( shipGroup.quaternion )
// var cameraDirection = camera.getWorldDirection();
// var cameraForward = new THREE.Vector3(cameraDirection.x, 0, cameraDirection.z).multiplyScalar(speed * dir.ud);
// cube.position.x += cameraForward.x;
// cube.position.z += cameraForward.z;



  // console.log(direction)
  switch (event.key) {
    case 'w':
    case 'ArrowUp':
      console.log(chassisBody)
      //chassisBody.velocity.vmult(shipGroup.position)
      // chassisBody.velocity.y += chassisBody.quaternion.y * 100

      //chassisBody.rotation.x -= 0.05;
			chassisBody.velocity.x -= Math.cos(chassisBody.quaternion.y) * 5.25;
			chassisBody.velocity.z -= Math.sin(chassisBody.quaternion.y) * 5.25;
      // chassisBody.velocity.z += chassisBody.quaternion.z * 100
        chassisBody.applyForce(camera.getWorldDirection(shipGroup.position))
    break

  case 's':
  case 'ArrowDown':
      chassisBody.velocity.x +=10
    break

  case 'a':
  case 'ArrowLeft':
      chassisBody.angularVelocity.y += .1
    break

  case 'd':
  case 'ArrowRight':
        chassisBody.angularVelocity.y -= .1
    break

  case ' ':
    chassisBody.velocity.y +=20
    break
}
 })

 document.addEventListener('keyup', (event) => {
    event.preventDefault();
   switch (event.key) {
     case 'w':
     case 'ArrowUp':
       // vehicle.setWheelForce(0, 2)
       // vehicle.setWheelForce(0, 3)
       break

     case 's':
     case 'ArrowDown':
       // vehicle.setWheelForce(0, 2)
       // vehicle.setWheelForce(0, 3)
       break

     case 'a':
     case 'ArrowLeft':
       // vehicle.setSteeringValue(0, 0)
       // vehicle.setSteeringValue(0, 1)
       break

     case 'd':
     case 'ArrowRight':
       // vehicle.setSteeringValue(0, 0)
       // vehicle.setSteeringValue(0, 1)
       break
   }
         })
controls.maxZoom= 20
controls.maxDistance = 20

cannonDebugger(scene, world.bodies, {})


const clock = new THREE.Clock()

const tick = () =>{
  // if ( mixer ) mixer.update( clock.getDelta() )
  const elapsedTime = clock.getElapsedTime()

  boxes3.map((x, index) =>{
    if(index %2 === 0){
      x.position.z += Math.sin(elapsedTime)  * index/10
      x.position.y += Math.sin(elapsedTime)  * index/10
    }
    if(index %2 !== 0){
      x.position.z += Math.cos(elapsedTime)  * index/10
    }
    boxesC[index].position.copy(x.position)

  })


  lightsMaterial.uniforms.uTime.value = elapsedTime
  thrustersMaterial.uniforms.uTime.value = elapsedTime
  windowMaterial.uniforms.uTime.value = elapsedTime
  groundMaterial.uniforms.uTime.value = elapsedTime

  if(shipGroup){
    //console.log(vehicle)
    shipGroup.position.copy(chassisBody.position)
    shipGroup.quaternion.copy(chassisBody.quaternion)
  }

  const time = performance.now() / 1000 // seconds
  if (!lastCallTime) {
    world.step(timeStep)
  } else {
    const dt = time - lastCallTime
    world.step(timeStep, dt)


  }
  lastCallTime = time

  // Update controls
  controls.update()

  if(shipGroup){
    camera.lookAt(shipGroup.position)
    controls.target = shipGroup.position


  }




  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
