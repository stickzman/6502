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
    name: "LDA (const)", //Load Accumulator with constant (Immediate)
    bytes: 2,
    cycles: 2,
    execute: function() {
        this.ACC = this.nextByte();
        this.updateFlags(this.ACC);
    }
}
opTable[0xAD] = {
    name: "LDA (mem)", //Load Accumulator from memory location (Absolute)
    bytes: 3,
    cycles: 4,
    execute: function() {
        let addr = this.getRef();
        this.ACC = this.mem[addr];
        this.updateFlags(this.ACC);
    }
}
opTable[0xBD] = {
    name: "LDA (mem, X)",
    bytes: 3,
    cycles: 4,
    execute: function() {
        let addr = this.getRef(this.X);
        this.ACC = this.mem[addr];
        this.updateFlags(this.ACC);
    }
}
opTable[0xB9] = {
    name: "LDA (mem, Y)",
    bytes: 3,
    cycles: 4,
    execute: function() {
        let addr = this.getRef(this.Y);
        this.ACC = this.mem[addr];
        this.updateFlags(this.ACC);
    }
}
opTable[0xA5] = {
    name: "LDA (zpg)",
    bytes: 2,
    cycles: 3,
    execute: function() {
        let addr = this.getZPageRef();
        this.ACC = this.mem[addr];
        this.updateFlags(this.ACC);
    }
}
opTable[0xB5] = {
    name: "LDA (zpg, X)",
    bytes: 2,
    cycles: 4,
    execute: function() {
        let addr = this.getZPageRef(this.X);
        this.ACC = this.mem[addr];
        this.updateFlags(this.ACC);
    }
}
opTable[0xA1] = {
    name: "LDA (ind, X)",
    bytes: 2,
    cycles: 6,
    execute: function() {
        let addr = this.getIndRef(this.X);
        this.ACC = this.mem[addr];
        this.updateFlags(this.ACC);
    }
}
opTable[0xA1] = {
    name: "LDA (ind, Y)",
    bytes: 2,
    cycles: 5,
    execute: function() {
        let addr = this.getIndRef(this.Y);
        this.ACC = this.mem[addr];
        this.updateFlags(this.ACC);
    }
}

opTable[0x8D] = {
    name: "STA", //Store Accumulator in memory location
    bytes: 3,
    cycles: 4,
    execute: function() {
        let addr = this.getRef();
        this.mem[addr] = this.ACC;
        this.updateFlags(this.ACC);
    }
}


opTable[0x6D] = {
    name: "ADC", //Add contents at memory location to ACC
    bytes: 3,
    cycles: 4,
    execute: function() {
        let addr = this.getRef();
        let num1 = this.mem[addr];
        let num2 = this.ACC;
        this.ACC += num1 + this.flags.carry;
        //Wrap ACC and set/clear carry flag
        if (this.ACC > 0xFF) {
            this.flags.carry = true;
            this.ACC -= 0x100;
        } else {
            this.flags.carry = false;
        }
        //If the sum of two like signed terms is a diff sign, then the
        //signed result is outside [-128, 127], so set overflow flag
        this.flags.overflow= (num1 < 0x80 && num2 < 0x80 && this.ACC >= 0x80) ||
                              (num1 >= 0x80 && num2 >= 0x80 && this.ACC < 0x80);
    }
}

opTable[0xA2] = {
    name: "LDX (const)", //Load X with constant
    bytes: 2,
    cycles: 2,
    execute: function() {
        this.X = this.nextByte();
        this.updateFlags(this.X);
    }
}
opTable[0xA6] = {
    name: "LDX (zpg)",
    bytes: 2,
    cycles: 3,
    execute: function() {
        let addr = this.getZPageRef();
        this.X = this.mem[addr];
        this.updateFlags(this.X);
    }
}
opTable[0xB6] = {
    name: "LDX (zpg, X)",
    bytes: 2,
    cycles: 4,
    execute: function() {
        let addr = this.getZPageRef(this.X);
        this.X = this.mem[addr];
        this.updateFlags(this.X);
    }
}
opTable[0xAE] = {
    name: "LDX (mem)", //Load X from memory
    bytes: 3,
    cycles: 4,
    execute: function() {
        let addr = this.getRef();
        this.X = this.mem[addr];
        this.updateFlags(this.X);
    }
}
opTable[0xBE] = {
    name: "LDX (mem, X)",
    bytes: 3,
    cycles: 4,
    execute: function() {
        let addr = this.getRef(this.X);
        this.X = this.mem[addr];
        this.updateFlags(this.X);
    }
}

opTable[0xA0] = {
    name: "LDY (const)", //Load Y with constant
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
    name: "LDY (mem)", //Load Y with constant
    bytes: 3,
    cycles: 4,
    execute: function() {
        let addr = this.getRef();
        this.Y = this.mem[addr];
    }
}
opTable[0xBC] = {
    name: "LDY (mem, X)",
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

opTable[0xEE] = {
    name: "INC", //Increment content in memory by 1
    bytes: 3,
    cycles: 6,
    execute: function() {
        this.mem[this.nextByte()]++;
    }
}
