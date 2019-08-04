import React from 'react';
import logo from './logo.svg';
import subtaskLogo from './addSubtask.png'
import deleteTaskLogo from './deleteTask.png'
import './App.css';
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css";
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'

const axios = require('axios');

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <TaskRoot></TaskRoot>
      </header>
    </div>
  );
}

class TaskRoot extends React.Component{
  constructor(){
    super()
    this.state = {
      data: [],
      show: false,
      parent: null,
    }
    this.getData()

    this.showModal = this.showModal.bind(this)
    this.hideModal = this.hideModal.bind(this)
    this.getData = this.getData.bind(this)
  }

  getData(){
    fetch('http://localhost:3001/api/get_tasks',{method: 'get'})
    .then(results => {return results.json()})
    .then(res => {
      this.setState({data:res.data});
      console.log(this.state);
      console.log('BBBBBBBBBBBBBBB');
      this.forceUpdate()})
  }

  showModal(id){
    console.log(id)
    this.setState({show:true})
    this.setState({parent:id})
  }

  hideModal(){
    this.setState({show:false})
  }

  render(){
      return (
      <div id={'taskList'}>
        <div>
          <button style={{'width': '25vmin','margin': 'auto','display':'block'}} onClick={()=>{this.showModal(null)}}>
            Create New Task
          </button>
        </div>
        <br></br>
        <h3 style={{'text-align':'center', "color": "#61dafb"}}>My Tasks</h3>
        <div>
          {this.state.data.map((x, _) => <TaskItem key={x._id} data={x} rootgetdata={this.getData} parentShowModal={this.showModal} depth_level={0}/>)}
        </div>
        
        <div>
          <TaskForm rootgetdata={this.getData} parent={this.state.parent} show={this.state.show} onHide={this.hideModal}/>
        </div>
      </div>
      )
  }
}

class TaskItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isDone: props.data ? props.data.isDone : false,
      body: props.data && props.data.body ? props.data.body : 'HEEYA',
      children: props.data && props.data.children ? props.data.children : [],
      id: props.data && props.data._id ? props.data._id: null,
      due_date: props.data? props.data.due_date : null,
      depth_level: this.props.depth_level,
      showOptions: false,
    };
    this.showCreateTask = this.showCreateTask.bind(this)
    this.onHoverEnter = this.onHoverEnter.bind(this)
    this.onHoverExit = this.onHoverExit.bind(this)
    this.deleteTask = this.deleteTask.bind(this)
  }

  componentWillReceiveProps({data}){
    console.log(data._id,this.state.depth_level,this.state)
    this.setState(data)
    console.log(data._id,this.state.depth_level,this.state)
  }

  componentWillUnmount(){
    console.log(this.state)
  }
  
  onHoverEnter(e){
    e.stopPropagation()
    this.setState({showOptions:true})
  }

  onHoverExit(e){
    e.stopPropagation()
    this.setState({showOptions:false})
  }

  showCreateTask(e){
    e.stopPropagation()
    this.props.parentShowModal(this.state.id)
  }

  removeChild(){
    this.state.children.pop()
  }

  deleteTask(e){
    e.stopPropagation()
    fetch('http://localhost:3001/api/delete_task', {
      method: 'delete',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({
        id:this.state.id
      })
     }).then(()=>{this.props.rootgetdata(); console.log('AAAAAAAAAAAAAAAAA')});
  }

  render() {
    const optionsStyle = this.state.showOptions ? {} : {display: 'none'}
    return (
      <ul>
        <li onClick={()=>{this.toggleStatus()}} onMouseEnter={this.onHoverEnter} onMouseLeave={this.onHoverExit}>
          {this.state.isDone ? "👌" : "👉"} 
          <b style={{"color": "#61dafb", "font-weight":"600"}}>{this.state.body}</b>  
          {this.state.due_date ? " - " + (new Date(this.state.due_date)).toLocaleDateString('en-GB', { 
        year: 'numeric', 
        month: 'long', 
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }): ""}
          {this.props.depth_level < 3 ? <img className={'logo'} src={subtaskLogo} onClick={this.showCreateTask} style={optionsStyle}/> : null}
          <img className={'logo'} src={deleteTaskLogo} onClick={this.deleteTask} style={optionsStyle}/>
        </li>
        {this.state.children.map((child, index) => 
          <li key={child._id}><TaskItem data={child} depth_level={this.props.depth_level+1} rootgetdata={this.props.rootgetdata} parentShowModal={this.props.parentShowModal}/></li>
        )}
      </ul>
    )
  }

  toggleStatus(){
    fetch('http://localhost:3001/api/update_task', {
      method: 'put',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({
       id: this.state.id,
       update: {isDone: !this.state.isDone}
      })
    })
    .then(()=>{
        this.setState({isDone:!this.state.isDone})
    })
  }
}

class TaskForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      body: '',
      date: null,
      show:false
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleInputChange(event) {
    const target = event.target;
    console.log(target)
    const name = target.name;
    const value = target.value;
    this.setState({
      [name]: value,
    })
  }

  handleDateChange = date => this.setState({ date: date })

  handleSubmit(event) {
    fetch('http://localhost:3001/api/new_task', {
      method: 'post',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({
       "body": this.state.body,
       "parent": this.props.parent,
       "due_date": this.state.date,
      })
     }).then(()=>{this.props.rootgetdata();this.props.onHide()});
  }

  render() {
    return (
      <Modal
        {...this.props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            Create Task
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form>
            <br></br>
            <br></br>
            <label>
              Task: 
              <input style={{'marginLeft': '20px'}} name="body" type="text" value={this.state.body} onChange={this.handleInputChange}/>
            </label>
            <label>
              Due To:
              <DatePicker
                  popperModifiers={{preventOverflow: {
                    enabled: true,
                    escapeWithReference: false, // force popper to stay in viewport (even when input is scrolled out of view)
                    boundariesElement: 'viewport'
                  }}}
                  selected={this.state.date}
                  onChange={this.handleDateChange}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat="MMMM d, yyyy h:mm aa"
                  timeCaption="time"
              />
            </label>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={this.handleSubmit}>Create</Button>
          <Button onClick={this.props.onHide}>Close</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}




export default App;
