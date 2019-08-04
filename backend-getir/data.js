const mongoose = require("mongoose");
const Schema = mongoose.Schema;
var ObjectId = mongoose.Schema.ObjectId;
// this will be our data base's data structure 
const taskSchema = new Schema(
  {
    _id: ObjectId,
    body: {
        type:String,
        required: 'Task body is required'
    },
    isDone: {
        type:Boolean,
        default: false
    },
    isSoftDeleted: {
        type: Boolean,
        default: false
    },
    children: [{
        type: mongoose.Schema.ObjectId,
        ref: 'Data'
    }],
    parent: {
        type: mongoose.Schema.ObjectId,
        ref: 'Data'
    },
    due_date: Date
  },
  { timestamps: true }
);

Data = mongoose.model("Data", taskSchema);


// export) the new Schema so we could modify it using Node.js
module.exports = Data;
