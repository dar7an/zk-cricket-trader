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

    it('generates and deploys the `Bet` smart contract', async () => {
        await localDeploy();
        const oraclePublicKey = zkApp.oraclePublicKey.get();
        expect(oraclePublicKey).toEqual(
            PublicKey.fromBase58(ORACLE_PUBLIC_KEY)
        );
    });

    describe('hardcoded values', () => {
        it('updates fixture state if the provided signature from the hard coded value is valid', async () => {
            await localDeploy();

            const fixtureID = Field(59204);
            const localTeamID = Field(1979);
            const visitorTeamID = Field(6);
            const startingAt = Field(1714485600000);
            const signature = Signature.fromBase58(
                '7mXMzuMHbUC7T42Kgf7tkdZBE2G5ZjP27m2nJxTmscPBxtQnEmRTCFN5aEKRqgeVgeMjkcYyU61D1K3KAB9m1Wocx7dx49fr'
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
    });

    describe('actual API requests', () => {
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
            console.log(
                'fixtureID: ',
                fixture.fixtureID,
                'localTeamID: ',
                fixture.localTeamID,
                'visitorTeamID: ',
                fixture.visitorTeamID,
                'startingAt: ',
                fixture.startingAt
            );
        });
    });
});
