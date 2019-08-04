
const mongoose = require('mongoose');
const express = require('express');
var cors = require('cors');
const bodyParser = require('body-parser');
const logger = require('morgan');
const Data = require('./data');

const API_PORT = 3001;
const app = express();
app.use(cors());
const router = express.Router();

// MongoDB database Route
const dbRoute =
  'mongodb+srv://Admin:admin@getir-to-do-list-yh3fn.mongodb.net/test?retryWrites=true&w=majority';

// connects back end code with the database
mongoose.connect(dbRoute, { useNewUrlParser: true });

let db = mongoose.connection;

db.once('open', () => console.log('connected to the database'));

// checks if connection with the database is successful
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// bodyParser, parses the request body to be a readable json format
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
app.use(logger('dev'));




// this is get method
// this method fetches all available data in the database
router.get('/get_tasks', (req, res) => {
  Data.find({parent:null})
      .populate({path:'children',
                 populate: { path: 'children',
                             populate: { path: 'children'}}})
      .exec((err, data) => {
                              if (err) return res.json({ success: false, error: err });
                              return res.json({ success: true, data: data });
                            });
});



// this is update method
// this method overwrites existing data in the database
// Used for changing the state of the task. It could be Accomplished or not
router.put('/update_task', (req, res) => {
  console.log(req.body)
  const { id, update } = req.body;
  Data.findByIdAndUpdate(id, update, (err) => {

    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true });
  });
});



  // this is task create method
router.post('/new_task', (req, res) => {
  let data = new Data();
  console.log(req.body)
  const { body, parent, due_date } = req.body;

  if (!body) {
    return res.json({
      success: false,
      error: 'Invalid task input',
    });
  }
  data.body = body;
  data._id = new mongoose.Types.ObjectId()

  if(parent){
      Data.findByIdAndUpdate(parent,{$push: {children: data._id}},()=> {console.log('YES')})
      data.parent = parent
  }
  console.log(due_date)
  data.due_date = due_date
  console.log(data)

  data.save((err) => {
    if (err) return res.json({ success: false, error: err });
    return res.json({ success: true });
  });
});



//Delete all tasks in db
router.delete('/delete_all',(req, res)=>{
    Data.remove({}, (err) => {
        if (err) return res.send(err);
        return res.json({ success: true });
      })
})

/**
function markToDelete(id,callback){
  Data.findById(id)
  .exec()
  .then((doc)=>{
    console.log('1')
    children = doc.children
    if(children && children.length>0)
      for(child of children)
        markToDelete(child)
    return new Promise((resolve,reject)=>
    {resolve(doc)})
  })
  .then((doc)=>{
    console.log(2)
    doc.isSoftDeleted = true
    doc.save()
    .then(()=>{
        console.log(3)
        if(callback){
          console.log('PARENT')
          callback()
        }
    })
  })
}
 */

// this is task delete method
//3 level deep tasks
router.delete('/delete_task', (req, res) => {
  const { id } = req.body;
  ids = []
  ids.push(id)
  Data.findById(id).exec((err,doc)=>{
    ids.push(...doc.children)
  })
  Data.remove({parent:{"$in":ids}},()=>{
    Data.findByIdAndDelete(id,(err,_)=>{
      if (err) return res.send(err);
        return res.json({ success: true });
    })
  })
});


// append /api for our http requests
app.use('/api', router);

// launch our backend into a port
app.listen(API_PORT, () => console.log(`LISTENING ON PORT ${API_PORT}`));
