import '../css/App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Row, Col} from 'react-bootstrap';
import React from 'react';
import Plot from 'react-plotly.js';
import { Menu } from 'antd';
import "antd/dist/antd.css";
import { PageHeader, Divider, Button, Empty, Spin, Steps, Statistic, Card } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { LoadingOutlined } from '@ant-design/icons';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
} from "react-router-dom";
import { Controls } from './controls';

const { Step } = Steps;

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;
const { SubMenu } = Menu;

const DEFAULT_PLAN = {
  basic_rate: {
    title: "Basic rate",
    description: "The basic rate is the first of three tax brackets on all income, after allowances are deducted.",
    default: 20,
    value: 20,
    summary: "Change the basic rate to @%",
    type: "rate"
  },
  higher_rate: {
    title: "Higher rate",
    description: "The higher rate is the middle tax bracket.",
    default: 40,
    value: 40,
    summary: "Change the higher rate to @%",
    type: "rate"
  },
  add_rate: {
    title: "Additional rate",
    description: "The additional rate is the highest tax bracket, with no upper bound.",
    default: 45,
    value: 45,
    summary: "Change the additional rate to @%",
    type: "rate"
  },
  basic_threshold: {
    title: "Basic rate threshold",
    description: "Lower threshold for the basic rate, on income after allowances (including the personal allowance) have been deducted.",
    default: 0,
    value: 0,
    max: 100000,
    summary: "Change the basic rate to £@/year",
    type: "yearly"
  },
  higher_threshold: {
    title: "Higher rate threshold",
    description: "The lower threshold for the higher rate of income tax (and therefore the upper threshold of the basic rate).",
    default: 37500,
    value: 37500,
    max: 200000,
    summary: "Change the higher rate to £@/year",
    type: "yearly"
  },
  add_threshold: {
    title: "Additional rate",
    description: "The lower threshold for the additional rate.",
    default: 150000,
    value: 150000,
    max: 1000000,
    summary: "Change the additional rate to £@/year",
    type: "yearly"
  },
  personal_allowance: {
    title: "Personal allowance",
    description: "The personal allowance is deducted from general income.",
    default: 12500,
    value: 12500,
    max: 25000,
    summary: "Change the personal allowance to £@/year",
    type: "yearly"
  },
  NI_main_rate: {
    title: "NI main rate",
    description: "The Class 1 NI main rate is paid on employment earnings between the Primary Threshold and the Upper Earnings Limit.",
    default: 12,
    value: 12,
    summary: "Change the NI main rate to @%",
    type: "rate"
  },
  NI_add_rate: {
    title: "NI additional rate",
    description: "The Class 1 NI additional rate is paid on employment earnings above the Upper Earnings Limit.",
    default: 2,
    value: 2,
    summary: "Change the NI additional rate to @%",
    type: "rate"
  },
  NI_PT: {
    title: "NI Primary Threshold",
    description: "The Primary Threshold is the lower bound for the main rate of NI.",
    default: 183,
    value: 183,
    max: 1000,
    summary: "Change the PT to £@/week",
    type: "weekly"
  },
  NI_UEL: {
    title: "NI Upper Earnings Limit",
    description: "The Upper Earnings Limit is the upper bound for the main rate of NI.",
    default: 962,
    value: 962,
    max: 10000,
    summary: "Change the UEL to £@/week",
    type: "weekly"
  },
  child_BI: {
    title: "Child basic income",
    description: "A basic income for children is given to every child aged under 18, regardless of household income.",
    default: 0,
    value: 0,
    max: 250,
    summary: "Give a basic income of £@/week to children",
    type: "weekly"
  },
  adult_BI: {
    title: "Adult basic income",
    description: "Basic income for adults is given to individuals aged over 18 but under State Pension age.",
    default: 0,
    value: 0,
    max: 250,
    summary: "Give a basic income of £@/week to adults",
    type: "weekly"
  },
  senior_BI: {
    title: "Senior basic income",
    description: "A basic income for senior citizens is given to those over State Pension age.",
    default: 0,
    value: 0,
    max: 250,
    summary: "Give a basic income of £@/week to seniors",
    type: "weekly"
  },
}

function TopProgress(props) {
  return (
    <>
      <Row style={{padding: 50}} className="d-none d-md-flex">
        <Col md={4}>
          <p>Welcome to the OpenFisca-UK Reform Explorer. Powered by the open-source microsimulation model OpenFisca-UK, this site allows you to experiment with different changes to how taxes and benefits are set in the United Kingdom, and simulate the results on people, families and households in the country.</p>
        </Col>
        <Col md={8}>
          <div className="d-flex justify-content-center">
            <div style={{width: 1000}}>
              <Steps current={props.step}>
                <Step title="Policy" description="Specify changes to the current taxes and benefit programmes"></Step>
                <Step title="UK-wide effects" description="Simulate the changes on people, families and households in the UK"/>
                <Step title="About you" description="Describe your household to calculate the effects on you and your family"/>
                <Step title="Your results" description="Simulate the reform, showing your finances before and after"/>
              </Steps>
            </div>
          </div>
        </Col>
      </Row>
      <Row style={{padding: 50, paddingTop: 20}} className="d-md-none">
        <Col md={4} style={{paddingBottom: 20}}>
          <p>Welcome to the OpenFisca-UK Reform Explorer. Powered by the open-source microsimulation model OpenFisca-UK, this site allows you to experiment with different changes to how taxes and benefits are set in the United Kingdom, and simulate the results on people, families and households in the country.</p>
        </Col>
        <Col md={8}>
        <Steps current={props.step} direction="vertical">
          <Step title="Policy" description="Specify changes to the current taxes and benefit programmes"></Step>
          <Step title="Results" description="Simulate the changes on people, families and households in the UK"/>
          <Step title="About you" description="Describe your household to calculate the effects on you and your family"/>
          <Step title="Your results" description="Simulate the reform, showing your finances before and after"/>
        </Steps>
        </Col>
      </Row>
    </>
  )
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {selected: "main_rates", plan: DEFAULT_PLAN, results: null, ready: false, waiting: true};
    this.getPlanFromURL = this.getPlanFromURL.bind(this);
    this.simulate = this.simulate.bind(this);
  }

  getPlanFromURL() {
    let searchParams = (new URL(document.location)).searchParams;
    let plan = this.state.plan;
    for(let key of searchParams.keys()) {
      plan[key].value = +searchParams.get(key);
    }
    this.setState({plan: plan, ready: true});
  }

  simulate() {
    this.getPlanFromURL();
    let submission = {}
    for(let key in this.state.plan) {
      submission[key] = this.state.plan[key].value;
    }
    this.setState({waiting: true}, () => {
      fetch("http://localhost:5000/reform", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submission)
      }).then(res => res.json()).then(json => {this.setState({results: json, waiting: false});})
    })
  }

  render() {
    return (
      <div>
        <div className="d-none d-md-block">
          <PageHeader
            title="openfisca-uk"
            subTitle="reform explorer"
          />
        </div>
        <div className="d-md-none d-flex justify-content-center">
          <PageHeader
            title="openfisca-uk"
            subTitle="reform explorer"
          />
        </div>
      <Router>
          <Switch>
            <Route path="/simulate">
                <TopProgress step={1}/>
                <Row>
                  <Col md={2} style={{paddingLeft: 50}}>
                    <PlanSummary plan={this.state.plan}/>
                  </Col>
                  <Col md={10} style={{paddingLeft: 60, padding: 60}}>
                    {
                      this.state.results ? <Results results={this.state.results}/> : <LoadingResults onMount={this.simulate}/>
                    }
                  </Col>
                </Row>
            </Route>
            <Route path="/" exact>
                <TopProgress step={0}/>
                <Row>
                  <Col md={3} style={{paddingRight: 0}}>
                    <div className="main-menu">
                      <ControlTab onClick={name => {this.setState({selected: name.key})}}/>
                    </div>
                  </Col>
                  <Col md={6} style={{padding: 50}}>
                    <div className="main-menu">
                      <Controls plan={this.state.plan} selected={this.state.selected} onChange={(name, val) => {let plan = this.state.plan; plan[name].value = val; this.setState({plan: plan});}}/>
                    </div>
                  </Col>
                  <Col md={3} style={{padding: 50}}>
                    <div className="main-menu">
                    <PlanSummary plan={this.state.plan} />
                    <Empty description="" image={null}>
                      <SimulateButton plan={this.state.plan}/>
                    </Empty>
                    </div>
                  </Col>
                </Row>
            </Route>
            <Route path="/about-you">
              <TopProgress step={2}/>
              <IndividualControls />
            </Route>
          </Switch>
      </Router>
        
      </div>
    )
  }
}

function SimulateButton(props) {
  let plan = props.plan;
  let searchParams = new URLSearchParams(window.location.search);
  for(let key in plan) {
    if(plan[key].value !== plan[key].default) {
      searchParams.set(key, +plan[key].value);
    } else {
      searchParams.delete(key);
    }
  }
  let url = `/simulate?${searchParams.toString()}`;
  return (
    <div>
      <Link to={url}><Button>Simulate</Button></Link>
    </div>
  )
}

class LoadingResults extends React.Component {
  componentDidMount() {
    this.props.onMount();
  }
  render() {
    return (
      <Empty description="Simulating your plan on the UK population">
        <br /><br /><Spin indicator={antIcon}/>
      </Empty>
    )
  }
}

class Results extends React.Component {
  constructor(props) {
    super(props);
    this.state = {results: props.results, waiting: false};
  }

  render() {
    if(this.state.results && this.state.results["status"] === "error") {
      return (
        <Empty description="Error">
        </Empty>
      )
    }
    return (
      <>
      <Divider>Population results</Divider>
        <Row>
          <Col style={{padding: 10, margin: 10}}>
            <Card style={{minWidth: 150}}>
              <Statistic title="Net cost" value={this.state.results.net_cost} />
            </Card>
          </Col>
          <Col style={{padding: 10, margin: 10}}>
            <Card style={{minWidth: 150}}>
              <Statistic 
              title="Poverty rate change" 
              value={this.state.results["poverty_change"] * 100}
              precision={1}
              prefix={this.state.results["poverty_change"] >= 0 ? <><ArrowUpOutlined /></> : <><ArrowDownOutlined /></>}
              suffix="%"
              />
            </Card>
          </Col>
          <Col style={{padding: 10, margin: 10}}>
            <Card style={{minWidth: 150}}>
              <Statistic 
              title="Winner share" 
              value={this.state.results["winner_share"] * 100}
              precision={1}
              suffix="%"
              />
            </Card>
          </Col>
          <Col style={{padding: 10, margin: 10}}>
            <Card style={{minWidth: 150}}>
              <Statistic 
              title="Loser share" 
              value={this.state.results["loser_share"] * 100}
              precision={1}
              suffix="%"
              />
            </Card>
          </Col>
          <Col style={{padding: 10, margin: 10}}>
            <Card style={{minWidth: 150}}>
              <Statistic 
              title="Inequality" 
              value={this.state.results["inequality_change"] * 100}
              precision={1}
              prefix={this.state.results["poverty_change"] >= 0 ? <><ArrowUpOutlined /></> : <><ArrowDownOutlined /></>}
              suffix="%"
              />
            </Card>
          </Col>
        </Row>
        <div>
          <Row>
            <Col md={6}>
              <Plot data={this.state.results.decile_plot.data} layout={this.state.results.decile_plot.layout} config={{displayModeBar: false}} style={{width: "100%"}}/>
            </Col>
            <Col md={6}>
              <Plot data={this.state.results.poverty_plot.data} layout={this.state.results.poverty_plot.layout} config={{displayModeBar: false}} style={{width: "100%"}}/>
            </Col>
            <Col md={6}>
              <Plot data={this.state.results.age.data} layout={this.state.results.age.layout} config={{displayModeBar: false}} style={{width: "100%"}}/>
            </Col>
            <Col md={6}>
              <Plot data={this.state.results.mtr_plot.data} layout={this.state.results.mtr_plot.layout} config={{displayModeBar: false}} style={{width: "100%"}}/>
            </Col>
          </Row>
        </div>
      </>
    )
  }
}



function PlanSummary(props) {
  return (
    <>
    <Divider>Your plan</Divider>
    <Steps progressDot direction="vertical">
      {
        Object.keys(props.plan).map((key, i) => (
          props.plan[key].value !== props.plan[key].default ?
          <Step key={key} status="finish" title={props.plan[key].title} description={props.plan[key].summary.replace("@", props.plan[key].value)} /> :
          null
        ))
      }
    </Steps>
    </>
  )
}


class ControlTab extends React.Component {
  render() {
    return (
      <Menu
        onClick={this.props.onClick}
        mode="inline"
        defaultOpenKeys={["tax", "income_tax"]}
        defaultSelectedKeys={["main_rates"]}
      >
        <SubMenu key="tax" title="Tax">
          <SubMenu key="income_tax" title="Income Tax">
            <Menu.Item key="main_rates">Labour income</Menu.Item>
            <Menu.Item key="sav_div">Savings and dividends</Menu.Item>
            <Menu.Item key="allowances">Allowances</Menu.Item>
            <Menu.Item key="it_alt">Structural</Menu.Item>
          </SubMenu>
          <SubMenu key="national_insurance" title="National Insurance">
            <Menu.Item key="employee_side">Employees</Menu.Item>
            <Menu.Item key="employer_side">Employers</Menu.Item>
            <Menu.Item key="ni_alt">Structural</Menu.Item>
          </SubMenu>
        </SubMenu>
        <SubMenu key="benefit" title="Benefit">
          <SubMenu key="means" title="Means-tested benefits">
            <Menu.Item key="universal_credit">Universal Credit</Menu.Item>
            <Menu.Item key="UC">Universal Credit2</Menu.Item>
            <Menu.Item key="jsa">JSA</Menu.Item>
            <Menu.Item key="cb">Child Benefit</Menu.Item>
            <Menu.Item key="wtc">Working Tax Credit</Menu.Item>
            <Menu.Item key="ctc">Child Tax Credit</Menu.Item>
            <Menu.Item key="hb">Housing Benefit</Menu.Item>
            <Menu.Item key="is">Income Support</Menu.Item>
          </SubMenu>
        </SubMenu>
        <Menu.Item key="basic_income">Basic income</Menu.Item>
      </Menu>
    )
  }
}

class IndividualControls extends React.Component {
  constructor(props) {
    super(props);
    this.state = {situation: {household:{num_families: 1}, families: [{num_people: 1}]}}
  }
  render() {
    return (
      <Row>
        <Col md={3} style={{paddingRight: 0}}>
          <div className="main-menu">
          <Menu
          onClick={this.props.onClick}
          mode="inline"
          defaultOpenKeys={[]}
          defaultSelectedKeys={[]}
        >
          <Menu.Item key="household">Your household</Menu.Item>
          <SubMenu key="family-1" title="Family">
            <Menu.Item key="family-1-general">General</Menu.Item>
            <Menu.Item key="family-1-benefits">Benefits</Menu.Item>
            <SubMenu key="people" title="People">
              <SubMenu key="person-1" title="Person">
                <Menu.Item key="family-1-general">General</Menu.Item>
                <Menu.Item key="family-1-benefits">Benefits</Menu.Item>
              </SubMenu>
            </SubMenu>
          </SubMenu>
        </Menu>
          </div>
        </Col>
        <Col md={9}>

        </Col>
      </Row>
      
    )
  }
}

export default App;