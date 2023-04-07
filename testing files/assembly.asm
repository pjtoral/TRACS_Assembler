ORG 0x10
start:   WB 0x55		 ; write 0x05 to MBR
         WM 0x400	 	 ; write data on MBR to memory at address 0x400
         WB 0x05	 	 ; write 0x03 to MBR
         WACC	 	         ; write data on MBR to memory at address 0x401
         WB 0x08	 	 ; read address 0x400, store data to MBR
         ADD	 	 	 ; write MBR to ACC (via BUS)
         RM 0x400	 	 ; read data at memory address 0x401, store to MBR
    	 MUL	 	 	 ; add ACC to MBR (through BUS)
    	 RACC	 	 	 ; read ACC, store to MBR
    	 WM 0x401	 	 ; write data on MBR to memory address 0x402
    	 WIB 0x0B	 	 ; write 0x00 to MBR
    	 WIO 0x000	 	 ; read address 0x402, store data to MBR
    	 WB 0x10	 	 ; write MBR to ACC (via BUS)
    	 SUB	 	         ; write 0x05 to MBR
         RACC	 	 	 ; MBR = 0x01
         WIO 0x001	 	 ; ioBuffer[0x001] : 0x0B
         SHL	 	 	 ; ACC = (0x01) << 1 = 0x02	 	 ZF=0, CF=0, OF=0, SF=0
         SHL	 	 	 ; ACC = (0x02) << 1 = 0x04	 	 ZF=0, CF=0, OF=0, SF=0
         SHR	 	 	 ; ACC = (0x04) >> 1 = 0x02	 	 ZF=0, CF=0, OF=0, SF=0
         RM 0x401	 	 ; MBR = 0x11
         OR	 	 	 ; ACC = (0x02) OR (0x11) = 0x13 ZF=0, CF=0, OF=0, SF=0	 
         NOT	 	 	 ; ACC = NOT (0x13) = 0xEC	 	 ZF=0, CF=0, OF=0, SF=0
         RIO 0x001	 	 ; IOBR = 0x0B
here: 	 SWAP	 	 	 ; MBR = 0x0B, IOBR = 0x11
         XOR	 	 	 ; ACC = (0xEC) XOR (0x0B) = 0xE7 ZF=0, CF=0, OF=0, SF=0
         WB 0xFF	 	 ; MBR = 0xFF
         AND	 	 	 ; ACC = (0xE7) AND (0xFF) = 0xE7 ZF=0, CF=0, OF=0, SF=0
         RM 0x401	 	 ; MBR = 0x11
         BRE 0x03C	 	 ; ACC = (0xE7) - (0x11) = 0xD6	 	 ZF=0, CF=0, OF=0, SF=0	 
         WM 0xF0	 	 ; MBR = 0xF0
         BRGT 0x040	 	 ; ACC = (0xD6) - (0xF0) = 0xE6	 	 ZF=0, CF=1, OF=1, SF=1
         BRLT 0x044	 	 ; ACC = (0xE6) - (0xF0) = 0xF6	 	 ZF=0, CF=1, OF=1, SF=1	 	 
         WB 0x00	 	 ; unreachable
         WACC	 	 	 ; unreachable
         WB 0x03	 	 ; MBR = 0x03
         WACC	 	 	 ; ACC = 0x03
         WB 0x00	 	 ; MBR = 0x00
         BRE 0x052	 	 
         WB 0x01	 	 ; MBR = 0x01
         SUB	 	 	 
         BR 0x048 
         EOP	