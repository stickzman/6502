let opTable = {};
opTable[0x00] = {
    name: "BRK",
    bytes: 1,
    cycles: 7,
    execute: function () {
        this.running = false;
        this.flags.break = true;
    }
};
//ORA X,ind 0x01
//ORA zpg   0x05
//ASL zpg   0x06
//PHP impl  0x08
//ORA #     0x09
//ASL       0x0A
//ORA abs   0x0D
//ASL abs   0x0E
//BPL rel   0x10
//ORA ind,Y 0x11
//ORA zpg,X 0x15
//ASL zpg,X 0x16
//CLC impl  0x18
//ORA abs,Y 0x19
//ORA abs,X 0x1D
//ASL abs,X 0x1E
//JSR abs   0x20
//AND X,ind 0x21
//BIT zpg   0x24
//AND zpg   0x25
//ROL zpg   0x26
opTable[0xA9] = {
    name: "LDA (const)",
    bytes: 2,
    cycles: 2,
    execute: function () {
        this.ACC = this.nextByte();
        this.updateFlags(this.ACC);
    }
};
opTable[0xAD] = {
    name: "LDA (mem)",
    bytes: 3,
    cycles: 4,
    execute: function () {
        let addr = this.getRef();
        this.ACC = this.mem[addr];
        this.updateFlags(this.ACC);
    }
};
opTable[0xBD] = {
    name: "LDA (mem, X)",
    bytes: 3,
    cycles: 4,
    execute: function () {
        let addr = this.getRef(this.X);
        this.ACC = this.mem[addr];
        this.updateFlags(this.ACC);
    }
};
opTable[0xB9] = {
    name: "LDA (mem, Y)",
    bytes: 3,
    cycles: 4,
    execute: function () {
        let addr = this.getRef(this.Y);
        this.ACC = this.mem[addr];
        this.updateFlags(this.ACC);
    }
};
opTable[0xA5] = {
    name: "LDA (zpg)",
    bytes: 2,
    cycles: 3,
    execute: function () {
        let addr = this.getZPageRef();
        this.ACC = this.mem[addr];
        this.updateFlags(this.ACC);
    }
};
opTable[0xB5] = {
    name: "LDA (zpg, X)",
    bytes: 2,
    cycles: 4,
    execute: function () {
        let addr = this.getZPageRef(this.X);
        this.ACC = this.mem[addr];
        this.updateFlags(this.ACC);
    }
};
opTable[0xA1] = {
    name: "LDA (ind, X)",
    bytes: 2,
    cycles: 6,
    execute: function () {
        let addr = this.getIndRef(this.X);
        this.ACC = this.mem[addr];
        this.updateFlags(this.ACC);
    }
};
opTable[0xA1] = {
    name: "LDA (ind, Y)",
    bytes: 2,
    cycles: 5,
    execute: function () {
        let addr = this.getIndRef(this.Y);
        this.ACC = this.mem[addr];
        this.updateFlags(this.ACC);
    }
};
opTable[0x6D] = {
    name: "ADC",
    bytes: 3,
    cycles: 4,
    execute: function () {
        let addr = this.getRef();
        let num1 = this.mem[addr];
        let num2 = this.ACC;
        this.ACC += num1 + this.flags.carry;
        //Wrap ACC and set/clear carry flag
        if (this.ACC > 0xFF) {
            this.flags.carry = true;
            this.ACC -= 0x100;
        }
        else {
            this.flags.carry = false;
        }
        //If the sum of two like signed terms is a diff sign, then the
        //signed result is outside [-128, 127], so set overflow flag
        this.flags.overflow = (num1 < 0x80 && num2 < 0x80 && this.ACC >= 0x80) ||
            (num1 >= 0x80 && num2 >= 0x80 && this.ACC < 0x80);
    }
};
opTable[0xA2] = {
    name: "LDX (const)",
    bytes: 2,
    cycles: 2,
    execute: function () {
        this.X = this.nextByte();
        this.updateFlags(this.X);
    }
};
opTable[0xA6] = {
    name: "LDX (zpg)",
    bytes: 2,
    cycles: 3,
    execute: function () {
        let addr = this.getZPageRef();
        this.X = this.mem[addr];
        this.updateFlags(this.X);
    }
};
opTable[0xB6] = {
    name: "LDX (zpg, X)",
    bytes: 2,
    cycles: 4,
    execute: function () {
        let addr = this.getZPageRef(this.X);
        this.X = this.mem[addr];
        this.updateFlags(this.X);
    }
};
opTable[0xAE] = {
    name: "LDX (mem)",
    bytes: 3,
    cycles: 4,
    execute: function () {
        let addr = this.getRef();
        this.X = this.mem[addr];
        this.updateFlags(this.X);
    }
};
opTable[0xBE] = {
    name: "LDX (mem, X)",
    bytes: 3,
    cycles: 4,
    execute: function () {
        let addr = this.getRef(this.X);
        this.X = this.mem[addr];
        this.updateFlags(this.X);
    }
};
opTable[0xA0] = {
    name: "LDY (const)",
    bytes: 2,
    cycles: 2,
    execute: function () {
        this.Y = this.nextByte();
    }
};
opTable[0xA4] = {
    name: "LDY (zpg)",
    bytes: 2,
    cycles: 3,
    execute: function () {
        let addr = this.getZPageRef();
        this.Y = this.mem[addr];
    }
};
opTable[0xB4] = {
    name: "LDY (zpg, X)",
    bytes: 2,
    cycles: 4,
    execute: function () {
        let addr = this.getZPageRef(this.X);
        this.Y = this.mem[addr];
    }
};
opTable[0xAC] = {
    name: "LDY (mem)",
    bytes: 3,
    cycles: 4,
    execute: function () {
        let addr = this.getRef();
        this.Y = this.mem[addr];
    }
};
opTable[0xBC] = {
    name: "LDY (mem, X)",
    bytes: 3,
    cycles: 4,
    execute: function () {
        let addr = this.getRef(this.X);
        this.Y = this.mem[addr];
    }
};
opTable[0x85] = {
    name: "STA (zpg)",
    bytes: 2,
    cycles: 3,
    execute: function () {
        let addr = this.getZPageRef();
        this.mem[addr] = this.ACC;
    }
};
opTable[0x95] = {
    name: "STA (zpg, X)",
    bytes: 2,
    cycles: 4,
    execute: function () {
        let addr = this.getZPageRef(this.X);
        this.mem[addr] = this.ACC;
    }
};
opTable[0x8D] = {
    name: "STA (abs)",
    bytes: 3,
    cycles: 4,
    execute: function () {
        let addr = this.getRef();
        this.mem[addr] = this.ACC;
    }
};
opTable[0x9D] = {
    name: "STA (abs, X)",
    bytes: 3,
    cycles: 4,
    execute: function () {
        let addr = this.getRef(this.X);
        this.mem[addr] = this.ACC;
    }
};
opTable[0x99] = {
    name: "STA (abs, Y)",
    bytes: 3,
    cycles: 4,
    execute: function () {
        let addr = this.getRef(this.Y);
        this.mem[addr] = this.ACC;
    }
};
opTable[0x81] = {
    name: "STA (ind, X)",
    bytes: 2,
    cycles: 6,
    execute: function () {
        let addr = this.getIndrRef(this.X);
        this.mem[addr] = this.ACC;
    }
};
opTable[0x91] = {
    name: "STA (ind, Y)",
    bytes: 2,
    cycles: 5,
    execute: function () {
        let addr = this.getIndrRef(this.Y);
        this.mem[addr] = this.ACC;
    }
};
opTable[0x86] = {
    name: "STX (zpg)",
    bytes: 2,
    cycles: 3,
    execute: function () {
        let addr = this.getZPageRef();
        this.mem[addr] = this.X;
    }
};
opTable[0x96] = {
    name: "STX (zpg, Y)",
    bytes: 2,
    cycles: 4,
    execute: function () {
        let addr = this.getZPageRef(this.Y);
        this.mem[addr] = this.X;
    }
};
opTable[0x8E] = {
    name: "STX (abs)",
    bytes: 3,
    cycles: 4,
    execute: function () {
        let addr = this.getRef();
        this.mem[addr] = this.X;
    }
};
opTable[0x84] = {
    name: "STY (zpg)",
    bytes: 2,
    cycles: 3,
    execute: function () {
        let addr = this.getZPageRef();
        this.mem[addr] = this.Y;
    }
};
opTable[0x94] = {
    name: "STY (zpg, Y)",
    bytes: 2,
    cycles: 4,
    execute: function () {
        let addr = this.getZPageRef(this.X);
        this.mem[addr] = this.Y;
    }
};
opTable[0x8C] = {
    name: "STY (abs)",
    bytes: 2,
    cycles: 4,
    execute: function () {
        let addr = this.getRef();
        this.mem[addr] = this.Y;
    }
};
opTable[0xAA] = {
    name: "TAX",
    bytes: 1,
    cycles: 2,
    execute: function () {
        this.X = this.ACC;
        this.updateFlags(this.X);
    }
};
opTable[0xA8] = {
    name: "TAY",
    bytes: 1,
    cycles: 2,
    execute: function () {
        this.Y = this.ACC;
        this.updateFlags(this.Y);
    }
};
opTable[0xBA] = {
    name: "TSX",
    bytes: 1,
    cycles: 2,
    execute: function () {
        this.X = this.SP;
        this.updateFlags(this.X);
    }
};
opTable[0x8A] = {
    name: "TXA",
    bytes: 1,
    cycles: 2,
    execute: function () {
        this.ACC = this.X;
        this.updateFlags(this.ACC);
    }
};
opTable[0x9A] = {
    name: "TXS",
    bytes: 1,
    cycles: 2,
    execute: function () {
        this.SP = this.X;
        this.updateFlags(this.SP);
    }
};
opTable[0x98] = {
    name: "TYA",
    bytes: 1,
    cycles: 2,
    execute: function () {
        this.ACC = this.Y;
        this.updateFlags(this.Y);
    }
};
opTable[0xEA] = {
    name: "NOP",
    bytes: 1,
    cycles: 1,
    execute: function () { }
};
opTable[0xEC] = {
    name: "CPX",
    bytes: 3,
    cycles: 4,
    execute: function () {
        let addr = this.getRef();
        this.flags.zero = (this.mem[addr] == this.X) ? true : false;
    }
};
opTable[0xD0] = {
    name: "BNE",
    bytes: 2,
    cycles: 3,
    execute: function () {
        if (!this.flags.zero) {
            if (this.debug) {
                console.log(`Branching ${this.nextByte()} bytes...`);
            }
            this.PC += this.nextByte();
        }
    }
};
opTable[0xEE] = {
    name: "INC",
    bytes: 3,
    cycles: 6,
    execute: function () {
        this.mem[this.nextByte()]++;
    }
};
/// <reference path="opCodes.ts" />
class p6502 {
    static boot() {
        if (this.mem === undefined) {
            this.mem = new Uint8Array(0x10000);
        }
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
        //Write memory to file
        this.writeMem();
    }
    static loadMemory(filePath) {
        let fs = require("fs");
        this.mem = fs.readFileSync(filePath);
    }
    static loadProg(filePath) {
        let fs = require("fs");
        let prog = fs.readFileSync(filePath);
        let mem = new Buffer(this.MEM_SIZE);
        prog.copy(mem, 0x0200);
        mem[0xFFFC] = 0x00;
        mem[0xFFFD] = 0x02;
        this.mem = mem;
    }
    static loadProgStr(str) {
        str = str.replace(/[^A-z0-9]/g, "");
        let prog = Buffer.from(str, "hex");
        let mem = new Buffer(this.MEM_SIZE);
        prog.copy(mem, 0x0200);
        mem[0xFFFC] = 0x00;
        mem[0xFFFD] = 0x02;
        this.mem = mem;
    }
    static writeMem() {
        let fs = require("fs");
        fs.writeFileSync(this.MEM_PATH, Buffer.from(this.mem));
    }
    static getResetVector() {
        let bytes = new Uint8Array(this.mem.slice(0xFFFC, 0xFFFE));
        return combineHexBuff(bytes.reverse());
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
        let bytes = new Uint8Array(this.mem.slice(this.PC + 1, this.PC + 3));
        if (flip) {
            bytes.reverse();
        }
        return combineHexBuff(bytes);
    }
    static updateFlags(register) {
        this.flags.zero = (register === 0x00);
        this.flags.negative = (register > 0x7F);
    }
    static getRef(offset = 0) {
        let addr = this.next2Bytes() + offset;
        if (this.debug) {
            console.log(`Accessing memory at 0x${addr.toString(16).padStart(4, "0")}...`);
        }
        return addr;
    }
    static getZPageRef(offset = 0) {
        let addr = this.nextByte() + offset;
        if (this.debug) {
            console.log(`Accessing memory at 0x${addr.toString(16).padStart(4, "0")}...`);
        }
        return addr;
    }
    static getIndrRef(offset = 0) {
        let addr = this.nextByte() + offset;
        return combineHex(this.mem[addr + 1], this.mem[addr]);
    }
}
p6502.debug = true; //Output debug info
p6502.MEM_PATH = "mem.hex";
p6502.MEM_SIZE = 0x10000;
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
var input = require('readline-sync');
var hexStr = input.question("Please enter program hex: ");
if (hexStr.length > 0) {
    p6502.loadProgStr(hexStr);
}
p6502.boot();
console.log("");
p6502.displayState();
function combineHexBuff(buff) {
    return (buff[0] << 8) | (buff[1]);
}
function combineHex(hiByte, lowByte) {
    return (hiByte << 8) | (lowByte);
}
