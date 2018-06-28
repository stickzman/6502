let opTable = {};
opTable[0x00] = {
    name: "BRK",
    bytes: 1,
    execute: function() {
        this.running = false;
        this.flags.breakCmd = true;
        console.log("BRK");
    }
}
