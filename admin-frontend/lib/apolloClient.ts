import { ApolloClient, InMemoryCache, createHttpLink, split } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_API_URL || 'http://localhost:5001/graphql',
});

const wsLink = typeof window !== 'undefined' ? new GraphQLWsLink(createClient({
  url: process.env.NEXT_PUBLIC_GRAPHQL_WS_URL || 'ws://localhost:5001/graphql',
  connectionParams: () => {
    const token = localStorage.getItem('token');
    return {
      authorization: token ? `Bearer ${token}` : '',
    };
  },
})) : null;

const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  const token = localStorage.getItem('token');
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const splitLink = typeof window !== 'undefined' && wsLink != null
  ? split(
      ({ query }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === 'OperationDefinition' &&
          definition.operation === 'subscription'
        );
      },
      wsLink,
      authLink.concat(httpLink)
    )
  : authLink.concat(httpLink);

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});

export default client; 