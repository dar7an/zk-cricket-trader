# Mina zkApp: zkiplbets

Currently, the application stores the next fixture's data and updates its status from an oracle.

The smart contract uses 8 state variables which is the maximum limit of a Mina zkApp. The project can be taken forward in two ways:

1. Use of off-chain storage like a Merkle Tree to store user's bet information
2. Interacting with another zkApp which handles user betting

## Prerequisites

1. For testing the application, you must run the following oracle locally:
   [`sportsmonksoracle`](https://github.com/dar7an/sportmonksoracle)

2. Hardcode values for the tests.

## Sample Run

### Input

Run the oracle server locally and hardcode the output for Tests 2 and 3 and update the URL of the local server for tests 4 and 5.

For example, response for http://localhost:3000/fixture:

```
{
  "data": {
    "fixtureID": 59213,
    "localTeamID": 6,
    "visitorTeamID": 5,
    "startingAt": 1714744800000,
    "timestamp": 1714698664432
  },
  "signature": "7mXEX49AzUUBfARt6XXK1yAaPA2TprEhh3C3C7pLNULL8ifiH7arjUNAJYUNX7qgEEGLKdBxqayg51FzgaTUEYL3kzfFbg6j",
  "publicKey": "B62qp7eyQ9RKwdYBLWNzxmfKntP6dPDrTSQ1ukyYsV4FoTkJH6sfuPU"
}
```

| Variable      | Value                                                                                            |
| :------------ | :----------------------------------------------------------------------------------------------- |
| fixtureID     | 59213                                                                                            |
| localTeamID   | 6                                                                                                |
| visitorTeamID | 5                                                                                                |
| startingAt    | 1714744800000                                                                                    |
| signature     | 7mXEX49AzUUBfARt6XXK1yAaPA2TprEhh3C3C7pLNULL8ifiH7arjUNAJYUNX7qgEEGLKdBxqayg51FzgaTUEYL3kzfFbg6j |

Update the revelant variables:

```
const fixtureID = Field(59213);
            const localTeamID = Field(6);
            const visitorTeamID = Field(5);
            const startingAt = Field(1714744800000);
            const signature = Signature.fromBase58(
                '7mXEX49AzUUBfARt6XXK1yAaPA2TprEhh3C3C7pLNULL8ifiH7arjUNAJYUNX7qgEEGLKdBxqayg51FzgaTUEYL3kzfFbg6j'
            );
```

```
const response = await fetch('http://localhost:3000/fixture');
```

For example, response for http://localhost:3000/status/59213

```
{
  "data": {
    "fixtureID": 59213,
    "status": 1,
    "winnerTeamID": 0,
    "timestamp": 1714699981382
  },
  "signature": "7mXHh41LMHw4TvX62BiPzGiyWc8TDL3kGCA5MThNTkmcvBU9e7Du29t1HrD1FUMPkFDbYSKmmUwbjgMjz4z2wJrd41xC1dCj",
  "publicKey": "B62qp7eyQ9RKwdYBLWNzxmfKntP6dPDrTSQ1ukyYsV4FoTkJH6sfuPU"
}
```

| Variable     | Value                                                                                            |
| :----------- | :----------------------------------------------------------------------------------------------- |
| fixtureID    | 59213                                                                                            |
| status       | 1                                                                                                |
| winnerTeamID | 0                                                                                                |
| signature    | 7mXHh41LMHw4TvX62BiPzGiyWc8TDL3kGCA5MThNTkmcvBU9e7Du29t1HrD1FUMPkFDbYSKmmUwbjgMjz4z2wJrd41xC1dCj |

Update the revelant variables:

```
const fixtureID2 = Field(59213);
            const status = Field(1);
            const winnerTeamID = Field(0);
            const signature2 = Signature.fromBase58(
                '7mXHh41LMHw4TvX62BiPzGiyWc8TDL3kGCA5MThNTkmcvBU9e7Du29t1HrD1FUMPkFDbYSKmmUwbjgMjz4z2wJrd41xC1dCj'
            );
```

```
const response2 = await fetch('http://localhost:3000/status/59213');
```

### Output

```
  console.log
    proving...

      at Object.<anonymous> (src/Bet.test.ts:84:21)

  console.log
    fixtureID:  Field { value: [ 0, [ 0, 59213n ] ] }

      at Object.<anonymous> (src/Bet.test.ts:89:21)

  console.log
    localTeamID:  Field { value: [ 0, [ 0, 6n ] ] }

      at Object.<anonymous> (src/Bet.test.ts:90:21)

  console.log
    visitorTeamID:  Field { value: [ 0, [ 0, 5n ] ] }

      at Object.<anonymous> (src/Bet.test.ts:91:21)

  console.log
    startingAt:  Field { value: [ 0, [ 0, 1714744800000n ] ] }

      at Object.<anonymous> (src/Bet.test.ts:92:21)

  console.log
    proving...

      at Object.<anonymous> (src/Bet.test.ts:117:21)

  console.log
    fixtureID:  Field { value: [ 0, [ 0, 59213n ] ] }

      at Object.<anonymous> (src/Bet.test.ts:122:21)

  console.log
    localTeamID:  Field { value: [ 0, [ 0, 6n ] ] }

      at Object.<anonymous> (src/Bet.test.ts:123:21)

  console.log
    visitorTeamID:  Field { value: [ 0, [ 0, 5n ] ] }

      at Object.<anonymous> (src/Bet.test.ts:124:21)

  console.log
    startingAt:  Field { value: [ 0, [ 0, 1714744800000n ] ] }

      at Object.<anonymous> (src/Bet.test.ts:125:21)

  console.log
    proving...

      at Object.<anonymous> (src/Bet.test.ts:143:21)

  console.log
    status:  Field { value: [ 0, [ 0, 1n ] ] }

      at Object.<anonymous> (src/Bet.test.ts:148:21)

  console.log
    winnerTeamID:  Field { value: [ 0, [ 0, 0n ] ] }

      at Object.<anonymous> (src/Bet.test.ts:149:21)

  console.log
    proving...

      at Object.<anonymous> (src/Bet.test.ts:176:21)

  console.log
    fixtureID:  Field { value: [ 0, [ 0, 59213n ] ] }

      at Object.<anonymous> (src/Bet.test.ts:181:21)

  console.log
    localTeamID:  Field { value: [ 0, [ 0, 6n ] ] }

      at Object.<anonymous> (src/Bet.test.ts:182:21)

  console.log
    visitorTeamID:  Field { value: [ 0, [ 0, 5n ] ] }

      at Object.<anonymous> (src/Bet.test.ts:183:21)

  console.log
    startingAt:  Field { value: [ 0, [ 0, 1714744800000n ] ] }

      at Object.<anonymous> (src/Bet.test.ts:184:21)

  console.log
    proving...

      at Object.<anonymous> (src/Bet.test.ts:209:21)

  console.log
    fixtureID:  Field { value: [ 0, [ 0, 59213n ] ] }

      at Object.<anonymous> (src/Bet.test.ts:214:21)

  console.log
    localTeamID:  Field { value: [ 0, [ 0, 6n ] ] }

      at Object.<anonymous> (src/Bet.test.ts:215:21)

  console.log
    visitorTeamID:  Field { value: [ 0, [ 0, 5n ] ] }

      at Object.<anonymous> (src/Bet.test.ts:216:21)

  console.log
    startingAt:  Field { value: [ 0, [ 0, 1714744800000n ] ] }

      at Object.<anonymous> (src/Bet.test.ts:217:21)

  console.log
    proving...

      at Object.<anonymous> (src/Bet.test.ts:235:21)

  console.log
    status:  Field { value: [ 0, [ 0, 1n ] ] }

      at Object.<anonymous> (src/Bet.test.ts:240:21)

  console.log
    winnerTeamID:  Field { value: [ 0, [ 0, 0n ] ] }

      at Object.<anonymous> (src/Bet.test.ts:241:21)

 PASS  src/Bet.test.ts (6.207 s)
  Bet
    ✓ generates and deploys the `Bet` smart contract (753 ms)
    hardcoded values
      ✓ updates fixture state if the provided signature from the hard coded value is valid (1446 ms)
      ✓ updates status state if the provided signature from the hard coded value is valid (722 ms)
    actual API requests
      ✓ updates fixture state if the provided signature from the fixture oracle is valid (1060 ms)
      ✓ updates status state if the provided signature from the status oracle is valid (1084 ms)

Test Suites: 1 passed, 1 total
Tests:       5 passed, 5 total
Snapshots:   0 total
Time:        6.243 s, estimated 7 s
Ran all test suites.
```

## Build

```sh
npm run build
```

## Run Tests

```sh
npm run test
npm run testw # watch mode
```

## How to run coverage

```sh
npm run coverage
```

## License

[Apache-2.0](LICENSE)
