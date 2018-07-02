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
//LDA
opTable[0xA9] = {
    name: "LDA (const)", //Load Accumulator with constant (Immediate)
    bytes: 2,
    cycles: 2,
    execute: function() {
        this.ACC = this.nextByte();
    }
}
opTable[0xAD] = {
    name: "LDA (mem)", //Load Accumulator from memory location (Absolute)
    bytes: 3,
    cycles: 4,
    execute: function() {
        let addr = getAddr();
        this.ACC = this.mem[addr];
    }
}
opTable[0x8D] = {
    name: "STA", //Store Accumulator in memory location
    bytes: 3,
    cycles: 4,
    execute: function() {
        let addr = getAddr(false);
        this.mem[addr] = this.ACC;
    }
}
opTable[0x6D] = {
    name: "ADC", //Add contents at memory location to ACC
    bytes: 3,
    cycles: 4,
    execute: function() {
        let addr = getAddr();
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
    }
}
opTable[0xAE] = {
    name: "LDX (mem)", //Load X from memory
    bytes: 3,
    cycles: 4,
    execute: function() {
        let addr = getAddr();
        this.X = addr;
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
opTable[0xAC] = {
    name: "LDY (mem)", //Load Y with constant
    bytes: 3,
    cycles: 4,
    execute: function() {
        let addr = getAddr();
        this.Y = addr;
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
        let addr = getAddr();
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

function getAddr(read: boolean = true): number {
    let addr = p6502.next2Bytes();
    if (p6502.debug) { console.log(`${
        (read) ? "Reading from" : "Writing to"} memory at 0x${
        addr.toString(16).padStart(4, "0")}...`); }
    return addr;
}
