const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const taskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    title: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    client: {
      type: String,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// will create separate collection called counter containing ticketNums
taskSchema.plugin(AutoIncrement, {
  inc_field: "ticket",
  id: "ticketNums",
  // start ticket nums at 500 and sequential
  start_seq: 500,
});

module.exports = mongoose.model("Task", taskSchema);
