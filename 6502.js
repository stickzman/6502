let opTable = {};
opTable[0x00] = {
    name: "BRK",
    bytes: 1,
    execute: function () {
        this.running = false;
        this.flags.breakCmd = true;
        console.log("BRK");
    }
};
/// <reference path="opCodes.ts" />
class p6502 {
    static boot() {
        this.loadMemory('mem.hex');
        this.PC = this.getResetVector();
        this.running = true;
        //Main loop
        while (this.running) {
            let opCode = this.mem[this.PC]; //Fetch
            let op = opTable[opCode]; //Decode
            if (op === undefined) {
                console.log(`ERROR: Encountered unknown opCode: [0x${opCode.toString(16)}] at PC: 0x${this.PC.toString(16).padStart(4, "0").toUpperCase()}`);
                break;
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
        let keys = Object.getOwnPropertyNames(this.flags);
        for (let key of keys) {
            console.log(`${key}: ${this.flags[key]}`);
        }
        console.log(`[ACC: 0x${this.ACC.toString(16).padStart(2, "0").toUpperCase()} X: 0x${this.X.toString(16).padStart(2, "0").toUpperCase()} Y: 0x${this.Y.toString(16).padStart(2, "0").toUpperCase()} PC: 0x${this.PC.toString(16).padStart(4, "0").toUpperCase()} SP: 0x${this.SP.toString(16).padStart(2, "0").toUpperCase()} ]`);
    }
}
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
    breakCmd: false,
    overflow: false,
    negative: false //Result of last op had bit 7 set to 1
};
function combineHex(buff) {
    return (buff[0] << 8) | (buff[1]);
}
p6502.boot();
console.log("");
p6502.displayState();
