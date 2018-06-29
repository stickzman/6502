/// <reference path="opCodes.ts" />
class p6502 {

    public static debug: boolean = true; //Output debug info

    private static mem: Uint8Array;
    private static running: boolean = false;
    private static ACC: number = 0;//Accumulator
    private static X: number = 0;  //Register X
    private static Y: number = 0;  //Register Y
    private static PC: number = 0; //Program Counter
    private static SP: number = 0xFF; //Stack Pointer
    private static flags = {
        carry: false, //Last op caused overflow from bit 7 (or 0) of result
        zero: false, //Result of last op was 0
        interruptDisable: true, //Processor will ignore interrupts when true
        decimalMode: false, //Enables BCD arithmetic (ignored in NES)
        break: false, //Set when BRK op was executed
        overflow: false, //Arithmetic yielded invalid 2's complement result
        negative: false //Result of last op had bit 7 set to 1
    }

    public static boot(loadPath: string = "mem.hex") {
        this.loadMemory(loadPath);
        this.PC = this.getResetVector();

        this.running = true;

        //Main loop
        while(this.running) {
            let opCode = this.mem[this.PC]; //Fetch

            let op = opTable[opCode];       //Decode
            if (op === undefined) {
                console.log(`ERROR: Encountered unknown opCode: [0x${
                    opCode.toString(16).toUpperCase()}] at PC: 0x${
                    this.PC.toString(16).padStart(4, "0").toUpperCase()}`);
                break;
            }

            if (this.debug) {
                console.log(`Executing ${op.name} at 0x${
                    this.PC.toString(16).padStart(4, "0").toUpperCase()}...`);
            }

            op.execute.bind(this)();        //Execute

            this.PC += op.bytes;

        }
    }

    private static loadMemory(filePath: string) {
        let fs = require("fs");
        this.mem = fs.readFileSync(filePath) as Uint8Array;
    }

    private static getResetVector(): number{
        return combineHex(this.mem.slice(0xFFFC,0xFFFE).reverse());
    }

    public static displayState() {
        //Print Registers
        console.log(`[ACC: 0x${this.ACC.toString(16).padStart(2, "0").toUpperCase()
                } X: 0x${this.X.toString(16).padStart(2, "0").toUpperCase()
            } Y: 0x${this.Y.toString(16).padStart(2, "0").toUpperCase()
            } PC: 0x${this.PC.toString(16).padStart(4, "0").toUpperCase()
            } SP: 0x${this.SP.toString(16).padStart(2, "0").toUpperCase()} ]`);

        //Print flags
        let keys = Object.getOwnPropertyNames(this.flags);
        for (let key of keys) {
            console.log(`${key}: ${this.flags[key]}`);
        }
    }

    public static nextByte(): number {
        return this.mem[this.PC+1];
    }

    public static next2Bytes(flip = true): number {
        let bytes = this.mem.slice(this.PC+1, this.PC+3);
        if (flip) {
            bytes.reverse();
        }
        return combineHex(bytes);
    }

}

function combineHex(buff: Uint8Array): number {
    return (buff[0]<<8)|(buff[1]);
}

//p6502.boot("../6502_functional_test.bin");
p6502.boot();
console.log("");
p6502.displayState();
