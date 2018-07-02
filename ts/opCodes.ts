/// <reference path="6502.ts" />
interface opTable {
    [code: string]: {
        name: string,
        bytes: number,
        cycles: number,
        execute: Function
    }
}

let opTable: opTable = {};
opTable[0x00] = {
    name: "BRK", //TODO: Make this cause a non-maskable interrupt
    bytes: 1,
    cycles: 7,
    execute: function() {
        this.running = false;
        this.flags.break = true;
    }
}
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
    name: "LDA (imm)", //Load Accumulator with constant (Immediate)
    bytes: 2,
    cycles: 2,
    execute: function() {
        this.ACC = this.nextByte();
        this.updateNumStateFlags(this.ACC);
    }
}
opTable[0xAD] = {
    name: "LDA (abs)", //Load Accumulator from memory location (Absolute)
    bytes: 3,
    cycles: 4,
    execute: function() {
        let addr = this.getRef();
        this.ACC = this.mem[addr];
        this.updateNumStateFlags(this.ACC);
    }
}
opTable[0xBD] = {
    name: "LDA (abs, X)",
    bytes: 3,
    cycles: 4,
    execute: function() {
        let addr = this.getRef(this.X);
        this.ACC = this.mem[addr];
        this.updateNumStateFlags(this.ACC);
    }
}
opTable[0xB9] = {
    name: "LDA (abs, Y)",
    bytes: 3,
    cycles: 4,
    execute: function() {
        let addr = this.getRef(this.Y);
        this.ACC = this.mem[addr];
        this.updateNumStateFlags(this.ACC);
    }
}
opTable[0xA5] = {
    name: "LDA (zpg)",
    bytes: 2,
    cycles: 3,
    execute: function() {
        let addr = this.getZPageRef();
        this.ACC = this.mem[addr];
        this.updateNumStateFlags(this.ACC);
    }
}
opTable[0xB5] = {
    name: "LDA (zpg, X)",
    bytes: 2,
    cycles: 4,
    execute: function() {
        let addr = this.getZPageRef(this.X);
        this.ACC = this.mem[addr];
        this.updateNumStateFlags(this.ACC);
    }
}
opTable[0xA1] = {
    name: "LDA (ind, X)",
    bytes: 2,
    cycles: 6,
    execute: function() {
        let addr = this.getIndRef(this.X);
        this.ACC = this.mem[addr];
        this.updateNumStateFlags(this.ACC);
    }
}
opTable[0xA1] = {
    name: "LDA (ind, Y)",
    bytes: 2,
    cycles: 5,
    execute: function() {
        let addr = this.getIndRef(this.Y);
        this.ACC = this.mem[addr];
        this.updateNumStateFlags(this.ACC);
    }
}

opTable[0xA2] = {
    name: "LDX (imm)", //Load X with constant
    bytes: 2,
    cycles: 2,
    execute: function() {
        this.X = this.nextByte();
        this.updateNumStateFlags(this.X);
    }
}
opTable[0xA6] = {
    name: "LDX (zpg)",
    bytes: 2,
    cycles: 3,
    execute: function() {
        let addr = this.getZPageRef();
        this.X = this.mem[addr];
        this.updateNumStateFlags(this.X);
    }
}
opTable[0xB6] = {
    name: "LDX (zpg, X)",
    bytes: 2,
    cycles: 4,
    execute: function() {
        let addr = this.getZPageRef(this.X);
        this.X = this.mem[addr];
        this.updateNumStateFlags(this.X);
    }
}
opTable[0xAE] = {
    name: "LDX (abs)", //Load X from memory
    bytes: 3,
    cycles: 4,
    execute: function() {
        let addr = this.getRef();
        this.X = this.mem[addr];
        this.updateNumStateFlags(this.X);
    }
}
opTable[0xBE] = {
    name: "LDX (abs, X)",
    bytes: 3,
    cycles: 4,
    execute: function() {
        let addr = this.getRef(this.X);
        this.X = this.mem[addr];
        this.updateNumStateFlags(this.X);
    }
}

opTable[0xA0] = {
    name: "LDY (imm)", //Load Y with constant
    bytes: 2,
    cycles: 2,
    execute: function() {
        this.Y = this.nextByte();
    }
}
opTable[0xA4] = {
    name: "LDY (zpg)",
    bytes: 2,
    cycles: 3,
    execute: function() {
        let addr = this.getZPageRef();
        this.Y = this.mem[addr];
    }
}
opTable[0xB4] = {
    name: "LDY (zpg, X)",
    bytes: 2,
    cycles: 4,
    execute: function() {
        let addr = this.getZPageRef(this.X);
        this.Y = this.mem[addr];
    }
}
opTable[0xAC] = {
    name: "LDY (abs)", //Load Y with constant
    bytes: 3,
    cycles: 4,
    execute: function() {
        let addr = this.getRef();
        this.Y = this.mem[addr];
    }
}
opTable[0xBC] = {
    name: "LDY (abs, X)",
    bytes: 3,
    cycles: 4,
    execute: function() {
        let addr = this.getRef(this.X);
        this.Y = this.mem[addr];
    }
}

opTable[0x85] = {
    name: "STA (zpg)",
    bytes: 2,
    cycles: 3,
    execute: function() {
        let addr = this.getZPageRef();
        this.mem[addr] = this.ACC;
    }
}
opTable[0x95] = {
    name: "STA (zpg, X)",
    bytes: 2,
    cycles: 4,
    execute: function() {
        let addr = this.getZPageRef(this.X);
        this.mem[addr] = this.ACC;
    }
}
opTable[0x8D] = {
    name: "STA (abs)",
    bytes: 3,
    cycles: 4,
    execute: function() {
        let addr = this.getRef();
        this.mem[addr] = this.ACC;
    }
}
opTable[0x9D] = {
    name: "STA (abs, X)",
    bytes: 3,
    cycles: 4,
    execute: function() {
        let addr = this.getRef(this.X);
        this.mem[addr] = this.ACC;
    }
}
opTable[0x99] = {
    name: "STA (abs, Y)",
    bytes: 3,
    cycles: 4,
    execute: function() {
        let addr = this.getRef(this.Y);
        this.mem[addr] = this.ACC;
    }
}
opTable[0x81] = {
    name: "STA (ind, X)",
    bytes: 2,
    cycles: 6,
    execute: function() {
        let addr = this.getIndrRef(this.X);
        this.mem[addr] = this.ACC;
    }
}
opTable[0x91] = {
    name: "STA (ind, Y)",
    bytes: 2,
    cycles: 5,
    execute: function() {
        let addr = this.getIndrRef(this.Y);
        this.mem[addr] = this.ACC;
    }
}

opTable[0x86] = {
    name: "STX (zpg)",
    bytes: 2,
    cycles: 3,
    execute: function() {
        let addr = this.getZPageRef();
        this.mem[addr] = this.X;
    }
}
opTable[0x96] = {
    name: "STX (zpg, Y)",
    bytes: 2,
    cycles: 4,
    execute: function() {
        let addr = this.getZPageRef(this.Y);
        this.mem[addr] = this.X;
    }
}
opTable[0x8E] = {
    name: "STX (abs)",
    bytes: 3,
    cycles: 4,
    execute: function() {
        let addr = this.getRef();
        this.mem[addr] = this.X;
    }
}

opTable[0x84] = {
    name: "STY (zpg)",
    bytes: 2,
    cycles: 3,
    execute: function() {
        let addr = this.getZPageRef();
        this.mem[addr] = this.Y;
    }
}
opTable[0x94] = {
    name: "STY (zpg, Y)",
    bytes: 2,
    cycles: 4,
    execute: function() {
        let addr = this.getZPageRef(this.X);
        this.mem[addr] = this.Y;
    }
}
opTable[0x8C] = {
    name: "STY (abs)",
    bytes: 2,
    cycles: 4,
    execute: function() {
        let addr = this.getRef();
        this.mem[addr] = this.Y;
    }
}

opTable[0xAA] = {
    name: "TAX",
    bytes: 1,
    cycles: 2,
    execute: function() {
        this.X = this.ACC;
        this.updateNumStateFlags(this.X);
    }
}
opTable[0xA8] = {
    name: "TAY",
    bytes: 1,
    cycles: 2,
    execute: function() {
        this.Y = this.ACC;
        this.updateNumStateFlags(this.Y);
    }
}
opTable[0xBA] = {
    name: "TSX",
    bytes: 1,
    cycles: 2,
    execute: function() {
        this.X = this.SP;
        this.updateNumStateFlags(this.X);
    }
}
opTable[0x8A] = {
    name: "TXA",
    bytes: 1,
    cycles: 2,
    execute: function() {
        this.ACC= this.X;
        this.updateNumStateFlags(this.ACC);
    }
}
opTable[0x9A] = {
    name: "TXS",
    bytes: 1,
    cycles: 2,
    execute: function() {
        this.SP = this.X;
        this.updateNumStateFlags(this.SP);
    }
}
opTable[0x98] = {
    name: "TYA",
    bytes: 1,
    cycles: 2,
    execute: function() {
        this.ACC = this.Y;
        this.updateNumStateFlags(this.Y);
    }
}

function ADC(num: number) {
    let num2 = this.ACC;
    this.ACC += num + this.flags.carry;
    //Wrap ACC and set/clear carry flag
    if (this.ACC > 0xFF) {
        this.flags.carry = true;
        this.ACC -= 0x100;
    } else {
        this.flags.carry = false;
    }
    ///Set/clear overflow flag
    this.updateOverflowFlag(this.ACC, num, num2);
    //Set/clear negative + zero flags
    this.updateNumStateFlags(this.ACC);
}
opTable[0x69] = {
    name: "ADC (imm)", //Adds constant to ACC
    bytes: 2,
    cycles: 2,
    execute: function() {
        ADC.bind(this).call(this.nextByte());
    }
}
opTable[0x65] = {
    name: "ADC (zpg)",
    bytes: 2,
    cycles: 3,
    execute: function() {
        let addr = this.getZPageRef();
        ADC.bind(this).call(this.mem[addr]);
    }
}
opTable[0x75] = {
    name: "ADC (zpg, X)",
    bytes: 2,
    cycles: 4,
    execute: function() {
        let addr = this.getZPageRef(this.X);
        ADC.bind(this).call(this.mem[addr]);
    }
}
opTable[0x6D] = {
    name: "ADC (abs)", //Add contents at memory location to ACC
    bytes: 3,
    cycles: 4,
    execute: function() {
        let addr = this.getRef();
        ADC.bind(this).call(this.mem[addr]);
    }
}
opTable[0x7D] = {
    name: "ADC (abs, X)",
    bytes: 3,
    cycles: 4,
    execute: function() {
        let addr = this.getRef(this.X);
        ADC.bind(this).call(this.mem[addr]);
    }
}
opTable[0x79] = {
    name: "ADC (abs, Y)",
    bytes: 3,
    cycles: 4,
    execute: function() {
        let addr = this.getRef(this.Y);
        ADC.bind(this).call(this.mem[addr]);
    }
}
opTable[0x61] = {
    name: "ADC (ind, X)",
    bytes: 2,
    cycles: 6,
    execute: function() {
        let addr = this.getIndrRef(this.X);
        ADC.bind(this).call(this.mem[addr]);
    }
}
opTable[0x71] = {
    name: "ADC (ind, Y)",
    bytes: 2,
    cycles: 6,
    execute: function() {
        let addr = this.getIndrRef(this.Y);
        ADC.bind(this).call(this.mem[addr]);
    }
}

function SBC(num: number) {
    let num2 = this.ACC;
    this.ACC -= num + this.flags.carry;
    //Wrap ACC and set/clear carry flag
    if (this.ACC < 0x00) {
        this.flags.carry = true;
        this.ACC += 0x100;
    } else {
        this.flags.carry = false;
    }
    ///Set/clear overflow flag
    this.updateOverflowFlag(this.ACC, num, num2);
    //Set/clear negative + zero flags
    this.updateNumStateFlags(this.ACC);
}
opTable[0xE9] = {
    name: "SBC (imm)",
    bytes: 2,
    cycles: 2,
    execute: function() {
        SBC.bind(this).call(this.nextByte());
    }
}
opTable[0xE5] = {
    name: "SBC (zpg)",
    bytes: 2,
    cycles: 3,
    execute: function() {
        let num = this.mem[this.getZPageRef()];
        SBC.bind(this).call(num);
    }
}
opTable[0xF5] = {
    name: "SBC (zpg, X)",
    bytes: 2,
    cycles: 4,
    execute: function() {
        let num = this.mem[this.getZPageRef(this.X)];
        SBC.bind(this).call(num);
    }
}
opTable[0xED] = {
    name: "SBC (abs)",
    bytes: 3,
    cycles: 4,
    execute: function() {
        let num = this.mem[this.getRef()];
        SBC.bind(this).call(num);
    }
}
opTable[0xFD] = {
    name: "SBC (abs, X)",
    bytes: 3,
    cycles: 4,
    execute: function() {
        let num = this.mem[this.getRef(this.X)];
        SBC.bind(this).call(num);
    }
}
opTable[0xF9] = {
    name: "SBC (abs, Y)",
    bytes: 3,
    cycles: 4,
    execute: function() {
        let num = this.mem[this.getRef(this.Y)];
        SBC.bind(this).call(num);
    }
}
opTable[0xE1] = {
    name: "SBC (ind, X)",
    bytes: 2,
    cycles: 6,
    execute: function() {
        let num = this.mem[this.getIndrRef(this.X)];
        SBC.bind(this).call(num);
    }
}
opTable[0xF1] = {
    name: "SBC (ind, Y)",
    bytes: 2,
    cycles: 6,
    execute: function() {
        let num = this.mem[this.getIndrRef(this.Y)];
        SBC.bind(this).call(num);
    }
}

opTable[0xEA] = {
    name: "NOP", //No operation
    bytes: 1,
    cycles: 1,
    execute: function() { }
}

opTable[0xEC] = {
    name: "CPX", //Compare byte in memory to X register, sets zero if equal
    bytes: 3,
    cycles: 4,
    execute: function() {
        let addr = this.getRef();
        this.flags.zero = (this.mem[addr] == this.X) ? true : false;
    }
}

opTable[0xD0] = {
    name: "BNE", //Branch Not Equal, branch if zero flag is cleared
    bytes: 2,
    cycles: 3, //TODO: Adjust cycles conditionally
    execute: function() {
        if (!this.flags.zero) {
            if (this.debug) {
                console.log(`Branching ${this.nextByte()} bytes...`);
            }
            this.PC += this.nextByte();
        }
    }
}

opTable[0xE6] = {
    name: "INC (zpg)", //Increment byte in memory by 1
    bytes: 2,
    cycles: 5,
    execute: function() {
        let addr = this.getZPageRef();
        this.mem[addr]++;
        this.updateNumStateFlags(this.mem[addr]);
    }
}
opTable[0xF6] = {
    name: "INC (zpg, X)",
    bytes: 2,
    cycles: 6,
    execute: function() {
        let addr = this.getZPageRef(this.X);
        this.mem[addr]++;
        this.updateNumStateFlags(this.mem[addr]);
    }
}
opTable[0xEE] = {
    name: "INC (abs)",
    bytes: 3,
    cycles: 6,
    execute: function() {
        let addr = this.getRef();
        this.mem[addr]++;
        this.updateNumStateFlags(this.mem[addr]);
    }
}
opTable[0xFE] = {
    name: "INC (abs, X)",
    bytes: 3,
    cycles: 7,
    execute: function() {
        let addr = this.getRef(this.X);
        this.mem[addr]++;
        this.updateNumStateFlags(this.mem[addr]);
    }
}

opTable[0xE8] = {
    name: "INX",
    bytes: 1,
    cycles: 2,
    execute: function() {
        this.X++;
        this.updateNumStateFlags(this.X);
    }
}
opTable[0xC8] = {
    name: "INY",
    bytes: 1,
    cycles: 2,
    execute: function() {
        this.Y++;
        this.updateNumStateFlags(this.Y);
    }
}

opTable[0xC6] = {
    name: "DEC (zpg)", //Decrement byte in memory by 1
    bytes: 2,
    cycles: 5,
    execute: function() {
        let addr = this.getZPageRef();
        this.mem[addr]--;
        this.updateNumStateFlags(this.mem[addr]);
    }
}
opTable[0xD6] = {
    name: "DEC (zpg, X)",
    bytes: 2,
    cycles: 6,
    execute: function() {
        let addr = this.getZPageRef(this.X);
        this.mem[addr]--;
        this.updateNumStateFlags(this.mem[addr]);
    }
}
opTable[0xCE] = {
    name: "DEC (abs)",
    bytes: 3,
    cycles: 3,
    execute: function() {
        let addr = this.getRef();
        this.mem[addr]--;
        this.updateNumStateFlags(this.mem[addr]);
    }
}
opTable[0xDE] = {
    name: "DEC (abs, X)",
    bytes: 3,
    cycles: 7,
    execute: function() {
        let addr = this.getRef(this.X);
        this.mem[addr]--;
        this.updateNumStateFlags(this.mem[addr]);
    }
}

opTable[0xCA] = {
    name: "DEX",
    bytes: 1,
    cycles: 2,
    execute: function() {
        this.X--;
        this.updateNumStateFlags(this.X);
    }
}
opTable[0x88] = {
    name: "DEY",
    bytes: 1,
    cycles: 2,
    execute: function() {
        this.Y--;
        this.updateNumStateFlags(this.Y);
    }
}

opTable[0x18] = {
    name: "CLC",
    bytes: 1,
    cycles: 2,
    execute: function() {
        this.flags.carry = false;
    }
}
opTable[0xD8] = {
    name: "CLD",
    bytes: 1,
    cycles: 2,
    execute: function() {
        this.flags.decimalMode = false;
    }
}
opTable[0xB8] = {
    name: "CLV",
    bytes: 1,
    cycles: 2,
    execute: function() {
        this.flags.overflow = false;
    }
}
opTable[0x58] = {
    name: "CLI",
    bytes: 1,
    cycles: 2,
    execute: function() {
        this.flags.interruptDisable = false;
    }
}

opTable[0x38] = {
    name: "SEC",
    bytes: 1,
    cycles: 2,
    execute: function() {
        this.flags.carry = true;
    }
}
opTable[0xF8] = {
    name: "SED",
    bytes: 1,
    cycles: 2,
    execute: function() {
        this.flags.decimalMode = true;
    }
}
opTable[0x78] = {
    name: "SEI",
    bytes: 1,
    cycles: 2,
    execute: function() {
        this.flags.interruptDisable = true;
    }
}
