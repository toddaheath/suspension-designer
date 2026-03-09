import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import type { DoubleWishboneHardpoints } from '../../types/suspension';

const COLORS = {
  upperWishbone: 0xe74c3c,
  lowerWishbone: 0x3498db,
  upright: 0x2c3e50,
  springDamper: 0xf39c12,
  tierod: 0x2ecc71,
  wheel: 0x95a5a6,
  ground: 0x444444,
  background: 0x1a1a2e,
};

function toVec3(p: { x: number; y: number; z: number }): THREE.Vector3 {
  return new THREE.Vector3(p.x, p.z, -p.y);
}

export class SuspensionScene {
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;
  private animFrameId: number = 0;

  private upperWishboneMesh: THREE.Mesh | null = null;
  private upperWishboneEdges: THREE.LineSegments | null = null;
  private lowerWishboneMesh: THREE.Mesh | null = null;
  private lowerWishboneEdges: THREE.LineSegments | null = null;
  private uprightLine: THREE.Line | null = null;
  private springDamper: THREE.Mesh | null = null;
  private tierodLine: THREE.Line | null = null;
  private pushrodLine: THREE.Line | null = null;
  private wheelMesh: THREE.Mesh | null = null;
  private annotations: THREE.Group = new THREE.Group();
  private showAnnotations = true;

  constructor(container: HTMLDivElement) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor(COLORS.background);
    container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(50, 1, 1, 10000);
    this.camera.position.set(800, 600, 800);
    this.camera.lookAt(0, 200, -400);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(0, 200, -400);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.1;
    this.controls.update();

    this.addLights();
    this.addGroundGrid();
    this.addAxes();
    this.scene.add(this.annotations);

    this.resize(container.clientWidth, container.clientHeight);
    this.animate();
  }

  private addLights(): void {
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambient);

    const dir1 = new THREE.DirectionalLight(0xffffff, 0.8);
    dir1.position.set(500, 1000, 500);
    this.scene.add(dir1);

    const dir2 = new THREE.DirectionalLight(0xffffff, 0.3);
    dir2.position.set(-500, 500, -500);
    this.scene.add(dir2);
  }

  private addGroundGrid(): void {
    const grid = new THREE.GridHelper(2000, 40, 0x555555, 0x333333);
    this.scene.add(grid);
  }

  private addAxes(): void {
    // SAE: X forward (red), Y left (green), Z up (blue)
    // Three.js mapping: SAE X -> Three X, SAE Z -> Three Y, SAE Y -> Three -Z
    const axisLength = 300;
    const origin = new THREE.Vector3(0, 0, 0);

    // X axis (forward) - red
    const xGeom = new THREE.BufferGeometry().setFromPoints([
      origin,
      new THREE.Vector3(axisLength, 0, 0),
    ]);
    const xLine = new THREE.Line(xGeom, new THREE.LineBasicMaterial({ color: 0xff0000, linewidth: 2 }));
    this.scene.add(xLine);

    // Z axis (up) - blue -> Three.js Y
    const zGeom = new THREE.BufferGeometry().setFromPoints([
      origin,
      new THREE.Vector3(0, axisLength, 0),
    ]);
    const zLine = new THREE.Line(zGeom, new THREE.LineBasicMaterial({ color: 0x0000ff, linewidth: 2 }));
    this.scene.add(zLine);

    // Y axis (left) - green -> Three.js -Z
    const yGeom = new THREE.BufferGeometry().setFromPoints([
      origin,
      new THREE.Vector3(0, 0, -axisLength),
    ]);
    const yLine = new THREE.Line(yGeom, new THREE.LineBasicMaterial({ color: 0x00ff00, linewidth: 2 }));
    this.scene.add(yLine);
  }

  resize(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  update(hardpoints: DoubleWishboneHardpoints, tireRadius = 228): void {
    this.clearGeometry();
    this.buildUpperWishbone(hardpoints);
    this.buildLowerWishbone(hardpoints);
    this.buildUpright(hardpoints);
    this.buildSpringDamper(hardpoints);
    this.buildTierod(hardpoints);
    this.buildPushrod(hardpoints);
    this.buildWheel(hardpoints, tireRadius);
    this.buildAnnotations(hardpoints);
  }

  private clearGeometry(): void {
    const items = [
      this.upperWishboneMesh,
      this.upperWishboneEdges,
      this.lowerWishboneMesh,
      this.lowerWishboneEdges,
      this.uprightLine,
      this.springDamper,
      this.tierodLine,
      this.pushrodLine,
      this.wheelMesh,
    ];
    for (const item of items) {
      if (item) {
        this.scene.remove(item);
        item.geometry.dispose();
        const mat = item.material;
        if (Array.isArray(mat)) {
          mat.forEach((m) => m.dispose());
        } else {
          (mat as THREE.Material).dispose();
        }
      }
    }
  }

  private buildTriangleMesh(
    p1: THREE.Vector3,
    p2: THREE.Vector3,
    p3: THREE.Vector3,
    color: number
  ): { mesh: THREE.Mesh; edges: THREE.LineSegments } {
    const geom = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      p1.x, p1.y, p1.z,
      p2.x, p2.y, p2.z,
      p3.x, p3.y, p3.z,
      // back face
      p3.x, p3.y, p3.z,
      p2.x, p2.y, p2.z,
      p1.x, p1.y, p1.z,
    ]);
    geom.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geom.computeVertexNormals();

    const mat = new THREE.MeshPhongMaterial({
      color,
      transparent: true,
      opacity: 0.5,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(geom, mat);

    const edgeGeom = new THREE.BufferGeometry().setFromPoints([p1, p2, p2, p3, p3, p1]);
    const edgeMat = new THREE.LineBasicMaterial({ color, linewidth: 2 });
    const edges = new THREE.LineSegments(edgeGeom, edgeMat);

    return { mesh, edges };
  }

  private buildUpperWishbone(hp: DoubleWishboneHardpoints): void {
    const { mesh, edges } = this.buildTriangleMesh(
      toVec3(hp.upperWishboneFrontPivot),
      toVec3(hp.upperWishboneRearPivot),
      toVec3(hp.upperBallJoint),
      COLORS.upperWishbone
    );
    this.upperWishboneMesh = mesh;
    this.upperWishboneEdges = edges;
    this.scene.add(mesh);
    this.scene.add(edges);
  }

  private buildLowerWishbone(hp: DoubleWishboneHardpoints): void {
    const { mesh, edges } = this.buildTriangleMesh(
      toVec3(hp.lowerWishboneFrontPivot),
      toVec3(hp.lowerWishboneRearPivot),
      toVec3(hp.lowerBallJoint),
      COLORS.lowerWishbone
    );
    this.lowerWishboneMesh = mesh;
    this.lowerWishboneEdges = edges;
    this.scene.add(mesh);
    this.scene.add(edges);
  }

  private buildUpright(hp: DoubleWishboneHardpoints): void {
    const upper = toVec3(hp.upperBallJoint);
    const lower = toVec3(hp.lowerBallJoint);
    const geom = new THREE.BufferGeometry().setFromPoints([upper, lower]);
    const mat = new THREE.LineBasicMaterial({ color: COLORS.upright, linewidth: 3 });
    this.uprightLine = new THREE.Line(geom, mat);
    this.scene.add(this.uprightLine);
  }

  private buildSpringDamper(hp: DoubleWishboneHardpoints): void {
    const bottom = toVec3(hp.springDamperLower);
    const top = toVec3(hp.springDamperUpper);
    const direction = new THREE.Vector3().subVectors(top, bottom);
    const length = direction.length();
    const center = new THREE.Vector3().addVectors(bottom, top).multiplyScalar(0.5);

    const geom = new THREE.CylinderGeometry(8, 8, length, 8);
    const mat = new THREE.MeshPhongMaterial({
      color: COLORS.springDamper,
      transparent: true,
      opacity: 0.8,
    });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.copy(center);

    // Align cylinder to direction
    const axis = new THREE.Vector3(0, 1, 0);
    const dir = direction.clone().normalize();
    const quat = new THREE.Quaternion().setFromUnitVectors(axis, dir);
    mesh.quaternion.copy(quat);

    this.springDamper = mesh;
    this.scene.add(mesh);
  }

  private buildTierod(hp: DoubleWishboneHardpoints): void {
    const inboard = toVec3(hp.tieRodInner);
    const outboard = toVec3(hp.tieRodOuter);
    const geom = new THREE.BufferGeometry().setFromPoints([inboard, outboard]);
    const mat = new THREE.LineBasicMaterial({ color: COLORS.tierod, linewidth: 2 });
    this.tierodLine = new THREE.Line(geom, mat);
    this.scene.add(this.tierodLine);
  }

  private buildPushrod(hp: DoubleWishboneHardpoints): void {
    const wheelEnd = toVec3(hp.pushrodWheelEnd);
    const rockerEnd = toVec3(hp.pushrodRockerEnd);
    const geom = new THREE.BufferGeometry().setFromPoints([wheelEnd, rockerEnd]);
    const mat = new THREE.LineBasicMaterial({ color: 0x9b59b6, linewidth: 2 });
    this.pushrodLine = new THREE.Line(geom, mat);
    this.scene.add(this.pushrodLine);
  }

  private buildWheel(hp: DoubleWishboneHardpoints, tireRadius: number): void {
    const center = toVec3(hp.wheelCenter);
    const geom = new THREE.CircleGeometry(tireRadius, 32);
    const mat = new THREE.MeshPhongMaterial({
      color: COLORS.wheel,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.copy(center);

    // Align normal of circle to the lateral (Y/SAE) direction
    const defaultNormal = new THREE.Vector3(0, 0, 1);
    const wheelNormal = new THREE.Vector3(0, 0, -1);
    const quat = new THREE.Quaternion().setFromUnitVectors(defaultNormal, wheelNormal);
    mesh.quaternion.copy(quat);

    // Also add a ring edge
    const ringGeom = new THREE.RingGeometry(tireRadius - 2, tireRadius, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x666666,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeom, ringMat);
    ring.position.copy(center);
    ring.quaternion.copy(quat);

    // Group them
    const group = new THREE.Group();
    group.add(mesh);
    group.add(ring);
    this.wheelMesh = mesh;
    this.scene.add(group);
  }

  private createTextSprite(text: string, color: string = '#ffffff'): THREE.Sprite {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    canvas.width = 256;
    canvas.height = 64;
    ctx.font = 'bold 24px sans-serif';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 128, 32);
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const mat = new THREE.SpriteMaterial({ map: texture, depthTest: false, transparent: true });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(120, 30, 1);
    return sprite;
  }

  private buildAnnotations(hp: DoubleWishboneHardpoints): void {
    // Clear old
    while (this.annotations.children.length) {
      const child = this.annotations.children[0];
      this.annotations.remove(child);
      if (child instanceof THREE.Sprite) {
        (child.material as THREE.SpriteMaterial).map?.dispose();
        child.material.dispose();
      }
    }

    if (!this.showAnnotations) return;

    const labels: [string, { x: number; y: number; z: number }, string][] = [
      ['UBJ', hp.upperBallJoint, '#e74c3c'],
      ['LBJ', hp.lowerBallJoint, '#3498db'],
      ['TR-I', hp.tieRodInner, '#2ecc71'],
      ['TR-O', hp.tieRodOuter, '#2ecc71'],
      ['Spring', hp.springDamperUpper, '#f39c12'],
      ['Pushrod', hp.pushrodRockerEnd, '#9b59b6'],
      ['Wheel', hp.wheelCenter, '#95a5a6'],
    ];

    for (const [text, point, color] of labels) {
      const sprite = this.createTextSprite(text, color);
      const pos = toVec3(point);
      sprite.position.set(pos.x, pos.y + 25, pos.z);
      this.annotations.add(sprite);
    }
  }

  resetCamera(): void {
    this.camera.position.set(800, 600, 800);
    this.controls.target.set(0, 200, -400);
    this.controls.update();
  }

  setAnnotationsVisible(visible: boolean): void {
    this.showAnnotations = visible;
    this.annotations.visible = visible;
  }

  private animate = (): void => {
    this.animFrameId = requestAnimationFrame(this.animate);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };

  dispose(): void {
    cancelAnimationFrame(this.animFrameId);
    this.controls.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
