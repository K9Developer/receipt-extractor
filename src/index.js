import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { render } from 'react-dom';

import App from './App';

const rootElement = document.getElementById('root');

render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
  rootElement
);