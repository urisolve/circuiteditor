const mongoose = require('mongoose');

const vertexSchema = new mongoose.Schema(
  {
    id: { type: String, requited: true },
    owner: String,
    position: {
      x: Number,
      y: Number,
    },
  },
  { _id: false },
);

module.exports = vertexSchema;
