const fs = require("mz/fs");

const reservedKeywords = [
  "org",
  "add",
  "sub",
  "mul",
  "and",
  "or",
  "not",
  "xor",
  "shl",
  "shr",
  "wm",
  "rm",
  "rio",
  "wio",
  "wb",
  "wib",
  "wacc",
  "racc",
  "swap",
  "br",
  "bre",
  "brne",
  "brgt",
  "brlt",
  "eop",
];

const instructionMap = {
  add: 0b11110,
  sub: 0b11101,
  mul: 0b11011,
  and: 0b11010,
  or: 0b11001,
  not: 0b11000,
  xor: 0b10111,
  shl: 0b10110,
  shr: 0b10101,
  wm: 0b00001,
  rm: 0b00010,
  rio: 0b00100,
  wio: 0b00101,
  wb: 0b00110,
  wib: 0b00111,
  wacc: 0b01001,
  racc: 0b01011,
  swap: 0b01110,
  br: 0b00011,
  bre: 0b10100,
  brne: 0b10011,
  brgt: 0b10010,
  brlt: 0b10001,
  eop: 0b11111,
  org: 0b00000,
};

//const filepath = "assembly.asm";

async function getOrg(filename) {
  const data = await fs.readFile(filename, "utf8");
  const lines = data.split("\n");
  const firstLine = lines[0].trim();

  let initialValue = 0;
  const match = firstLine.match(/org\s+(\w+)/i);
  if (match) {
    initialValue = parseInt(match[1], 16);
  }

  return initialValue;
}
function hexToBinary(hexString) {
  if (!hexString) {
    return undefined;
  }
  const hex = hexString.startsWith("0x") ? hexString.slice(2) : hexString;
  return parseInt(hex, 16);
}
function binaryToHex(binaryString) {
  const num = parseInt(binaryString, 2);
  return num.toString(16);
}
function combineInstructionAndOperand(instructionCode, operand) {
  let maxOperandValue = 0b11111111111; // 11 bits set to 1
  let encodedInstruction =
    (instructionCode << 11) | (operand & maxOperandValue);
  const c1 = encodedInstruction.toString(16).padStart(4, "0");
  if (instructionCode === 0b00110 || instructionCode === 0b00111) {
    const upperNibble = instructionCode << 3;
    return {
      cycle1: upperNibble.toString(16).padStart(2, "0"), // convert to hex string with padding
      cycle2: binaryToHex(operand.toString(2)), // convert to hex string with padding
    };
  }
  return {
    cycle1: c1.slice(0, 2).toLocaleUpperCase(),
    cycle2: (parseInt(c1, 16) & 0x00ff).toString(16),
  }; // convert to hex string with padding
}

function storeLabels(lines, org) {
  const labels = new Map();
  for (const line of lines) {
    // Check if the line has a label
    let label = null;
    const colonIndex = line.indexOf(":");
    if (colonIndex !== -1 && /^\w+\s*:/.test(line)) {
      label = line.slice(0, colonIndex);
      labels.set(label, org);
    }
    org++;
  }
  return labels;
}
function validOrg(org){
  return !isNaN(org) || org !== undefined || org !== null
}

async function assembler(filepath) {
  let result = [];
  const data = await fs.promises.readFile(filepath, "utf8");
  const lines = data
    .split("\n")
    .filter((line) => !/^\s*;/.test(line)) // remove pre-processor directives
    .map((line) => line.trim()); // trim whitespace from each line

  let org = (await getOrg(filepath)) || 0x00;

  let labelsMap = storeLabels(lines, org);

  if (validOrg(org)) {
    for (const line of lines) {
      if (line.includes("ORG") || line.includes("org") || line === "") {
        continue;
      }
      //Check if the line has a label
      let label = null;
      const colonIndex = line.indexOf(":");
      if (colonIndex !== -1 && /^\w+\s*:/.test(line)) {
        label = line.slice(0, colonIndex);
      }

      // Parse the instruction and operand
      const lineWithoutLabel = label ? line.slice(colonIndex + 1).trim() : line;
      let [instruction, operand] = lineWithoutLabel.split(/\s+/);

      if(instruction === "") continue;

      if (reservedKeywords.includes(instruction.toLocaleLowerCase())) {
        const instKey = instruction.toLocaleLowerCase();
        instructionMap.org = org;

        //check if operand is a label
        const { cycle1, cycle2 } = combineInstructionAndOperand(
          instructionMap[instKey.trim()],
          hexToBinary(operand)
        );

        console.log(
          `INST=${instruction} \tADDR=0x${org.toString(
            16
          )}; \tBUS=0x${cycle1}; \tMainMemory();`
        );
        console.log(
          `\t\tADDR=0x${(org + 1).toString(16)}; \tBUS=0x${
            labelsMap.has(operand)
              ? labelsMap.get(operand).toString(16)
              : cycle2
          }; \tMainMemory();`
        );

        result.push(
          `ADDR=0x${org.toString(16)}; \tBUS=0x${cycle1}; \tMainMemory();`
        );
        result.push(
          `ADDR=0x${(org + 1).toString(16)}; \tBUS=0x${
            labelsMap.has(operand)
              ? labelsMap.get(operand).toString(16)
              : cycle2
          }; \tMainMemory();`
        );

        org += 2;
      } else {
        console.error(`Error: unrecognized instruction \"${instruction}\"`);
      }
    }
  }
  return result.join("\n");
}
module.exports = assembler
