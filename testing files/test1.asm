DATA SEGMENT
   PORTA EQU 0F0H;
   PORTB EQU 0F2H;
   PORTC EQU 0F4H;
   COM_REG EQU 0F6H;
DATA ENDS


CODE    SEGMENT PUBLIC 'CODE'
        ASSUME CS:CODE
	MOV AX, DATA
	MOV DS, AX
	
	ORG 0000H

START:
   MOV DX, COM_REG ; set the address 
   MOV AL, 10001001B
   OUT DX, AL ; send the command byte
   
INITIAL:
;initializing both segments to 0
MOV DX, PORTA
MOV AL, 00000000B
OUT DX, AL
MOV DX, PORTB
OUT DX, AL
;pointers for registers
MOV DI, 00H
MOV SI, 00H
;tens place display
TENS:
MOV DX, PORTA
MOV AL, NUMS[SI]
OUT DX, AL
MOV DX, PORTB
MOV AL, NUMS[DI]
OUT DX, AL
;ones place display
ONES:
;checks for input from button
MOV DX, PORTC
IN AL, PORTC
CMP AL, 01H
JE INITIAL
;displays values
MOV DX, PORTA
MOV AL, NUMS[SI]
OUT DX, AL
CALL DELAY_1MS
INC SI
CMP SI, 00001001B;9
JNE ONES
MOV SI, 00H
INC DI
;compares to binary 9
CMP DI, 00001001B;9
JNE TENS
; jumps back to 00 when 99 is reached
JMP INITIAL

NUMS    DB 00000000B;0
	      DB 00000001B;1
	      DB 00000010B;2
	      DB 00000011B;3
	      DB 00000100B;4
	      DB 00000101B;5
	      DB 00000110B;6
	      DB 00000111B;7
	      DB 00001000B;8
	      DB 00001001B;9 

DELAY_1MS:
   MOV BX, 03FCAH
L1:
   DEC BX
   NOP
   JNZ L1
   RET
RET




 HERE:
 NOP

  JMP HERE 
 CODE ENDS 
 END 
