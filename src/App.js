import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Row, Col, Nav, Form} from 'react-bootstrap';
import React from 'react';
import { TextInput, Button, Spinner } from 'grommet';
import Plot from 'react-plotly.js';

function App() {
  return (
    <div style={{color: "#DDD", height: "100vh", width: "90vw"}}>
      <NavBar />
      <UI />
    </div>
  );
}

class UI extends React.Component {
  constructor(props) {
    super(props);
    this.state = {parameters: {}, ready: false, reform: {}};
    this.toggleParameterEdit = this.toggleParameterEdit.bind(this);
  }

  toggleParameterEdit(name, desc, value) {
    console.log(this.state.parameters, name)
    if(Object.keys(this.state.parameters).includes(name)) {
      let newParams = Object.assign({}, this.state.parameters);
      delete newParams[name];
      this.setState({parameters: newParams});
    } else {
      let newParams = Object.assign({}, this.state.parameters);
      newParams[name] = {name: name, description: desc, value: value};
      this.setState({parameters: newParams});
    }
  }

  render() {
    return (
      <Row style={{padding: 25}}>
        <Col md={4}>
          <h2>Parameters</h2>
          <p>Select parameters of the existing system</p>
          <div style={{backgroundColor: "#333", padding: 10, maxHeight: "75vh"}} className="overflow-auto">
            <Parameters choose={this.toggleParameterEdit}/>
          </div>
        </Col>
        <Col md={4}>
          <h2>Changes</h2>
          <p>Change the values for the current tax year</p>
          <div style={{maxHeight: "75vh"}} className="overflow-auto">
            <Editor parameters={this.state.parameters} onSubmit={reform => {this.setState({reform: reform, ready: true})}}/>
          </div>
        </Col>
        <Col md={4}>
          <h2>Results</h2>
          <p>See the results on the UK population</p>
          <Results ready={this.state.ready} reform={this.state.reform}/>
        </Col>
      </Row>
    )
  }
}

function NavBar() {
  return <Nav>
    <Nav.Item>
      <Nav.Link href="/" style={{fontSize: 30, color: "#DDD", paddingLeft: 25}}>openfisca-uk</Nav.Link>
    </Nav.Item>
  </Nav>
}

class Results extends React.Component {
  constructor(props) {
    super(props);
    this.state = {net_cost: null, net_cost_str: null, decile_plot: null, calculated: false}
  }

  componentDidUpdate() {
    if (this.props.ready & !this.state.calculated) {
      fetch("http://localhost:5000/reform", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({parameters: this.props.reform})
      }).then(res => res.json()).then(json => {this.setState({calculated: true, lastReform: Object.assign({}, this.props.reform), decile_plot: JSON.parse(json.decile_plot), net_cost: json.net_cost, net_cost_str: json.net_cost_str})})
    }
  }

  render() {
    return this.props.ready ? 
    (this.state.calculated ? 
      <div>
      <h4>Net cost: {this.state.net_cost_str}</h4>
      {this.state.decile_plot ? <Plot data={this.state.decile_plot.data} layout={this.state.decile_plot.layout} /> : null}
    </div> :
    <Spinner/>
    ) :
    <div>No changes applied.</div>
  }
}

class Editor extends React.Component {
  constructor(props) {
    super(props);
    this.change = this.change.bind(this);
    this.state = {parameters: {}};
  }

  change(parameter, value) {
    let newParams = this.state.parameters;
    if(!Object.keys(this.state.parameters).includes(parameter)) {
      newParams[parameter] = {};
      newParams[parameter].name = this.props.parameters[parameter].name;
      newParams[parameter].value = this.props.parameters[parameter].value;
    }
    newParams[parameter].newValue = +value;
    this.setState({parameters: newParams});
  }

  render() {
    if (!this.props.parameters) {
      return <div></div>
    }
    return (
      <div>
        {Object.keys(this.props.parameters).map(name => <ParameterEditor change={this.change} key={name} name={this.props.parameters[name].name} desc={this.props.parameters[name].description} value={this.props.parameters[name].value}/>)}
        <Button label="Simulate" onClick={() => {this.props.onSubmit(this.state.parameters)}} style={{color: "#EEE"}}/>
      </div>    
    )
  }
}

class ParameterEditor extends React.Component {
  render() {
    return (
      <div style={{paddingBottom: 5, paddingTop: 10, borderTop: "2px solid"}}>
        <h4 style={{fontSize: 10}}>{this.props.name.split("/").join(" > ")}</h4>
        <p style={{fontSize: 20}}>{this.props.desc}</p>
        <h6>Current value: {this.props.value}</h6>
        <TextInput label="Reformed value" onChange={e => {this.props.change(this.props.name, e.target.value)}}/>
      </div>
    )
  }
}

class Parameters extends React.Component {
  constructor(props) {
    super(props);
    this.state = {parameterTree: {}}
  }

  componentDidMount() {
    fetch("http://127.0.0.1:5000/parameters").then(res => res.json()).then(json => {this.setState({parameterTree: json})})
  }

  render() {
    return <ParameterNode data={this.state.parameterTree} depth={0} choose={this.props.choose}/>
  }
}

class ParameterNode extends React.Component {
  constructor(props) {
    super(props);
  }
  
  render() {
    if(this.props.data.children) {
      return (
          <div style={{paddingLeft: this.props.depth * 5 - 5}}>
            {this.props.name}
            {Object.keys(this.props.data.children).map((name, i) => <ParameterNode name={name} key={i} data={this.props.data.children[name]} depth={this.props.depth + 1} choose={(name, desc, value) => {this.props.choose((this.props.name ? this.props.name + "/" : "") + name, desc, value)}}/>)}
          </div>
        )
    } else {
      return (
        <div style={{cursor: "pointer"}} className="parameterHolder" onClick={() => {this.props.choose(this.props.name, this.props.data.description, this.props.data.value)}}>
          {this.props.name}
        </div>
      )
    }
  }
}

export default App;
