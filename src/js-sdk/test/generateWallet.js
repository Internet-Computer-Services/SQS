import nacl from "tweetnacl";

const ED25519_OID = Uint8Array.from([
  ...[0x30, 0x05], // SEQUENCE
  ...[0x06, 0x03], // OID with 3 bytes
  ...[0x2b, 0x65, 0x70], // id-Ed25519 OID
]);

function wrapDER(payload, oid) {
  // The Bit String header needs to include the unused bit count byte in its length
  const bitStringHeaderLength = 2 + encodeLenBytes(payload.byteLength + 1);
  const len = oid.byteLength + bitStringHeaderLength + payload.byteLength;
  let offset = 0;
  const buf = new Uint8Array(1 + encodeLenBytes(len) + len);
  // Sequence
  buf[offset++] = 0x30;
  // Sequence Length
  offset += encodeLen(buf, offset, len);

  // OID
  buf.set(oid, offset);
  offset += oid.byteLength;

  // Bit String Header
  buf[offset++] = 0x03;
  offset += encodeLen(buf, offset, payload.byteLength + 1);
  // 0 padding
  buf[offset++] = 0x00;
  buf.set(new Uint8Array(payload), offset);

  return buf;
}

const encodeLenBytes = (len) => {
  if (len <= 0x7f) {
    return 1;
  } else if (len <= 0xff) {
    return 2;
  } else if (len <= 0xffff) {
    return 3;
  } else if (len <= 0xffffff) {
    return 4;
  } else {
    throw new Error("Length too long (> 4 bytes)");
  }
};

const encodeLen = (buf, offset, len) => {
  if (len <= 0x7f) {
    buf[offset] = len;
    return 1;
  } else if (len <= 0xff) {
    buf[offset] = 0x81;
    buf[offset + 1] = len;
    return 2;
  } else if (len <= 0xffff) {
    buf[offset] = 0x82;
    buf[offset + 1] = len >> 8;
    buf[offset + 2] = len;
    return 3;
  } else if (len <= 0xffffff) {
    buf[offset] = 0x83;
    buf[offset + 1] = len >> 16;
    buf[offset + 2] = len >> 8;
    buf[offset + 3] = len;
    return 4;
  } else {
    throw new Error("Length too long (> 4 bytes)");
  }
};

function toHexString(bytes) {
  return new Uint8Array(bytes).reduce(
    (str, byte) => str + byte.toString(16).padStart(2, "0"),
    ""
  );
}

function getIdsfromKeyPair(publicKey, privateKey) {
  const pubDer = wrapDER(publicKey, ED25519_OID).buffer;
  const ids = [toHexString(pubDer), toHexString(privateKey)];
  return ids;
}

export const generateWallet = async () => {
  const { publicKey, secretKey } = nacl.box.keyPair();

  const keys = getIdsfromKeyPair(publicKey, secretKey);
  return keys;
};
