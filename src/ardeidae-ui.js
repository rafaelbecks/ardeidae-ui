import { LitElement, html } from 'lit'
import { unsafeHTML } from 'lit/directives/unsafe-html.js'
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

import uiStyles from './styles.js';
import { ansiToHtml, isElectronAvailable } from './utils.js'
import { AccelerometerIcon, ConfigIcon, RingIcon } from './icons.js'

class ArdeidaeUi extends LitElement {
  static properties = {
    header: { type: String },
  }

  static styles = uiStyles

  constructor() {
    super();
    this.angleSnapshot = { x:0, y:0, z: 0 }
    this.logEntries = []
  }

  firstUpdated() {
    this.renderModel({
      containerId: 'hand-three-js',
      modelPath: '../assets/handLowpoly.glb',
      cameraZ: 2,
      applyWireframe: true,
      customCenter: true,
      // autoRotate: true,
    })
    this.renderModel({
      containerId: 'cube-render',
      modelPath: '../assets/lissajous.glb',
      cameraZ: 20,
      ignoreOffset: true,
      // autoRotate: true,
    })
    this.listenOSCMessages()
    this.listenLogEntry()
  }

  updated(){
    const logEntriesContainer = this.renderRoot.getElementById('log-entries')
    if(logEntriesContainer) logEntriesContainer.scrollTo(0, logEntriesContainer.scrollHeight)
  }

  renderModel({ containerId, modelPath, cameraZ, applyWireframe = false, autoRotate = false, customCenter = false, ignoreOffset = false }) {
    const scene = new THREE.Scene()
    const axesHelper = new THREE.AxesHelper(2)
    scene.add(axesHelper)

    const container = this.renderRoot.getElementById(containerId)
    const { clientWidth, clientHeight } = container

    const camera = new THREE.PerspectiveCamera(45, clientWidth / clientHeight, 0.1, 1000)
    camera.position.z = cameraZ
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(clientWidth, clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    container.append(renderer.domElement)
    scene.background = null

    const loader = new GLTFLoader()
    loader.load(modelPath, (gltf) => {
      this.model = gltf.scene

      this.model.traverse((child) => {
        if (child.isMesh) {
          if (applyWireframe) {
            child.material.wireframe = true
          } else {
            child.material = child.material.clone()
            child.material.needsUpdate = true
          }
        }
      })

      const box = new THREE.Box3().setFromObject(this.model)
      const center = box.getCenter(new THREE.Vector3())
      if(customCenter){
        center.x -= 0.07
        center.y -= -0.06
      }
      this.model.position.sub(center)

      const ambientLight = new THREE.AmbientLight(0xffffff, 1.0)
      ambientLight.intensity = 7
      scene.add(ambientLight)

      const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
      directionalLight.position.set(5, 5, 5)
      scene.add(directionalLight)

      scene.add(this.model)
    }, undefined, (error) => {
      console.error('Error loading GLTF:', error)
    })

    const animate = () => {
      requestAnimationFrame(animate)
      if (autoRotate) {
        scene.rotation.y += 0.02
      }
      if (this.model) {
        if (this.currentAngleX) scene.rotation.x = THREE.MathUtils.degToRad(this.currentAngleX) - (ignoreOffset ? 0 : THREE.MathUtils.degToRad(this.angleSnapshot.x))
        if (this.currentAngleY) scene.rotation.y = THREE.MathUtils.degToRad(this.currentAngleY) - (ignoreOffset ? 0 : THREE.MathUtils.degToRad(this.angleSnapshot.y))
        if (this.currentAngleZ) scene.rotation.z = THREE.MathUtils.degToRad(this.currentAngleZ) - (ignoreOffset ? 0 : THREE.MathUtils.degToRad(this.angleSnapshot.z))
      }
      renderer.render(scene, camera)
    }
    animate()

    window.addEventListener('resize', () => {
      const { clientWidth: uiWidth, clientHeight: uiHeight } = container
      renderer.setSize(uiWidth, uiHeight)
      camera.aspect = uiWidth / uiHeight
      camera.updateProjectionMatrix()
    })
  }


  listenOSCMessages(){
    if(!isElectronAvailable()) return
    window.electronAPI.onOSCMessage((message) => {
      if(message.address === '/accelerometer/angx'){
        [this.currentAngleX] = message.value
        this.renderRoot.getElementById('angx').innerText = this.currentAngleX.toFixed(2)
      }
      if(message.address === '/accelerometer/angy'){
        [this.currentAngleY] = message.value
        this.renderRoot.getElementById('angy').innerText = this.currentAngleY.toFixed(2)
      }
      if(message.address === '/accelerometer/angz'){
        [this.currentAngleZ] = message.value
        this.renderRoot.getElementById('angz').innerText = this.currentAngleZ.toFixed(2)
      }
    })
  }

  listenLogEntry(){
    if(!isElectronAvailable()) return
    window.electronAPI.onLogEntry((message) => {
      this.logEntries.push(message)
      this.requestUpdate()

      if(message.includes('Ring connected')){
        this.ringConnected = true
      }
    })
  }

  startSensors(){
    if(!isElectronAvailable()) return
    window.electronAPI.startSensors()
    this.requestUpdate()
  }

  calibrate(){
    this.angleSnapshot = { x: this.currentAngleX, y: this.currentAngleY, z: this.currentAngleZ }
  }

  render() {
    return html`
      <main>
        <section class="main-container">
          <section id="event-stream" class="left-module">
            ${this.logEntries.length > 0
            ? html`
              <div id="log-entries">
                ${this.logEntries.map(log => unsafeHTML(`<span>${ansiToHtml(log)}</span>`))}
              </div>
              `
            : html`
              <h3>EVENT STREAM</h3>
              <button @click="${this.startSensors}">start sensors</button>
              `
            }
          </section>
          <section id="config-stream" class="left-module">
            <h3>SENSOR POSITION</h3>
            <div id="cube-render"></div>
            <section class="toolbar">
              <div class="config-section">
                ${ConfigIcon(28)}
                <button @click="${this.calibrate}">calibrate position</button>
              </div>
              <div>
               ${AccelerometerIcon(33, this.currentAngleY !== undefined ? '15A0FF' : 'FEFEFE')}
               ${RingIcon(28, this.ringConnected ? '4EFC6E' : 'FEFEFE')}
              </div>
            </section>
          </section>
        </section>
        <section id="hand-container">
          <section class="model">
            <div id="hand-three-js">
            </div>
            <section class="toolbar">
              <button  style="background: #ff3c3c;"><strong>X &nbsp;</strong> = &nbsp;<span id="angx"></span></button>
              <button  style="background: #54a449;"><strong>Y &nbsp;</strong> = &nbsp;<span id="angy"></span></button>
              <button  style="background: #3838ff;"><strong>Z &nbsp;</strong> = &nbsp;<span id="angz"></span></button>
            </section>
          </section>
        </section>
      </main>
    `;
  }
}

customElements.define('ardeidae-ui', ArdeidaeUi);
