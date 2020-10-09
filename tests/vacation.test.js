import 'cross-fetch/polyfill';
import { gql } from 'apollo-boost';
import { prisma } from '../src/generated';
import { getClient } from './utils';
const client = getClient();
let authenticatedClient;
let userID;

beforeAll(async () => {
  await prisma.deleteManyUsers()
  await prisma.deleteManyVacations()
  const SIGN_UP = gql`
      mutation {
        signUp(
          username: "JMac",
          email: "jeremy@mac.com",
          password: "Kansas"
        ){
        ...on SignUpResponse {
          token 
          user {
            id 
            username 
            email
          }
        }
        ... on UserFoundError {
          message
        }
        }
      }
      `;
  const signUpRes = await client.mutate({
    mutation: SIGN_UP
  })
  
  authenticatedClient = getClient(signUpRes.data.signUp.token)
  console.log('authClient', authenticatedClient)
})

describe('Tests the Vacation Resolver Logic', () => {
  test('should create a vacation for an authenticated user', async () => {
    const CREATE_VACATION = gql`
      mutation createVacation(
        $title: String!, 
        $dates: [DayCreateWithoutTripInput!]
        ) {
        createVacation(data: {
            title: $title,
            dates: { create: $dates }
          }
        ) {
          id
          title
          dates {
            id
            date
            events {
              id
              title
            }
          }
        }
      }
    `;

    const vacationRes = await authenticatedClient.mutate({
      mutation: CREATE_VACATION, variables: {title: "Hawaii", dates: [ {date: "2021-10-15"},{ date: "2021-10-16"}]}
    })
    expect(vacationRes.data.createVacation.title).toMatch("Hawaii")
  });
  
  
});