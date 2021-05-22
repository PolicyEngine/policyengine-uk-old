import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Row, Col} from 'react-bootstrap';
import React from 'react';
import Plot from 'react-plotly.js';
import { Menu } from 'antd';
import "antd/dist/antd.css";
import { InputNumber, PageHeader, Divider, Button, Empty, Spin, Steps, Statistic, Card, Layout } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { UserOutlined, SolutionOutlined, LoadingOutlined, SmileOutlined } from '@ant-design/icons';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import { AnimatePresence, motion } from 'framer-motion';

const { Step } = Steps;

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;
const { SubMenu } = Menu;
const { Header, Content, Footer } = Layout;

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {selected: null, plan: {}};
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
            <Row style={{width: "100%"}}>
              <Col>
                <ControlTab onClick={name => {this.setState({selected: name.key})}}/>
              </Col>
              <Col md={3}>
                <Controls selected={this.state.selected} onChange={(name, val) => {let plan = this.state.plan; plan[name] = val; this.setState({plan: plan})}}/>
              </Col>
              <Col md={5}>
                <PolicyCommentary selected={this.state.selected}/>
              </Col>
              <Col md={2}>
                <PlanSummary plan={this.state.plan} />
                <Empty description="" image={null}>
                  <SimulateButton />
                </Empty>
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
      <Link to="/simulation">Simulate</Link>
    </div>
  )
}

function PolicyCommentary(props) {
  return (
    <>
    <Divider>The UK Tax-Benefit System</Divider>
    This calculator presents a toolkit for anyone to use, to estimate the effects of their ideas around how the UK taxes and distributes money on households, families and people in the United Kingdom.
    </>
  )
}

class Results extends React.Component {
  constructor(props) {
    super(props);
    this.state = {results: null, waiting: false}
  }

  componentDidMount() {
    this.setState({waiting: true}, () => {
      fetch("http://localhost:5000/reform", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.props.plan)
      }).then(res => res.json()).then(json => {this.setState({results: json, waiting: false});})
    })
  }

  render() {
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
        <Row>
          <Col>
            <Card>
              <Statistic 
              title="Top 1% mean effect" 
              value={Math.abs(this.state.results["1pct"])}
              precision={2}
              valueStyle={{ color: this.state.results["1pct"] >= 0 ? '#3f8600' : "#cf1322" }}
              prefix={this.state.results["1pct"] >= 0 ? <><ArrowUpOutlined /> £</> : <><ArrowDownOutlined /></>}
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
              prefix={this.state.results["10pct"] >= 0 ? <><ArrowUpOutlined /> £</> : <><ArrowDownOutlined /></>}
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
              prefix={this.state.results["median"] >= 0 ? <><ArrowUpOutlined /> £</> : <><ArrowDownOutlined /></>}
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

function BasicRate(props) {
  return (
    <>
    <Divider>Basic Rate</Divider>
    <p>The basic rate is the first of three tax brackets on all income, after allowances are deducted.</p>
    <InputNumber
      defaultValue={20}
      min={0}
      max={100}
      formatter={value => `${value}%`}
      parser={value => value.replace('%', '')}
      onChange={value => {props.onChange("basic_rate", value)}}
    />
    </>
  )
}

function HigherRate(props) {
  return (
    <>
    <Divider>Higher Rate</Divider>
    <p>The higher rate is the middle tax bracket.</p>
    <InputNumber
      defaultValue={40}
      min={0}
      max={100}
      formatter={value => `${value}%`}
      parser={value => value.replace('%', '')}
      onChange={value => {props.onChange("higher_rate", value)}}
    />
    </>
  )
}

function AdditionalRate(props) {
  return (
    <>
    <Divider>Additional Rate</Divider>
    <p>The additional rate is the highest tax bracket, with no upper bound.</p>
    <InputNumber
      defaultValue={45}
      min={0}
      max={100}
      formatter={value => `${value}%`}
      parser={value => value.replace('%', '')}
      onChange={value => {props.onChange("add_rate", value)}}
    />
    </>
  )
}

function IncomeTaxControls(props) {
  return (
    <>
      <BasicRate onChange={props.onChange}/>
      <HigherRate onChange={props.onChange} />
      <AdditionalRate onChange={props.onChange} />
    </>
  )
}

function BasicIncomeControls(props) {
  return (
    <>
      <Divider>Child Basic Income</Divider>
      <p>A basic income for children is given to every child aged under 18, regardless of household income.</p>
      <InputNumber
        defaultValue={0}
        min={0}
        formatter={value => `£${value}/week`}
        parser={value => value.replace('/week', '').replace("£", "")}
        onChange={value => {props.onChange("child_BI", value)}}
      />
      <Divider>Adult Basic Income</Divider>
      <p>Basic income for adults is given to individuals aged over 18 but under State Pension age.</p>
      <InputNumber
        defaultValue={0}
        min={0}
        formatter={value => `£${value}/week`}
        parser={value => value.replace('/week', '').replace("£", "")}
        onChange={value => {props.onChange("adult_BI", value)}}
      />
      <Divider>Senior Basic Income</Divider>
      <p>A basic income for senior citizens is given to those over State Pension age.</p>
      <InputNumber
        defaultValue={0}
        min={0}
        formatter={value => `£${value}/week`}
        parser={value => value.replace('/week', '').replace("£", "")}
        onChange={value => {props.onChange("senior_BI", value)}}
      />
    </>
  )
}

function NothingControls(props) {
  return (
    <>
      <Divider>Nothing selected</Divider>
      <p>Choose a category of tax or benefit controls on the left to edit.</p>
    </>
  )
}

function Controls(props) {
  const controlSet = {
    "main_rates": <IncomeTaxControls onChange={props.onChange} />,
    "basic_income": <BasicIncomeControls onChange={props.onChange} />
  };
  if(!(props.selected in controlSet)) {
    return <NothingControls />
  } else {
    return controlSet[props.selected];
  }
}

function PlanSummary(props) {
  return (
    <>
    <Divider>Your plan</Divider>
    <Steps progressDot direction="vertical">
      {props.plan.basic_rate ?
      <Step status="finish" title="Basic Rate" description={`Change the basic rate to ${props.plan.basic_rate}%`} /> :
      null }
      {props.plan.higher_rate ?
      <Step status="finish" title="Higher Rate" description={`Change the higher rate to ${props.plan.higher_rate}%`} /> :
      null }
      {props.plan.add_rate ?
      <Step status="finish" title="Additional Rate" description={`Change the additional rate to ${props.plan.add_rate}%`} /> :
      null }
      {props.plan.child_BI ?
      <Step status="finish" title="Child Basic Income" description={`Give a basic income of £${props.plan.child_BI}/week to children`} /> :
      null }
      {props.plan.adult_BI ?
      <Step status="finish" title="Adult Basic Income" description={`Give a basic income of £${props.plan.adult_BI}/week to adults`} /> :
      null }
      {props.plan.senior_BI ?
      <Step status="finish" title="Senior Basic Income" description={`Give a basic income of £${props.plan.senior_BI}/week to senior citizens`} /> :
      null }
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