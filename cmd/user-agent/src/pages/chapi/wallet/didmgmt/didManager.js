/*
Copyright SecureKey Technologies Inc. All Rights Reserved.

SPDX-License-Identifier: Apache-2.0
*/

import {KeyValueStore} from '../common/keyValStore.js'

const dbName = "did-metadata"
const storeName = "metadata"
const sigTypeIndex = new Map([["Ed25519Signature2018", "Ed25519VerificationKey2018"], ["JsonWebSignature2020", "JwsVerificationKey2020"]]);
const keyTypeIndex = new Map([["Ed25519", "ED25519"], ["P256", "ECDSAP256IEEEP1363"]]);

/**
 * DIDManager is manages DID create/store/query features
 * @class
 */
export class DIDManager extends KeyValueStore {
    constructor(aries, trustblocAgent, opts) {
        super(dbName, storeName)

        // params needed for create DID operation
        this.aries = aries
        this.trustblocAgent = trustblocAgent
        this.trustblocStartupOpts = opts
    }

    async createDID(keyType, signType) {
        if (!this.aries || !this.trustblocAgent) {
            console.error("aries and trustbloc agents are required to create DIDs")
            throw "operation not supported"
        }

        let generateKeyType = keyTypeIndex.get(keyType)

        const keySet = await this.aries.kms.createKeySet({keyType: generateKeyType})
        const recoveryKeySet = await this.aries.kms.createKeySet({keyType: generateKeyType})
        const updateKeySet = await this.aries.kms.createKeySet({keyType: generateKeyType})

        const createDIDRequest = {
            "publicKeys": [{
                "id": keySet.keyID,
                "type": sigTypeIndex.get(signType),
                "value": keySet.publicKey,
                "encoding": "Jwk",
                "keyType": keyType,
                "purpose": ["general", "auth"]
            }, {
                "id": recoveryKeySet.keyID,
                "type": sigTypeIndex.get(signType),
                "value": recoveryKeySet.publicKey,
                "encoding": "Jwk",
                "keyType": keyType,
                "recovery": true
            }, {
                "id": updateKeySet.keyID,
                "type": sigTypeIndex.get(signType),
                "value": updateKeySet.publicKey,
                "encoding": "Jwk",
                "keyType": keyType,
                "update": true
            }
            ]
        };

        const t = await new this.trustblocAgent.Framework(this.trustblocStartupOpts)

        let did
        await t.didclient.createDID(createDIDRequest).then(
            resp => {
                // TODO generate public key from generic wasm
                // TODO pass public key to createDID
                did = resp.DID

            })
            .catch(err => {
                t.destroy()
                console.error("failed to create did", err)
                throw err
            })

        await t.destroy()

        return did
    }

    async saveDID(name, signType, did){
        if (!this.aries || !this.trustblocAgent) {
            console.error("aries and trustbloc agents are required for saving DIDs")
            throw "operation not supported"
        }

        // Save DID to local browser storage
        await this.aries.vdri.saveDID({
                name: name,
                did: did
            }
        )

        const t = await new this.trustblocAgent.Framework(this.trustblocStartupOpts)

        // Save DID to persistent storage
        await t.didclient.saveDID({
            name: name,
            signType: signType,
            did: did
        })
    }

    async getAllDIDMetadata() {
        return this.getAll()
    }

    async getDIDMetadata(did) {
        return this.get(did)
    }

    async storeDIDMetadata(did, metadata) {
        return this.store(did, metadata)
    }
}