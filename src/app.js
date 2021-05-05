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

const textureLoader = new THREE.TextureLoader()
const loadingManager = new THREE.LoadingManager(
  // Loaded
  () =>{
    gsap.to(overlayMaterial.uniforms.uAlpha, { duration: 3, value: 0 })
  },

  // Progress
  () =>{
    console.log('progress')
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
  skinning: false,
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
  skinning: false,
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
  skinning: false,
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
  skinning: false,
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




const groundMaterialCannon = new CANNON.Material('ground')

// Create a static plane for the ground
const groundBody = new CANNON.Body({
  mass: 0, // can also be achieved by setting the mass to 0
  shape: new CANNON.Box(new CANNON.Vec3(50, 25, 5)),
  material: groundMaterialCannon
})
groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0) // make it face up
groundBody.position.y = -9.5
world.addBody(groundBody)


const sizeX = 64
       const sizeZ = sizeX
       const matrix = []
       for (let i = 0; i < sizeX; i++) {
         matrix.push([])
         for (let j = 0; j < sizeZ; j++) {
           if (i === 0 || i === sizeX - 1 || j === 0 || j === sizeZ - 1) {
             const height = 6
             matrix[i].push(height)
             continue
           }

           const height = Math.sin((i / sizeX) * Math.PI * 7) * Math.sin((j / sizeZ) * Math.PI * 7) * 6 + 6
           matrix[i].push(height)
         }
       }

       // const groundMaterial = new CANNON.Material('ground')
       const heightfieldShape = new CANNON.Heightfield(matrix, {
         elementSize: 300 / sizeX,
       })
       const heightfieldBody = new CANNON.Body({ mass: 0, material: groundMaterial })
       heightfieldBody.addShape(heightfieldShape)
       heightfieldBody.position.set(
         (-(sizeX - 1) * heightfieldShape.elementSize) / 2,
         -15,
         ((sizeZ - 1) * heightfieldShape.elementSize) / 2
       )
heightfieldBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0)
       //world.addBody(heightfieldBody)

const groundGeometry = new THREE.BoxGeometry(100,50,10)
const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial)

groundMesh.rotation.x = - Math.PI / 2;
groundMesh.position.y = -9.5;
scene.add(groundMesh)



const chassisShape = new CANNON.Box(new CANNON.Vec3(5, 0.5, 2))
  const chassisBody = new CANNON.Body({ mass: 5 })
        const centerOfMassAdjust = new CANNON.Vec3(0, -1, 0)
        chassisBody.addShape(chassisShape, centerOfMassAdjust)


        // Create the vehicle
        const vehicle = new CANNON.RigidVehicle({
          chassisBody
        })

        const mass = 5
        const axisWidth = 7
        const wheelShape = new CANNON.Sphere(1.5)
        const wheelMaterial = new CANNON.Material('wheel')
        const down = new CANNON.Vec3(0, -1, 0)

        const wheelBody1 = new CANNON.Body({ mass, material: wheelMaterial })
        wheelBody1.addShape(wheelShape)
        vehicle.addWheel({
          body: wheelBody1,
          position: new CANNON.Vec3(-5, 0, axisWidth / 2).vadd(centerOfMassAdjust),
          axis: new CANNON.Vec3(0, 0, 1),
          direction: down
        })

        const wheelBody2 = new CANNON.Body({ mass, material: wheelMaterial })
        wheelBody2.addShape(wheelShape)
        vehicle.addWheel({
          body: wheelBody2,
          position: new CANNON.Vec3(-5, 0, -axisWidth / 2).vadd(centerOfMassAdjust),
          axis: new CANNON.Vec3(0, 0, -1),
          direction: down
        })

        const wheelBody3 = new CANNON.Body({ mass, material: wheelMaterial })
        wheelBody3.addShape(wheelShape)
        vehicle.addWheel({
          body: wheelBody3,
          position: new CANNON.Vec3(5, 0, axisWidth / 2).vadd(centerOfMassAdjust),
          axis: new CANNON.Vec3(0, 0, 1),
          direction: down
        })

        const wheelBody4 = new CANNON.Body({ mass, material: wheelMaterial })
        wheelBody4.addShape(wheelShape)
        vehicle.addWheel({
          body: wheelBody4,
          position: new CANNON.Vec3(5, 0, -axisWidth / 2).vadd(centerOfMassAdjust),
          axis: new CANNON.Vec3(0, 0, -1),
          direction: down
        })

        vehicle.wheelBodies.forEach((wheelBody) => {
          // Some damping to not spin wheels too fast
          wheelBody.angularDamping = 0.4


        })

        const wheel_ground = new CANNON.ContactMaterial(wheelMaterial, groundMaterial, {
         friction: 0.3,
         restitution: 0,
         contactEquationStiffness: 1000,
       })
       world.addContactMaterial(wheel_ground)

// vehicle.chassisBody.position. = 5
vehicle.addToWorld(world)

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

 document.addEventListener('keydown', (event) => { event.preventDefault();
const maxSteerVal = Math.PI / 8
const maxSpeed = 10
const maxForce = 100

  switch (event.key) {
    case 'w':
    case 'ArrowUp':
    vehicle.setWheelForce(maxForce, 2)
    vehicle.setWheelForce(-maxForce, 3)
    break

  case 's':
  case 'ArrowDown':
    vehicle.setWheelForce(-maxForce / 2, 2)
    vehicle.setWheelForce(maxForce / 2, 3)
    break

  case 'a':
  case 'ArrowLeft':
    vehicle.setSteeringValue(maxSteerVal, 0)
    vehicle.setSteeringValue(maxSteerVal, 1)
    break

  case 'd':
  case 'ArrowRight':
    vehicle.setSteeringValue(-maxSteerVal, 0)
    vehicle.setSteeringValue(-maxSteerVal, 1)
    break
}
         })

         document.addEventListener('keyup', (event) => {
            event.preventDefault();
                   switch (event.key) {
                     case 'w':
                     case 'ArrowUp':
                       vehicle.setWheelForce(0, 2)
                       vehicle.setWheelForce(0, 3)
                       break

                     case 's':
                     case 'ArrowDown':
                       vehicle.setWheelForce(0, 2)
                       vehicle.setWheelForce(0, 3)
                       break

                     case 'a':
                     case 'ArrowLeft':
                       vehicle.setSteeringValue(0, 0)
                       vehicle.setSteeringValue(0, 1)
                       break

                     case 'd':
                     case 'ArrowRight':
                       vehicle.setSteeringValue(0, 0)
                       vehicle.setSteeringValue(0, 1)
                       break
                   }
                 })
controls.maxZoom= 20
controls.maxDistance = 20

//cannonDebugger(scene, world.bodies, {})


const clock = new THREE.Clock()

const tick = () =>{
  // if ( mixer ) mixer.update( clock.getDelta() )
  const elapsedTime = clock.getElapsedTime()


  lightsMaterial.uniforms.uTime.value = elapsedTime
  thrustersMaterial.uniforms.uTime.value = elapsedTime
  windowMaterial.uniforms.uTime.value = elapsedTime
  groundMaterial.uniforms.uTime.value = elapsedTime

  if(shipGroup){
    console.log(vehicle)
    shipGroup.position.copy(vehicle.chassisBody.position)
    shipGroup.quaternion.copy(vehicle.chassisBody.quaternion)
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
