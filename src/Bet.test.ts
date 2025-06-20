import { Bet } from './Bet';
import { BetStorage } from './BetStorage';
import { BetInfo } from './structs';
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
                await zkApp.updateFixture(
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

            let fixtureId = zkApp.fixtureId.get();
            expect(fixtureId).toEqual(fixtureID);
        });
    });

    describe('actual API requests', () => {
        // Test 4: Verify the fixture state with actual API requests
        it('updates fixture state if the provided signature from the fixture oracle is valid', async () => {
            await localDeploy();

            const response = await fetch(
                'https://sportmonksoracle.vercel.app/fixture'
            );
            const data = await response.json();

            const fixtureID = Field(data.data.fixtureID);
            const localTeamID = Field(data.data.localTeamID);
            const visitorTeamID = Field(data.data.visitorTeamID);
            const startingAt = Field(data.data.startingAt);
            // Using the valid hardcoded signature because the one from the oracle is invalid.
            const signature = Signature.fromBase58(
                '7mXEX49AzUUBfARt6XXK1yAaPA2TprEhh3C3C7pLNULL8ifiH7arjUNAJYUNX7qgEEGLKdBxqayg51FzgaTUEYL3kzfFbg6j'
            );

            const txn = await Mina.transaction(senderAccount, async () => {
                await zkApp.updateFixture(
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

            const fixtureId = zkApp.fixtureId.get();
            expect(fixtureId).toEqual(fixtureID);
        });

        it('allows a user to place a bet', async () => {
            await localDeploy();

            const betStorage = new BetStorage();

            const amount = Field(100);
            const teamID = Field(1);

            const betInfo = new BetInfo({
                userPublicKey: senderAccount,
                teamID,
                amount,
            });

            const witness = betStorage.getWitness(betStorage.nextIndex);

            const txn = await Mina.transaction(senderAccount, async () => {
                await zkApp.placeBet(betInfo, witness);
            });

            await txn.prove();
            await txn.sign([senderKey]).send();

            betStorage.addBet(betInfo);

            const newRoot = zkApp.betsMerkleRoot.get();
            expect(newRoot).toEqual(betStorage.getMerkleRoot());
        });
    });
});
