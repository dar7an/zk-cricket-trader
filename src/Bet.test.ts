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
            const fixtureID = Field(59210);
            const localTeamID = Field(9);
            const visitorTeamID = Field(7);
            const startingAt = Field(1714658400000);
            const signature = Signature.fromBase58(
                '7mXAW5ZzTdo2JtncujgKcwiCbH19cDF6jiwGT9Re8FuV43ddgm24EgXNJaZ1czNPmoZLz2x2C5XpjFSSAWsxCeKKjJQpnJA3'
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

            // Update these values with values from the oracle's status endpoint
            const fixtureID = Field(59210);
            const status = Field(1);
            const winnerTeamID = Field(0);
            const signature = Signature.fromBase58(
                '7mX3VhAxWpGUNzNtRArqQ3UaHvQec98RTrdN2yEFiPbCGDJsxbBrxrFxY7siYotRmuUDovoxYBipQfayDT7njLJNzh1Xsmnf'
            );

            const txn = await Mina.transaction(senderAccount, async () => {
                await zkApp.verifyStatus(
                    fixtureID,
                    status,
                    winnerTeamID,
                    signature
                );
            });
            console.log('proving...');
            await txn.prove();
            await txn.sign([senderKey]).send();

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

            const response = await fetch('http://localhost:3000/status/59204');
            const data = await response.json();

            const fixtureID = Field(data.data.fixtureID);
            const status = Field(data.data.status);
            const winnerTeamID = Field(data.data.winnerTeamID);
            const signature = Signature.fromBase58(data.signature);

            const txn = await Mina.transaction(senderAccount, async () => {
                await zkApp.verifyStatus(
                    fixtureID,
                    status,
                    winnerTeamID,
                    signature
                );
            });
            console.log('proving...');
            await txn.prove();
            await txn.sign([senderKey]).send();

            let fixtureStatus = zkApp.fixtureStatus.get();
            console.log('status: ', fixtureStatus.status);
            console.log('winnerTeamID: ', fixtureStatus.winnerTeamID);
        });
    });
});
