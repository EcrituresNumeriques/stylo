import React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import store from './store/configureStore';
import { BrowserRouter} from 'react-router-dom';
import App from './components/App/App.jsx';
import './styles/app.scss';
require('./favicon.ico'); // Tell webpack to load favicon.ico

let renderApp = function(){
  render(
    <AppContainer>
      <BrowserRouter>
        <App/>
      </BrowserRouter>
    </AppContainer>,
    document.getElementById('app')
  );
};
renderApp();

if (module.hot) {
  module.hot.accept('./components/App/App', () => {
    const NewApp = require('./components/App/App').default;
    renderApp = function(){
      render(
        <AppContainer>
            <BrowserRouter>
              <NewApp/>
            </BrowserRouter>
        </AppContainer>,
        document.getElementById('app')
      );
    };
  });
}
renderApp();
store.subscribe(renderApp);
