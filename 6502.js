class p6502 {
    static boot() {
        this.loadMemory('mem.hex');
        this.PC = this.getResetVector();
    }
    static loadMemory(filePath) {
        let fs = require("fs");
        this.mem = fs.readFileSync(filePath);
    }
    static getResetVector() {
        return combineHex(this.mem.slice(0xFFFC, 0xFFFE).reverse());
    }
    static displayState() {
        console.log(`[ACC: 0x${this.ACC.toString(16).padStart(2, "0")} X: 0x${this.X.toString(16).padStart(2, "0")} Y: 0x${this.Y.toString(16).padStart(2, "0")} PC: 0x${this.PC.toString(16).padStart(4, "0")} SP: 0x${this.SP.toString(16).padStart(2, "0")} ]`);
    }
}
p6502.ACC = 0; //Accumulator
p6502.X = 0; //Register X
p6502.Y = 0; //Register Y
p6502.PC = 0; //Program Counter
p6502.SP = 0; //Stack Pointer
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
p6502.displayState();
