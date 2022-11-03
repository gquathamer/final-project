import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

export default class LogInForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      validated: false,
      usernameError: '',
      passwordError: ''
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    if (event.target.name === 'username') {
      this.setState({
        username: event.target.value
      });
    } else {
      this.setState({
        password: event.target.value
      });
    }
  }

  handleSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;

    const { username, password } = this.state;

    const data = {
      username,
      password
    };

    fetch('/api/auth/log-in', {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(data)
    })
      .then(response => {})
      .catch(err => console.error(err));
    form.reset();
  }

  render() {

    return (
      <Container fluid="md" className="mt-5">
        <Row className="justify-content-center">
          <Col md={6} sm={9}>
            <Form onSubmit={this.handleSubmit} className="border border-dark rounded p-3">
              <h2 className="text-center">Log In!</h2>
              <Form.Group className="mb-3" controlId="formUsername">
                <Form.Label>Username:</Form.Label>
                <Form.Control type="text" name="username" value={this.state.username} onChange={this.handleChange} placeholder="Username" required />
                <Form.Control.Feedback type="invalid">
                  {this.state.usernameError}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Password:</Form.Label>
                <Form.Control type="password" name="password" value={this.state.password} onChange={this.handleChange} placeholder="Password" required />
                <Form.Control.Feedback type="invalid">
                  {this.state.passwordError}
                </Form.Control.Feedback>
              </Form.Group>
              <Button className="red-color" type="submit">
                Sign Up
              </Button>
            </Form>
          </Col>
        </Row>
      </Container>
    );
  }
}