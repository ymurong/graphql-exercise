const { ApolloServer } = require('apollo-server')
const typeDefs = require('./typedefs')
const resolvers = require('./resolvers')
const { FormatDateDirective, AuthenticationDirective, AuthorizationDirective } = require('./directives')
const { createToken, getUserFromToken } = require('./auth')
const db = require('./db')

const server = new ApolloServer({
  typeDefs,
  resolvers,
  schemaDirectives: {
    formatDate: FormatDateDirective,
    authenticated: AuthenticationDirective,
    authorized: AuthorizationDirective
  },
  context({ req, connection }) {
    const context = { ...db }
    if (connection) {
      return { ...context, ...connection.context }
    }
    const token = req.headers.authorization
    const user = getUserFromToken(token)
    return { ...context, user, createToken }
  },
  subscriptions: {
    onConnect(params) {
      const token = params.authToken
      const user = getUserFromToken(token)
      if (!user) {
        throw new Error("invalid user")
      }
      // here we return the connection.context
      return { user }
    }
  }
})

server.listen(4000).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`)
})
