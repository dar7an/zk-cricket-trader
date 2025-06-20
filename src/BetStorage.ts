import { Field, MerkleTree } from 'o1js';
import { BetInfo, BetsMerkleWitness, BETS_TREE_HEIGHT } from './structs';

export class BetStorage {
    betsTree: MerkleTree;
    nextIndex: bigint;

    constructor() {
        this.betsTree = new MerkleTree(BETS_TREE_HEIGHT);
        this.nextIndex = 0n;
    }

    getMerkleRoot(): Field {
        return this.betsTree.getRoot();
    }

    addBet(bet: BetInfo) {
        this.betsTree.setLeaf(this.nextIndex, bet.hash());
        this.nextIndex++;
    }

    getWitness(index: bigint) {
        return new BetsMerkleWitness(this.betsTree.getWitness(index));
    }
} 