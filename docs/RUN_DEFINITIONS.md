# Introduction

The ALICE detector is being run in multiple shifts by hundreds of users remotely and in person. To ensure a proper history view and transparency, 
a new system, Bookkeeping, was developed. This helps users keep track of data acquisition configurations, conditions, and operational interventions 
in the experimental area. It not only allows users to create entries about the state of the system but it is also capable of receiving and analysing 
notifications from other components when events are triggered.

The data aquisition chain is split in processes named RUNs.

## RUN Definitions

Bookkeeping receives updates about RUNs from multiple sources and based on them, decides the definition for each RUN.
This definition is computed automatically depending on several criteria in the following low level services: `createRun`, `updateRun` and in the `UpdateLhcFillUseCase`.

When a run or lhcFill is created or updated without using those two services, for each updated runs the definition automatic update must be triggered manually using the following URL:
- When one run has been updated: `curl -X PUT http://[bookkeeping-url]/api/runs/[run-id] -d "{}"` replacing `[bookkeeping-url]` by the actual bookkeeping URL and `[run-id]` by the actual run ID
- When one LHC fill has been updated: `curl -X PATCH http://[bookkeeping-url]/api/lhcFills/[fill-number] -d "{}"` replacing `[bookkeeping-url]` by the actual bookkeeping URL and `[fill-number]` by the actual fill number

### PHYSICS:
- be created and successully started during stable beams;
- use as detectors BOTH:
    - `FT0` (for luminiosity)
    - `ITS` (for vertex)
- have all the following components enabled:
    - `dcs` = `true`
    - `dd_flp` = `true`
    - `epn` = `true`
    - `trigger_value` = `CTP`
    - `tfb_dd_mode` (Time Frame Builder mode) = `processing` or `processing-disk`
    - `pdp_workflow_parameters` should contain at least `CTF`

### COSMICS:
- `run_type` set to `COSMICS` or `COSMIC`
- `beam_mode` = `NO BEAM` or missing `beam_mode`
- have all the following components enabled:
    - `dcs` = `true`
    - `dd_flp` = `true`
    - `epn` = `true`
    - `trigger_value` = `CTP`
    - `tfb_dd_mode` (Time Frame Builder mode) = `processing` or `processing-disk`
    - `pdp_workflow_parameters` should contain at least `CTF`

### TECHNICAL:
During technical runs, the processes are reading the front-end electronics;
- `run_type` = `technical`
- `pdp_beam_type` = `technical`

### SYNTHETIC: 
During synthetic runs, the processes are at the level of readout and emulate readout;
- `readout_cfg_uri` to include (`pp` or `pbpb`) and `replay`
- `dcs` = `false`
- `trigger_value` = `OFF`

### CALIBRATION:
- `run_type` should be prefixed with `CALIBRATION_`, `PEDESTAL`, `LASER`, `PULSER`, `NOISE`

### COMMISIONING:
- any run that does not fit any of the prior definitions;
