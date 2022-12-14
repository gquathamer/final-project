import React from 'react';
import Navigation from '../components/navbar';
import Oddsbar from '../components/odds-bar';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import AppContext from '../lib/app-context';
import Redirect from '../components/redirect';
import InputGroup from 'react-bootstrap/InputGroup';

export default class HomePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      odds: [],
      gameId: '',
      winningTeam: '',
      show: false,
      potentialWinnings: 0,
      betOdds: 0,
      betAmount: 1,
      betType: '',
      betPoints: 0,
      dateTime: ''
    };
    this.fetchOddsData = this.fetchOddsData.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.toggleShow = this.toggleShow.bind(this);
    this.handleBetAmountChange = this.handleBetAmountChange.bind(this);
    this.calculatePotentialWinnings = this.calculatePotentialWinnings.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  toggleShow() {
    this.setState({
      show: !this.state.show,
      betAmount: 1
    });
  }

  componentDidMount() {
    this.fetchOddsData(this.props.sport);
  }

  componentDidUpdate(prevProp) {
    if (this.props.sport !== prevProp.sport) {
      this.fetchOddsData(this.props.sport);
    }
  }

  fetchOddsData(sport) {
    fetch(`https://api.the-odds-api.com/v4/sports/${sport}/odds?apiKey=${process.env.API_KEY}&regions=us&oddsFormat=american&markets=h2h,spreads,totals&bookmakers=bovada`)
      .then(response => response.json())
      .then(response => {
        const games = [];
        for (let i = 0; i < response.length; i++) {
          const gameObject = {};
          gameObject.homeTeam = response[i].home_team;
          gameObject.awayTeam = response[i].away_team;
          gameObject.startTime = new Date(response[i].commence_time);
          gameObject.id = response[i].id;
          if (!response[i].bookmakers[0]) {
            continue;
          }
          const odds = response[i].bookmakers[0].markets;
          for (let j = 0; j < odds.length; j++) {
            if (odds[j].key === 'spreads') {
              gameObject.spreads = [];
              if (odds[j].outcomes[0].name === gameObject.awayTeam) {
                gameObject.spreads.push(odds[j].outcomes[0]);
                gameObject.spreads.push(odds[j].outcomes[1]);
              } else {
                gameObject.spreads.push(odds[j].outcomes[1]);
                gameObject.spreads.push(odds[j].outcomes[0]);
              }
            } else if (odds[j].key === 'h2h') {
              gameObject.h2h = [];
              if (odds[j].outcomes[0].name === gameObject.awayTeam) {
                gameObject.h2h.push(odds[j].outcomes[0]);
                gameObject.h2h.push(odds[j].outcomes[1]);
              } else {
                gameObject.h2h.push(odds[j].outcomes[1]);
                gameObject.h2h.push(odds[j].outcomes[0]);
              }
            } else if (odds[j].key === 'totals') {
              gameObject.totals = [];
              if (odds[j].outcomes[0].name === 'Over') {
                gameObject.totals.push(odds[j].outcomes[0]);
                gameObject.totals.push(odds[j].outcomes[1]);
              } else {
                gameObject.totals.push(odds[j].outcomes[1]);
                gameObject.totals.push(odds[j].outcomes[0]);
              }
            }
          }
          if (!gameObject.spreads) {
            gameObject.spreads = [];
            gameObject.spreads.push({ name: 'N/A', price: 'N/A', point: 'N/A' });
            gameObject.spreads.push({ name: 'N/A', price: 'N/A', point: 'N/A' });
          }
          if (!gameObject.h2h) {
            gameObject.h2h = [];
            gameObject.h2h.push({ name: 'N/A', price: 'N/A' });
            gameObject.h2h.push({ name: 'N/A', price: 'N/A' });
          }
          if (!gameObject.totals) {
            gameObject.totals = [];
            gameObject.totals.push({ name: 'Under', price: 'N/A', point: 'N/A' });
            gameObject.totals.push({ name: 'Over', price: 'N/A', point: 'N/A' });
          }
          games.push(gameObject);
        }
        return games;
      })
      .then(response => {
        this.setState({
          odds: response
        });
      });
  }

  handleClick(event) {
    // event.preventDefault();
    // console.log(odds);
    let betType;
    let betOdds;
    let winningTeam;
    let betPoints;
    const gameObject = this.state.odds.find(elem => elem.id === event.currentTarget.id);
    if (event.target.classList.contains('spread')) {
      betType = 'spread';
      betOdds = parseInt(event.target.textContent.split('(')[1].split(')')[0]);
      event.target.classList.contains('home') ? winningTeam = gameObject.homeTeam : winningTeam = gameObject.awayTeam;
      betPoints = parseInt(gameObject.spreads.find(elem => elem.name === winningTeam).point);
    } else if (event.target.classList.contains('moneyline')) {
      betType = 'moneyline';
      betOdds = parseInt(event.target.textContent);
      event.target.classList.contains('home') ? winningTeam = gameObject.homeTeam : winningTeam = gameObject.awayTeam;
    } else if (event.target.classList.contains('total')) {
      betType = 'total';
      betOdds = parseInt(event.target.textContent.split('(')[1].split(')')[0]);
      event.target.classList.contains('over') ? winningTeam = 'Over' : winningTeam = 'Under';
      betPoints = parseInt(gameObject.totals.find(elem => elem.name === winningTeam).point);
    } else {
      return;
    }
    const dateTime = event.currentTarget.childNodes[1].childNodes[0].childNodes[0].textContent;
    this.setState({
      betOdds,
      show: true,
      gameId: event.currentTarget.id,
      winningTeam,
      homeTeam: gameObject.homeTeam,
      awayTeam: gameObject.awayTeam,
      betPoints,
      betType,
      dateTime,
      potentialWinnings: this.calculatePotentialWinnings(this.state.betAmount, betOdds)
    });
    this.toggleShow();
  }

  handleBetAmountChange(event) {
    this.setState({
      betAmount: event.target.value,
      show: true,
      potentialWinnings: this.calculatePotentialWinnings(event.target.value, this.state.betOdds)
    });
  }

  calculatePotentialWinnings(betAmount, odds) {
    let potentialWinnings = 0;
    if (Math.sign(odds) === -1) {
      potentialWinnings = 100 / (odds * -1) * betAmount;
    } else {
      potentialWinnings = odds / 100 * betAmount;
    }
    return potentialWinnings;
  }

  handleSubmit(event) {
    event.preventDefault();
    const data = this.state;
    data.userId = this.context.user.userId;
    fetch('/api/place-bet', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-access-token': this.context.token
      },
      body: JSON.stringify(data)
    })
      .then(response => {
        if (response.status === 201) {
          this.toggleShow();
        }
      })
      .catch(err => console.error(err));
  }

  render() {
    if (!this.context.user) return <Redirect to='log-in' />;
    if (this.state.odds.length < 1) {
      return (
        <>
          <Navigation />
          <Oddsbar />
          <Container>
            <h1 className='text-center mt-5'>This sport is out of season!</h1>
          </Container>
        </>
      );
    }
    return (
      <>
        <Navigation />
        <Oddsbar />
        <Container fluid="md" className="mt-5">
          {
            this.state.odds.map(elem => {
              return (
                <Row key={elem.id} className="justify-content-center">
                  <Table onClick={e => this.handleClick(e)} bordered className='table' key={elem.id} id={elem.id}>
                    <thead>
                      <tr className="td-no-wrap td-quarter">
                        <th />
                        <th>Team</th>
                        <th>Spread</th>
                        <th>Line</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className='td-no-wrap td-quarter'>
                        <td rowSpan="2" className="align-middle text-center">{elem.startTime.toLocaleDateString()}<br />{elem.startTime.toLocaleTimeString()}</td>
                        <td>{elem.awayTeam}</td>
                        <td className="cursor-pointer spread away">{elem.spreads[0].point} ({elem.spreads[0].price})</td>
                        <td className="cursor-pointer moneyline away">{elem.h2h[0].price}</td>
                        <td className="cursor-pointer total over">O{elem.totals[0].point} ({elem.totals[0].price})</td>
                      </tr>
                      <tr className='td-no-wrap td-quarter'>
                        <td>{elem.homeTeam}</td>
                        <td className="cursor-pointer spread home">{elem.spreads[1].point} ({elem.spreads[1].price})</td>
                        <td className="cursor-pointer moneyline home">{elem.h2h[1].price}</td>
                        <td className="cursor-pointer total under">U{elem.totals[1].point} ({elem.totals[1].price})</td>
                      </tr>
                    </tbody>
                  </Table>
                </Row>
              );
            })
          }
        </Container>
        <Modal show={this.state.show} onHide={this.toggleShow}>
          <Modal.Header closeButton>
            <Modal.Title>Place Bet</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={this.handleSubmit}>
              <p>{this.state.awayTeam} @ {this.state.homeTeam}</p>
              <p>{this.state.dateTime}</p>
              <Form.Group className="mb-3" controlId="betAmount">
                <Form.Label>Bet Amount</Form.Label>
                <InputGroup>
                  <InputGroup.Text>$</InputGroup.Text>
                  <Form.Control
                    type="text"
                    autoFocus
                    onChange={this.handleBetAmountChange}
                    value={this.state.betAmount}
                  />
                </InputGroup>
              </Form.Group>
              <Form.Group className="mb-3" controlId="potentialEarnings">
                <Form.Label>Winnings</Form.Label>
                <Form.Control
                  type="text"
                  value={new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(this.state.potentialWinnings)}
                  disabled
                />
              </Form.Group>
              <Button variant="primary" type="submit" className="red-color">
                Submit
              </Button>
            </Form>
          </Modal.Body>
        </Modal>
      </>
    );
  }
}

HomePage.contextType = AppContext;
