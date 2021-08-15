(this.webpackJsonpclient=this.webpackJsonpclient||[]).push([[0],{102:function(e,t,i){},170:function(e,t,i){"use strict";i.r(t);var a=i(0),n=i.n(a),s=i(34),l=i.n(s),o=i(9),r=i(10),c=i(12),u=i(11),d=i(111),h=i(172),j=i(173),p=i(174),m=i(178),b=i(179),f=(i(102),i(92),i(93),i(1)),y=m.a.Step;function x(){return Object(f.jsxs)(f.Fragment,{children:[Object(f.jsx)("div",{className:"d-none d-md-block",children:Object(f.jsx)(b.a,{title:"UK Policy Engine",subTitle:"by the UBI Center"})}),Object(f.jsxs)("div",{className:"d-md-none",children:[Object(f.jsx)("div",{className:"d-flex justify-content-center",children:Object(f.jsx)(b.a,{title:"UK Policy Engine",style:{paddingBottom:8}})}),Object(f.jsx)("div",{className:"d-flex justify-content-center",children:Object(f.jsx)("div",{className:"ant-page-header-heading-sub-title",children:"By the UBI Center"})})]})]})}var O=function(e){for(var t=Object(f.jsx)("p",{style:{fontSize:16},children:"Welcome to the UBI Center's UK Policy Engine. Powered by the open-source microsimulation model OpenFisca-UK, this site allows you to experiment with different changes to how taxes and benefits are set in the United Kingdom, and simulate the results on people, families and households in the country."}),i=["Policy","About you","UK-wide effects","Your results"],a=["Specify changes to the current taxes and benefit programmes","Describe your household to calculate the effects on you and your family","Simulate the changes on people, families and households in the UK","Simulate the reform, showing your finances before and after"],n=[],s=0;s<i.length;s++)n.push(Object(f.jsx)(y,{title:i[s],description:a[s],style:{minWidth:200}},s));return Object(f.jsxs)(f.Fragment,{children:[Object(f.jsx)(x,{}),Object(f.jsxs)(h.a,{fluid:!0,children:[Object(f.jsxs)(j.a,{style:{padding:50},className:"d-none d-xl-flex",children:[Object(f.jsx)(p.a,{md:4,style:{paddingRight:40},children:t}),Object(f.jsx)(p.a,{md:8,children:Object(f.jsx)("div",{className:"d-flex justify-content-center",children:Object(f.jsx)("div",{children:Object(f.jsx)(m.a,{current:e.step,children:n})})})})]}),Object(f.jsxs)(j.a,{style:{padding:10},className:"d-xl-none",children:[Object(f.jsx)(p.a,{md:4,style:{paddingBottom:20},children:t}),Object(f.jsx)(p.a,{md:8,children:Object(f.jsx)(m.a,{current:e.step,direction:"vertical",children:n})})]})]})]})},v=i(20),g=i(175),_=i(183),w=i(180),I=i(182);function S(e){var t=null,i=null;return"rate"===e.param.type?(t=function(e){return"".concat(e,"%")},i=function(e){return e.replace("%","")}):"weekly"===e.param.type?(t=function(e){return"\xa3".concat(e,"/week")},i=function(e){return e.replace("\xa3","").replace("/week","")}):"yearly"===e.param.type?(t=function(e){return"\xa3".concat(e,"/year")},i=function(e){return e.replace("\xa3","").replace("/year","")}):"monthly"===e.param.type&&(t=function(e){return"\xa3".concat(e,"/month")},i=function(e){return e.replace("\xa3","").replace("/month","")}),Object(f.jsxs)(f.Fragment,{children:[Object(f.jsx)(g.a,{children:e.param.title}),Object(f.jsx)("p",{children:e.param.description}),"bool"===e.param.type?Object(f.jsx)(_.a,{onChange:function(t){e.onChange(e.name,t)},checked:e.param.value}):Object(f.jsxs)(f.Fragment,{children:[Object(f.jsx)(w.a,{value:e.param.value,min:e.param.min||0,max:e.param.max||100,onChange:function(t){e.onChange(e.name,t)},tooltipVisible:!1}),Object(f.jsx)(I.a,{value:e.param.value,min:e.param.min?e.min:null,max:e.param.max?e.max:null,formatter:t,parser:i,onChange:function(t){e.onChange(e.name,t)},style:{width:175}})]})]})}function C(e){return Object(f.jsx)(f.Fragment,{children:e.names.map((function(t){return Object(f.jsx)(S,{name:t,param:e.policy[t],onChange:e.onChange,rate:!0},t)}))})}function k(e){return Object(f.jsxs)(f.Fragment,{children:[Object(f.jsx)(g.a,{children:"No parameters available"}),Object(f.jsx)("p",{children:"No parameters are currently available for this category."})]})}var N=function(e){var t={main_rates:["basic_rate","basic_threshold","higher_rate","higher_threshold","add_rate","add_threshold"],sav_div:["abolish_savings_allowance","abolish_dividend_allowance"],it_alt:["abolish_income_tax"],employee_side:["NI_main_rate","NI_PT","NI_add_rate","NI_UEL"],ni_alt:["abolish_NI"],allowances:["personal_allowance"],basic_income:["child_UBI","adult_UBI","senior_UBI"],universal_credit:["abolish_UC"],cb:["abolish_CB"]},i=t[e.selected];return e.selected in t?Object(f.jsx)(C,{onChange:e.onChange,policy:e.policy,names:i},e.selected):Object(f.jsx)(k,{policy:e.policy},e.selected)},T=i(101),B=T.a.SubMenu,U=function(e){Object(c.a)(i,e);var t=Object(u.a)(i);function i(){return Object(o.a)(this,i),t.apply(this,arguments)}return Object(r.a)(i,[{key:"render",value:function(){var e=this;return Object(f.jsxs)(T.a,{onClick:function(t){e.props.onClick(t.key)},mode:"inline",defaultOpenKeys:["tax","income_tax"],defaultSelectedKeys:["main_rates"],children:[Object(f.jsxs)(B,{title:"Tax",children:[Object(f.jsxs)(B,{title:"Income Tax",children:[Object(f.jsx)(T.a.Item,{children:"Labour income"},"main_rates"),Object(f.jsx)(T.a.Item,{children:"Savings and dividends"},"sav_div"),Object(f.jsx)(T.a.Item,{children:"Allowances"},"allowances"),Object(f.jsx)(T.a.Item,{children:"Structural"},"it_alt")]},"income_tax"),Object(f.jsxs)(B,{title:"National Insurance",children:[Object(f.jsx)(T.a.Item,{children:"Employees"},"employee_side"),Object(f.jsx)(T.a.Item,{children:"Employers"},"employer_side"),Object(f.jsx)(T.a.Item,{children:"Structural"},"ni_alt")]},"national_insurance")]},"tax"),Object(f.jsx)(B,{title:"Benefit",children:Object(f.jsxs)(B,{title:"Means-tested benefits",children:[Object(f.jsx)(T.a.Item,{children:"Universal Credit"},"universal_credit"),Object(f.jsx)(T.a.Item,{children:"JSA"},"jsa"),Object(f.jsx)(T.a.Item,{children:"Child Benefit"},"cb"),Object(f.jsx)(T.a.Item,{children:"Working Tax Credit"},"wtc"),Object(f.jsx)(T.a.Item,{children:"Child Tax Credit"},"ctc"),Object(f.jsx)(T.a.Item,{children:"Housing Benefit"},"hb"),Object(f.jsx)(T.a.Item,{children:"Income Support"},"is")]},"means")},"benefit"),Object(f.jsx)(T.a.Item,{children:"Basic income"},"basic_income")]})}}]),i}(n.a.Component),P=i(88),A=i(68),F=i(49),L=m.a.Step;function E(e){var t=e.policy,i=new URLSearchParams(window.location.search);for(var a in t)t[a].value!==t[a].default?i.set(a,+t[a].value):i.delete(a);var n="".concat(e.target||"/situation","?").concat(i.toString());return Object(f.jsx)("div",{children:Object(f.jsx)(F.Link,{to:n,children:Object(f.jsx)(P.a,{type:e.primary?"primary":null,onClick:e.onClick,children:e.text||"Simulate"})})})}var D=function(e){return Object(f.jsxs)(f.Fragment,{children:[Object(f.jsx)(g.a,{children:"Your plan"}),Object(f.jsx)(m.a,{progressDot:!0,direction:"vertical",children:Object.keys(e.policy).map((function(t,i){return e.policy[t].value!==e.policy[t].default?Object(f.jsx)(L,{status:"finish",title:e.policy[t].title,description:e.policy[t].summary.replace("@",e.policy[t].value)},t):null}))}),Object(f.jsxs)(A.a,{description:"",image:null,children:[Object(f.jsx)(E,{primary:!0,policy:e.policy,onClick:e.onSubmit,text:"Describe your situation"}),Object(f.jsx)("div",{style:{paddingTop:30}}),Object(f.jsx)(E,{text:"Simulate on the population",target:"/population-results",policy:e.policy,onClick:e.onSubmit})]})]})},M=function(e){Object(c.a)(i,e);var t=Object(u.a)(i);function i(e){var a;return Object(o.a)(this,i),(a=t.call(this,e)).state={policy:e.policy,selected:"main_rates"},a.updatePolicy=a.updatePolicy.bind(Object(v.a)(a)),a.selectPolicyMenuItem=a.selectPolicyMenuItem.bind(Object(v.a)(a)),a}return Object(r.a)(i,[{key:"selectPolicyMenuItem",value:function(e){this.setState({selected:e})}},{key:"updatePolicy",value:function(e,t){var i=this.state.policy;i[e].value=t,this.setState({policy:i})}},{key:"render",value:function(){var e=this;return Object(f.jsxs)(j.a,{children:[Object(f.jsx)(p.a,{xl:3,children:Object(f.jsx)(U,{onClick:this.selectPolicyMenuItem})}),Object(f.jsx)(p.a,{xl:6,children:Object(f.jsx)(N,{policy:this.state.policy,selected:this.state.selected,onChange:this.updatePolicy})}),Object(f.jsx)(p.a,{xl:3,children:Object(f.jsx)(D,{policy:this.state.policy,onSubmit:function(){e.props.onSubmit(e.state.policy)}})})]})}}]),i}(n.a.Component),K=i(2),V=T.a.SubMenu;var J=function(e){for(var t=[],i=0;i<e.household.families.length;i++){for(var a="family-".concat(i),n=[],s=0,l=0;l<e.household.families[i].people.length;l++){var o="family-".concat(i,"-person-").concat(l),r=e.household.families[i].people[l].age.value>=18,c=r?"Adult":"Child";r||s++;var u=r?l-s+1:s;n.push(Object(f.jsxs)(T.a.Item,{children:[c," ",u]},o))}t.push(Object(f.jsxs)(V,{title:1==e.household.families.length?"Family":"Family ".concat(i+1),children:[Object(f.jsx)(T.a.Item,{children:"Overview"},"family-".concat(i,"-overview")),n]},a))}return Object(f.jsxs)(T.a,{mode:"inline",onClick:function(t){return e.onSelect(t.key)},defaultOpenKeys:["family-0"],defaultSelectedKeys:["household"],children:[Object(f.jsx)(T.a.Item,{children:"Your household"},"household"),t]})},H={num_families:{title:"Number of families",description:"The number of nuclear families (benefit units) in the household. A family is at most two adults and any number of children. If you have more than two adults in the household, increase this beyond one",default:1,value:1,max:3}},Y={num_people:{title:"Number of people",description:"The number of people in the family",default:1,value:1,max:2}},W={age:{title:"Age",description:"The age of the person",default:18,value:18,max:80},employment_income:{title:"Employment income",description:"Income from employment (gross)",default:0,value:0,max:8e4},pension_income:{title:"Pension income",description:"Income from pensions (excluding the State Pension)",default:0,value:0,max:15e4},savings_interest_income:{title:"Savings interest income",description:"Income from savings interest (including ISAs)",default:0,value:0,max:5e3},dividend_income:{title:"Dividend income",description:"Income from dividends",default:0,value:0,max:5e3}},G=Object(K.a)(Object(K.a)({},H),{},{families:[Object(K.a)(Object(K.a)({},Y),{},{people:[W]})]});var R=function(e){var t=function(t,i){e.onEnter(t,i,e.selected)};if(e.selected.includes("person")){var i=+e.selected.split("-")[1],a=+e.selected.split("-")[3];return Object(f.jsx)(C,{onChange:t,policy:e.household.families[i].people[a],names:Object.keys(W)})}if(e.selected.includes("family")){var n=+e.selected.split("-")[1];return Object(f.jsx)(C,{onChange:t,policy:e.household.families[n],names:Object.keys(Y)})}return Object(f.jsx)(C,{onChange:t,policy:e.household,names:Object.keys(H)})},z=m.a.Step;var q=function(e){console.log(e.household);for(var t,i=e.household.families.length<2,a=0,n=0,s=0,l=0;l<e.household.families.length;l++)for(var o=0;o<e.household.families[l].people.length;o++)(t=e.household.families[l].people[o].age.value)<18?s++:t<65?n++:a++;return Object(f.jsxs)(f.Fragment,{children:[Object(f.jsx)(g.a,{children:"Your plan"}),Object(f.jsx)(m.a,{progressDot:!0,direction:"vertical",children:Object.keys(e.policy).map((function(t,i){return e.policy[t].value!==e.policy[t].default?Object(f.jsx)(z,{status:"finish",title:e.policy[t].title,description:e.policy[t].summary.replace("@",e.policy[t].value)},t):null}))}),Object(f.jsx)(g.a,{children:"Your situation"}),Object(f.jsx)(m.a,{progressDot:!0,direction:"vertical",children:Object(f.jsxs)(f.Fragment,{children:[Object(f.jsx)(z,{status:"finish",title:i?"Single-family household":"Multi-family household",description:"This affects benefit entitlements"}),Object(f.jsx)(z,{status:"finish",title:(0==n?"No ":n)+" working-age adult"+(1==n?"":"s")}),Object(f.jsx)(z,{status:"finish",title:(0==s?"No ":s)+" child"+(1==s?"":"ren")}),Object(f.jsx)(z,{status:"finish",title:(0==a?"No ":a)+" pensioner"+(1==a?"":"s")})]})}),e.noButton?Object(f.jsx)(f.Fragment,{}):Object(f.jsxs)(A.a,{description:"",image:null,children:[Object(f.jsx)(E,{primary:!0,text:"Simulate on the population",target:"/population-results",policy:e.policy,onClick:e.onSubmit}),Object(f.jsx)("div",{style:{paddingTop:30}}),Object(f.jsx)(E,{text:"Skip to your outcome",target:"/situation-results",policy:e.policy,onClick:e.onSubmit})]})]})},Q=function(e){Object(c.a)(i,e);var t=Object(u.a)(i);function i(e){var a;return Object(o.a)(this,i),(a=t.call(this,e)).state={household:a.props.situation.household,selected:"household"},a.updateSituation=a.updateSituation.bind(Object(v.a)(a)),a}return Object(r.a)(i,[{key:"updateSituation",value:function(e,t,i){var a=this.state.household;if(i.includes("family")){var n=+i.split("-")[1];if(i.includes("person")){var s=+i.split("-")[3];a.families[n].people[s][e].value=t}else a.families[n][e].value=t}else a[e].value=t;for(;a.num_families.value>a.families.length;)a.families.push(Object(K.a)(Object(K.a)({},JSON.parse(JSON.stringify(Y))),{},{people:[]}));for(;a.num_families.value<a.families.length;)a.families.pop();for(var l=0;l<a.families.length;l++){for(;a.families[l].num_people.value>a.families[l].people.length;)a.families[l].people.push(Object(K.a)({},JSON.parse(JSON.stringify(W))));for(;a.families[l].num_people.value<a.families[l].people.length;)a.families[l].people.pop()}this.setState({household:a})}},{key:"render",value:function(){var e=this;return Object(f.jsxs)(j.a,{children:[Object(f.jsx)(p.a,{xl:3,children:Object(f.jsx)(J,{household:this.state.household,onSelect:function(t){e.setState({selected:t})}})}),Object(f.jsx)(p.a,{xl:6,children:Object(f.jsx)(R,{selected:this.state.selected,household:this.state.household,onEnter:this.updateSituation})}),Object(f.jsx)(p.a,{xl:3,children:Object(f.jsx)(q,{policy:this.props.policy,household:this.state.household,onSubmit:function(){e.props.onSubmit({household:e.state.household})}})})]})}}]),i}(n.a.Component),X=i(177),Z=i(181),$=i(176),ee=i(81),te=i.n(ee),ie=i(74),ae=i(184),ne=i(185),se=Object(f.jsx)(ie.a,{style:{fontSize:24},spin:!0});function le(e){return Object(f.jsx)(p.a,{style:{padding:10,margin:10},children:Object(f.jsx)(X.a,{style:{minWidth:150},children:Object(f.jsx)(Z.a,{title:e.title,value:e.value,precision:e.precision,prefix:e.noArrow||e.nonNumeric?Object(f.jsx)(f.Fragment,{}):e.value>=0?Object(f.jsx)(f.Fragment,{children:Object(f.jsx)(ae.a,{})}):Object(f.jsx)(f.Fragment,{children:Object(f.jsx)(ne.a,{})}),suffix:e.suffix})})})}function oe(e){return Object(f.jsx)(p.a,{md:e.md?e.md:6,children:Object(f.jsx)(te.a,{data:e.plot.data,layout:e.plot.layout,config:{displayModeBar:!1},style:{width:"100%"}})})}function re(e){return Object(f.jsxs)(f.Fragment,{children:[Object(f.jsx)(g.a,{children:"Population results"}),Object(f.jsxs)(j.a,{children:[Object(f.jsx)(le,{title:"Net cost",value:e.results.net_cost,nonNumeric:!0}),Object(f.jsx)(le,{title:"Poverty rate change",value:100*e.results.poverty_change,precision:1,suffix:"%"}),Object(f.jsx)(le,{title:"Winner share",value:100*e.results.winner_share,precision:1,suffix:"%",noArrow:!0}),Object(f.jsx)(le,{title:"Loser share",value:100*e.results.loser_share,precision:1,suffix:"%",noArrow:!0}),Object(f.jsx)(le,{title:"Inequality",value:100*e.results.inequality_change,precision:1,suffix:"%"})]}),Object(f.jsx)(j.a,{children:Object(f.jsx)(oe,{plot:e.results.waterfall,md:12})}),Object(f.jsxs)(j.a,{children:[Object(f.jsx)(oe,{plot:e.results.decile_plot}),Object(f.jsx)(oe,{plot:e.results.poverty_plot}),Object(f.jsx)(oe,{plot:e.results.age}),Object(f.jsx)(oe,{plot:e.results.mtr_plot})]})]})}function ce(e){return Object(f.jsx)(A.a,{description:e.message,children:Object(f.jsx)($.a,{indicator:se})})}var ue=m.a.Step;var de=function(e){console.log(e.household);for(var t,i=e.household.families.length<2,a=0,n=0,s=0,l=0;l<e.household.families.length;l++)for(var o=0;o<e.household.families[l].people.length;o++)(t=e.household.families[l].people[o].age.value)<18?s++:t<65?n++:a++;return Object(f.jsxs)(f.Fragment,{children:[Object(f.jsx)(g.a,{children:"Your plan"}),Object(f.jsx)(m.a,{progressDot:!0,direction:"vertical",children:Object.keys(e.policy).map((function(t,i){return e.policy[t].value!==e.policy[t].default?Object(f.jsx)(ue,{status:"finish",title:e.policy[t].title,description:e.policy[t].summary.replace("@",e.policy[t].value)},t):null}))}),Object(f.jsx)(g.a,{children:"Your situation"}),Object(f.jsx)(m.a,{progressDot:!0,direction:"vertical",children:Object(f.jsxs)(f.Fragment,{children:[Object(f.jsx)(ue,{status:"finish",title:i?"Single-family household":"Multi-family household",description:"This affects benefit entitlements"}),Object(f.jsx)(ue,{status:"finish",title:(0==n?"No ":n)+" working-age adult"+(1==n?"":"s")}),Object(f.jsx)(ue,{status:"finish",title:(0==s?"No ":s)+" child"+(1==s?"":"ren")}),Object(f.jsx)(ue,{status:"finish",title:(0==a?"No ":a)+" pensioner"+(1==a?"":"s")})]})}),e.noButton?null:Object(f.jsx)(A.a,{description:"",image:null,children:Object(f.jsx)(E,{primary:!0,text:"See your results",target:"/situation-results",policy:e.policy,onClick:e.onSubmit})})]})},he=function(e){Object(c.a)(i,e);var t=Object(u.a)(i);function i(e){var a;return Object(o.a)(this,i),(a=t.call(this,e)).state={plan:a.props.policy,results:null,waiting:!1},a.simulate=a.simulate.bind(Object(v.a)(a)),a}return Object(r.a)(i,[{key:"componentDidMount",value:function(){this.simulate()}},{key:"simulate",value:function(){var e=this,t={};for(var i in this.state.plan)t[i]=this.state.plan[i].value;this.setState({waiting:!0},(function(){fetch("https://uk-policy-engine.uw.r.appspot.com/reform",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(t)}).then((function(e){return e.json()})).then((function(t){e.setState({results:t,waiting:!1})}))}))}},{key:"render",value:function(){return Object(f.jsxs)(j.a,{children:[Object(f.jsx)(p.a,{xl:9,children:this.state.results?Object(f.jsx)(re,{results:this.state.results}):Object(f.jsx)("div",{className:"d-flex justify-content-center align-items-center",style:{minHeight:400},children:Object(f.jsx)(ce,{message:"Simulating your results on the UK population"})})}),Object(f.jsx)(p.a,{xl:3,style:{paddingLeft:50},children:Object(f.jsx)(de,{policy:this.props.policy,household:this.props.situation.household})})]})}}]),i}(n.a.Component);ie.a;function je(e){var t=function(t){return(e.gbp?"\xa3":"")+t.toLocaleString(void 0,{minimumFractionDigits:2,maximumFractionDigits:2})},i=t(e.oldValue),a=t(e.newValue),n=null,s=e.newValue>e.oldValue,l=e.newValue<e.oldValue,o="black";return s?(o="green",n=Object(f.jsx)(ae.a,{style:{color:o}})):l&&(o="red",n=Object(f.jsx)(ne.a,{style:{color:o}})),Object(f.jsx)(p.a,{style:{padding:10,margin:10},children:Object(f.jsx)(X.a,{style:{minWidth:300},children:Object(f.jsx)(Z.a,{title:e.title,value:[i,a,e.oldValue,e.newValue],formatter:function(e){return e[0]!==e[1]?Object(f.jsxs)(f.Fragment,{children:[Object(f.jsx)("s",{style:{color:"grey"},children:e[0]}),Object(f.jsx)("br",{}),Object(f.jsxs)("div",{style:{color:o},children:[e[1],Object(f.jsx)("br",{}),"(",n,t(e[3]-e[2]),")"]})]}):e[0]},suffix:e.suffix})})})}function pe(e){return Object(f.jsxs)(f.Fragment,{children:[Object(f.jsx)(p.a,{md:3}),Object(f.jsx)(p.a,{md:6,children:Object(f.jsx)(te.a,{data:e.plot.data,layout:e.plot.layout,config:{displayModeBar:!1},frames:e.plot.frames,style:{width:"100%"}})})]})}function me(e){for(var t=["Tax","Income Tax","National Insurance","Universal Credit","Benefits","Household disposable income"],i=["tax","income_tax","national_insurance","universal_credit","benefits","household_net_income"],a=[],n=0;n<i.length;n++)a.push(Object(f.jsx)(je,{title:t[n],oldValue:e.results[i[n]].old,newValue:e.results[i[n]].new,gbp:!0},n));return Object(f.jsxs)(f.Fragment,{children:[Object(f.jsx)(g.a,{children:"Your situation results"}),Object(f.jsx)(j.a,{children:a}),Object(f.jsx)(j.a,{children:Object(f.jsx)(pe,{plot:e.results.waterfall_chart})}),Object(f.jsx)(j.a,{children:Object(f.jsx)(pe,{plot:e.results.budget_chart})}),Object(f.jsx)(j.a,{children:Object(f.jsx)(pe,{plot:e.results.mtr_chart})})]})}var be=function(e){Object(c.a)(i,e);var t=Object(u.a)(i);function i(e){var a;return Object(o.a)(this,i),(a=t.call(this,e)).state={plan:a.props.policy,situation:a.props.situation,results:null,waiting:!1},a}return Object(r.a)(i,[{key:"componentDidMount",value:function(){this.simulate()}},{key:"simulate",value:function(){var e=this,t={};for(var i in this.state.plan)t[i]=this.state.plan[i].value;t.situation=this.state.situation,this.setState({waiting:!0},(function(){fetch("https://uk-policy-engine.uw.r.appspot.com/situation-reform",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(t)}).then((function(e){return e.json()})).then((function(t){e.setState({results:t,waiting:!1})}))}))}},{key:"render",value:function(){return Object(f.jsxs)(j.a,{children:[Object(f.jsx)(p.a,{xl:9,children:this.state.results?Object(f.jsx)(me,{results:this.state.results}):Object(f.jsx)("div",{className:"d-flex justify-content-center align-items-center",style:{minHeight:400},children:Object(f.jsx)(ce,{message:"Simulating policy on your situation"})})}),Object(f.jsx)(p.a,{xl:3,style:{paddingLeft:50},children:Object(f.jsx)(de,{policy:this.props.policy,household:this.props.situation.household,noButton:!0})})]})}}]),i}(n.a.Component),fe=i(23),ye=i(130),xe=i.n(ye),Oe={basic_rate:{title:"Basic rate",description:"The basic rate is the first of three tax brackets on all income, after allowances are deducted.",default:20,value:20,summary:"Change the basic rate to @%",type:"rate"},higher_rate:{title:"Higher rate",description:"The higher rate is the middle tax bracket.",default:40,value:40,summary:"Change the higher rate to @%",type:"rate"},add_rate:{title:"Additional rate",description:"The additional rate is the highest tax bracket, with no upper bound.",default:45,value:45,summary:"Change the additional rate to @%",type:"rate"},basic_threshold:{title:"Basic rate threshold",description:"Lower threshold for the basic rate, on income after allowances (including the personal allowance) have been deducted.",default:0,value:0,max:1e5,summary:"Change the basic rate to \xa3@/year",type:"yearly"},higher_threshold:{title:"Higher rate threshold",description:"The lower threshold for the higher rate of income tax (and therefore the upper threshold of the basic rate).",default:37500,value:37500,max:2e5,summary:"Change the higher rate to \xa3@/year",type:"yearly"},add_threshold:{title:"Additional rate",description:"The lower threshold for the additional rate.",default:15e4,value:15e4,max:1e6,summary:"Change the additional rate to \xa3@/year",type:"yearly"},personal_allowance:{title:"Personal allowance",description:"The personal allowance is deducted from general income.",default:12500,value:12500,max:25e3,summary:"Change the personal allowance to \xa3@/year",type:"yearly"},NI_main_rate:{title:"NI main rate",description:"The Class 1 NI main rate is paid on employment earnings between the Primary Threshold and the Upper Earnings Limit.",default:12,value:12,summary:"Change the NI main rate to @%",type:"rate"},NI_add_rate:{title:"NI additional rate",description:"The Class 1 NI additional rate is paid on employment earnings above the Upper Earnings Limit.",default:2,value:2,summary:"Change the NI additional rate to @%",type:"rate"},NI_PT:{title:"NI Primary Threshold",description:"The Primary Threshold is the lower bound for the main rate of NI.",default:183,value:183,max:1e3,summary:"Change the PT to \xa3@/week",type:"weekly"},NI_UEL:{title:"NI Upper Earnings Limit",description:"The Upper Earnings Limit is the upper bound for the main rate of NI.",default:962,value:962,max:1e4,summary:"Change the UEL to \xa3@/week",type:"weekly"},child_UBI:{title:"Child UBI",description:"A basic income for children is given to every child aged under 18, regardless of household income.",default:0,value:0,max:250,summary:"Give a basic income of \xa3@/week to children",type:"weekly"},adult_UBI:{title:"Adult UBI",description:"Basic income for adults is given to individuals aged over 18 but under State Pension age.",default:0,value:0,max:250,summary:"Give a basic income of \xa3@/week to adults",type:"weekly"},senior_UBI:{title:"Senior UBI",description:"A basic income for senior citizens is given to those over State Pension age.",default:0,value:0,max:250,summary:"Give a basic income of \xa3@/week to seniors",type:"weekly"},abolish_savings_allowance:{title:"Personal Savings Allowance",description:"The Personal Savings Allowance is the amount of taxable savings interest income disregarded for Income Tax purposes. It has different values at different Income Tax bands - this switch abolishes all of them.",default:!1,value:!1,summary:"Abolish the Personal Savings Allowance",type:"bool"},abolish_dividend_allowance:{title:"Dividend Allowance",description:"The Dividend Allowance disregards up to \xa32,000 of taxable dividend income per year. This switch abolishes it.",default:!1,value:!1,summary:"Abolish the Dividend Allowance",type:"bool"},abolish_income_tax:{title:"Income Tax",description:"Income Tax raises over \xa3190bn per year. This switch abolishes it.",default:!1,value:!1,summary:"Abolish Income Tax",type:"bool"},abolish_NI:{title:"National Insurance",description:"This switch abolishes National Insurance.",default:!1,value:!1,summary:"Abolish National Insurance",type:"bool"},abolish_UC:{title:"Abolish Universal Credit",description:"Universal Credit is the main means-tested benefit, currently being rolled out across the country.",default:!1,value:!1,summary:"Abolish Universal Credit",type:"bool"},abolish_CB:{title:"Abolish Child Benefit",description:"Child Benefit is a universal allowance to parents of children, with a means test embedded in Income Tax.",default:!1,value:!1,summary:"Abolish Child Benefit",type:"bool"}};function ve(){var e=Oe;if(document.location.hash.includes("?")){var t,i=new URLSearchParams(document.location.hash.toString().slice(document.location.hash.indexOf("?"))),a=Object(d.a)(i.keys());try{for(a.s();!(t=a.n()).done;){var n=t.value;e[n].value=+i.get(n)}}catch(s){a.e(s)}finally{a.f()}}return e}var ge=function(e){Object(c.a)(i,e);var t=Object(u.a)(i);function i(e){var a;return Object(o.a)(this,i),(a=t.call(this,e)).state={policy:ve(),situation:{household:G}},a}return Object(r.a)(i,[{key:"render",value:function(){var e=this;return Object(f.jsx)(F.HashRouter,{basename:"/",children:Object(f.jsx)(xe.a,{id:"G-QL2XFHB7B4",children:Object(f.jsx)(h.a,{fluid:!0,style:{paddingBottom:50},children:Object(f.jsxs)(fe.g,{children:[Object(f.jsxs)(fe.d,{path:"/",exact:!0,children:[Object(f.jsx)(O,{step:0}),Object(f.jsx)(M,{policy:this.state.policy,onSubmit:function(t){e.setState({policy:t})}})]}),Object(f.jsxs)(fe.d,{path:"/situation",children:[Object(f.jsx)(O,{step:1}),Object(f.jsx)(Q,{policy:this.state.policy,onSubmit:function(t){e.setState({situation:t})},situation:this.state.situation})]}),Object(f.jsxs)(fe.d,{path:"/population-results",children:[Object(f.jsx)(O,{step:2}),Object(f.jsx)(he,{policy:this.state.policy,situation:this.state.situation})]}),Object(f.jsxs)(fe.d,{path:"/situation-results",children:[Object(f.jsx)(O,{step:3}),Object(f.jsx)(be,{policy:this.state.policy,situation:this.state.situation})]})]})})})})}}]),i}(n.a.Component);l.a.render(Object(f.jsx)(ge,{}),document.getElementById("root"))}},[[170,1,2]]]);
//# sourceMappingURL=main.55dc7a11.chunk.js.map