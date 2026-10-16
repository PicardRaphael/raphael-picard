import * as THREE from 'three';

/**
 * A mesh's geometry with a transform baked in, as plain float attributes. Compressed models store positions and
 * normals as normalised 16/8-bit integers (KHR_mesh_quantization, meshopt) and rely on the node's transform to
 * scale them back: transforming those attributes in place would clamp every value to [-1, 1] and crush the model.
 * Here every attribute is read through its accessors (de-quantised, de-interleaved) into a Float32Array first.
 */
export function bakeGeometry(source: THREE.BufferGeometry, matrix: THREE.Matrix4) {
	const g = new THREE.BufferGeometry();
	for (const [name, attr] of Object.entries(source.attributes)) {
		const a = attr as THREE.BufferAttribute | THREE.InterleavedBufferAttribute;
		const n = a.itemSize;
		const out = new Float32Array(a.count * n);
		for (let i = 0; i < a.count; i++) {
			out[i * n] = a.getX(i);
			if (n > 1) out[i * n + 1] = a.getY(i);
			if (n > 2) out[i * n + 2] = a.getZ(i);
			if (n > 3) out[i * n + 3] = a.getW(i);
		}
		g.setAttribute(name, new THREE.BufferAttribute(out, n));
	}
	if (source.index) g.setIndex(new THREE.BufferAttribute(source.index.array.slice(), 1));
	for (const grp of source.groups) g.addGroup(grp.start, grp.count, grp.materialIndex);
	g.applyMatrix4(matrix);
	return g;
}
