class p6502 {
    constructor() {
        this.flags = {
            carry: false,
            zero: false,
            interruptDisable: false,
            decimalMode: false,
            breakCmd: false,
            overflow: false,
            negative: false //Result of last op had bit 7 set to 1
        };
    }
    static loadMemory() {
        let fs = require("fs");
        this.mem = fs.readFileSync('mem.hex');
    }
}
p6502.loadMemory();
