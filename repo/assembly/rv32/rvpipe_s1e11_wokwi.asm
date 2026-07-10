
# WepSIM (https://wepsim.github.io/wepsim/)
#
# Wokwi external devices example for the RV32 pipeline
# Uses in/out instructions to interact with Wokwi components
#
# Memory map (Wokwi devices):
#   0x1300: LED 0    (out: 0=off, 1=on)
#   0x1304: LED 1    (out: 0=off, 1=on)
#   0x1310: Button 0 (in:  returns 0/1)
#   0x1314: Button 1 (in:  returns 0/1)
#   0x1320: 7-Segment (out: write hex digit 0-15)
#   0x1324: Buzzer   (out: 0=off, 1=on)
#   0x1328: Switch   (in:  returns 0/1)
#   0x132C: DIP Switch (in: returns 8-bit value 0-255)

.data
msg_on:  .string "LED On!\n"
msg_off: .string "LED Off!\n"

.text

# print: prints a null-terminated string pointed by a0
print:
    lbu     t1, 0(a0)
    beq     t1, x0, print_end
    out     t1, 0x1000
    addi    a0, a0, 1
    j       print
print_end: jr      ra

main:
    # --- LED demo: blink LED 0 ---
    li      t0, 1
    out     t0, 0x1300        # LED 0 ON

    # Read DIP switch value and show on LED 1
    in      t0, 0x132C        # Read DIP switch (8-bit value)
    andi    t1, t0, 1         # LSB -> LED 1
    out     t1, 0x1304        # LED 1 = DIP LSB

    # Write lowest nibble of DIP switch to 7-segment
    andi    t1, t0, 0x0F
    out     t1, 0x1320        # 7-segment = DIP nibble

    # Read button 0 -> toggle buzzer
    in      t0, 0x1310        # Read Button 0
    out     t0, 0x1324        # Buzzer = button state

    # Read switch -> turn LED 0 off if switch is ON
    in      t0, 0x1328        # Read switch
    beqz    t0, skip_off
    li      t1, 0
    out     t1, 0x1300        # LED 0 OFF
skip_off:

    # Print message
    la      a0, msg_on
    jal     ra, print
