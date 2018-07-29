import React, { Component } from 'react';

class Fortune extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fortune: '',
      newFortune: ''
    };
    this.handleClick = this.handleClick.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  getFortune() {
    fetch('/api/fortune.json')
      .then(response => {
        if (response.ok) {
          return response;
        } else {
          let errorMessage = `${response.status} (${response.statusText})`,
              error = new Error(errorMessage);
          throw(error);
        }
      })
      .then(response => response.json())
      .then(body => {
        this.setState({ fortune: body.fortune.text });
      })
      .catch(error => console.error(`Error in fetch: ${error.message}`));
  }

  handleClick() {
    this.getFortune()
  }

  componentDidMount() {
    this.getFortune()
  }

  handleChange(event) {
    this.setState({newFortune: event.target.value})
  }

  handleSubmit(event) {
    event.preventDefault();
    let formPayload = {
      fortune: this.state.newFortune
    };
    fetch('/api/fortune', {
      credentials: 'same-origin',
      method: 'POST',
      body: JSON.stringify(formPayload),
      headers: { 'Content-Type': 'application/json' }
    })
      .then(response => {
        if (response.ok) {
          return response;
        } else {
          let errorMessage = `${response.status} (${response.statusText})`,
              error = new Error(errorMessage);
          throw(error);
        }
      })
      .then(response => response.json())
      .then(body => {
        this.setState({ fortune: body.fortune.text,
        newFortune: '' });
      })
      .catch(error => console.error(`Error in fetch: ${error.message}`));
  }

  render() {
    return (
      <div>
        <h1>Your Fortune: {this.state.fortune}</h1>
        <button onClick={this.handleClick}> Get another fortune </button>
        <form onSubmit={this.handleSubmit}>
          <label>New Fortune:</label>
          <input type="text" value={this.state.newFortune} onChange={this.handleChange} />
          <input type="submit" value="Submit"/>
        </form>
      </div>
    );
  }
}

export default Fortune;
