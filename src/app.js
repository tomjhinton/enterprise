import './style.scss'

import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'



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
