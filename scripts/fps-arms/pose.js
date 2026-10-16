import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import P from '/sp/wb/params.js';
window.addEventListener('error', (e) => { console.log('ERR ' + e.message); window.__done = true; });
window.addEventListener('unhandledrejection', (e) => { console.log('REJ ' + e.reason + ' ' + e.reason?.stack); window.__done = true; });
const V = (a) => new THREE.Vector3(...a);
const log = [];

const r = new THREE.WebGLRenderer({ antialias: true }); r.setSize(1280, 720); r.toneMapping = THREE.ACESFilmicToneMapping; document.body.appendChild(r.domElement);
r.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene(); scene.background = new THREE.Color('#8fa6b8');
scene.add(new THREE.HemisphereLight('#dfe8ff', '#4a4038', 1.6)); const dl = new THREE.DirectionalLight('#fff4e0', 2.2); dl.position.set(2, 3, 1); scene.add(dl);
const cam = new THREE.PerspectiveCamera(72, 16 / 9, 0.04, 50);
scene.add(cam);

// weapon frame, exactly as FpsWeapon places it (k = 1)
const Wf = new THREE.Group(); Wf.position.set(...P.weapon.pos); Wf.rotateY(P.weapon.rotY); Wf.rotateZ(P.weapon.rotZ); Wf.rotateX(P.weapon.rotX || 0); scene.add(Wf);
const gltf = await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync('/models/rifle.glb');
const holder = new THREE.Group(); holder.rotation.y = -Math.PI / 2; holder.scale.setScalar(0.62); holder.add(gltf.scene); Wf.add(holder);

const fbx = await new FBXLoader().loadAsync('/sp/para/raw/FPS ARMS RIG 1.fbx');
const tex = await new THREE.TextureLoader().loadAsync('/sp/work/arms_tac.png'); tex.colorSpace = THREE.SRGBColorSpace; tex.flipY = true;
let skinned;
fbx.traverse((o) => { if (o.isSkinnedMesh) { skinned = o; o.material = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.78, metalness: 0.08, side: THREE.DoubleSide }); o.frustumCulled = false; } });
const rig = new THREE.Group(); rig.add(fbx); scene.add(rig);
// rig placement in the weapon frame
rig.position.set(...P.rig.pos); rig.rotation.set(0, P.rig.yaw, 0); rig.scale.setScalar(P.rig.scale);
scene.updateMatrixWorld(true);

const B = (n) => fbx.getObjectByName(n);
const wpos = (o) => o.getWorldPosition(new THREE.Vector3());
const wq = (o) => o.getWorldQuaternion(new THREE.Quaternion());
const setWorldQuat = (bone, q) => { bone.quaternion.copy(wq(bone.parent).invert().multiply(q)); bone.updateMatrixWorld(true); };
const setWorldPos = (bone, p) => { bone.parent.updateMatrixWorld(true); bone.position.copy(bone.parent.worldToLocal(p.clone())); bone.updateMatrixWorld(true); };
const basisQuat = (X, Y, Z) => new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(X, Y, Z));
const axis = (q, a) => a.clone().applyQuaternion(q);
const WQ = wq(Wf);
const toWorldDir = (d) => d.clone().applyQuaternion(WQ).normalize();
const toWorld = (p) => Wf.localToWorld(p.clone());

// local shoulder adjustments (clavicle push forward etc.)
for (const [n, rot] of Object.entries(P.extraRot || {})) { const b = B(n); b.quaternion.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(...rot))); }
scene.updateMatrixWorld(true);

function solveArm(side, H) {
	const up = B('upper_arm' + side), fo = B('forearm' + side), foEnd = B('forearm' + side + '_end'), ctrl = B('hand' + side + 'control'), hand = B('hand' + side);
	scene.updateMatrixWorld(true);
	const S = wpos(up), E0 = wpos(fo), W0 = wpos(foEnd);
	const a = S.distanceTo(E0), b = E0.distanceTo(W0);
	const qUp0 = wq(up), qFo0 = wq(fo), qH0 = wq(hand);
	const sign = Math.sign(new THREE.Vector3().crossVectors(E0.clone().sub(S), W0.clone().sub(E0)).dot(axis(qUp0, new THREE.Vector3(1, 0, 0)))) || 1;
	const qRel = qFo0.clone().invert().multiply(qH0);
	// hand target frame (weapon frame): Y = toward fingers, Z = palm normal
	const Y = toWorldDir(V(H.fingers)), Zr = toWorldDir(V(H.palm));
	const Z = Zr.sub(Y.clone().multiplyScalar(Zr.dot(Y))).normalize();
	const X = new THREE.Vector3().crossVectors(Y, Z);
	const qH = basisQuat(X, Y, Z);
	let Wt = toWorld(V(H.wrist));
	// 2-bone IK
	let d = Wt.clone().sub(S); let dist = d.length();
	if (dist > a + b - 1e-4) { log.push(`${side} unreachable by ${(dist - a - b).toFixed(3)}`); dist = a + b - 1e-4; }
	d.normalize();
	const cosA = (a * a + dist * dist - b * b) / (2 * a * dist);
	const pole = toWorldDir(V(H.pole));
	const pPerp = pole.sub(d.clone().multiplyScalar(pole.dot(d))).normalize();
	const E = S.clone().add(d.clone().multiplyScalar(a * cosA)).add(pPerp.multiplyScalar(a * Math.sqrt(Math.max(0, 1 - cosA * cosA))));
	const Wreal = S.clone().add(d.clone().multiplyScalar(dist));
	// upper arm: Y to elbow, X = hinge normal
	const Yu = E.clone().sub(S).normalize();
	const Xu = new THREE.Vector3().crossVectors(E.clone().sub(S), Wreal.clone().sub(E)).normalize().multiplyScalar(sign);
	const Zu = new THREE.Vector3().crossVectors(Xu, Yu);
	setWorldQuat(up, basisQuat(Xu, Yu, Zu));
	// forearm: Y to wrist, twist follows the hand (blend with the hinge)
	const Yf = Wreal.clone().sub(E).normalize();
	const Xi = axis(qH.clone().multiply(qRel.clone().invert()), new THREE.Vector3(1, 0, 0)).lerp(Xu, 1 - (H.twist ?? 0.7));
	const Xf = Xi.sub(Yf.clone().multiplyScalar(Xi.dot(Yf))).normalize();
	setWorldQuat(fo, basisQuat(Xf, Yf, new THREE.Vector3().crossVectors(Xf, Yf)));
	scene.updateMatrixWorld(true);
	setWorldPos(ctrl, wpos(foEnd));
	setWorldQuat(hand, qH);
	// fingers
	for (const [f, curls] of Object.entries(H.curl)) {
		const names = f === 'thumb' ? ['thumb01', 'thumb02', 'thumb03'] : ['f_' + f + '01', 'f_' + f + '02', 'f_' + f + '03'];
		names.forEach((n, i) => { const bn = B(n + side); const c = curls[i]; const e = Array.isArray(c) ? c : [c, 0, 0]; bn.quaternion.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(...e))); });
	}
	scene.updateMatrixWorld(true);
	if (H.thumbAim) {
		// swing the thumb chain so its tip heads to a target point (weapon frame)
		const t1 = B('thumb01' + side), tip = B('thumb03' + side + '_end');
		const base = wpos(t1), cur = wpos(tip).sub(base).normalize(), des = toWorld(V(H.thumbAim)).sub(base).normalize();
		setWorldQuat(t1, new THREE.Quaternion().setFromUnitVectors(cur, des).multiply(wq(t1)));
		scene.updateMatrixWorld(true);
	}
	log.push(`${side} S=${S.toArray().map((n) => n.toFixed(2))} reach=${(a + b).toFixed(3)} dist=${Wt.distanceTo(S).toFixed(3)}`);
}
solveArm('R', P.right);
solveArm('L', P.left);
const wl = (n) => Wf.worldToLocal(wpos(B(n))).toArray().map((x) => x.toFixed(3)).join(',');
for (const sd of ['R', 'L']) for (const n of ['hand', 'f_index01', 'f_index03', 'f_middle01', 'f_middle03', 'f_pinky03', 'thumb01', 'thumb03']) log.push(sd + ' ' + n + ' ' + wl(n + sd + (n.endsWith('03') ? '_end' : '')));
// palm normal estimate: average vertex normal of vertices mostly weighted to the hand bone
{
	const g = skinned.geometry, si = g.attributes.skinIndex, sw = g.attributes.skinWeight, nm = g.attributes.normal;
	for (const sd of ['R', 'L']) {
		const hb = skinned.skeleton.bones.indexOf(B('hand' + sd));
		// in bind pose: collect normals of hand vertices, split by sign along the hand's local Z
		const qinv = wq(B('hand' + sd)).invert();
		let zp = 0, zn = 0;
		const mw = skinned.matrixWorld; const nmat = new THREE.Matrix3().getNormalMatrix(mw);
		for (let i = 0; i < si.count; i++) { if (si.getX(i) === hb && sw.getX(i) > 0.9) { const v = new THREE.Vector3().fromBufferAttribute(nm, i); skinned.applyBoneTransform; } }
	}
}


// markers
if (P.markers) for (const m of P.markers) { const s = new THREE.Mesh(new THREE.SphereGeometry(0.006), new THREE.MeshBasicMaterial({ color: '#f0f', depthTest: false })); s.position.set(...m); s.renderOrder = 99; Wf.add(s); }

// views: eye (full), insets: side + top in the weapon frame
r.setScissorTest(true);
const view = (x, y, w, h, c) => { r.setViewport(x, y, w, h); r.setScissor(x, y, w, h); r.render(scene, c); };
if (P.views) {
	// close-ups: grid of perspective cameras placed in the weapon frame
	const n = P.views.length, cols = n > 2 ? 2 : n, rows = Math.ceil(n / cols), w = 1280 / cols, h = 720 / rows;
	scene.background = new THREE.Color('#556'); scene.add(new THREE.AmbientLight('#fff', 1.5));
	P.views.forEach((vw, i) => {
		const c = new THREE.PerspectiveCamera(vw.fov || 35, w / h, 0.01, 10); Wf.add(c); c.position.copy(vw.eye === 'cam' ? Wf.worldToLocal(new THREE.Vector3()) : V(vw.eye)); c.up.copy(toWorldDir(V(vw.up || [0, 1, 0]))); c.lookAt(toWorld(V(vw.at))); c.updateMatrixWorld(true);
		view((i % cols) * w, (rows - 1 - Math.floor(i / cols)) * h, w, h, c);
	});
	window.__out = log.join(' | '); window.__done = true; throw new Error('views done');
}
view(0, 0, 1280, 720, cam);
if (P.insets) {
	const side = new THREE.OrthographicCamera(-0.45, 0.45, 0.3, -0.3, 0.01, 10);
	Wf.add(side); side.position.set(1.5, 0.05, -0.05); side.lookAt(toWorld(V([0, 0.05, -0.05]))); side.updateMatrixWorld(true);
	const top = new THREE.OrthographicCamera(-0.45, 0.45, 0.3, -0.3, 0.01, 10);
	Wf.add(top); top.position.set(0, 1.5, -0.05); top.up.copy(toWorldDir(V([0, 0, -1]))); top.lookAt(toWorld(V([0, 0, -0.05]))); top.updateMatrixWorld(true);
	scene.background = new THREE.Color('#556'); scene.add(new THREE.AmbientLight('#fff', 1.5));
	view(0, 440, 420, 280, side);
	view(860, 440, 420, 280, top);
}

if (P.export) {
	// bake the posed skin into a static mesh expressed in the weapon frame
	skinned.updateMatrixWorld(true);
	const src = skinned.geometry, pos = src.attributes.position, n = pos.count;
	const out = new THREE.BufferGeometry();
	const p = new Float32Array(n * 3);
	const v = new THREE.Vector3();
	const inv = Wf.matrixWorld.clone().invert();
	for (let i = 0; i < n; i++) {
		v.fromBufferAttribute(pos, i); skinned.applyBoneTransform(i, v);
		v.applyMatrix4(skinned.matrixWorld).applyMatrix4(inv);
		p.set([v.x, v.y, v.z], i * 3);
	}
	out.setAttribute('position', new THREE.BufferAttribute(p, 3));
	out.setAttribute('uv', src.attributes.uv.clone());
	if (src.index) out.setIndex(src.index.clone());
	const mesh = new THREE.Mesh(out, new THREE.MeshStandardMaterial({ map: tex, roughness: 0.78, metalness: 0.08, name: 'tactical', side: THREE.DoubleSide }));
	mesh.name = 'FpsArms';
	// merge the split FBX vertices, then smooth normals
	const { mergeVertices } = await import('three/addons/utils/BufferGeometryUtils.js');
	let g = mergeVertices(out, 1e-5); g.computeVertexNormals(); mesh.geometry = g;
	log.push('baked verts ' + g.attributes.position.count + ' tris ' + (g.index ? g.index.count / 3 : 0));
	const glb = await new GLTFExporter().parseAsync(mesh, { binary: true });
	let s = ''; const u8 = new Uint8Array(glb); for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
	window.__glb = btoa(s);
}
window.__out = log.join('\n'); window.__done = true;
