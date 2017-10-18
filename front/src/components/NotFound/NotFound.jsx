import React, { Component } from 'react';
import { Link,withRouter } from 'react-router-dom';


class NotFound extends Component {
  constructor(props) {
    super(props);
    console.log('construct');
    this.checkLogedIn();
  }
  checkLogedIn(){
    this.props.history.push("/login");
  }
  componentDidUpdate(){
    console.log("update")
  }

  render() {
    return (
      <section>
        <h2 ref="title">Status Check</h2>
      </section>
    );
  }
}
export default withRouter(NotFound);
