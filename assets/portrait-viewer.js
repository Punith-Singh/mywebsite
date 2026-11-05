import * as THREE from './vendor/three-r170/three.module.min.js';
import { GLTFLoader } from './vendor/three-r170/GLTFLoader.js';

// This viewer renders the supplied GLB; the surrounding portfolio stays usable
// if graphics support or the model request is unavailable.
export async function mountPortrait(stage) {
  const status = stage.querySelector('[data-portrait-status]');
  const controls = stage.querySelector('[data-portrait-controls]');
  const viewport = stage.querySelector('[data-portrait-viewport]');
  const live = stage.querySelector('[data-portrait-live]');
  let renderer;
  let model;
  let failed = false;
  let resizeObserver;

  function fallback(error) {
    failed = true;
    stage.dataset.state = 'fallback';
    status.textContent = '3D unavailable · showing photo';
    controls.hidden = true;
    viewport.replaceChildren();
    resizeObserver?.disconnect();
    renderer?.dispose();
    console.warn('Portrait viewer unavailable:', error);
  }

  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.setClearColor(0x000000, 0);

    const canvas = renderer.domElement;
    canvas.tabIndex = 0;
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', '3D portrait of Punith H Singh. Drag horizontally or use arrow keys to rotate. Press Home to reset.');
    canvas.addEventListener('webglcontextlost', event => {
      event.preventDefault();
      fallback(new Error('Graphics context lost'));
    });
    viewport.append(canvas);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 10);
    camera.position.set(0, 0, 2);
    scene.add(new THREE.HemisphereLight(0xf1eaff, 0x383340, 2.1));
    const key = new THREE.DirectionalLight(0xfff4e4, 2.3);
    key.position.set(-2, 3, 4);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xbca5f7, 0.8);
    rim.position.set(2, 1, -2);
    scene.add(rim);

    // Load locally so the portrait never depends on a third-party model CDN.
    const response = await fetch(new URL('./punith-portrait.glb', import.meta.url), {
      signal: AbortSignal.timeout(30000)
    });
    if (!response.ok) throw new Error(`Model request returned ${response.status}`);
    const gltf = await new GLTFLoader().parseAsync(await response.arrayBuffer(), '');
    if (failed) return;
    model = new THREE.Group();
    const bounds = new THREE.Box3().setFromObject(gltf.scene);
    const center = bounds.getCenter(new THREE.Vector3());
    const size = bounds.getSize(new THREE.Vector3());
    gltf.scene.position.sub(center);
    gltf.scene.traverse(mesh => {
      if (!mesh.isMesh) return;
      // The front already contains photographic lighting. Keep its colors intact.
      if (mesh.material.map) {
        const original = mesh.material;
        const texture = original.map;
        texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
        mesh.material = new THREE.MeshBasicMaterial({ map: texture });
        original.dispose();
      } else {
        mesh.material.roughness = 1;
        mesh.material.metalness = 0;
      }
    });
    model.add(gltf.scene);
    scene.add(model);
    model.rotation.y = -0.12;

    function render() {
      if (failed) return;
      renderer.render(scene, camera);
      stage.dataset.rotation = model.rotation.y.toFixed(3);
    }
    function resize() {
      if (failed) return;
      const width = viewport.clientWidth;
      const height = viewport.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      const aspect = width / height;
      const halfHeight = Math.max(size.y / 2, size.x / (2 * aspect)) * 1.12;
      camera.left = -halfHeight * aspect;
      camera.right = halfHeight * aspect;
      camera.top = halfHeight;
      camera.bottom = -halfHeight;
      camera.updateProjectionMatrix();
      render();
    }
    function announce() {
      const angle = ((Math.round(THREE.MathUtils.radToDeg(model.rotation.y)) % 360) + 360) % 360;
      live.textContent = `Portrait rotated to ${angle} degrees.`;
    }
    function rotate(delta) {
      model.rotation.y += delta;
      render();
      announce();
    }
    function reset() {
      model.rotation.set(0, 0, 0);
      render();
      live.textContent = 'Portrait reset to front view.';
    }
    stage.querySelector('[data-rotate-left]').addEventListener('click', () => rotate(-Math.PI / 8));
    stage.querySelector('[data-rotate-right]').addEventListener('click', () => rotate(Math.PI / 8));
    stage.querySelector('[data-reset-portrait]').addEventListener('click', reset);

    let pointer = null;
    canvas.addEventListener('pointerdown', event => {
      if (event.button !== 0 || !event.isPrimary) return;
      pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, type: event.pointerType };
      canvas.setPointerCapture(event.pointerId);
      stage.classList.add('is-dragging');
    });
    canvas.addEventListener('pointermove', event => {
      if (!pointer || event.pointerId !== pointer.id) return;
      model.rotation.y += (event.clientX - pointer.x) * 0.008;
      if (pointer.type !== 'touch') {
        model.rotation.x = THREE.MathUtils.clamp(model.rotation.x + (event.clientY - pointer.y) * 0.004, -0.35, 0.35);
      }
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      render();
    });
    function release(event) {
      if (!pointer || event.pointerId !== pointer.id) return;
      pointer = null;
      stage.classList.remove('is-dragging');
      if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
      announce();
    }
    canvas.addEventListener('pointerup', release);
    canvas.addEventListener('pointercancel', release);
    canvas.addEventListener('lostpointercapture', release);
    canvas.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home'].includes(event.key)) return;
      event.preventDefault();
      if (event.key === 'Home') return reset();
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') return rotate(event.key === 'ArrowLeft' ? -0.12 : 0.12);
      model.rotation.x = THREE.MathUtils.clamp(model.rotation.x + (event.key === 'ArrowUp' ? -0.08 : 0.08), -0.35, 0.35);
      render();
    });

    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(viewport);
    resize();
    stage.dataset.state = 'ready';
    status.textContent = '3D portrait · drag to rotate';
    controls.hidden = false;
    live.textContent = 'Interactive 3D portrait loaded.';
  } catch (error) {
    fallback(error);
  }
}
