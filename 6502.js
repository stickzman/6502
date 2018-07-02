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
opTable[0xD0] = {
    name: "BNE",
    bytes: 2,
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
    execute: function () {
        this.mem[this.nextByte()]++;
    }
};
function getAddr(read = true) {
    let addr = p6502.next2Bytes();
    if (p6502.debug) {
        console.log(`${(read) ? "Reading from" : "Writing to"} memory at 0x${addr.toString(16).padStart(4, "0")}...`);
    }
    return addr;
}
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
        return combineHex(bytes.reverse());
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
        return combineHex(bytes);
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
function combineHex(buff) {
    return (buff[0] << 8) | (buff[1]);
}
var input = require('readline-sync');
var hexStr = input.question("Please enter program hex: ");
if (hexStr.length > 0) {
    p6502.loadProgStr(hexStr);
}
p6502.boot();
console.log("");
p6502.displayState();
