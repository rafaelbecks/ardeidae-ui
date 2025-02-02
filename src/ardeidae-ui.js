import { LitElement, html, css } from 'lit';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

class ArdeidaeUi extends LitElement {
  static properties = {
    header: { type: String },
  }

  static styles = css`
    :host {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      max-width: 1024px;
      margin: 0 auto;
      text-align: center;
      border-radius: 20px;
      color: #fff;
      font-weight: 200;
      background-color: #1f1f1f;
      opacity: 1;
      background-image:  linear-gradient(#575757 1px, transparent 1px), linear-gradient(to right, #575757 1px, #1f1f1f 1px);
      background-position-x: 8px;
      background-position-y: 11px;
      background-size: 20px 20px;
      }

    main {
      flex-grow: 1;
      display: flex;
      flex-direction: row;
      width: 100%;
      justify-content: space-between
    }

    .main-container{
      height: 100%;
      width: 50%;
      margin: 20px;
    }

    .left-module {
      width: 100%;
      height: 45vh;
      margin: 6px;
      background: #000;
      border-radius: 20px;
      opacity: 0.7;
      display: flex;
      font-weight: inherit;
      padding: 10px;
      text-align: center;
      justify-content: center;
      align-items: center;
      h3 {
        font-weight: 200;
      }
    }

    #config-stream{
      flex-direction: column;
    }

    #hand-container {
      height: 100vh;
      width: 50%;
      margin: 5px;
      #hand-three-js {
        width: 100%;
        height: 100%;
      }

      canvas {
        display: block;
        width: 496px;
        height: 800px;
        position: relative;
        right: 12px;
        border-radius: 20px;
        bottom: 11px;
      }
      .model {
        height: 93%;
        border-radius: 20px;
        opacity: 0.7;
        display: flex;
        font-weight: inherit;
        padding: 10px;
        text-align: center;
        justify-content: center;
        align-items: center;
        margin: 20px
      }
      h3 {
        font-weight: 200;
      }
    }
  `;

  constructor() {
    super();
    this.angleSnapshot = { x:0, y:0, z: 0 }
  }

  firstUpdated() {
    this.renderHandModel()
    this.listenOSCMessages()
  }

  renderHandModel() {
    const scene = new THREE.Scene();

    // Optional: Add an AxesHelper (size 2)
    const axesHelper = new THREE.AxesHelper(2);
    scene.add(axesHelper);

    const container = this.renderRoot.getElementById('hand-container');
    const rendererElement = this.renderRoot.getElementById('hand-three-js');
    const { clientWidth, clientHeight } = container;

    console.log(clientWidth, clientHeight)

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
      const maxDim = Math.max(size.x, size.y, size.z);


      const center = box.getCenter(new THREE.Vector3());
      center.x = center.x - 0.05
      center.y = center.y -0.04
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
      const { clientWidth, clientHeight } = container;
      renderer.setSize(clientWidth, clientHeight);
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
    });
  }

  listenOSCMessages(){
    if(!window.electronAPI) return
    window.electronAPI.onOSCMessage((message) => {
      if(message.address === '/accelerometer/angx'){
        this.currentAngleX = message.value[0]
      }
      if(message.address === '/accelerometer/angy'){
        this.currentAngleY = message.value[0]
      }
      if(message.address === '/accelerometer/angz'){
        this.currentAngleZ = message.value[0]
      }
    })
  }

  calibrate(){
    this.angleSnapshot = { x: this.currentAngleX, y: this.currentAngleY, z: this.currentAngleZ }
  }

  render() {
    return html`
      <main>
        <section class="main-container">
          <section id="event-stream" class="left-module">
            <h3>EVENT STREAM</h3>
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
