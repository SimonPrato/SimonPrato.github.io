# BIST-per-Scan Circuit Implementation

## Project Overview

This project implements a comprehensive Built-In Self-Test (BIST) system using scan chain methodology for automated circuit testing. The BIST architecture enables self-testing of a predefined Circuit Under Test (CUT) without external test equipment.

### Course Information
- **University**: Técnico Lisboa
- **Course**: Design Test and Reliability of Electronic Systems
- **Project**: BIST-per-Scan Implementation

## System Architecture

The BIST system integrates the following key components:

### Core Components

1. **Circuit Under Test (CUT)** (`cut.v`)
   - The target circuit to be tested
   - Modified with scan flip-flops for testability
   - Implements a finite state machine with multiple operational states (IDLE, LZ, WR, SS, SD, STZ, WE)

2. **BIST Controller** (`controller.v`)
   - Orchestrates the entire BIST sequence
   - Manages state transitions through six states (S0-S5)
   - Controls test initialization, execution, and completion
   - Parameters: N=13 scan cycles, M=1023 test patterns

3. **Linear Feedback Shift Register (LFSR)** (`lfsr.v`)
   - Generates pseudo-random test patterns
   - 16-bit maximal-length LFSR
   - Configurable seed for pattern optimization
   - Polynomial: x^16 + x^15 + x^13 + x^4 + 1

4. **Scan Chain**
   - Converts all CUT flip-flops to scan flip-flops
   - Enables serial test pattern loading
   - Facilitates observability of internal states
   - Auto-generated during DFT synthesis

5. **Multiple Input Signature Register (MISR)** (`misr.v`)
   - Compresses CUT output responses into a signature
   - 16-bit signature register
   - Compresses 10-bit input vector (scan_out, fz_L, lclk, read_a[4:0], test_out[1:0])
   - Generates golden signature for fault-free operation
   - Integrated comparator for pass/fail determination

6. **Top Module** (`top_module.v`)
   - Integrates all BIST components
   - Manages signal routing and multiplexing
   - Handles mode switching (normal vs. BIST)

### System Diagram

<img width="800" alt="image" src="https://github.com/user-attachments/assets/595f7e7c-63f1-4ae8-bf13-999164edc33e" />

## File Structure

```
.
├── sources/
│   ├── cut.v                    # Original Circuit Under Test
│   ├── cut_scan_syn.v          # Synthesized CUT with scan chain (generated)
│   ├── top_module.v            # Top-level BIST integration
│   ├── top_module_syn.v        # Synthesized top module (generated)
│   ├── controller.v            # BIST controller FSM
│   ├── lfsr.v                  # Pseudo-random pattern generator
│   ├── misr.v                  # Signature analyzer with comparator
│   └── filelist.f              # File list for compilation
│
├── testbenches/
│   ├── tb_cut.v                       # CUT standalone testbench
│   ├── tb_top_level_normal.v         # Normal mode operation testbench
│   ├── tb_top_level_bist.v           # BIST mode testbench
│   ├── tb_top_level_controller.v     # Controller verification testbench
│   └── cut_testvectors.vec           # Test vectors for CUT verification
│
├── scripts/
│   ├── synthesis_dft.tcl       # DFT synthesis script (scan insertion)
│   ├── synthesis_bist.tcl      # BIST system synthesis script
│   ├── fault.file              # Fault simulation target configuration
│   ├── strobes.tcl             # Signal strobing for fault analysis
│   └── reseeding.py            # Automated seed optimization script
│
├── reports/                    # Generated reports directory
│   ├── golden-signature.txt    # Golden signature (generated)
│   ├── fault_report.txt        # Fault coverage report (generated)
│   ├── bist_coverage_log.txt   # Reseeding iteration log (generated)
│   ├── cut_scan.sdc           # Timing constraints (generated)
│   ├── cut_scan_chain.txt     # Scan chain definition (generated)
│   ├── cut_scan.stil          # STIL patterns (generated)
│   └── various timing/power reports
│
├── Makefile                    # Build automation
├── README.md                   # This file
└── .gitignore                  # Git ignore rules
```

### Source Files (`sources/`)

- **cut.v** - Original circuit under test (behavioral RTL)
- **cut_scan_syn.v** - Gate-level netlist with inserted scan chain (auto-generated)
- **top_module.v** - BIST system integration module
- **top_module_syn.v** - Synthesized complete BIST system (auto-generated)
- **controller.v** - BIST controller finite state machine
- **lfsr.v** - Linear feedback shift register for pattern generation
- **misr.v** - Multiple input signature register with pass/fail logic
- **filelist.f** - Verilog source file list for compilation

### Testbenches (`testbenches/`)

- **tb_cut.v** - Standalone CUT verification using test vectors
- **tb_top_level_normal.v** - Verifies normal mode operation (bypassing BIST)
- **tb_top_level_bist.v** - Full BIST mode simulation and golden signature generation
- **tb_top_level_controller.v** - Controller state machine verification
- **cut_testvectors.vec** - 30 test vectors for CUT functional verification

### Scripts (`scripts/`)

- **synthesis_dft.tcl** - Genus script for DFT synthesis (scan chain insertion)
- **synthesis_bist.tcl** - Genus script for complete BIST system synthesis
- **fault.file** - Specifies fault simulation target and fault types (SA0+SA1)
- **strobes.tcl** - Defines strobed signals for fault coverage analysis
- **reseeding.py** - Python automation for finding optimal LFSR seeds

### Reports (`reports/`)

Generated during simulation and synthesis (not version controlled):

- **golden-signature.txt** - 16-bit golden signature from fault-free BIST run
- **fault_report.txt** - Detailed fault coverage statistics
- **bist_coverage_log.txt** - Iteration history from reseeding script
- **cut_scan.sdc** - Timing constraints for scan-enabled CUT
- **cut_scan_chain.txt** - Scan chain connection information
- **cut_scan.stil** - STIL format test patterns
- **Various .txt files** - Gates, timing, power reports

## Operation Modes

### Normal Mode
- `bist_start = 0`
- CUT operates in functional mode
- Direct input/output access to CUT
- Scan chain disabled (`scan_enable = 0`)
- Used for functional verification

### BIST Mode
- `bist_start = 1`
- Automated test sequence execution
- Controller manages test flow through states S0→S5
- LFSR provides pseudo-random test patterns
- MISR collects and compresses responses
- Scan chain active during pattern application

## BIST Controller States

| State | Description | Outputs |
|-------|-------------|---------|
| S0 | Idle - Waiting for BIST start | mode=0, bist_end=0, init=0, running=0, finish=0 |
| S1 | Initialize - Reset LFSR and MISR | mode=0, bist_end=0, init=1, running=0, finish=0 |
| S2 | Running - Apply test patterns (N cycles) | mode=1, bist_end=0, init=0, running=1, finish=0 |
| S3 | Pattern complete - Check iteration count | mode=0, bist_end=0, init=0, running=1, finish=0 |
| S4 | Finish - Final signature ready | mode=0, bist_end=0, init=0, running=0, finish=1 |
| S5 | End - BIST complete, results available | mode=0, bist_end=1, init=0, running=0, finish=0 |

**State Transitions:**
- S0→S1: Rising edge of `bist_start`
- S1→S2: Always after one cycle
- S2→S3: After N=13 scan cycles
- S3→S2: If `cnt_m ≤ M`
- S3→S4: If `cnt_m > M` (1023 patterns complete)
- S4→S5: Always after one cycle
- S5→S1: Rising edge of `bist_start` (restart)

## Test Sequence

1. **Initialization (S0→S1)**: 
   - Wait for rising edge of `bist_start`
   - Reset LFSR to seed value and MISR to zero

2. **Pattern Generation (S2)**: 
   - LFSR generates pseudo-random bit stream
   - Scan enable activated (`mode=1`)

3. **Scan Load (S2, cycles 1-13)**: 
   - Patterns shifted into CUT scan chain
   - CUT inputs isolated (forced to default values)
   - 13 clock cycles per pattern (N=13)

4. **Capture (S3, 1 cycle)**: 
   - CUT executes one functional cycle
   - Scan disabled, outputs captured

5. **Scan Unload & Compress (S2, next pattern)**: 
   - Response scanned out while next pattern scanned in
   - MISR compresses 10-bit output vector each cycle

6. **Iteration (S2↔S3)**: 
   - Repeat steps 2-5 for M=1023 test patterns
   - Total cycles: 1023 × 13 = 13,299 scan cycles

7. **Finalization (S4→S5)**: 
   - Final MISR signature available
   - Comparator checks against golden signature

8. **Result (S5)**: 
   - `bist_end=1` signals completion
   - `pass_nfail=1` if signature matches, `0` otherwise

## Fault Coverage Optimization

The `reseeding.py` script automates the process of finding optimal LFSR seeds to maximize fault coverage.

### Features
- **Target Coverage**: 95% (configurable via `TARGET_COVERAGE` constant)
- **Automatic Seed Generation**: Random 16-bit seeds (0-65535)
- **Iterative Testing**: Continues until target met
- **Comprehensive Logging**: Detailed iteration history in `reports/bist_coverage_log.txt`
- **Fault Parsing**: Extracts detected, potentially detected, and undetected fault counts

### Configuration Constants
```python
TARGET_COVERAGE = 0.95              # 95% coverage goal
LFSR_FILE = 'sources/lfsr.v'       # LFSR source file
LFSR_LINE_NUM = 18                  # Line number for seed update
MISR_FILE = 'sources/misr.v'       # MISR source file
MISR_LINE_NUM = 19                  # Line number for golden signature
GOLDEN_SIGNATURE_FILE = 'reports/golden-signature.txt'
LOG_FILE = 'reports/bist_coverage_log.txt'
```

### Process Flow
1. **Generate Seed**: Random 16-bit value
2. **Update LFSR**: Modify line 18 in `sources/lfsr.v`
3. **RTL Simulation**: Run BIST testbench to generate golden signature
4. **Extract Signature**: Read from `reports/golden-signature.txt`
5. **Update MISR**: Modify line 19 in `sources/misr.v` with golden signature
6. **Synthesis**: Regenerate gate-level netlist
7. **Fault Simulation**: Run concurrent fault simulation
8. **Parse Results**: Extract fault statistics from simulation output
9. **Calculate Coverage**: (Detected + Potentially Detected) / Total Faults
10. **Log Iteration**: Record all data to log file
11. **Check Target**: Repeat if coverage < 95%

### Fault Statistics Tracked
- **Detected (Total & Prime)**: Faults definitively caught
- **Potentially Detected (Total & Prime)**: Faults possibly caught
- **Undetected (Total & Prime)**: Faults not caught
- **Coverage**: Percentage of faults detected or potentially detected

### Usage
```bash
python scripts/reseeding.py
```

**Output**:
- Console: Real-time progress with coverage percentages
- Log file: Complete iteration history with fault statistics
- Modified files: `sources/lfsr.v` and `sources/misr.v` updated automatically

### Example Log Entry
```
================================================================================
Iteration: 5
Seed: 42315
Timestamp: 2026-01-16 14:30:22
--------------------------------------------------------------------------------
Fault Statistics:
  Detected Total:           1245
  Detected Prime:           1180
  Potentially Detected Total: 58
  Potentially Detected Prime: 52
  Undetected Total:         97
  Undetected Prime:         88
--------------------------------------------------------------------------------
Coverage:
  Total Coverage: 93.07%
  Prime Coverage: 92.73%
================================================================================
```

## Simulation and Verification

### Complete Workflow
```bash
# Full simulation and synthesis flow
make all
```

### Individual Steps

#### Circuit Level
```bash
# RTL simulation of CUT only
make SIM_rtl_circuit

# DFT synthesis (insert scan chain)
make SYN_dft_circuit

# Gate-level simulation with scan
make SIM_syn_scan_circuit
```

#### Top Level - RTL Simulations
```bash
# Normal mode (behavioral top + gate-level CUT)
make SIM_rtl_top_level_normal

# BIST mode (generates golden signature)
make SIM_rtl_top_level_bist

# Controller verification
make SIM_rtl_top_level_controller
```

#### Top Level - Synthesis
```bash
# Synthesize complete BIST system
make SYN_final
```

#### Top Level - Gate-Level Simulations
```bash
# Normal mode (all gate-level)
make SIM_syn_top_level_normal

# BIST mode (all gate-level)
make SIM_syn_top_level_bist

# Controller mode (all gate-level)
make SIM_syn_top_level_controller
```

#### Fault Analysis
```bash
# Concurrent fault simulation
make FS_concurrent

# Complete synthesis + fault analysis
make syn_fault
```

#### Code Quality Check
```bash
# Analyze coding style (HAL tool)
make HAL
```

### Custom Simulation Options

#### With GUI
Edit `Makefile` and uncomment:
```makefile
GUI = -gui -access +r
```

#### Custom LFSR Seed
```bash
make SIM_rtl_top_level_bist SEED=12345
make FS_concurrent SEED=12345
```

## Key Design Parameters

| Parameter | Value | Location | Description |
|-----------|-------|----------|-------------|
| LFSR Width | 16 bits | `lfsr.v` | Pattern generator register size |
| LFSR Seed | Configurable | `lfsr.v` line 18 | Initial PRNG state (default: 16'h5A5A) |
| LFSR Polynomial | x^16+x^15+x^13+x^4+1 | `lfsr.v` | Maximal-length feedback taps |
| MISR Width | 16 bits | `misr.v` | Signature register size |
| MISR Input Width | 10 bits | `misr.v` | Compressed vector width |
| Golden Signature | 16'b1110010100001001 | `misr.v` line 19 | Expected fault-free signature |
| Scan Cycles (N) | 13 | `controller.v` | Cycles per pattern load/unload |
| Test Patterns (M) | 1023 | `controller.v` | Total number of test vectors |
| Clock Period | 4000 ns | Testbenches | System clock period (250 kHz) |
| Target Coverage | 95% | `reseeding.py` | Fault detection goal |

## Golden Signature

The golden signature represents the fault-free response of the CUT to the complete test pattern sequence.

### Generation Process
1. Run BIST mode testbench: `make SIM_rtl_top_level_bist`
2. Signature automatically written to `reports/golden-signature.txt`
3. Manually update `sources/misr.v` line 19 (or use `reseeding.py`)

### Current Value
```verilog
localparam [15:0] GOLDEN_SIGNATURE = 16'b1110010100001001;
```

### When to Regenerate
- LFSR seed changed
- CUT design modified
- Test parameters (N or M) changed
- Any change affecting CUT behavior during BIST

## Circuit Under Test (CUT) Details

### CUT FSM States
- **IDLE**: Initial/reset state
- **WE**: Wait enable
- **LZ**: Load zone
- **WR**: Write
- **SS**: Scan start
- **SD**: Scan data
- **STZ**: Stop zone

### CUT Signals
**Inputs:**
- `clock`, `reset`
- `s`, `dv`, `l_in` - Control signals
- `test_in[1:0]` - Test data input
- `scan_in`, `scan_en` - Scan chain signals (DFT)

**Outputs:**
- `fz_L`, `lclk` - Status flags
- `read_a[4:0]` - Address counter
- `test_out[1:0]` - Test data output
- `scan_out` - Scan chain output (DFT)

## Technology

- **Target Technology**: AMS C35 0.35μm CMOS
- **Process**: C35B4
- **Library**: c35_CORELIB_TYP
- **Supply Voltage**: 3.3V
- **Synthesis Tool**: Cadence GENUS
- **Simulation Tool**: Cadence Xcelium (xrun)
- **Fault Simulator**: Xcelium Fault Simulation (xfsg, xfr)
- **Language**: Verilog HDL (`timescale 1ns/1ps)

## Results and Validation

### Verification Checklist
- [x] **Functional Verification**: CUT standalone matches vectors
- [x] **Normal Mode**: Top-level normal mode matches standalone CUT
- [x] **BIST Execution**: BIST completes with `bist_end=1`
- [x] **Golden Signature**: Successfully generated and validated
- [x] **Controller States**: All transitions verified
- [x] **Fault Coverage**: Meets or exceeds 95% target
- [x] **HAL Analysis**: No fatal errors (warnings acceptable)

### Success Criteria
✓ Normal mode output matches standalone CUT simulation  
✓ BIST completes successfully (bist_end asserted)  
✓ Golden signature generated and embedded in MISR  
✓ Fault coverage ≥ 95% for both total and prime faults  
✓ No fatal errors in HAL coding style check  
✓ Synthesis completes without critical warnings  

## Important Notes

1. **LFSR Seed**: Must be non-zero to ensure proper PRNG operation
2. **Timing**: All testbenches use synchronized clock edges (drive on negedge, sample on posedge)
3. **Scan Chain**: Auto-generated by GENUS during DFT synthesis
4. **Reset**: Synchronous reset for FSMs; initialization pulse (`init`) for LFSR/MISR
5. **Golden Signature**: Must be regenerated after any design/parameter changes
6. **File Paths**: Testbench file paths are relative; ensure correct directory structure
7. **Synthesis Order**: Always run `SYN_dft_circuit` before `SYN_final`
8. **Timescale**: Added automatically by Makefile to synthesized netlists

## Directory Cleanup

```bash
# Remove all generated files
make clean
```

This removes:
- `fault_db/` - Fault database
- `xcelium.d/` - Simulation database
- `genus.*` - Synthesis temporary files
- `reports/*` - All generated reports
- Various log files

**Note**: Synthesized netlists (`*_syn.v`) are also removed by clean target


---

**Last Updated**: January 16, 2026  
