import { LitElement, html, css } from 'lit'
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { ShaderArt } from 'https://esm.sh/shader-art';
import { UniformPlugin } from 'https://esm.sh/@shader-art/plugin-uniform';

ShaderArt.register([() => new UniformPlugin()]);


class Caos extends LitElement {
  static properties = {
    header: { type: String },
  }

  static styles = css`
    :host {
      display: flex;
      margin:0;
      height: 100vh;
    }

    #caos-render{
      width: 800px;
      height: 400px;
      position: absolute;
      top: calc(100vh / 2 - 200px);
      left: calc(100vw / 2 - 400px);
      z-index: 1;
    }

    shader-art {
      display: block;
      width: 100%;
      height: 100%;
      opacity: 0.8;
    }

    shader-art canvas {
      display: block;
      width: 100%;
      height: 100%;
    }

    .hdr-buttons {
      position: absolute;
      top: 0;
      right: 0;
      margin: 10px 10px 0 0;

      button {
        border-radius: 20px;
        padding: 5px 10px;
        cursor: pointer;
        border: none;
      }
    }
    `

  constructor() {
    super();
    this.logEntries = []
    this.scene = new THREE.Scene();
    this.renderer = null;
    this.camera = null;
    this.model = null;
  }

  firstUpdated() {
    this.renderModel({
      containerId: 'caos-render',
      modelPath: '../assets/caos.glb',
      cameraZ: -5.5,
      ignoreOffset: true,
      autoRotate: true,
      // applyWireframe: true
    })
  }

  loadHDR(hdrPath) {
    const rgbLoader = new RGBELoader();
    rgbLoader.load(hdrPath, (texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      this.scene.environment = texture;
    });
  }

  renderModel({ containerId, modelPath, cameraZ, applyWireframe = false, autoRotate = false, customCenter = false, ignoreOffset = false }) {

    const container = this.renderRoot.getElementById(containerId)
    const { clientWidth, clientHeight } = container

    const camera = new THREE.PerspectiveCamera(45, clientWidth / clientHeight, 0.1, 1000)
    camera.position.z = cameraZ
    camera.lookAt(0, 0, 0)

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    this.renderer.setSize(clientWidth, clientHeight)
    this.renderer.setPixelRatio(window.devicePixelRatio)
    container.append(this.renderer.domElement)
    this.scene.background = null

    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    camera.position.set(0, 0, cameraZ || 5);

    const loader = new GLTFLoader()

    this.loadHDR('../assets/satara.hdr')

    loader.load(modelPath, (gltf) => {
      this.model = gltf.scene
      this.model.scale.set(50, 50, 50);
      this.model.position.set(0, 0, 0);
      this.model.rotation.set(-99, 0, 0);

      const material = new THREE.MeshStandardMaterial({
          metalness: 1,
          roughness: 0,
          envMapIntensity: 1,
      })

      this.model.traverse((child) => {
        if (child.isMesh) {
          if (applyWireframe) {
            child.material.wireframe = true
            child.material.transparent = false;
            child.material.opacity = 1;
          } else {
            child.material = material;
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
      ambientLight.intensity = 1

      this.scene.add(ambientLight)

      const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
      directionalLight.position.set(5, 5, 5)

      this.scene.add(directionalLight)
      this.scene.add(this.model)
    }, undefined, (error) => {
      console.error('Error loading GLTF:', error)
    })

    const animate = () => {
      requestAnimationFrame(animate)
      if (autoRotate) {
        this.scene.rotation.y += 0.015
      }
      this.renderer.render(this.scene, camera)
    }

    animate()

    window.addEventListener('resize', () => {
      const { clientWidth: uiWidth, clientHeight: uiHeight } = container
      this.renderer.setSize(uiWidth, uiHeight)
      camera.aspect = uiWidth / uiHeight
      camera.updateProjectionMatrix()
    })
  }

  //studio: 5270ff
  //satara: f79361
  //rooftop: c28bf5

  render() {
    return html`
      <main>

        <shader-art autoplay>
          <uniform type="float" name="scale" value=".4" min="0.1" max="4" step="0.01" />
          <uniform type="float" name="ax" value="5" min="1" max="15" step=".01" />
          <uniform type="float" name="ay" value="7" min="1" max="15" step=".01" />
          <uniform type="float" name="az" value="9" min="1" max="15" step=".01" />
          <uniform type="float" name="aw" value="13" min="1" max="15" step=".01" />
          <uniform type="float" name="bx" value="1" min="-1" max="1" step="0.01" />
          <uniform type="float" name="by" value="1" min="-1" max="1" step="0.01" />
          <uniform type="color" name="color1" value="#000000" />
          <uniform type="color" name="color2" value="#050505" />
          <uniform type="color" name="color3" value="#6e6e6e" />
          <uniform type="color" name="color4" value="#a0a0a0" />

          <script type="buffer" name="position" data-size="2">
            [-1, 1, -1,-1, 1,1, 1, 1, -1,-1, 1,-1]
          </script>
          <script type="buffer" name="uv" data-size="2">
            [ 0, 0,  0, 1, 1,0, 1, 0,  0, 1, 1, 1]
          </script>

          <script type="vert">
            precision highp float;
            attribute vec4 position;
            attribute vec2 uv;
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = position;
            }
          </script>
          <script type="frag">
            precision highp float;
            varying vec2 vUv;
            uniform float time;
            uniform float scale;
            uniform vec2 resolution;
            uniform vec3 color1, color2, color3, color4;
            uniform int numOctaves;
            const float PI = 3.141592654;
            uniform float ax, ay, az, aw;
            uniform float bx, by;

            // just a bunch of sin & cos to generate an interesting pattern
            float cheapNoise(vec3 stp) {
              vec3 p = vec3(stp.st, stp.p);
              vec4 a = vec4(ax, ay, az, aw);
              return mix(
                sin(p.z + p.x * a.x + cos(p.x * a.x - p.z)) *
                cos(p.z + p.y * a.y + cos(p.y * a.x + p.z)),
                sin(1. + p.x * a.z + p.z + cos(p.y * a.w - p.z)) *
                cos(1. + p.y * a.w + p.z + cos(p.x * a.x + p.z)),
                .436
              );
            }

            void main() {

              vec2 aR = vec2(resolution.x/resolution.y, 1.);
              vec2 st = vUv * aR * scale;
              float S = sin(time * .005);
              float C = cos(time * .005);
              vec2 v1 = vec2(cheapNoise(vec3(st, 2.)), cheapNoise(vec3(st, 1.)));
              vec2 v2 = vec2(
                cheapNoise(vec3(st + bx*v1 + vec2(C * 1.7, S * 9.2), 0.15 * time)),
                cheapNoise(vec3(st + by*v1 + vec2(S * 8.3, C * 2.8), 0.126 * time))
              );
              float n = .5 + .5 * cheapNoise(vec3(st + v2, 0.));

              vec3 color = mix(color1,
                color2,
                clamp((n*n)*8.,0.0,1.0));

              color = mix(color,
                color3,
                clamp(length(v1),0.0,1.0));

              color = mix(color,
                        color4,
                        clamp(length(v2.x),0.0,1.0));

              //       color *= n * n * n + .6  * n * n + .5 * n;
              color /= n*n + n * 7.;
              gl_FragColor = vec4(color,1.);
            }
          </script>
        </shader-art>
        <div class="hdr-buttons">
          <button @click="${() => this.loadHDR('../assets/satara.hdr')}">Sahara</button>
          <button @click="${() => this.loadHDR('../assets/rooftop.hdr')}">Rooftop</button>
          <button @click="${() => this.loadHDR('./assets/studio.hdr')}">Studio</button>
        </div>
        <section id="caos-render"></section>
      </main>
    `;
  }
}

customElements.define('caos-ui', Caos);
