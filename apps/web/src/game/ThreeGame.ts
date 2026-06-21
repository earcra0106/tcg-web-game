import * as THREE from 'three';
import {
  createInitialInputState,
  getMovementVector,
  type InputState,
  updateInputState,
} from './input.ts';
import { getAspectRatio, getViewportSize } from './viewport.ts';

const cubeColor = 0x38bdf8;
const floorColor = 0x1f2937;

export class ThreeGame {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
  private readonly player: THREE.Mesh;
  private readonly timer = new THREE.Timer();
  private readonly resizeObserver: ResizeObserver;
  private inputState: InputState = createInitialInputState();
  private animationFrameId: number | null = null;

  constructor(private readonly host: HTMLElement) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setClearColor(0x0f172a);
    this.renderer.setAnimationLoop(null);
    this.host.append(this.renderer.domElement);
    this.timer.connect(document);

    const playerGeometry = new THREE.BoxGeometry(1, 1, 1);
    const playerMaterial = new THREE.MeshStandardMaterial({ color: cubeColor });
    this.player = new THREE.Mesh(playerGeometry, playerMaterial);
    this.player.position.y = 0.5;

    this.configureScene();
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.host);
    this.resize();
  }

  start() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    this.tick();
  }

  dispose() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    this.resizeObserver.disconnect();
    this.timer.dispose();

    if (this.animationFrameId !== null) {
      window.cancelAnimationFrame(this.animationFrameId);
    }

    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();

        if (Array.isArray(object.material)) {
          object.material.forEach((material) => material.dispose());
        } else {
          object.material.dispose();
        }
      }
    });

    this.renderer.dispose();
    this.renderer.domElement.remove();
  }

  private configureScene() {
    this.scene.add(this.player);

    const floorGeometry = new THREE.PlaneGeometry(16, 16);
    const floorMaterial = new THREE.MeshStandardMaterial({ color: floorColor });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    this.scene.add(floor);

    const grid = new THREE.GridHelper(16, 16, 0x64748b, 0x334155);
    this.scene.add(grid);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
    directionalLight.position.set(4, 8, 6);
    this.scene.add(directionalLight);

    this.camera.position.set(4, 4, 6);
    this.camera.lookAt(this.player.position);
  }

  private resize() {
    const size = getViewportSize(this.host, window.devicePixelRatio);
    this.camera.aspect = getAspectRatio(size);
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(size.pixelRatio);
    this.renderer.setSize(size.width, size.height, false);
  }

  private tick = () => {
    this.timer.update();
    const delta = this.timer.getDelta();
    const movement = getMovementVector(this.inputState);
    const movementLength = Math.hypot(movement.x, movement.z);

    if (movementLength > 0) {
      const speed = 3;
      this.player.position.x += (movement.x / movementLength) * speed * delta;
      this.player.position.z += (movement.z / movementLength) * speed * delta;
      this.player.rotation.y += delta * 1.8;
    } else {
      this.player.rotation.y += delta * 0.45;
    }

    this.camera.lookAt(this.player.position);
    this.renderer.render(this.scene, this.camera);
    this.animationFrameId = window.requestAnimationFrame(this.tick);
  };

  private handleKeyDown = (event: KeyboardEvent) => {
    this.inputState = updateInputState(this.inputState, event.code, true);
  };

  private handleKeyUp = (event: KeyboardEvent) => {
    this.inputState = updateInputState(this.inputState, event.code, false);
  };
}
