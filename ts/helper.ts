function combineHexBuff(buff: Uint8Array): number {
    return (buff[0]<<8)|(buff[1]);
}

function combineHex(hiByte: number, lowByte: number): number {
    return (hiByte<<8)|(lowByte);
}
