import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import configureStore, { history } from './store/configureStore';
import { BrowserRouter} from 'react-router-dom'
import App from './components/App/App.jsx';
import './styles/app.scss';
require('./favicon.ico'); // Tell webpack to load favicon.ico
const store = configureStore();

render(
  <AppContainer>
    <BrowserRouter>
      <App/>
    </BrowserRouter>
  </AppContainer>,
  document.getElementById('app')
);

if (module.hot) {
  module.hot.accept('./components/App/App', () => {
    const NewApp = require('./components/App/App').default;
    render(
      <AppContainer>
          <BrowserRouter>
            <NewApp/>
          </BrowserRouter>
      </AppContainer>,
      document.getElementById('app')
    );
  });
}
