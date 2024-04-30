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
} from 'o1js';

// The public key of sportmonksoracle
const ORACLE_PUBLIC_KEY =
    'B62qp7eyQ9RKwdYBLWNzxmfKntP6dPDrTSQ1ukyYsV4FoTkJH6sfuPU';

class Fixture extends Struct({
    fixtureID: Field,
    localTeamID: Field,
    visitorTeamID: Field,
    startingAt: Field,
}) {}

export class Bet extends SmartContract {
    // Define contract state
    @state(PublicKey) oraclePublicKey = State<PublicKey>();
    @state(Fixture) fixture = State<Fixture>();

    init() {
        super.init();

        // Initialize contract state
        this.oraclePublicKey.set(PublicKey.fromBase58(ORACLE_PUBLIC_KEY));

        // Specify that caller should include signature with tx instead of proof
        this.requireSignature();
    }

    @method async verifyFixture(
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
        this.fixture.set(
            new Fixture({ fixtureID, localTeamID, visitorTeamID, startingAt })
        );
    }
}
