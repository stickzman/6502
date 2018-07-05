/// <reference path="opCodes.ts" />
class p6502 {

    public static debug: boolean = true; //Output debug info
    private static readonly MEM_PATH = "mem.hex";
    private static readonly MEM_SIZE = 0x10000;

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
        interruptDisable: false, //Processor will ignore interrupts when true
        decimalMode: false, //Enables BCD arithmetic (ignored in NES)
        break: false, //Set when BRK op was executed
        overflow: false, //Arithmetic yielded invalid 2's complement result
        negative: false //Result of last op had bit 7 set to 1
    }

    public static boot() {
        if (this.mem === undefined) {
            this.mem = new Uint8Array(0x10000);
        }
        this.reset();

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

        //Write memory to file
        this.writeMem();
    }

    private static loadMemory(filePath: string) {
        let fs = require("fs");
        this.mem = fs.readFileSync(filePath) ;
    }

    public static loadProg(filePath: string) {
        let fs = require("fs");
        let prog = fs.readFileSync(filePath) as Buffer;
        let mem = new Buffer(this.MEM_SIZE);
        prog.copy(mem, 0x0200);
        mem[0xFFFC] = 0x00;
        mem[0xFFFD] = 0x02;
        this.mem = mem as Uint8Array;
    }

    public static loadProgStr(str: string) {
        str = str.replace(/[^A-z0-9]/g, "");
        let prog = Buffer.from(str, "hex");
        let mem = new Buffer(this.MEM_SIZE);
        prog.copy(mem, 0x0200);
        mem[0xFFFC] = 0x00;
        mem[0xFFFD] = 0x02;
        this.mem = mem as Uint8Array;
    }

    private static writeMem() {
        let fs = require("fs");
        fs.writeFileSync(this.MEM_PATH, Buffer.from(this.mem));
    }

    public static requestInterrupt() {
        this.handleInterrupt(0xFFFE)
    }

    public static requestNonMaskInterrupt() {
        this.handleInterrupt(0xFFFA);
    }

    public static reset() {
        this.flags.interruptDisable = true;
        this.PC = this.getResetVector();
    }

    private static handleInterrupt(resetVectStartAddr: number) {
        if (!this.flags.interruptDisable) {
            this.handleForcedInterrupt(resetVectStartAddr);
        }
    }

    private static handleForcedInterrupt(resetVectStartAddr: number) {
        //Split PC and add each addr byte to stack
        let bytes = splitHex(this.PC);
        this.pushStack(bytes[0]); //MSB
        this.pushStack(bytes[1]); //LSB
        //Store the processor status in the stack
        pushStatusToStack.bind(this).call();
        this.flags.interruptDisable = true;
        //Set program counter to interrupt vector
        let vector = new Uint8Array(
            this.mem.slice(resetVectStartAddr, resetVectStartAddr+1));
        this.PC = combineHexBuff(vector.reverse());
    }

    private static getResetVector(): number{
        let bytes = new Uint8Array(this.mem.slice(0xFFFC,0xFFFE));
        return combineHexBuff(bytes.reverse());
    }

    private static pushStack(byte: number) {
        this.mem[this.SP] = byte;               //Write byte to stack
        this.SP--;                              //Decrement stack pointer
        if (this.SP < 0) { this.SP = 0xFF; }    //Wrap stack pointer, if necessary
    }

    private static pullStack(): number {
        let byte = this.mem[this.SP];
        this.SP++;
        if (this.SP > 0xFF) { this.SP = 0; }
        return byte;
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

    private static nextByte(): number {
        return this.mem[this.PC+1];
    }

    private static next2Bytes(flip = true): number {
        let bytes = new Uint8Array(this.mem.slice(this.PC+1, this.PC+3));
        if (flip) {
            bytes.reverse();
        }
        return combineHexBuff(bytes);
    }

    private static updateOverflowFlag(register: number, num1: number, num2: number) {
        //If the sum of two like signed terms is a diff sign, then the
        //signed result is outside [-128, 127], so set overflow flag
        this.flags.overflow= (num1 < 0x80 && num2 < 0x80 && this.ACC >= 0x80) ||
                              (num1 >= 0x80 && num2 >= 0x80 && this.ACC < 0x80);
    }

    private static updateNegativeFlag(register: number) {
        this.flags.negative = (register > 0x7F);
    }

    private static updateNumStateFlags(register: number) {
        this.flags.zero = (register === 0x00);
        this.updateNegativeFlag(register);
    }

    private static getRef(offset: number = 0): number {
        let addr = this.next2Bytes() + offset;
        if (this.debug) { console.log(`Accessing memory at 0x${
            addr.toString(16).padStart(4, "0")}...`); }
        return addr;
    }

    private static getZPageRef(offset: number = 0): number {
        let addr = this.nextByte() + offset;
        if (this.debug) { console.log(`Accessing memory at 0x${
            addr.toString(16).padStart(4, "0")}...`); }
        return addr;
    }

    private static getIndrRef(offset: number = 0): number {
        let addr = this.nextByte() + offset;
        return combineHex(this.mem[addr+1], this.mem[addr]);
    }
}

var input = require('readline-sync');
var hexStr = input.question("Please enter program hex: ");
if (hexStr.length > 0) {
    p6502.loadProgStr(hexStr);
}
p6502.boot();
console.log("");
p6502.displayState();
