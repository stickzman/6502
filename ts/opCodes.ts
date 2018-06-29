interface opTable {
    [code: string]: {
        name: string,
        bytes: number,
        execute: Function
    }
}

let opTable: opTable = {};
opTable[0x00] = {
    name: "BRK",
    bytes: 1,
    execute: function() {
        this.running = false;
        this.flags.break = true;
    }
}
opTable[0xA9] = {
    name: "LDA (const)", //Load Accumulator with constant (Immediate)
    bytes: 2,
    execute: function() {
        this.ACC = this.nextByte();
    }
}
opTable[0xAD] = {
    name: "LDA (mem)", //Load Accumulator from memory location (Absolute)
    bytes: 3,
    execute: function() {
        let addr = getAddr();
        this.ACC = this.mem[addr];
    }
}
opTable[0x8D] = {
    name: "STA", //Store Accumulator in memory location
    bytes: 3,
    execute: function() {
        let addr = getAddr(false);
        this.mem[addr] = this.ACC;
    }
}
opTable[0x6D] = {
    name: "ADC", //Add contents at memory location to ACC
    bytes: 3,
    execute: function() {
        let addr = getAddr();
        this.ACC += this.mem[addr] + this.flags.carry;
        if (this.ACC > 255) {
            this.flags.carry = true;
        }
    }
}
opTable[0xA2] = {
    name: "LDX (const)", //Load X with constant
    bytes: 2,
    execute: function() {
        this.X = this.nextByte();
    }
}
opTable[0xAE] = {
    name: "LDX (mem)", //Load X from memory
    bytes: 3,
    execute: function() {
        let addr = getAddr();
        this.X = addr;
    }
}
opTable[0xA0] = {
    name: "LDY (const)", //Load Y with constant
    bytes: 2,
    execute: function() {
        this.Y = this.nextByte();
    }
}
opTable[0xAC] = {
    name: "LDY (mem)", //Load Y with constant
    bytes: 2,
    execute: function() {
        let addr = getAddr();
        this.Y = addr;
    }
}
opTable[0xEA] = {
    name: "NOP", //No operation
    bytes: 1,
    execute: function() { }
}
opTable[0xEC] = {
    name: "CPX", //Compare byte in memory to X register, sets zero if equal
    bytes: 3,
    execute: function() {
        let addr = getAddr();
        this.flags.zero = (this.mem[addr] == this.X) ? true : false;
    }
}

function getAddr(read: boolean = true): number {
    let addr = p6502.next2Bytes();
    if (p6502.debug) { console.log(`${
        (read) ? "Reading from" : "Writing to"} memory from 0x${
        addr.toString(16).padStart(4, "0")}...`); }
    return addr;
}
