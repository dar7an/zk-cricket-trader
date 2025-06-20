import {
    Field,
    SmartContract,
    state,
    State,
    method,
    PublicKey,
    Signature,
    Struct,
    Provable,
    MerkleTree,
} from 'o1js';
import { BetInfo, BetsMerkleWitness, BETS_TREE_HEIGHT } from './structs';

// The public key of sportmonksoracle
const ORACLE_PUBLIC_KEY =
    'B62qp7eyQ9RKwdYBLWNzxmfKntP6dPDrTSQ1ukyYsV4FoTkJH6sfuPU';

class Fixture extends Struct({
    fixtureID: Field,
    localTeamID: Field,
    visitorTeamID: Field,
    startingAt: Field,
}) {}

class FixtureStatus extends Struct({
    status: Field,
    winnerTeamID: Field,
}) {}

export class Bet extends SmartContract {
    // Define contract state
    @state(PublicKey) oraclePublicKey = State<PublicKey>();
    @state(Field) fixtureId = State<Field>();
    @state(Field) betsMerkleRoot = State<Field>();

    init() {
        super.init();

        // Initialize contract state
        this.oraclePublicKey.set(PublicKey.fromBase58(ORACLE_PUBLIC_KEY));
        this.betsMerkleRoot.set(new MerkleTree(BETS_TREE_HEIGHT).getRoot());

        // Specify that caller should include signature with tx instead of proof
        this.requireSignature();
    }

    @method async updateFixture(
        fixtureID: Field,
        localTeamID: Field,
        visitorTeamID: Field,
        startingAt: Field,
        signature: Signature
    ) {
        // Get the oracle public key from the contract state
        const oraclePublicKey = this.oraclePublicKey.get();
        this.oraclePublicKey.requireEquals(oraclePublicKey);

        // Evaluate whether the signature is valid for the provided data
        const validSignature = signature.verify(oraclePublicKey, [
            fixtureID,
            localTeamID,
            visitorTeamID,
            startingAt,
        ]);

        // Check that the signature is valid
        validSignature.assertTrue();

        // Change state to store the fixture
        this.fixtureId.set(fixtureID);
    }

    @method async verifyStatus(
        fixtureID: Field,
        localTeamID: Field,
        visitorTeamID: Field,
        startingAt: Field,
        status: Field,
        winnerTeamID: Field,
        signature: Signature
    ) {
        // Get the oracle public key from the contract state
        const oraclePublicKey = this.oraclePublicKey.get();
        this.oraclePublicKey.requireEquals(oraclePublicKey);

        // Evaluate whether the signature is valid for the provided data
        const validSignature = signature.verify(oraclePublicKey, [
            fixtureID,
            localTeamID,
            visitorTeamID,
            startingAt,
            status,
            winnerTeamID,
        ]);

        // Check that the signature is valid
        validSignature.assertTrue();

        // Check that the fixture ID matches the stored fixture ID
        this.fixtureId.requireEquals(fixtureID);
    }

    @method async placeBet(bet: BetInfo, path: BetsMerkleWitness) {
        // Get the current merkle root
        const root = this.betsMerkleRoot.get();
        this.betsMerkleRoot.requireEquals(root);

        // Check if the sender is the one placing the bet
        bet.userPublicKey.assertEquals(this.sender.getAndRequireSignature());

        // Check that the leaf is empty
        const emptyLeaf = Field(0);
        path.calculateRoot(emptyLeaf).assertEquals(root);

        // Calculate the new root and update the state
        const newRoot = path.calculateRoot(bet.hash());
        this.betsMerkleRoot.set(newRoot);
    }
}
