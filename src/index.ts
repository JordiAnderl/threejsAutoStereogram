import * as THREE from "three";

let container: HTMLElement;

let scene: THREE.Scene;
let renderer: THREE.WebGLRenderer;

let mesh: THREE.Mesh, light: THREE.Light;

let mouseX = 0, mouseY = 0;

let windowWidth: number;
let windowHeight: number;

// Initialize all the views.

let size = 100;
let views: {
    left: number;
    top: number;
    width: number;
    height: number;
    background: THREE.Color;
    eye: number[];
    up: number[];
    fov: number;
    updateCamera: (camera: THREE.Camera, scene: THREE.Scene, mouseX: number, mouseY: number) => void;
    camera?: THREE.PerspectiveCamera;
}[] = [];

let column = 0;
let row = 0;

for (let i = 0; i < size; i++) {
    if (i % 10 === 0 && i > 0) {
        column = 0;
        row++;
    }
    let v = {
        left: 0.1 * column++,
        top: 0.1 * row,
        width: 0.1,
        height: 0.1,
        background: new THREE.Color(0.1 * column, 0.1 * row, 0.05 * (column + row)),
        eye: [0, 300, 1800],
        up: [0, 1, 0],
        fov: 30,
        updateCamera: function (camera: THREE.Camera, scene: THREE.Scene, mouseX: number, mouseY: number) {
            camera.position.x += mouseX * 0.05;
            camera.position.x = Math.max(Math.min(camera.position.x, 2000), -2000);
            camera.lookAt(scene.position);
        }
    };
    views.push(v);

}

init();
animate();

/**
 *
 *
 */
function init() {

    container = document.getElementById('container');

    for (let ii = 0; ii < views.length; ++ii) {

        const view = views[ii];
        const camera = new THREE.PerspectiveCamera(view.fov, window.innerWidth / window.innerHeight, 1, 10000);
        camera.position.fromArray(view.eye);
        camera.up.fromArray(view.up);
        view.camera = camera;

    }

    scene = new THREE.Scene();

    light = new THREE.DirectionalLight(0xffffff);
    light.position.set(0, 0, 1);
    scene.add(light);

    // shadow

    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;

    let context = canvas.getContext('2d');
    let gradient = context.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2);
    gradient.addColorStop(0.1, 'rgba(0,0,0,0.15)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');

    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);


    // Add geometry
    let shadowTexture = new THREE.CanvasTexture(canvas);

    let shadowMaterial = new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true });
    let shadowGeo = new THREE.PlaneBufferGeometry(300, 300, 1, 1);

    for (let i = 0; i < 20; i++) {
        //
        mesh = new THREE.Mesh(shadowGeo, new THREE.PlaneBufferGeometry(300, 300, 1, 1));
        mesh.position.x = - 800 + (i * 200);
        mesh.position.y = - 250;
        mesh.rotation.x = - Math.PI / 2;
        scene.add(mesh);
    }

    // Fish
    let x = -57;
    let y = 0;
    let z = 0;
    let s = 9;
    let fishShape = new THREE.Shape();
    fishShape.moveTo(x, y);
    fishShape.quadraticCurveTo(x + 50, y - 80, x + 90, y - 10);
    fishShape.quadraticCurveTo(x + 100, y - 10, x + 115, y - 40);
    fishShape.quadraticCurveTo(x + 115, y, x + 115, y + 40);
    fishShape.quadraticCurveTo(x + 100, y + 10, x + 90, y + 10);
    fishShape.quadraticCurveTo(x + 50, y + 80, x, y);

    let extrudeSettings = { depth: 8, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 1, bevelThickness: 1 };

    let geometry = new THREE.ExtrudeBufferGeometry(fishShape, extrudeSettings);
    let fishMesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({ color: new THREE.Color(Math.random() * 0xffffff) }));
    fishMesh.position.set(x, y, z - 75);
    // mesh.rotation.set( rx, ry, rz );
    fishMesh.scale.set(s, s, s);
    scene.add(fishMesh);



    // End add
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);
    document.addEventListener('mousemove', onDocumentMouseMove, false);

}

function onDocumentMouseMove(event: MouseEvent) {

    mouseX = (event.clientX - windowWidth / 2);
    mouseY = (event.clientY - windowHeight / 2);

}

function updateSize() {

    if (windowWidth != window.innerWidth || windowHeight != window.innerHeight) {

        windowWidth = window.innerWidth;
        windowHeight = window.innerHeight;

        renderer.setSize(windowWidth, windowHeight);

    }

}

function animate() {

    render();

    requestAnimationFrame(animate);
}

function render() {

    updateSize();

    for (let ii = 0; ii < views.length; ++ii) {

        let view = views[ii];
        let camera = view.camera;

        view.updateCamera(camera, scene, mouseX, mouseY);

        let left = Math.floor(windowWidth * view.left);
        let top = Math.floor(windowHeight * view.top);
        let width = Math.floor(windowWidth * view.width);
        let height = Math.floor(windowHeight * view.height);

        renderer.setViewport(left, top, width, height);
        renderer.setScissor(left, top, width, height);
        renderer.setScissorTest(true);
        renderer.setClearColor(view.background);

        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        renderer.render(scene, camera);

    }

}
