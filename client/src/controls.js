import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import "antd/dist/antd.css";
import { InputNumber, Divider, Switch, Slider } from 'antd';

function Parameter(props) {
    let formatter = null;
    let parser = null;
    if(props.param.type === "rate") {
        formatter = value => `${value}%`;
        parser = value => value.replace('%', '');
    } else if (props.param.type === "weekly") {
        formatter = value => `£${value}/week`
        parser = value => value.replace('£', '').replace("/week", "");
    } else if (props.param.type === "yearly") {
        formatter = value => `£${value}/year`;
        parser = value => value.replace('£', '').replace("/year", "");
    } else if (props.param.type === "monthly") {
        formatter = value => `£${value}/month`;
        parser = value => value.replace('£', '').replace("/month", "");
    }
    return (
        <>
            <Divider>{props.param.title}</Divider>
            <p>{props.param.description}</p>
            {props.param.type === "bool" ? 
            <Switch onChange={value => {props.onChange(props.name, value)}} checked={props.param.value}/> :
            <>
              <Slider 
              value={props.param.value}
              min={props.param.min || 0}
              max={props.param.max || 100}
              onChange={value => {props.onChange(props.name, value)}}
              tooltipVisible={false}
              />
              <InputNumber
                  value={props.param.value}
                  min={props.param.min ? props.min : null}
                  max={props.param.max ? props.max : null}
                  formatter={formatter}
                  parser={parser}
                  onChange={value => {props.onChange(props.name, value)}}
                  style={{width: 175}}
              />
            </>}
        </>
    )
}

function ParameterGroup(props) {
    return (
        <>
            {props.names.map(name => <Parameter key={name} name={name} param={props.plan[name]} onChange={props.onChange} rate/>)}
        </>
    )
}
  
  function NothingControls(props) {
    return (
      <>
        <Divider>No parameters available</Divider>
        <p>No parameters are currently available for this category.</p>
      </>
    )
  }
  
export function Controls(props) {
    const controlSet = {
      "main_rates": [
          "basic_rate",
          "basic_threshold",
          "higher_rate",
          "higher_threshold",
          "add_rate",
          "add_threshold"
      ],
      "employee_side": [
        "NI_main_rate",
        "NI_PT",
        "NI_add_rate",
        "NI_UEL"
      ],
      "allowances": [
        "personal_allowance"
      ],
      "basic_income": [
          "child_BI",
          "adult_BI",
          "senior_BI"
      ]
    };
    let names = controlSet[props.selected];
    if(!(props.selected in controlSet)) {
      return <NothingControls key={props.selected} plan={props.plan}/>
    } else {
      return <ParameterGroup key={props.selected} onChange={props.onChange} plan={props.plan} names={names}/>;
    }
  }