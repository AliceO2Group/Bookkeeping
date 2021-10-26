# Bookkeeping data model

## Introduction
This document describes the data model of the ALICE O2 Bookkeeping system.   
For simplicity, the following info is not described in this document: 
- internal AUTO_INCREMENT fields
- creation and update timestamp fields
- n-m junction tables

## Further explanations of fields tables

Concerning the **Update time** of the fields:
- At SOR: synchronously at Start of Run 
- At EOR: synchronously at End of Run 
- During Run: periodically during the run, normally to update/overwrite counters
- After EOR: asynchronously after the run finishes, normally by humans

Concerning the **Update key** of the fields, it indicates which key will be provided to know which database record to update. 

Concerning the **Update mode** of the fields: 
- Insert: direct insert via the API
- Replace: direct insert via the API, new value replaces existing one

## Runs

**Description:** A Run is a synchronous data taking time period, performed in the O2 computing farm with a specific and well-defined configuration. It normally ranges from a few minutes to tens of hours and can include one or many ALICE detectors. It provides a unique identifier for the data set generated during the run.   
**DB main table**: `runs`   

| **Field**                     | **Description**  | **Example** | **Update time** | **Update Key** | **Update mode** |
| ----------------------------- | ---------------- | ------------|-----------------|----------------|-----------------|
| `run_number`                  | Integer ID of a specific data taking period. Should be positive and strictly increasing.| `23`  | At SOR | | Insert |
| `time_o2_start`               | Time when Run was started (START transition). | | At SOR | `run_number` | Insert |
| `time_o2_end`                 | Time when Run was stopped. (STOP transition). | | At EOR | `run_number` | Insert |
| `time_trg_start`              | Time when the Trigger subsystem was started. | | At SOR | `run_number` | Insert |
| `time_trg_end`                | Time when the Trigger subsystem was stopped. | | At EOR | `run_number` | Insert |
| `environment_id`              | Unique identifier of the AliECS environment. | `2UE5fEfvE4J` | At SOR | `run_number` | Insert |
| `run_type`                    | Type of the run, each type will deploy different workflows and/or configurations.	| `PHYSICS`, `TECHNICAL`, `PEDESTAL` | At SOR | `run_number` | Insert |
| `run_quality`                 | Overall quality of the data from the data taking point of view. | `Good`, `Bad`, `Unknown` | At EOR | `run_number` | Insert |
| `n_detectors`                 | Number of detectors in the Run. | `4` | At SOR | `run_number` | Insert |
| `n_flps`                      | Number of First Level Processor (FLP) nodes in the Run. | `150` | At SOR | `run_number` | Insert |
| `n_epns`                      | Number of Event Processing Node (EPN) nodes in the Run. | `200` | At SOR | `run_number` | Insert |
| `epn_topology`                | Path of the Global Processing topology deployed on the EPN nodes | `/home/epn/odc/dd-standalone-5.xml`  | At SOR | `run_number` | Insert |
| `detectors`                   | List of detectors in the run | `ITS,TPC,TOF` | At SOR | `run_number` | Insert |


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
| `path`                        | Server side path to file. | `/var/storage/1633208265696_Run502915.png` | At Log Entry creation | `id` | Insert |
| `encoding`                    | File Content-Transfer-Encoding value. | `7bit` | At Log Entry creation | `id` | Insert |
| `log_id`                      | ID of Log Entry to which the attachment belongs to. | `123` | At Log Entry creation | `id` | Insert |


### Tags

**Description:** Free text labels to add to Runs or Log Entries. 
**DB main table**: `tags`

| **Field**                     | **Description**  | **Example** | **Update time** | **Update Key** | **Update mode** |
| ----------------------------- | ---------------- | ------------|-----------------|----------------|-----------------|
| `text`                        | Tag name. | `TPC`, `COSMICS`, `RC`  |   | `id` | Insert |



