import './style.scss'

import * as THREE from 'three'

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

//Shaders

import lightsVertexShader from './shaders/lights/vertex.glsl'
import lightsFragmentShader from './shaders/lights/fragment.glsl'


import thrustersVertexShader from './shaders/thrusters/vertex.glsl'
import thrustersFragmentShader from './shaders/thrusters/fragment.glsl'


import windowVertexShader from './shaders/window/vertex.glsl'
import windowFragmentShader from './shaders/window/fragment.glsl'





const canvas = document.querySelector('canvas.webgl')

const scene = new THREE.Scene()
scene.background = new THREE.Color( 0xffffff )

const textureLoader = new THREE.TextureLoader()

const gtlfLoader = new GLTFLoader()

const bakedTexture = textureLoader.load('ship.jpg')

bakedTexture.flipY = false
bakedTexture.encoding = THREE.sRGBEncoding



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


let bakedMesh, thrustersMesh, windowMesh, lightsMesh, shipGroup


gtlfLoader.load(
  'ship.glb',
  (gltf) => {
    console.log(gltf)
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
camera.position.x = 4
camera.position.y = 2
camera.position.z = 4
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
const clock = new THREE.Clock()

const tick = () =>{
  // if ( mixer ) mixer.update( clock.getDelta() )
  const elapsedTime = clock.getElapsedTime()


  lightsMaterial.uniforms.uTime.value = elapsedTime
  thrustersMaterial.uniforms.uTime.value = elapsedTime
  windowMaterial.uniforms.uTime.value = elapsedTime




  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
