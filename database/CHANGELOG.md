## [0.53.0]
* Changes made to the database:
  * `tags.description` is a new property of tags which is limited to 100 characters
  * `logs.content` is now indexed to help with searching within the property

## [0.50.0]
* Changes made to the database:
  * `run.run_quality` is not nullable anymore, and `unknown` value has been replaced by `none`
  * `environment.status` and `environment.statusMessage` have been moved to a separate table to store the history of its changes, `environment_history_items`

## [0.49.0]
* Changes made to the database:
  * table flp_runs has been deleted, relation is owned by `flp_roles` on the new `run_number` column

## [0.42.0]
* Changes made to the database:
  * Table `runs` - added fields:
      * `startOfDataTransfer` - date('1664271988000'),
      * `endOfDataTransfer` - date('1664271988000'),
      * `ctfFileCount` -  integer('123', '111', '456'),
      * `ctfFileSize` - bigInteger('0b1010101001010101001111111111111111'),
      * `tfFileCount` - integer('123', '111', '456'),
      * `tfFileSize` - bigInteger('0b1010101001010101001111111111111111'),
      * `otherFileCount` - integer('123', '111', '456'),
      * `otherFileSize` - bigInteger('0b1010101001010101001111111111111111'),

## [0.40.0]
* Changes made to the database:
  * Table `runs` updates:
    * `run_duration`:
      * Is based on the trigger when it exists;
      * Is based on o2 start/stop when trigger does not exist;
      * Is based on o2_stop - o2_trigger_start when there is a trigger start but there is no trigger_end;
    * new column `run_type_id` 
  * New Table `run_types`:
    * `id` - NUMBER & primary key,
    * `name` - CHAR(64),

## [0.37.0]
* Changes made to the database:
    * Table `runs` - added fields:
        * `pdp_workflow_parameters` - string('QC,GPU,CTF,EVENT_DISPLAY'),
        * `pdp_beam_type` - string('cosmic'),
        * `readout_cfg_uri` - string('Repository hash'),

## [0.36.0]
* Changes made to the database:
    * Table `runs` - added field:
        * `odc_topology_fullname` - string ('default', 'hash')

## [0.35.0]
* Changes made to the database:
    * table `runs` - added fields:
        * `lhc_period` - string ('lhc22b')
        * `n_epns` - number
        * `trigger_value` - enum (OFF, CTP, LTU)
## [0.32.0]
* Changes made to the database:
    * table `runs` - added fields:
        * `trg_globalr_run_enabled` - boolean ('true', 'false')
        * `trg_enabled` - boolean ('true', 'false')
        * `pdp_config_option` - string ('Repository Hash')
        * `pdp_topology_description_library_file` - string ('some/location.desc', 'production/production.desc')
        * `tfb_dd_mode` - string ('processing')

## [0.31.0]
* Changes made to the database:
  * table `runs`:
    * `alice_l3_polarity` - string ('positive', 'negative')
    * `alice_dipole_polarity` - string ('positive', 'negative')

## [0.28.0]
* Changes made to the database:
  * table `runs`:
    * `detectors` is now STRING;
    * new columns for LHC Fills data: `fill_number, lhc_beam_energy, lhc_beam_mode, lhc_beta_star, alice_l3_current, alice_dipole_current`
  * new table `lhc_fills`
  * new table `eor_reasons`
  * new table `reason_types`
* Respective changes were applied to GO APIs

## [0.21.0]
* Changes made to the database:
  * runQuality:
    * ENUM('good', 'bad', 'unknown', 'test');
    * defaultValue: 'test'
* Respective changes were applied to GO and CPP APIs
## [0.17.11]
* Changes made to the database and go-api-bindings[#420]https://github.com/AliceO2Group/Bookkeeping/pull/420
    * New field to be added to the RUNS table.
        - name: detectors
            - type: SET 
                - ALTER TABLE runs ADD detectors SET('CPV', 'EMC', 'FDD', 'FT0', 'FV0', 'HMP', 'ITS', 'MCH', 'MFT', 'MID', 'PHS', 'TOF', 'TPC', 'TRD', 'TST', 'ZDC');
                - ALTER TABLE runs modify detectors SET('CPV', 'EMC', 'FDD', 'FT0', 'FV0', 'HMP', 'ITS', 'MCH', 'MFT', 'MID', 'PHS', 'TOF', 'TPC', 'TRD', 'TST', 'ZDC');
## [0.17.7]
* Added the field epn_topology. [#411] (https://github.com/AliceO2Group/Bookkeeping/pull/411)
* Changes made to the database. Changes are registerd in the CHANGELOG.md file in the database folder.

    * New fields to be added to the RUNS table:
        - epn_topology
            - type: string 

## [0.17.6]
* Add more information to run entries. [#406] (https://github.com/AliceO2Group/Bookkeeping/pull/406)
* Hide/change existing Run Statistics fields. [#408] (https://github.com/AliceO2Group/Bookkeeping/pull/408)
* Changes made to the database and go-api-bindings. Changes are registerd in the CHANGELOG.md file in the database folder.

    * New fields to be added to the RUNS table:
        - dd_flp
            - type: boolean 
        - dcs
            - type: boolean 
        - epn
            - type: boolean 

    * Changed a field to another name in the RUNS table:
        - activity_id is changed to environment_id
