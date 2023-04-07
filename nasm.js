// Initialize the editor

// Define syntax highlighting rules
CodeMirror.defineMode("asm", function() {
  var registers = ["eax", "ebx", "ecx", "edx", "esi", "edi", "ebp", "esp"];
  var instructions = ["mov", "push", "pop", "add", "sub", "mul", "div", "cmp", "je", "jne", "jmp", "call", "ret"];
  var directives = [".section", ".data", ".bss", ".text", ".globl", ".align", ".ascii", ".asciz", ".byte", ".word", ".long", ".quad", ".string"];
  var labels = /^[a-zA-Z0-9_]+:$/;

  return {
    token: function(stream, state) {
      // Skip whitespace
      if (stream.eatSpace()) return null;

      // Comments
      if (stream.match(/^(#|\/\/).*/)) {
        return "comment";
      }

      // Registers
      if (stream.match(new RegExp(registers.join("|"), "i"))) {
        return "variable-2";
      }

      // Instructions
      if (stream.match(new RegExp(instructions.join("|"), "i"))) {
        return "keyword";
      }

      // Directives
      if (stream.match(new RegExp(directives.join("|"), "i"))) {
        return "atom";
      }

      // Numbers
      if (stream.match(/^-?(0x[0-9a-f]+|\d+)$/i)) {
        return "number";
      }

      // Labels
      if (stream.match(labels)) {
        return "def";
      }

      // Invalid characters
      stream.next();
      return "error";
    }
  };
});
