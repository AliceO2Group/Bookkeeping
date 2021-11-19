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