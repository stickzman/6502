let opTable = {};
opTable[0x00] = {
    name: "BRK",
    bytes: 1,
    execute: function () {
        this.running = false;
        this.flags.break = true;
    }
};
opTable[0xA9] = {
    name: "LDA (const)",
    bytes: 2,
    execute: function () {
        this.ACC = this.nextByte();
    }
};
opTable[0xAD] = {
    name: "LDA (mem)",
    bytes: 3,
    execute: function () {
        let addr = getAddr();
        this.ACC = this.mem[addr];
    }
};
opTable[0x8D] = {
    name: "STA",
    bytes: 3,
    execute: function () {
        let addr = getAddr(false);
        this.mem[addr] = this.ACC;
    }
};
opTable[0x6D] = {
    name: "ADC",
    bytes: 3,
    execute: function () {
        let addr = getAddr();
        this.ACC += this.mem[addr] + this.flags.carry;
        if (this.ACC > 255) {
            this.flags.carry = true;
        }
    }
};
opTable[0xA2] = {
    name: "LDX (const)",
    bytes: 2,
    execute: function () {
        this.X = this.nextByte();
    }
};
opTable[0xAE] = {
    name: "LDX (mem)",
    bytes: 3,
    execute: function () {
        let addr = getAddr();
        this.X = addr;
    }
};
opTable[0xA0] = {
    name: "LDY (const)",
    bytes: 2,
    execute: function () {
        this.Y = this.nextByte();
    }
};
opTable[0xAC] = {
    name: "LDY (mem)",
    bytes: 2,
    execute: function () {
        let addr = getAddr();
        this.Y = addr;
    }
};
opTable[0xEA] = {
    name: "NOP",
    bytes: 1,
    execute: function () { }
};
opTable[0xEC] = {
    name: "CPX",
    bytes: 3,
    execute: function () {
        let addr = getAddr();
        this.flags.zero = (this.mem[addr] == this.X) ? true : false;
    }
};
function getAddr(read = true) {
    let addr = p6502.next2Bytes();
    if (p6502.debug) {
        console.log(`${(read) ? "Reading from" : "Writing to"} memory from 0x${addr.toString(16).padStart(4, "0")}...`);
    }
    return addr;
}
/// <reference path="opCodes.ts" />
class p6502 {
    static boot(loadPath = "mem.hex") {
        this.loadMemory(loadPath);
        this.PC = this.getResetVector();
        this.running = true;
        //Main loop
        while (this.running) {
            let opCode = this.mem[this.PC]; //Fetch
            let op = opTable[opCode]; //Decode
            if (op === undefined) {
                console.log(`ERROR: Encountered unknown opCode: [0x${opCode.toString(16).toUpperCase()}] at PC: 0x${this.PC.toString(16).padStart(4, "0").toUpperCase()}`);
                break;
            }
            if (this.debug) {
                console.log(`Executing ${op.name} at 0x${this.PC.toString(16).padStart(4, "0").toUpperCase()}...`);
            }
            op.execute.bind(this)(); //Execute
            this.PC += op.bytes;
        }
    }
    static loadMemory(filePath) {
        let fs = require("fs");
        this.mem = fs.readFileSync(filePath);
    }
    static getResetVector() {
        return combineHex(this.mem.slice(0xFFFC, 0xFFFE).reverse());
    }
    static displayState() {
        //Print Registers
        console.log(`[ACC: 0x${this.ACC.toString(16).padStart(2, "0").toUpperCase()} X: 0x${this.X.toString(16).padStart(2, "0").toUpperCase()} Y: 0x${this.Y.toString(16).padStart(2, "0").toUpperCase()} PC: 0x${this.PC.toString(16).padStart(4, "0").toUpperCase()} SP: 0x${this.SP.toString(16).padStart(2, "0").toUpperCase()} ]`);
        //Print flags
        let keys = Object.getOwnPropertyNames(this.flags);
        for (let key of keys) {
            console.log(`${key}: ${this.flags[key]}`);
        }
    }
    static nextByte() {
        return this.mem[this.PC + 1];
    }
    static next2Bytes(flip = true) {
        let bytes = this.mem.slice(this.PC + 1, this.PC + 3);
        if (flip) {
            bytes.reverse();
        }
        return combineHex(bytes);
    }
}
p6502.debug = true; //Output debug info
p6502.running = false;
p6502.ACC = 0; //Accumulator
p6502.X = 0; //Register X
p6502.Y = 0; //Register Y
p6502.PC = 0; //Program Counter
p6502.SP = 0xFF; //Stack Pointer
p6502.flags = {
    carry: false,
    zero: false,
    interruptDisable: true,
    decimalMode: false,
    break: false,
    overflow: false,
    negative: false //Result of last op had bit 7 set to 1
};
function combineHex(buff) {
    return (buff[0] << 8) | (buff[1]);
}
//p6502.boot("../6502_functional_test.bin");
p6502.boot();
console.log("");
p6502.displayState();
