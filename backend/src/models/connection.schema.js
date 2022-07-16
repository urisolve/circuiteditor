const mongoose = require('mongoose');

const labelSchema = require('./label.schema');
const vertexSchema = require('./vertex.schema');

const connectionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    start: { type: String, required: true },
    end: { type: String, required: true },
    type: { type: String, default: 'grid' },
    label: labelSchema,
    properties: {
      color: String,
      dashed: Boolean,
      dashedAnimationSpeed: Number,
      strokeWidth: Number,
      vertexRadius: Number,
    },
    vertices: [vertexSchema],
  },
  { _id: false },
);

module.exports = connectionSchema;
