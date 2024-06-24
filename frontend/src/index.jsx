import { ApolloClient, ApolloProvider, InMemoryCache, } from '@apollo/client';
import { ThemeProvider } from '@material-tailwind/react';
import React from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';


const SERVICE_URL = process.env.REACT_APP_BACKEND_SERVICE_URL;

const client = new ApolloClient({
  uri: `${SERVICE_URL}/graphql`,
  cache: new InMemoryCache()
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ApolloProvider client={client}>
    <ThemeProvider>
      <DragDropContext>
        <App/>
      </DragDropContext>
    </ThemeProvider>
  </ApolloProvider>,
);


