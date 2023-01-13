import { Voxels, SvoxMeshGenerator, ModelReader, Buffers as SvoxBuffers } from "smoothvoxels";

// Based on testing with a bunch of models
const svoxBuffers = new SvoxBuffers(375000);

const EMPTY_OBJECT = {};

self.onmessage = ({
  data: {
    id,
    payload: { voxId, iFrame, modelString, voxelPackage }
  }
}) => {
  const model = ModelReader.readFromString(modelString, EMPTY_OBJECT, true /* skip voxels */);
  model.voxels = new Voxels(...voxelPackage);

  const svoxMesh = SvoxMeshGenerator.generate(model, svoxBuffers);
  self.postMessage({ id, result: { voxId, iFrame, svoxMesh } }, [
    svoxMesh.positions.buffer,
    svoxMesh.normals.buffer,
    svoxMesh.colors.buffer,
    svoxMesh.indices.buffer,
    svoxMesh.uvs.buffer
  ]);
};
