import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Row, Col} from 'react-bootstrap';
import React from 'react';
import Plot from 'react-plotly.js';
import { Menu } from 'antd';
import "antd/dist/antd.css";
import { InputNumber, PageHeader, Divider, Button, Empty, Spin, Steps, Statistic, Card } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;
const { SubMenu } = Menu;
const { Step } = Steps;

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {selected: null, plan: {}};
  }

  render() {
    return (
      <>
        <PageHeader
          title="openfisca-uk"
        />
        <Row style={{height: "100%", width: "100%"}}>
          <Col md={2}>
            <ControlTab onClick={name => {this.setState({selected: name.key})}}/>
          </Col>
          <Col md={2}>
            <Controls selected={this.state.selected} onChange={(name, val) => {let plan = this.state.plan; plan[name] = val; this.setState({plan: plan})}}/>
          </Col>
          <Col md={2}>
            <PlanSummary plan={this.state.plan}/>
          </Col>
          <Col md={6}>
            <Results plan={this.state.plan}/>
          </Col>
        </Row>
      </>
    )
  }
}

class Results extends React.Component {
  constructor(props) {
    super(props);
    this.state = {results: null, waiting: false}
    this.simulate = this.simulate.bind(this);
  }

  simulate() {
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
    console.log(this.state)
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
              prefix={this.state.results["1pct"] > 0 ? <><ArrowUpOutlined /> £</> : <><ArrowDownOutlined />£</>}
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
              prefix={this.state.results["10pct"] > 0 ? <><ArrowUpOutlined /> £</> : <><ArrowDownOutlined />£</>}
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
              prefix={this.state.results["median"] > 0 ? <><ArrowUpOutlined /> £</> : <><ArrowDownOutlined />£</>}
              />
            </Card>
          </Col>
        </Row>
      </>:
      <Empty description="Simulate your plan on the UK population">
        <Button onClick={() => {this.simulate()}}>Simulate</Button>
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
        formatter={value => `${value}/week`}
        parser={value => value.replace('/week', '')}
        onChange={value => {props.onChange("child_BI", value)}}
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
        openKeys={["tax", "income_tax", "national_insurance"]}
      >
        <SubMenu key="tax" title="Tax">
          <SubMenu key="income_tax" title="Income Tax">
            <Menu.Item key="main_rates">Main Rates</Menu.Item>
            <Menu.Item key="allowances">Allowances</Menu.Item>
          </SubMenu>
          <SubMenu key="national_insurance" title="National Insurance">
            <Menu.Item key="employee_side">Employee-Side</Menu.Item>
          </SubMenu>
        </SubMenu>
        <Menu.Item key="basic_income">Basic Income</Menu.Item>
      </Menu>
    )
  }
}

export default App;