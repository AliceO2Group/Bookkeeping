# Bookkeeping data model

- [Bookkeeping data model](#bookkeeping-data-model)
  - [Introduction](#introduction)
  - [Further explanations of fields tables](#further-explanations-of-fields-tables)
  - [Runs](#runs)
    - [End of run reasons](#end-of-run-reasons)
      - [Reason Types (for EOR)](#reason-types-for-eor)
  - [FLPs](#flps)
  - [Log Entries](#log-entries)
    - [Attachments](#attachments)
  - [Users](#users)
  - [Tags](#tags)
  - [Environments](#environments)
  - [LhcFills](#lhcfills)

## Introduction
This document describes the data model of the ALICE O2 Bookkeeping system.   
For simplicity, the following info is not described in this document: 
- internal AUTO_INCREMENT fields
- creation and update timestamp fields
- n-m junction tables

## Further explanations of fields tables

Concerning the **Update time** of the fields:
- At COF: synchronously at LhcFill creation
- At COE: synchronously at Environment creation
- At EOE: synchronously at End of environment
- At SOR: synchronously at Start of Run 
- At EOR: synchronously at End of Run 
- During Run: periodically during the run, normally to update/overwrite counters
- After EOR: asynchronously after the run finishes, normally by humans

Concerning the **Update key** of the fields, it indicates which key will be provided to know which database record to update. 

Concerning the **Update mode** of the fields: 
- Insert: direct insert via the API
- Update: direct insert via the API, new value replaces existing one

## Runs

**Description:** A Run is a synchronous data taking time period, performed in the O2 computing farm with a specific and well-defined configuration. It normally ranges from a few minutes to tens of hours and can include one or many ALICE detectors. It provides a unique identifier for the data set generated during the run.   
**Relation:** `run` hasMany `eor_reasons`
**DB main table**: `runs`   

| **Field**                                | **Description**  | **Example** | **Update time** | **Update Key** | **Update mode** |
| ---------------------------------------- | ---------------- | ------------|-----------------|----------------|-----------------|
| `run_number`                             | Integer ID of a specific data taking period. Should be positive and strictly increasing.| `23`  | At SOR | | Insert |
| `time_o2_start`                          | Time when Run was started (START transition). | | At SOR | `run_number` | Insert |
| `time_o2_end`                            | Time when Run was stopped. (STOP transition). | | At EOR | `run_number` | Insert |
| `time_trg_start`                         | Time when the Trigger subsystem was started. | | At SOR | `run_number` | Insert |
| `time_trg_end`                           | Time when the Trigger subsystem was stopped. | | At EOR | `run_number` | Insert |
| `environment_id`                         | Unique identifier of the AliECS environment. | `2UE5fEfvE4J` | At SOR | `run_number` | Insert |
| `run_type`                               | Type of the run, each type will deploy different workflows and/or configurations.	| `PHYSICS`, `TECHNICAL`, `PEDESTAL` | At SOR | `run_number` | Insert |
| `run_quality`                            | Overall quality of the data from the data taking point of view. | `good`, `bad`, `test` | At EOR | `run_number` | Insert |
| `n_detectors`                            | Number of detectors in the Run. | `4` | At SOR | `run_number` | Insert |
| `n_flps`                                 | Number of First Level Processor (FLP) nodes in the Run. | `150` | At SOR | `run_number` | Insert |
| `n_epns`                                 | Number of Event Processing Node (EPN) nodes in the Run. | `200` | At SOR | `run_number` | Insert |
| `epn_topology`                           | Path of the Global Processing topology deployed on the EPN nodes | `/home/epn/odc/dd-standalone-5.xml`  | At SOR | `run_number` | Insert |
| `fill_number`                            | The fill connected to the run                 | `1, 2, 1651`                        |  | `run_number` | Update |
| `lhc_beam_energy`                        | Energy of the beam (GeV)                      | `1.175494351 E - 38, 3.12`          |  | `run_number` | Update |
| `lhc_beam_mode`                          | LHC Beam Mode                                 | `STABLE BEAMS,INJECTION PROBE BEAM` |  | `run_number` | Update |
| `lhc_beta_star`                          | LHC Beta * in meters                          | `ITS,TPC,TOF`                       |  | `run_number` | Update |
| `alice_l3_current`                       | Current in L3 magnet (Amperes)                | `3.14, 2`                           |  | `run_number` | Update |
| `alice_l3_polarity`                      | The polarity of the L3 magnet                 | `POSITIVE, NEGATIVE`                |  | `run_number` | Update |
| `alice_dipole_current`                   | Current in Dipole magnet (Amperes)            | `ITS,TPC,TOF`                       |  | `run_number` | Update |
| `alice_dipole_polarity`                  | The polarity of the dipole magnet             | `POSITIVE, NEGATIVE`                |  | `run_number` | Update |
| `trg_global_run_enabled`                 | If the global run trigger is enabled          | `true, false`                       |  | `run_number` | Update |
| `trg_enabled`                            | If the trigger is enabled                     | `true, false`                       |  | `run_number` | Update |
| `pdp_config_option`                      | Configuration option PDP                      | `Repository Hash`                   |  | `run_number` | Update |
| `pdp_topology_description_library_file`  | File location of the pdp topology             | `some/location.desc`                |  | `run_number` | Update |
| `tfb_dd_mode`                            | The mode of the TFB DD                        | `processing`                        |  | `run_number` | Update |
| `lhc_period`                             | The period value of the lhc                   | `lhc22b`                            |  | `run_number` | Update |
| `odc_topology_full_name`                 | File location or setting for odc topology     | `hash, some/location.desc`          |  | `run_number` | Update |

### End of run reasons

**Description:** EOR Reasons for which runs have ended. They contain a general reason_type and extra information with regards to user selecting it and other information
**Relation:** `eor_reason` hasOne `reason_type`
**DB main table**: `eor_reasons`

| **Field**                     | **Description**  | **Example** | **Update time** | **Update Key** | **Update mode** |
| ----------------------------- | ---------------- | ------------|-----------------|----------------|-----------------|
| `id`                          | Auto-Incremented id for eor reason | `1`  | AT COE| `id` | Insert |
| `description`                    | Other information on the reason | `Run stopped due to faulty detector`  | AT COE| `description` | Insert |
| `reason_type_id`                    | Id of the general reason type belonging to | '1'  | AT COE| `reason_type_id` | Insert |
| `run_id`                    | RUN id for which the reason was added | `500540`  | AT COE| `run_id` | Insert |
| `last_edited_name`        | Name of the person who last edited the fields | `Anonymous`, `Jan Janssen` | When fields are edited | `id`| Update |
| `created_at`                   | When the entity is created | | AT COE | `created_at`| Insert |
| `updated_at`        | When entity is edited |  | When fields are edited | `updated_at`| Update |

#### Reason Types (for EOR)

**Description:** Reason Tpes for which runs have ended. This table describes general reasons categories and titles as per the RC criteria
**DB main table**: `reason_types`

| **Field**                     | **Description**  | **Example** | **Update time** | **Update Key** | **Update mode** |
| ----------------------------- | ---------------- | ------------|-----------------|----------------|-----------------|
| `id`                          | Auto-Incremented id for eor reason | `1`  | AT COE| `id` | Insert |
| `category`                    | Category represented by a String | `Data Sanity and Quality`  | AT COE| `category` | Insert |
| `title`                    | Title represented by a String | `Incomplete TF`  | AT COE| `title` | Insert |
| `created_at`                   | When the entity is created | | AT COE | `created_at`| Insert |
| `updated_at`        | When entity is edited |  | When fields are edited | `updated_at`| Update |

## FLPs

**Description:** First Level Processor (FLP) nodes are connected to the Front End Electronics of the detectors via P2P optical fibers. They provide the main function of detector readout while also running some local data processing and quality control.   
**DB main table**: `flp_roles`   

| **Field**                     | **Description**  | **Example** | **Update time** | **Update Key** | **Update mode** |
| ----------------------------- | ---------------- | ------------|-----------------|----------------|-----------------|
| `name`                        | TBD |  | At SOR | | Insert |
| `hostname`                    | TBD |  | At SOR | | Insert |
| `n_timeframes`                | TBD |  | At EOR | | Update |
| `bytes_processed`             | TBD |  | At SOR | | Update |
| `bytes_equipment_read_out`    | TBD |  | At EOR | | Update |
| `bytes_recording_read_out`    | TBD |  | At SOR | | Update |
| `bytes_fair_m_q_read_out`     | TBD |  | At SOR | | Update |


## Log Entries

**Description:** Text message that describes a significant intervention or event that happened. Can be generated either by humans (e.g. a shifter enters his/her end-of-shift report) or by computer processes (e.g. AliECS stores a dump of the configuration parameters used) and are normally consumed by humans.   
**DB main table**: `logs`

| **Field**                     | **Description**  | **Example** | **Update time** | **Update Key** | **Update mode** |
| ----------------------------- | ---------------- | ------------|-----------------|----------------|-----------------|
| `title`                       | Log Entry title. Normally a short sentence. | `EOS QC Night`  | At Log Entry creation  | `id` | Insert |
| `text`                        | Log Entry body. Normally long, multiple lines. |  | At Log Entry creation | `id` | Insert |
| `subtype`                     | Log entry type. Currently not used. | | At Log Entry creation | `id` | Insert |
| `origin`                      | What type of actor created the run  | `human`, `process` | At Log Entry creation | `id` | Insert |
| `announcement_valid_until`    | When Log Entry type is `announcement`, this field sets its validity date. |  | At Log Entry creation | `id` | Insert |
| `user_id`                     | Log Entry author ID | `123` | At Log Entry creation | `id` | Insert |
| `root_log_id`                 | When the Log Entry belongs to a thread, this field stores the ID of the top level Log Entry | `123` | At Log Entry creation | `id` | Insert |
| `parent_log_id`               | When the Log Entry belongs to a thread, this field stores the ID of the parent/previous Log Entry | `123` | At Log Entry creation | `id` | Insert |

### Attachments

**Description:** File attachment to a Log Entry   
**DB main table**: `attachments`

| **Field**                     | **Description**  | **Example** | **Update time** | **Update Key** | **Update mode** |
| ----------------------------- | ---------------- | ------------|-----------------|----------------|-----------------|
| `file_name`                   | Server side created filename. | `1633208265696_Run502915.png`  | At Log Entry creation  | `id` | Insert |
| `size`                        | File size in bytes. |  | At Log Entry creation | `id` | Insert |
| `mime_type`                   | File MIME type. | `image/png` | At Log Entry creation | `id` | Insert |
| `original_name`               | Client side original filename.  | `Run502915.png` | At Log Entry creation | `id` | Insert |
| `path`                        | Server side path to file. | `/data/o2-bkp/1633208265696_Run502915.png` | At Log Entry creation | `id` | Insert |
| `encoding`                    | File Content-Transfer-Encoding value. | `7bit` | At Log Entry creation | `id` | Insert |
| `log_id`                      | ID of Log Entry to which the attachment belongs to. | `123` | At Log Entry creation | `id` | Insert |


## Users

**Description:** Bookkeeping user. Used to identify the author of a Log Entry.   
**DB main table**: `users`

| **Field**                     | **Description**  | **Example** | **Update time** | **Update Key** | **Update mode** |
| ----------------------------- | ---------------- | ------------|-----------------|----------------|-----------------|
| `external_id`                 | User ID on the external Authentication system (e.g. CERN Authentication). | `568223`  | At first login  | `id` | Insert |
| `name`                        | User full name.. |  | At first login | `id` | Insert |


## Tags

**Description:** Free text labels to add to Runs or Log Entries.    
**DB main table**: `tags`

| **Field**                     | **Description**  | **Example** | **Update time** | **Update Key** | **Update mode** |
| ----------------------------- | ---------------- | ------------|-----------------|----------------|-----------------|
| `text`                        | Tag name. | `TPC`, `COSMICS`, `RC`  |   | `id` | Insert |
| `Mattermost`                  | Mattermost channels | `Food`, `Bookkeeping updates`| | `id`| Update |
| `email`                  | Email groups | `food@cern.ch`, `Bookkeeping-updates@cern.ch`| | `id`| Update |
| `last_edited_name`        | Name of the person who last edited the email/mattermost fields | `Anonymous`, `Jan Janssen` | When email/mattermost is edited | `id`| Update |


## Environments

**Description:** The overall environment the runs are performed in.    
**DB main table**: `envronments`

| **Field**                     | **Description**  | **Example** | **Update time** | **Update Key** | **Update mode** |
| ----------------------------- | ---------------- | ------------|-----------------|----------------|-----------------|
| `id`                          | Environment id | `Dxi029djX`, `EIDO13i3D`  | AT COE| `id` | Insert |
| `createdAt`                   | When the environment is created | | AT COE | `id`| Insert |
| `toredownAt`                  | When the environment is stopped | | AT EOE | `id`| Update |
| `status`                      | Actual status of the envrionment | `STOPPED`, `STARTED`|  | `id`| Update |
| `statusMessage`               | A bigger message to show more detail about the status | `Environment sucessfully closed`, `Error creating envrionment: bad configuration` | | `id`| Update |


### LhcFills

**Description:** The fill of    
**DB main table**: `lhcFills`

| **Field**                     | **Description**  | **Example** | **Update time** | **Update Key** | **Update mode** |
| ----------------------------- | ---------------- | ------------|-----------------|----------------|-----------------|
| `fillNumber`                  | lhcFill id                          | `1, 2, 3215`                        | AT COF | `fillNumber` | Insert |
| `createdAt`                   | When the lhcFill is created         |                                     | AT COF | `fillNumber` | Insert |
| `updatedAt`                   | When the lhcFill is updated         |                                     |        | `fillNumber` | Update |
| `stableBeamsStart`            | Start of STABLE BEAMS               |                                     |        | `fillNumber` | Update |
| `stableBeamsEnd`              | End of STABLE BEAMS                 |                                     |        | `fillNumber` | Update |
| `stableBeamsDuration`         | STABLE BEAMS duration in seconds    |                                     |        | `fillNumber` | Update |
| `beamType`                    | Type of collisions                  | `PROTON-PROTON` `Pb-Pb` `Pb-PROTON` |        | `fillNumber` | Update |
| `fillingSchemeName`           | The name of the filling scheme used |                                     |        | `fillNumber` | Update |
