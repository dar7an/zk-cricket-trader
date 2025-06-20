import { Field, Signature, PrivateKey, PublicKey } from 'o1js';

/**
 * This file contains **client-side** helper code for the oracle (off-chain).
 * Nothing here is used by the smart-contract itself – it merely shows the exact
 * transformation that must be performed to turn a JSON payload into the ordered
 * `Field[]` that is signed with the oracle's private key.
 */

/*******************************  TYPES  *************************************/
export type FixturePayload = {
    fixtureID: number | bigint;
    localTeamID: number | bigint;
    visitorTeamID: number | bigint;
    startingAt: number | bigint; // milliseconds since epoch (UTC)
};

export type StatusPayload = FixturePayload & {
    status: number | bigint;
    winnerTeamID: number | bigint;
};

/***************************  FIELD ENCODING  *******************************/
/** Convert a JS bigint/number into a Field with range check. */
function toField(value: number | bigint): Field {
    // The Pallas base field order is 289… which safely fits 2^255 – 1.
    // Basic range-check to avoid accidental overflow.
    const v = BigInt(value);
    if (v < 0n) throw new Error('Negative values are not allowed');
    return Field(v);
}

export function fixtureToFields(f: FixturePayload): Field[] {
    return [
        toField(f.fixtureID),
        toField(f.localTeamID),
        toField(f.visitorTeamID),
        toField(f.startingAt),
    ];
}

export function statusToFields(s: StatusPayload): Field[] {
    return [
        toField(s.fixtureID),
        toField(s.localTeamID),
        toField(s.visitorTeamID),
        toField(s.startingAt),
        toField(s.status),
        toField(s.winnerTeamID),
    ];
}

/**********************  SIGNING HELPERS FOR THE ORACLE  ********************/
/**
 * Create a Schnorr signature for a fixture payload.
 */
export function signFixture(
    sk: PrivateKey,
    data: FixturePayload
): Signature {
    return Signature.create(sk, fixtureToFields(data));
}

/**
 * Create a Schnorr signature for a status payload.
 */
export function signStatus(sk: PrivateKey, data: StatusPayload): Signature {
    return Signature.create(sk, statusToFields(data));
}

/*****************************  VERIFICATION  *******************************/
/** Convenience wrappers so you can unit-test off-chain before you publish. */
export function verifyFixture(
    pk: PublicKey,
    data: FixturePayload,
    sig: Signature
): boolean {
    return sig.verify(pk, fixtureToFields(data)).toBoolean();
}

export function verifyStatus(
    pk: PublicKey,
    data: StatusPayload,
    sig: Signature
): boolean {
    return sig.verify(pk, statusToFields(data)).toBoolean();
} 