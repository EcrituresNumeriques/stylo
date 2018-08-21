import React, { Component } from 'react';
import Users from './users/Users.jsx'
import Articles from './articles/Articles.jsx'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default class Admin extends Component {
  constructor(props) {
    super(props);
    this.byMonth = this.byMonth.bind(this);
    this.state = {labels:this.generateLabels(), waitingFor:2};
  }

  generateLabels(){
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = parseInt(new Date().getMonth());
    let labels = []
    for(let i=now+1;i<now+13;i++){
      labels.push({name:months[i%12]});
    }
    return labels;
  }

  byMonth(set,target){
    const now = {month:parseInt(new Date().getMonth()),year:parseInt(new Date().getFullYear())};
    //Create new array with 12 elements (one for each passed month)
    let dataSet = [0,0,0,0,0,0,0,0,0,0,0,0];
    for(let i=0;i<set.length;i++){
      //Need to compute distance from now
      let element = set[i].substring(0,7).split("-");
      let distance = (now.month + 1 - parseInt(element[1])) + (now.year - parseInt(element[0]))*12;
      if(distance < 11){
        dataSet[11 - distance]++;
      }
    }
    this.setState(function(state){
      for(let i=0;i<dataSet.length;i++){
        state.labels[i][target]=dataSet[i];
      }
      state.waitingFor--;
      return state;
    })
  }


  render() {
    return(
        [
        <h1 key="title">Administration</h1>,
        <section key="chart" >
          {this.state.waitingFor===0 &&
            <ResponsiveContainer width="100%" height={200}>
              <LineChart width={600} height={200} data={this.state.labels} margin={{ top: 5, right: 60, bottom: 5, left: 0 }}>
                <XAxis dataKey="name"/>
                <YAxis/>
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="users" stroke="#8884d8" />
                <Line type="monotone" dataKey="articles" stroke="#303030" />
              </LineChart>
          </ResponsiveContainer>}
        </section>,
        <Users key="users" updateChart={this.byMonth}/>,
        <Articles key="articles" updateChart={this.byMonth}/>
        ]
    );
  }
}
