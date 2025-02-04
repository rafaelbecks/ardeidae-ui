import { LitElement, html } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import uiStyles from './styles.js';
import { ansiToHtml, isElectronAvailable } from './utils.js';

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
    this.renderHandModel()
    this.listenOSCMessages()
    this.listenLogEntry()
  }

  updated(){
    const logEntriesContainer = this.renderRoot.getElementById('log-entries')
    if(logEntriesContainer) logEntriesContainer.scrollTo(0, logEntriesContainer.scrollHeight)
  }

  renderHandModel() {
    const scene = new THREE.Scene();

    // Optional: Add an AxesHelper (size 2)
    const axesHelper = new THREE.AxesHelper(2);
    scene.add(axesHelper);

    const container = this.renderRoot.getElementById('hand-container');
    const rendererElement = this.renderRoot.getElementById('hand-three-js');
    const { clientWidth, clientHeight } = container;

    const camera = new THREE.PerspectiveCamera(45, clientWidth  / clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(clientWidth, clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    rendererElement.append(renderer.domElement);

    const loader = new GLTFLoader();
    loader.load('../assets/handLowpoly.glb', (gltf) => {
      this.model = gltf.scene;

      // Apply wireframe material
      this.model.traverse((child) => {
        if (child.isMesh) {
          child.material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            wireframe: true
          });
        }
      });

      // Center and scale the model
      const box = new THREE.Box3().setFromObject(this.model);
      const size = new THREE.Vector3();
      box.getSize(size);

      const center = box.getCenter(new THREE.Vector3());
      center.x -= 0.05
      center.y -= 0.04
      this.model.position.sub(center); // Center the model

      scene.add(this.model);
    }, undefined, (error) => {
      console.error('Error loading GLTF:', error);
    });

    // Adjust camera position and add lighting
    camera.position.z = 2;
    // Adjust later if needed
    camera.lookAt(0, 0, 0);

    // const autoRotateSpeed = 0.02;

    const animate = () => {
      requestAnimationFrame(animate);
      if (this.model) {
          if(this.currentAngleX) scene.rotation.x =  THREE.MathUtils.degToRad(this.currentAngleX) -  THREE.MathUtils.degToRad(this.angleSnapshot.x);
          if(this.currentAngleY) scene.rotation.y =  THREE.MathUtils.degToRad(this.currentAngleY) -  THREE.MathUtils.degToRad(this.angleSnapshot.y);
          if(this.currentAngleZ) scene.rotation.Z =  THREE.MathUtils.degToRad(this.currentAngleZ) -  THREE.MathUtils.degToRad(this.angleSnapshot.z);
          // scene.rotation.x += autoRotateSpeed;
        }
      renderer.render(scene, camera);
    };
    animate();

    // Handle resizing
    window.addEventListener('resize', () => {
      const { clientWidth: uiWith , clientHeight: uiHeight } = container;
      renderer.setSize(uiWith, uiHeight);
      camera.aspect = uiWith / uiHeight;
      camera.updateProjectionMatrix();
    });
  }

  listenOSCMessages(){
    if(!isElectronAvailable()) return
    window.electronAPI.onOSCMessage((message) => {
      if(message.address === '/accelerometer/angx'){
        [this.currentAngleX] = message.value
      }
      if(message.address === '/accelerometer/angy'){
        [this.currentAngleY] = message.value
      }
      if(message.address === '/accelerometer/angz'){
        [this.currentAngleZ] = message.value
      }
    })
  }

  listenLogEntry(){
    if(!isElectronAvailable()) return
    window.electronAPI.onLogEntry((message) => {
      this.logEntries.push(message)
      this.requestUpdate()
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
            <h3>CONFIG</h3>
            <button @click="${this.calibrate}">calibrate</button>
          </section>
        </section>
        <section id="hand-container">
          <section class="model">
            <div id="hand-three-js">
            </div>
          </section>
        </section>
      </main>
    `;
  }
}

customElements.define('ardeidae-ui', ArdeidaeUi);
