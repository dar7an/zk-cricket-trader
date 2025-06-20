import {
    Field,
    Struct,
    MerkleWitness,
    PublicKey,
    Poseidon,
} from 'o1js';

export const BETS_TREE_HEIGHT = 8;

export class BetsMerkleWitness extends MerkleWitness(BETS_TREE_HEIGHT) {}

export class BetInfo extends Struct({
    userPublicKey: PublicKey,
    teamID: Field,
    amount: Field,
}) {
    hash(): Field {
        return Poseidon.hash(BetInfo.toFields(this));
    }
} 