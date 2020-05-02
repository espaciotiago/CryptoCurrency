import Elliptic from 'elliptic';
import hash from './hash';

// eslint-disable-next-line new-cap
const ec = new Elliptic.ec('secp256k1');

export default {
  createKeyPair: () => ec.genKeyPair(),

  verifySignature: (publicKey, signature, data) => ec.keyFromPublic(publicKey, 'hex').verify(hash(data), signature),
};
