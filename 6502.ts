class p6502 {

    private static mem: Buffer;
    private ACC, X, Y, SP, PC: number;
    private flags = {
        carry: false, //Last op caused overflow from bit 7 (or 0) of result
        zero: false, //Result of last op was 0
        interruptDisable: false, //Processor will ignore interrupts when true
        decimalMode: false, //Enables BCD arithmetic (ignored in NES)
        breakCmd: false, //Set when BRK op was executed
        overflow: false, //Arithmetic yielded invalid 2's complement result
        negative: false //Result of last op had bit 7 set to 1
    }

    public static loadMemory() {
        let fs = require("fs");
        this.mem = fs.readFileSync('mem.hex');
    }



}

p6502.loadMemory();
