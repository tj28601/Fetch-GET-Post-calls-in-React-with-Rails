## Learning Objectives

* Fetch data from a Rails API endpoint via Fetch API in React.

## Following Along
The repository we are working with can be retrieved using et. To get
quickly set up, do the following:

* Et get the repository, install the necessary gems, set up
    the database, and run the rails server.

    ```sh
    et get fetch-in-a-react-application-within-rails
    cd fetch-in-a-react-application-within-rails
    bundle install
    bundle exec rake db:create
    bundle exec rake db:migrate
    bundle exec rake db:seed
    bundle exec rails server -b 0.0.0.0
    ```

* In another tab, install the necessary NPM packages and run your Webpack Dev Server

    ```sh
    npm install
    npm start
    ```

## Fetch GET calls in React

We have written the following `Fortune` component in `app/javascript/components/Fortune.js`:

```javascript
import React, { Component } from 'react';

class Fortune extends Component {
  constructor(props) {
    super(props);
    this.state = { fortune: '' };
  }

  render() {
    return (
      <h1>Your Fortune: {this.state.fortune}</h1>
    );
  }
}

export default Fortune;
```

Our Rails application displays this component at our root index. If we visit the
page, we see the following:

![Fetch in Rails React 1][fetch-in-rails-react-1]

We have also built the following API endpoint in our Rails application that
returns a random fortune:

```ruby
#app/controllers/api/fortunes_controller.rb
class Api::FortunesController < ApiController
  def show
    render json: { fortune: Fortune.all.sample }
  end
end
```

We can test the API endpoint by running:

```sh
$ curl localhost:3000/api/fortune
```

And we get back a JSON formatted response of a random fortune:

```sh
{"fortune":{"id":29,"text":"Keep it short for pithy sake."}}
```

We would like our component to display a random fortune from the API. We can
accomplish this by calling fetch once the component mounts and setting the new
state with the returned fortune if the fetch response is successful. We update
our component as such:

```javascript
import React, { Component } from 'react';

class Fortune extends Component {
  constructor(props) {
    super(props);
    this.state = { fortune: '' };
  }

  componentDidMount() {
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

  render() {
    return (
      <h1>Your Fortune: {this.state.fortune}</h1>
    );
  }
}

export default Fortune;

```

If we visit our root path again, we now see the following:

![Fetch in Rails React 2][fetch-in-rails-react-2]

You may however get a different fortune due to the fortunes now appearing randomly.

We use the lifecycle method `componentDidMount` to check if the Fortune component appears on the page, even if it set to have an empty fortune due to the initial state of the Fortune Component. Once the component mounts, the lifecycle method runs, calling fetch to our rails endpoint which will retrieve a random fortune as JSON. We then parse that JSON, use setState to set the state of our Fortune component to the newly retrieved fortune from our api, and finally trigger a re-render so that our newly updated Fortune Component displays on the page with the retrieved fortune!

Recall that our fetch includes error handling, which will allow the application to return any errors to the browser's console if anything goes wrong, such as receiving a 500 error if a bug exists in the rails code.

### Retrieving more Fortunes using Fetch

Receiving a random fortune when the page loads is nice, but it would be nicer if we added a button that we could click to retrieve a new fortune. Fortunately, we do not need to create a new Rails API endpoint to retrieve the new random fortune; we already have `localhost:3000/api/fortune`. Therefore, we only need to incorporate the button within React.

Let's create our button in our render function in `app/javascript/components/Fortune.js` as well as a `handleClick` function that will essentially make the same fetch call as our `componentDidMount` method:

```javascript
import React, { Component } from 'react';

class Fortune extends Component {
  constructor(props) {
    super(props);
    this.state = { fortune: '' };
    this.handleClick = this.handleClick.bind(this)
  }

  handleClick() {
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

  componentDidMount() {
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

  render() {
    return (
      <div>
        <h1>Your Fortune: {this.state.fortune}</h1>
        <button onClick={this.handleClick}> Get another fortune </button>
      </div>
    );
  }
}

export default Fortune;

```

Because we're making the same fetch call twice, we can refactor our code in `componentDidMount` and `handleClick` into a single method:

```javascript
import React, { Component } from 'react';

class Fortune extends Component {
  constructor(props) {
    super(props);
    this.state = { fortune: '' };
    this.handleClick = this.handleClick.bind(this);
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

  render() {
    return (
      <div>
        <h1>Your Fortune: {this.state.fortune}</h1>
        <button onClick={this.handleClick}> Get another fortune </button>
      </div>
    );
  }
}

export default Fortune;

```

Now if we visit the page we should see the following:

![Fetch in Rails React 3][fetch-in-rails-react-3]

## POST in React using Fetch

We can also use `fetch` to post information. Let's set up our React application to incorporate a form:

```javascript
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
```

Now the only thing left to do is create a controller action to process the posting of the form:

```ruby
#app/controllers/api/fortunes_controller.rb
class Api::FortunesController < ApiController
  protect_from_forgery unless: -> { request.format.json? }

  def show
    render json: { fortune: Fortune.all.sample }
  end

  def create
    fortune = Fortune.new(text: params[:fortune])
    if fortune.save
      render json: { fortune: fortune }
    else
      render json: { error: fortune.errors.full_messages }, status: :unprocessable_entity
    end
  end
end
```

Now we have the ability to see the form:

![Fetch in Rails React 4][fetch-in-rails-react-4]

Fill out the form:

![Fetch in Rails React 5][fetch-in-rails-react-5]

And see our newly created fortune:

![Fetch in Rails React 6][fetch-in-rails-react-6]

We can even check the last fortune to see if it matches our newly created fortune:

```sh
$ bundle exec rails console
$ Fortune.last
# => #<Fortune:0x007f9502fc7170 id: 46, text: "Hey I'm a new Fortune">
```

### Key differences between Fetch GET and Fetch POST

- Fetch by default will perform an HTTP GET request, so the `handleSubmit` fetch call will take in a set of parameters, including the HTTP method.

- The other parameters include the content type to specify that the data being posted is in a JSON format, the body which is set to the data being posted, and finally the credentials. Because we are manipulating data in our database, we must specify that the fetch call is coming from the same origin as our rails application.

- The create action in our Rails controller requires the `protect_from_forgery unless: -> { request.format.json? }` for our create action in order to successfully access the data sent with the fetch request.

- Finally, we set the state of our fortune to the newly created fortune. We could use our `newFortune` piece of state to do so, but the response from the controller will match the exact format of a GET fetch call, so consistency is a nonissue.

## Summary
In a React application set up within a Rails application, we are able to fetch
data from a Rails API endpoint for the React application. We accomplish this
through the use of Fetch API and React component lifecycle methods. With such
knowledge, we are now able to leverage both the power of a Rails back-end and
the responsiveness of a React front-end in our website!

[fetch-in-rails-react-1]: https://s3.amazonaws.com/horizon-production/images/fetch-in-rails-react-1.png
[fetch-in-rails-react-2]: https://s3.amazonaws.com/horizon-production/images/fetch-in-rails-react-2.png
[fetch-in-rails-react-3]: https://s3.amazonaws.com/horizon-production/images/fetch-in-rails-react-3.png
[fetch-in-rails-react-4]: https://s3.amazonaws.com/horizon-production/images/fetch-in-rails-react-4.png
[fetch-in-rails-react-5]: https://s3.amazonaws.com/horizon-production/images/fetch-in-rails-react-5.png
[fetch-in-rails-react-6]: https://s3.amazonaws.com/horizon-production/images/fetch-in-rails-react-6.png
