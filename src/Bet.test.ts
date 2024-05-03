import { Bet } from './Bet';
import {
    Field,
    Mina,
    PrivateKey,
    PublicKey,
    AccountUpdate,
    Signature,
} from 'o1js';

let proofsEnabled = false;

// The public key of our trusted data provider
const ORACLE_PUBLIC_KEY =
    'B62qp7eyQ9RKwdYBLWNzxmfKntP6dPDrTSQ1ukyYsV4FoTkJH6sfuPU';

describe('Bet', () => {
    let deployerAccount: Mina.TestPublicKey,
        deployerKey: PrivateKey,
        senderAccount: Mina.TestPublicKey,
        senderKey: PrivateKey,
        zkAppAddress: PublicKey,
        zkAppPrivateKey: PrivateKey,
        zkApp: Bet;

    beforeAll(async () => {
        if (proofsEnabled) await Bet.compile();
    });

    beforeEach(async () => {
        const Local = await Mina.LocalBlockchain({ proofsEnabled });
        Mina.setActiveInstance(Local);
        deployerAccount = Local.testAccounts[0];
        deployerKey = deployerAccount.key;
        senderAccount = Local.testAccounts[1];
        senderKey = senderAccount.key;
        zkAppPrivateKey = PrivateKey.random();
        zkAppAddress = zkAppPrivateKey.toPublicKey();
        zkApp = new Bet(zkAppAddress);
    });

    async function localDeploy() {
        const txn = await Mina.transaction(deployerAccount, async () => {
            AccountUpdate.fundNewAccount(deployerAccount);
            await zkApp.deploy();
        });

        await txn.prove();
        await txn.sign([deployerKey, zkAppPrivateKey]).send();
    }

    // Test 1: Basic test to check if the contract is deployed
    it('generates and deploys the `Bet` smart contract', async () => {
        await localDeploy();
        const oraclePublicKey = zkApp.oraclePublicKey.get();
        expect(oraclePublicKey).toEqual(
            PublicKey.fromBase58(ORACLE_PUBLIC_KEY)
        );
    });

    describe('hardcoded values', () => {
        // Test 2: Verify the fixture state with hardcoded values
        it('updates fixture state if the provided signature from the hard coded value is valid', async () => {
            await localDeploy();

            // Update these values with values from the oracle's fixture endpoint
            const fixtureID = Field(59213);
            const localTeamID = Field(6);
            const visitorTeamID = Field(5);
            const startingAt = Field(1714744800000);
            const signature = Signature.fromBase58(
                '7mXEX49AzUUBfARt6XXK1yAaPA2TprEhh3C3C7pLNULL8ifiH7arjUNAJYUNX7qgEEGLKdBxqayg51FzgaTUEYL3kzfFbg6j'
            );

            const txn = await Mina.transaction(senderAccount, async () => {
                await zkApp.verifyFixture(
                    fixtureID,
                    localTeamID,
                    visitorTeamID,
                    startingAt,
                    signature
                );
            });
            console.log('proving...');
            await txn.prove();
            await txn.sign([senderKey]).send();

            let fixture = zkApp.fixture.get();
            console.log('fixtureID: ', fixture.fixtureID);
            console.log('localTeamID: ', fixture.localTeamID);
            console.log('visitorTeamID: ', fixture.visitorTeamID);
            console.log('startingAt: ', fixture.startingAt);
        });

        // Test 3: Verify the status state with hardcoded values
        it('updates status state if the provided signature from the hard coded value is valid', async () => {
            await localDeploy();

            // Update these values with values from the oracle's fixture endpoint
            const fixtureID = Field(59213);
            const localTeamID = Field(6);
            const visitorTeamID = Field(5);
            const startingAt = Field(1714744800000);
            const signature = Signature.fromBase58(
                '7mXEX49AzUUBfARt6XXK1yAaPA2TprEhh3C3C7pLNULL8ifiH7arjUNAJYUNX7qgEEGLKdBxqayg51FzgaTUEYL3kzfFbg6j'
            );

            const txn = await Mina.transaction(senderAccount, async () => {
                await zkApp.verifyFixture(
                    fixtureID,
                    localTeamID,
                    visitorTeamID,
                    startingAt,
                    signature
                );
            });
            console.log('proving...');
            await txn.prove();
            await txn.sign([senderKey]).send();

            let fixture = zkApp.fixture.get();
            console.log('fixtureID: ', fixture.fixtureID);
            console.log('localTeamID: ', fixture.localTeamID);
            console.log('visitorTeamID: ', fixture.visitorTeamID);
            console.log('startingAt: ', fixture.startingAt);

            // Update these values with values from the oracle's status endpoint
            const fixtureID2 = Field(59213);
            const status = Field(1);
            const winnerTeamID = Field(0);
            const signature2 = Signature.fromBase58(
                '7mXHh41LMHw4TvX62BiPzGiyWc8TDL3kGCA5MThNTkmcvBU9e7Du29t1HrD1FUMPkFDbYSKmmUwbjgMjz4z2wJrd41xC1dCj'
            );

            const txn2 = await Mina.transaction(senderAccount, async () => {
                await zkApp.verifyStatus(
                    fixtureID2,
                    status,
                    winnerTeamID,
                    signature2
                );
            });
            console.log('proving...');
            await txn2.prove();
            await txn2.sign([senderKey]).send();

            let fixtureStatus = zkApp.fixtureStatus.get();
            console.log('status: ', fixtureStatus.status);
            console.log('winnerTeamID: ', fixtureStatus.winnerTeamID);
        });
    });

    describe('actual API requests', () => {
        // Test 4: Verify the fixture state with actual API requests
        it('updates fixture state if the provided signature from the fixture oracle is valid', async () => {
            await localDeploy();

            const response = await fetch('http://localhost:3000/fixture');
            const data = await response.json();

            const fixtureID = Field(data.data.fixtureID);
            const localTeamID = Field(data.data.localTeamID);
            const visitorTeamID = Field(data.data.visitorTeamID);
            const startingAt = Field(data.data.startingAt);
            const signature = Signature.fromBase58(data.signature);

            const txn = await Mina.transaction(senderAccount, async () => {
                await zkApp.verifyFixture(
                    fixtureID,
                    localTeamID,
                    visitorTeamID,
                    startingAt,
                    signature
                );
            });
            console.log('proving...');
            await txn.prove();
            await txn.sign([senderKey]).send();

            let fixture = zkApp.fixture.get();
            console.log('fixtureID: ', fixture.fixtureID);
            console.log('localTeamID: ', fixture.localTeamID);
            console.log('visitorTeamID: ', fixture.visitorTeamID);
            console.log('startingAt: ', fixture.startingAt);
        });

        // Test 5: Verify the status state with actual API requests
        it('updates status state if the provided signature from the status oracle is valid', async () => {
            await localDeploy();

            const response = await fetch('http://localhost:3000/fixture');
            const data = await response.json();

            const fixtureID = Field(data.data.fixtureID);
            const localTeamID = Field(data.data.localTeamID);
            const visitorTeamID = Field(data.data.visitorTeamID);
            const startingAt = Field(data.data.startingAt);
            const signature = Signature.fromBase58(data.signature);

            const txn = await Mina.transaction(senderAccount, async () => {
                await zkApp.verifyFixture(
                    fixtureID,
                    localTeamID,
                    visitorTeamID,
                    startingAt,
                    signature
                );
            });
            console.log('proving...');
            await txn.prove();
            await txn.sign([senderKey]).send();

            let fixture = zkApp.fixture.get();
            console.log('fixtureID: ', fixture.fixtureID);
            console.log('localTeamID: ', fixture.localTeamID);
            console.log('visitorTeamID: ', fixture.visitorTeamID);
            console.log('startingAt: ', fixture.startingAt);

            // Change this value to the fixture ID from the oracle's status endpoint
            const response2 = await fetch('http://localhost:3000/status/59213');
            const data2 = await response2.json();

            const fixtureID2 = Field(data2.data.fixtureID);
            const status = Field(data2.data.status);
            const winnerTeamID = Field(data2.data.winnerTeamID);
            const signature2 = Signature.fromBase58(data2.signature);

            const txn2 = await Mina.transaction(senderAccount, async () => {
                await zkApp.verifyStatus(
                    fixtureID2,
                    status,
                    winnerTeamID,
                    signature2
                );
            });
            console.log('proving...');
            await txn2.prove();
            await txn2.sign([senderKey]).send();

            let fixtureStatus = zkApp.fixtureStatus.get();
            console.log('status: ', fixtureStatus.status);
            console.log('winnerTeamID: ', fixtureStatus.winnerTeamID);
        });
    });
});
