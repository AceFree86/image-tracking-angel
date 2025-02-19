import * as THREE from "three";
import { MindARThree } from "mindar-image-three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";


document.addEventListener("DOMContentLoaded", () => {
  const mindarThree = new MindARThree({
    container: document.querySelector("#container"),
    imageTargetSrc:
      "https://acefree86.github.io/image-tracking-angel/assets/Image/targets.mind",
    filterMinCF: 0.1, // Reduce jittering (default is 0.001)
    filterBeta: 10, // Reduce delay (default is 1000)
    warmupTolerance: 1, // Faster target detection (default is 5)
    missTolerance: 1, // Faster target lost detection (default is 5)
  });

  const { renderer, scene, camera } = mindarThree;

  const startButton = document.querySelector("#startButton");
  const errorDisplay = document.querySelector("#error-message");
  let isRunning = false;

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight1.position.set(5, 5, 5);
  scene.add(directionalLight1);

  const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
  directionalLight2.position.set(-5, -5, 5);
  scene.add(directionalLight2);

  const groupM = new THREE.Group();
  let mixer; // Animation Mixer

  // Load the GLTF model
  const url =
    "https://acefree86.github.io/image-tracking-angel/assets/models/Angel.glb";
  const loader = new GLTFLoader();

  loader.load(
    url,
    (gltf) => {
      const model = gltf.scene;
      model.position.set(0, 0, 0);
      model.rotation.set(0, 0, 0); // Reset rotation
      model.scale.set(2, 2, 2);
      groupM.add(model);

      // Initialize Animation Mixer
      mixer = new THREE.AnimationMixer(model);
      if (gltf.animations.length > 0) {
        const action = mixer.clipAction(gltf.animations[0]); // Play first animation
        action.play();
      }
    },
    (xhr) => {
      if (errorDisplay) {
        errorDisplay.textContent = "loaded";
        errorDisplay.style.color = "blue";
        errorDisplay.style.fontSize = "15px";
      }
      console.log(
        `Model ${Math.round((xhr.loaded / xhr.total) * 100)}% loaded`
      );
    },
    (error) => {
      if (errorDisplay) {
        errorDisplay.textContent = "Error";
        errorDisplay.style.color = "red";
        errorDisplay.style.fontSize = "15px";
        console.error(`Error: ${error.message}`);
      }
    }
  );

  const anchor = mindarThree.addAnchor(0);
  anchor.group.add(groupM);

  const anchor_1 = mindarThree.addAnchor(1);
  anchor_1.group.add(groupM);

  const anchor_2 = mindarThree.addAnchor(2);
  anchor_2.group.add(groupM);

  const anchor_3 = mindarThree.addAnchor(3);
  anchor_3.group.add(groupM);

  const anchor_4 = mindarThree.addAnchor(4);
  anchor_4.group.add(groupM);

  // Start AR
  const start = async () => {
    await mindarThree.start();
    renderer.setAnimationLoop(() => {
      if (mixer) mixer.update(0.016); // Update animation
      renderer.render(scene, camera);
    });
    isRunning = true;
    startButton.textContent = "Стоп";
    errorDisplay.style.display = "none";
  };

  // Stop AR
  const stop = () => {
    mindarThree.stop();
    renderer.setAnimationLoop(null);
    isRunning = false;
    startButton.textContent = "Старт";
  };

  // Add an event listener for visibility change
  document.addEventListener("visibilitychange", () => {
    location.reload();
  });

  // Toggle AR on Button Click
  startButton.addEventListener("click", () => {
    if (startButton) {
      if (isRunning) {
        stop();
      } else {
        start();
      }
    } else {
      console.error("startButton button not found!");
    }
  });
});
