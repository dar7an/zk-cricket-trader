# Mina zkApp: Zkiplbets

Currently, the application stores the next fixture's data and updates its status from an oracle.

The smart contract uses 8 state variables which is the maximum limit of a Mina zkApp. The project can be taken forward in two ways:

1. Use of off-chain storage like a Merkle Tree to store user's bet information
2. Interacting with another zkApp which handles user betting

## Setup

1. For testing the application, run the following oracle locally:
   [`sportsmonksoracle`](https://github.com/dar7an/sportmonksoracle)

2. Change hardcoded values for tests 2 and 3 with values from the oracle.

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

## Sample Run

### Input

#### Fixture

This is the only endpoint which will constrantly change.

```
const fixtureID = Field(59210);
    const localTeamID = Field(9);
    const visitorTeamID = Field(7);
    const startingAt = Field(1714658400000);
    const signature = Signature.fromBase58(
        '7mXAW5ZzTdo2JtncujgKcwiCbH19cDF6jiwGT9Re8FuV43ddgm24EgXNJaZ1czNPmoZLz2x2C5XpjFSSAWsxCeKKjJQpnJA3'
    );
```

### Output

```
> zkiplbets@0.1.0 test
> node --experimental-vm-modules node_modules/jest/bin/jest.js

  console.log
    proving...

      at Object.<anonymous> (src/Bet.test.ts:81:21)

  console.log
    fixtureID:  Field { value: [ 0, [ 0, 59210n ] ] }

      at Object.<anonymous> (src/Bet.test.ts:86:21)

  console.log
    localTeamID:  Field { value: [ 0, [ 0, 9n ] ] }

      at Object.<anonymous> (src/Bet.test.ts:87:21)

  console.log
    visitorTeamID:  Field { value: [ 0, [ 0, 7n ] ] }

      at Object.<anonymous> (src/Bet.test.ts:88:21)

  console.log
    startingAt:  Field { value: [ 0, [ 0, 1714658400000n ] ] }

      at Object.<anonymous> (src/Bet.test.ts:89:21)

  console.log
    proving...

      at Object.<anonymous> (src/Bet.test.ts:110:21)

  console.log
    status:  Field { value: [ 0, [ 0, 1n ] ] }

      at Object.<anonymous> (src/Bet.test.ts:115:21)

  console.log
    winnerTeamID:  Field { value: [ 0, [ 0, 0n ] ] }

      at Object.<anonymous> (src/Bet.test.ts:116:21)

  console.log
    proving...

      at Object.<anonymous> (src/Bet.test.ts:142:21)

  console.log
    fixtureID:  Field { value: [ 0, [ 0, 59210n ] ] }

      at Object.<anonymous> (src/Bet.test.ts:147:21)

  console.log
    localTeamID:  Field { value: [ 0, [ 0, 9n ] ] }

      at Object.<anonymous> (src/Bet.test.ts:148:21)

  console.log
    visitorTeamID:  Field { value: [ 0, [ 0, 7n ] ] }

      at Object.<anonymous> (src/Bet.test.ts:149:21)

  console.log
    startingAt:  Field { value: [ 0, [ 0, 1714658400000n ] ] }

      at Object.<anonymous> (src/Bet.test.ts:150:21)

  console.log
    proving...

      at Object.<anonymous> (src/Bet.test.ts:172:21)

  console.log
    status:  Field { value: [ 0, [ 0, 3n ] ] }

      at Object.<anonymous> (src/Bet.test.ts:177:21)

  console.log
    winnerTeamID:  Field { value: [ 0, [ 0, 1979n ] ] }

      at Object.<anonymous> (src/Bet.test.ts:178:21)

 PASS  src/Bet.test.ts (5.89 s)
  Bet
    ✓ generates and deploys the `Bet` smart contract (757 ms)
    hardcoded values
      ✓ updates fixture state if the provided signature from the hard coded value is valid (1468 ms)
      ✓ updates status state if the provided signature from the hard coded value is valid (468 ms)
    actual API requests
      ✓ updates fixture state if the provided signature from the fixture oracle is valid (1164 ms)
      ✓ updates status state if the provided signature from the status oracle is valid (622 ms)

Test Suites: 1 passed, 1 total
Tests:       5 passed, 5 total
Snapshots:   0 total
Time:        5.943 s
Ran all test suites.
```

## License

[Apache-2.0](LICENSE)
