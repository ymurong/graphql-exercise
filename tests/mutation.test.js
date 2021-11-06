const gql = require('graphql-tag')
const createTestServer = require('./helper')
const CREATE_POST = gql`
  mutation {
    createPost(input: {message: "hello"}) {
        message
    }
  }
`

describe('queries', () => {
  test('createPost', async () => {
    const {mutate} = createTestServer({
      user: {id: 1},
      models: {
        Post: {
          createOne: jest.fn(() => {message: "hello"})
        }
      }
    })

    const res = await mutate({query: CREATE_POST})
    expect(res).toMatchSnapshot()
  })
})
