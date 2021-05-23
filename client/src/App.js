import './App.css';
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
    summary: "Change the personal allowance to £@/year",
    type: "yearly"
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

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {selected: null, plan: DEFAULT_PLAN};
  }

  render() {
    return (
      <div style={{paddingLeft: 20, paddingRight: 20}}>
      <PageHeader
        title="openfisca-uk"
        subTitle="reform explorer"
        style={{height: 80}}
      />
      <Router>
          <Switch>
            <Route path="/simulation">
                <Row style={{paddingLeft: 250, paddingRight: 250, paddingBottom: 20}}>
                  <Steps current={1}>
                    <Step title="Policy" />
                    <Step title="Results" />
                  </Steps>
                </Row>
                <Row>
                  <Col md={2} style={{paddingLeft: 50}}>
                    <PlanSummary plan={this.state.plan}/>
                  </Col>
                  <Col md={10}>
                    <Results plan={this.state.plan}/>
                  </Col>
                </Row>
            </Route>
            <Route path="/">
                <Row style={{paddingLeft: 250, paddingRight: 250, paddingBottom: 20}}>
                  <Steps current={0}>
                    <Step title="Policy" />
                    <Step title="Results" />
                  </Steps>
                </Row>
                <Row>
                  <Col>
                    <div className="main-menu" style={{height:"88%", overflowY: "auto", width: "100%"}}>
                      <ControlTab onClick={name => {this.setState({selected: name.key})}}/>
                    </div>
                  </Col>
                  <Col md={3}>
                    <div className="main-menu" style={{height:"88%", overflowY: "auto", width: "100%"}}>
                      <Controls plan={this.state.plan} selected={this.state.selected} onChange={(name, val) => {let plan = this.state.plan; plan[name].value = val; this.setState({plan: plan})}}/>
                    </div>
                  </Col>
                  <Col md={5}>
                    <div className="main-menu" style={{height:"88%", overflowY: "auto", width: "100%"}}>
                      <PolicyCommentary selected={this.state.selected}/>
                    </div>
                  </Col>
                  <Col md={2}>
                    <div className="main-menu" style={{height:"88%", overflowY: "auto", width: "100%"}}>
                    <PlanSummary plan={this.state.plan} />
                    <Empty description="" image={null}>
                      <SimulateButton />
                    </Empty>
                    </div>
                  </Col>
                </Row>
            </Route>
          </Switch>
      </Router>
        
      </div>
    )
  }
}

function SimulateButton(props) {
  return (
    <div>
      <Link to="/simulation"><Button>Simulate</Button></Link>
    </div>
  )
}

function PolicyCommentary(props) {
  return (
    <>
    <Divider>The UK Tax-Benefit System</Divider>
    This calculator presents a toolkit for anyone to use, to estimate the effects of their ideas around how the UK taxes and distributes money on households, families and people in the United Kingdom. The first side panel displays a collection of policy switches; each of these describes a particular reform under a single parameter which may be combined with any other reform. Develop your policy plan by adding these reforms, and once you're ready to see the results, click the simulate button.
    </>
  )
}

class Results extends React.Component {
  constructor(props) {
    super(props);
    this.state = {results: null, waiting: false}
  }

  componentDidMount() {
    let submission = {}
    for(let key in this.props.plan) {
      if (this.props.plan[key].value !== this.props.plan[key].default) {
        submission[key] = this.props.plan[key].value;
      }
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
    if(this.state.results && this.state.results["status"] === "error") {
      return (
        <Empty description="Error">
        </Empty>
      )
    }
    return (
      <>
      <Divider>Results</Divider>
      {this.state.results ? 
      <>
        <Row>
          <Col>
            <Card>
              <Statistic title="Net cost" value={this.state.results.net_cost} />
            </Card>
          </Col>
        </Row>
        <Plot data={this.state.results.decile_plot.data} layout={this.state.results.decile_plot.layout}/>
        <Plot data={this.state.results.poverty_plot.data} layout={this.state.results.poverty_plot.layout}/>
        <Row>
          <Col>
            <Card>
              <Statistic 
              title="Top 1% mean effect" 
              value={Math.abs(this.state.results["1pct"])}
              precision={2}
              valueStyle={{ color: this.state.results["1pct"] >= 0 ? '#3f8600' : "#cf1322" }}
              prefix={this.state.results["1pct"] >= 0 ? <><ArrowUpOutlined />£</> : <><ArrowDownOutlined />£</>}
              />
            </Card>
          </Col>
          <Col>
            <Card>
              <Statistic 
              title="Top 10% mean effect" 
              value={Math.abs(this.state.results["10pct"])}
              precision={2}
              valueStyle={{ color: this.state.results["10pct"] >= 0 ? '#3f8600' : "#cf1322" }}
              prefix={this.state.results["10pct"] >= 0 ? <><ArrowUpOutlined />£</> : <><ArrowDownOutlined />£</>}
              />
            </Card>
          </Col>
          <Col>
            <Card>
              <Statistic 
              title="Median effect" 
              value={Math.abs(this.state.results["median"])}
              precision={2}
              valueStyle={{ color: this.state.results["median"] >= 0 ? '#3f8600' : "#cf1322" }}
              prefix={this.state.results["median"] >= 0 ? <><ArrowUpOutlined />£</> : <><ArrowDownOutlined />£</>}
              />
            </Card>
          </Col>
        </Row>
      </>:
      <Empty description="Simulating your plan on the UK population">
        {this.state.waiting ? <><br /><br /><Spin indicator={antIcon}/></> : null}
      </Empty>
      }
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
        openKeys={["tax", "income_tax", "national_insurance", "benefit", "means"]}
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

export default App;