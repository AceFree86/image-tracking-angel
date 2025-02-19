import * as THREE from "three";
import { MindARThree } from "mindar-image-three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";


const imageTargetSrcList = [
  "https://acefree86.github.io/image-tracking-angel/assets/Image/targets.mind",
  "https://acefree86.github.io/image-tracking-angel/assets/Image/targets1.mind",
  "https://acefree86.github.io/image-tracking-angel/assets/Image/targets2.mind",
  "https://acefree86.github.io/image-tracking-angel/assets/Image/targets3.mind",
  "https://acefree86.github.io/image-tracking-angel/assets/Image/targets4.mind",
  "https://acefree86.github.io/image-tracking-angel/assets/Image/targets5.mind",
  "https://acefree86.github.io/image-tracking-angel/assets/Image/targets6.mind",
  "https://acefree86.github.io/image-tracking-angel/assets/Image/targets7.mind"
];

const container = document.querySelector("#container");
const startButton = document.querySelector("#startButton");
const stopButton = document.querySelector("#stopButton");
const errorDisplay = document.querySelector("#error-message");

let renderer, scene, camera;
let activeTargetIndex = -1;
let mixer = null; // Animation mixer

const loadModel = async (group) => {
  const loader = new GLTFLoader();
  const url =
    "https://acefree86.github.io/image-tracking-angel/assets/models/Angel.glb";

  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (gltf) => {
        const model = gltf.scene;
        model.position.set(0, 0, 0);
        model.scale.set(2, 2, 2);
        group.add(model);

        mixer = new THREE.AnimationMixer(model);
        if (gltf.animations.length > 0) {
          const action = mixer.clipAction(gltf.animations[0]);
          action.play();
        }

        resolve();
      },
      (xhr) => {
        if (xhr.total > 0) {
          console.log(
            `Model ${Math.round((xhr.loaded / xhr.total) * 100)}% loaded`
          );
        }
      },
      (error) => {
        console.error("GLTF Load Error:", error);
        reject(error);
      }
    );
  });
};

const startTracking = async () => {
  for (let i = 0; i < imageTargetSrcList.length; i++) {
    try {
      const mindarThree = new MindARThree({
        container: document.querySelector("#container"),
        imageTargetSrc: imageTargetSrcList[i],
        filterMinCF: 0.1, // Reduce jittering (default is 0.001)
        filterBeta: 10, // Reduce delay (default is 1000)
        warmupTolerance: 1, // Faster target detection (default is 5)
        missTolerance: 1, // Faster target lost detection (default is 5)
      });

      ({ renderer, scene, camera } = mindarThree);

      // Add lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
      directionalLight.position.set(5, 5, 5);
      scene.add(directionalLight);

      const anchor = mindarThree.addAnchor(0);
      const groupM = new THREE.Group();
      anchor.group.add(groupM);

      await loadModel(groupM); // Load the 3D model into the anchor

      await mindarThree.start();
      activeTargetIndex = i;
      console.log(`Tracking started with target: ${imageTargetSrcList[i]}`);

      renderer.setAnimationLoop(() => {
        if (mixer) mixer.update(0.016); // Update animation
        renderer.render(scene, camera);
      });

      break; // Stop after finding a valid target
    } catch (error) {
      console.warn(
        `Failed to start tracking with target: ${imageTargetSrcList[i]}`,
        error
      );
    }
  }
};

startButton.addEventListener("click", startTracking);

stopButton.addEventListener("click", () => {
  if (mindarThree) {
    mindarThree.stop();
    if (renderer) {
      renderer.setAnimationLoop(null);
    }
    console.log("Tracking stopped.");
  }
});

// Handle page visibility changes
document.addEventListener("visibilitychange", () => {
  if (document.hidden && mindarThree) {
    mindarThree.stop();
    console.log("Tracking stopped due to page visibility change.");
  }
});
