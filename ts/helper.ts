function combineHexBuff(buff: Uint8Array): number {
    return (buff[0]<<8)|(buff[1]);
}

function combineHex(hiByte: number, lowByte: number): number {
    return (hiByte<<8)|(lowByte);
}

function getRef(read: boolean = true): number {
    let addr = p6502.next2Bytes();
    if (p6502.debug) { console.log(`${
        (read) ? "Reading from" : "Writing to"} memory at 0x${
        addr.toString(16).padStart(4, "0")}...`); }
    return addr;
}



function getIndRef(addX: boolean = true): number {
    let addr = p6502.nextByte();
    addr += (addX) ? p6502.getX() : p6502.getY();
    return combineHex(this.mem[addr+1], this.mem[addr]);
}
