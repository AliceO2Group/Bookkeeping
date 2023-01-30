# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [0.49.0](https://github.com/AliceO2Group/Bookkeeping/releases/tag/%40aliceo2%2Fbookkeeping%400.49.0)
* Notable changes for users:
  * Physics runs automatically have a 'good' quality when they ends

* Notable changes for developers:
  * Reset database at the beginning of each API test files

## [0.48.0](https://github.com/AliceO2Group/Bookkeeping/releases/tag/%40aliceo2%2Fbookkeeping%400.48.0)
* Notable changes for users:
  * Log runs filter applies on run number and not on run ID anymore
  * An icon has been added to outline the detector's quality
  * OpenAPI has been removed, and with it all the auto-generated Go and c++ plugins
  * Detectors are now sorted in the run's detector filter
  * FLP proto creation request expect a hostname instead of hostName
  * LHC fill GET endpoint returns the fill with all its runs, and not only the physics ones 
  * LHC fill display page now have tabs to display all the runs or physics ones ony
  * Tags can now be marked as archived by administrators, and those tags can not be linked to new runs or logs

* Notable changes for developers:
  * A general architecture documentation has been added

## [0.47.0](https://github.com/AliceO2Group/Bookkeeping/releases/tag/%40aliceo2%2Fbookkeeping%400.47.0)
* Notable changes for users:
  * A log is created when run quality change, and DPG and RC tags are added for good<->bad quality change only
  * Run's detectors are sorted alphabetically in run details
  * No more errors when ECS creates logs through gRPC
  * Fixed bug where text selection was canceled on mouse up after page switch
* Notable changes for developers:
  * Tests were added for the run detectors quality edition

## [0.46.0](https://github.com/AliceO2Group/Bookkeeping/releases/tag/%40aliceo2%2Fbookkeeping%400.46.0)
* Notable changes for users:
  * Fixes an issue in which clicking on an attachement link would not open/download the file
  * Introduces run quality per detector which allows users to modify the run and specify the quality for each detector on top of the current general run quality;
  * Adds restriction to not allow general run quality to be changed unless the run has ended;
  * Improves filtering by detector in RunsOverview page by adding checkboxes instead of free input box
* Notable changes for developers: none

## [0.45.0](https://github.com/AliceO2Group/Bookkeeping/releases/tag/%40aliceo2%2Fbookkeeping%400.45.0)
* Notable changes for developers:
  * GRPC endpoints have been added in parallel of the endpoints available through the Go API (the GO plugin will be removed in a future release)

## [0.44.1](https://github.com/AliceO2Group/Bookkeeping/releases/tag/%40aliceo2%2Fbookkeeping%400.44.1)
* Notable changes for developers:
  * Fixed the detectors table fill migration to handle runs with empty or null detectors list

## [0.44.0](https://github.com/AliceO2Group/Bookkeeping/releases/tag/%40aliceo2%2Fbookkeeping%400.44.0)
* Notable changes for users:
  * Synthetic run definition is less restrictive on readout_cfg_uri, it simply needs to contain replay and one of pp or pbpb
  * There is no more links that refresh completely the page and discard user configuration

* Notable changes for developers:
  * updates new log create service to use the SequalizeUser parameter rather than the one from LogAdapter
  * Docker tests may be run in parallel to docker run
  * gRPC API has been created (see docs to know how it works and how endpoints can be added)
  * All links are now frontLink, which are handled by the frontend router

## [0.43.0](https://github.com/AliceO2Group/Bookkeeping/releases/tag/%40aliceo2%2Fbookkeeping%400.43.0)
* Notable changes for users:
  * Adds a new run definition `CALIBRATION` for runs that do not match any criteria
  * Adds a new feature which allows the user to see how many entries in a table (runs, logs, etc.) match their filtering;
  * Improves the display of run dates times on home page table in one line
  * Improves Log creation tag selection: it now displays all the tags and outlines the already selected ones
  * Improves run definition for `COSMIC` to:
    * require COSMIC(S) `run_type` and renames it to `COSMICS`
    * require `beam_mode` as `NO BEAM`
  * Improves run definition for `PHYSICS` to check `stable beam` interval
  * Improves run definition for `SYNTHETIC` to remove the restriction on `pdp_workflow_parameters`
  * Improves run definition for `CALIBRATION` to include runs with `run_type` of one of `CALIBRATION_, PEDESTAL, LASER, PULSER`
  * Improves notification for run quality change to:
    * only notify on change from `good to bad` and the other way around
    * add information on who and when the changes was made
  * Fixes a bug which did not link the run to an environment properly
  * Fixes a bug in which fields which contained value "0" would be displayed as null rather than "0"
  * Fixes infinite scrolling across all tables

* Notable changes for developers:
  * Picker (front component) has been improved to make it more configurable
  * Overview pagination has been uniformized on every pages
  * Some UseCases have been reworked to be more reusable and their implementation has been extracted into services (their signature did not changed)
  * Rework adapters to be class instances and not only static methods, thus making them able to depend the one on the other recursively

## [0.42.0](https://github.com/AliceO2Group/Bookkeeping/releases/tag/%40aliceo2%2Fbookkeeping%400.42.0)
* Notable changes for users:
  * Added extra run fields for ccdb in the run details
* Notable changes for develops:
  * RUN Definitions criteria can be found [DEFINITIONS](./docs/RUN_DEFINITIONS.md)
  * Runs API:
    * `GET`
      * `startOfDataTransfer`, `endOfDataTransfer`, `ctf, tf, other` file size/count are added to the run object.
    * `PATCH`
      * `startOfDataTransfer`, `endOfDataTransfer`, `ctf, tf, other` file size/count are added to update run by run number.
  * Added a loading icon when log overview is loading
  * Fixed infinite requests when moving to homepage from logs/runs overview
  * Fixed Trigger Value displayed as active filter if any filter is active on run overview page
  * Run start/stop on the home screen is now consistent with the run overview page.
  * Add CALIBRATION run definition
  * Pagination limits is now of 1000 items in GUI and 5k in the API and export
* Notable changes for developers:
  * Some entities and sequelize models have typedefs to help autocompletion, code navigation and refactoring

## [0.41.0](https://github.com/AliceO2Group/Bookkeeping/releases/tag/%40aliceo2%2Fbookkeeping%400.41.0)
* Notable changes for users:
  * Efficiency per detector and Time between runs are now displayed on LHC fill details
  * UX improvements on displaying and calculating `run_duration` based on `o2 time/date` values when `trigger time/date` values are missing
  * Replying to a log will inherit the log's tags, run numbers and title
  * Filling filters for log overview will not automatically remove whitespaces on typing
  * A toggle in user actions is present to display timestamps as unix timestamps instead of local dates
  * Accents are now handled in file names

## [0.40.0](https://github.com/AliceO2Group/Bookkeeping/releases/tag/%40aliceo2%2Fbookkeeping%400.40.0)
* Notable changes for users:
  * Fix synthetic run definition computation
  * Fix fill efficiency on LHC fill overview
  * Run definition is now displayed on run details page
  * Detectors can be filled in any order in run overview filters
  * Visual improvements to log creation page
  * Run types are now added and can be filtered. The type for a run is shown in the details page.
  * `Runs`
    * Run duration values:
      * Is based on the trigger when it exists
      * Is based on o2 start/stop when trigger does not exist and is displayed with an Asterisk
      * Is based on o2_stop - o2_trigger_start when there is a trigger start but there is no trigger_end; this is displayed with 2 Asterisks;
* Notable changes for developers:
  * Balloon system is now a global popover system, not limited to content overflow
  * Runs API:
    * `GET` Runs API
      * `runDuration` New logic to generating a time stamp:
        * Is based on the trigger when it exists;
        * Is based on o2 start/stop when trigger does not exist;
        * Is based on o2_stop - o2_trigger_start when there is a trigger start but there is no trigger_end;
      * `runTypes` Run types can be fetched by id or overall.
      * `runTypes` Run types are added to a run, this can be an id or object depending on how the endpoint is set.
    * `POST`
      * `runType` A run type in a string can now be given when starting a run or updating a run.
    * `PATCH`
      * `runType` A run type can be given to a run to update it. A new type will be generated if it does not exist.

## [0.39.0](https://github.com/AliceO2Group/Bookkeeping/releases/tag/%40aliceo2%2Fbookkeeping%400.39.0)
* Notable changes for users:
  * Environment overview page now loads in a normal time
  * Only administrators as defined in CERN Application portal can create and edit tags 
  * `definition` is now available in run overview's table and filtering
  * Fixed table bug when row ids of multiple tables were the same and in the same order
  * Fixed log creation display bug when doing log creation => any page => log creation
  * LHC fills runs list are limited to physics runs only
  * Fixed LHC fill detail page cleanup
  * Fix the environment overview switch to infinite mode when changing page
  * Fixed log detail page cleanup
* Notable changes for developers:
  * Runs API:
    * `GET`
      * `definition` Can now be fetched in runs and a specific run.
  * Table system:
    * Table systems now support profiles, which allows to:
      * Display columns only under a specific profile or one of the listed specific profiles
      * Override column configuration under a specific profile
      * Apply one profile to a table

## [0.38.0](https://github.com/AliceO2Group/Bookkeeping/releases/tag/%40aliceo2%2Fbookkeeping%400.38.0)
* Notable changes for users:
  * `pdpWorkflowParameters, pdpBeamType, readoutCfgUri` field added to the runs detail page and can be exported.
  * Time after last run and corresponding loss has been added to fill statistics
  * Fix bug where some LHC fills had a negative time before first run (and associated loss)
  * Fix log notification not sent with logs created automatically
  * Fix bug where hovering log columns reset page to 1
* Notable changes for developers:
  * Runs API:
  * `GET`
    * `pdpWorkflowParameters, pdpBeamType, readoutCfgUri` Can now be fetched in runs and a specific run.
  * `PATCH`
    * `pdpWorkflowParameters, pdpBeamType, readoutCfgUri` Can now be updated when updating a run.

## [0.37.0](https://github.com/AliceO2Group/Bookkeeping/releases/tag/%40aliceo2%2Fbookkeeping%400.37.0)
* Notable changes for users:
  * Tags with a length of 2 characters are now allowed
  * A notification is sent any time a log is created, not only when a log is created from the log creation page (for example auto-generated logs)
  * Main links now have a complete link behavior, such as ctrl+click to open in a new tab
  * Changing run quality will automatically create a log with the following tags: `DPG` and `RC`
  * `pdpWorkflowParameters, pdpBeamType, readoutCfgUri` field added to the runs detail page and can be exported.
* Notable changes for developers:
  * Any log creation using `CreateLogUseCase` will send a notification, not only logs created from logs controller
  * Runs API:
  * `GET`
    * `pdpWorkflowParameters, pdpBeamType, readoutCfgUri` Can now be fetched in runs and a specific run.
  * `PATCH`
    * `pdpWorkflowParameters, pdpBeamType, readoutCfgUri` Can now be updated when updating a run.

## [0.36.0](https://github.com/AliceO2Group/Bookkeeping/releases/tag/%40aliceo2%2Fbookkeeping%400.36.0)
* Notable changes for users:
  * `odcTopologyFullname` field added to the runs detail page and can be exported.
  * A detail page has been created for LHC fills and is accessible from LHC fills overview, run details and runs overview. This page contains statistics about:
    * Fill efficiency 
      * The fill efficiency, calculated based on the percent of time we had ongoing RUNS compared to the FILL duration during a stable beam
      * The time elapsed between the stable beam start and the start of the first run, and the percentage that this time represents compared to the total SB duration (loss)
      * The mean run duration
      * The total run duration
    * Related runs
      * Total runs count
      * Amount of runs above/under 2 minutes of duration
      * Runs count grouped by quality
      * Runs count grouped by detectors
* Notable changes for developers:
  * Runs API:
    * `GET`
      * `odcTopologyFullname` Can now be fetched in runs and a specific run.
    * `POST`
      * `odcTopologyFullname` Can now be created when creating/starting a run.
    * `PATCH`
      * `odcTopologyFullname` Can now be updated when updating a run.

## [0.35.0](https://github.com/AliceO2Group/Bookkeeping/releases/tag/%40aliceo2%2Fbookkeeping%400.35.0)
* Notable changes for users:
  * Fixes a bug in which updating EOR reasons for a run, would change the `RunQuality` back to default;
  * Run LHC period, number of EPNs are now shown in the run details and can be exported via the export runs tab;
  * `trgEnabled` + `trgGlobalRunEnabled` are now shown as `triggerValue` and has the values `OFF or LTU or CTP`;
  * Notification service will now include `runNumbers` when used together with creating a log;
* Notable changes for developers:
  * `GET` Runs API:
    * `lhcPeriods` Runs can now be filtered by using the `lhcPeriods` field. Multiple values can be used with comma seperation;
    * `nEpns` Runs can now be filtered by using an operator and number;
    * `triggerValue` Runs can now be filtered by using the `triggerValues` field. These values can be a string array of this enum: `OFF, LTU, CTP`;
  * `PATCH` Runs API:
    * `lhcPeriod` is added to `endRun` endpoint and for the GO openAPI the `updateRun` function;

## [0.34.0](https://github.com/AliceO2Group/Bookkeeping/releases/tag/%40aliceo2%2Fbookkeeping%400.34.0)
* Notable changes for users:
  * Run tags update is now integrated in the global run update
  * LHC Fill overview's run lists are now hyperlinks to the corresponding run detail page
  * A spinner is displayed in each table when data is loading
* Notable changes for developers:
  * `GET` RUNS API:
    * `tag` filter do not exist anymore, it is replaced by `tags` which is the list of tags texts to filter on
  * `PUT` RUNS API:
    * `tags` can be provided to update the tags linked to the run, as a list of tag texts
  * `POST` RUNS TAGS API:
    * Route has been deleted
  * `GET` LOGS API:
    * `tag` filter do not exist anymore, it is replaced by `tags` which is the list of tags texts to filter on
  * `POST` LOGS API:
    * tags list is now the list of tag text and no tags ids

## [0.33.0](https://github.com/AliceO2Group/Bookkeeping/releases/tag/%40aliceo2%2Fbookkeeping%400.33.0)
* Notable changes for users:
  * Displays `UNKNOWN` for run duration above 48 hours, else `RUNNING`
  * Add fill number information on run overview page and in its filtering
* Notable changes for developers:
  * `GET` RUNS API:
    * `fillNumbers` is a new optional filter

## [0.32.0](https://github.com/AliceO2Group/Bookkeeping/releases/tag/%40aliceo2%2Fbookkeeping%400.32.0) 
* Notable changes for users:
  * Adds new fields for Run-Details
  * Fixes a bug in which infinite scrolling would not apply filters on runs & logs pages
  * Runs older than 48 hours and without a trigger end timestamp will be displayed as UNKNOWN
* Notable changes for developers:
  * `POST` RUNS API:
    * `timeTrgStart` and `timeO2Start` fields are not required anymore
  * `PATCH` RUNS API:
    * `timeO2Start`, `timeTrgStart`, `trgGlobalRunEnabled`, `trgEnabled`, `pdpConfigOption`, `pdpTopologyDescriptionLibraryFile`, `tfbDdMode` are now added and optional fields.

## [0.31.0](https://github.com/AliceO2Group/Bookkeeping/releases/tag/%40aliceo2%2Fbookkeeping%400.31.0) 
* Notable changes for users:
  * Adds `RunDuration` for Run-Overview, Run-Details and Run-Filters
  * Adds option to export the currently filtered runs from Run-Overview Page
  * Adds `aliceL3Polarity` and `aliceDipolePolarity` to Run-Details
* Notable changes for developers:
  * `GET` RUNS API:
    * `runDuration` added as a virtual column with sequalize

## [0.30.0](https://github.com/AliceO2Group/Bookkeeping/releases/tag/%40aliceo2%2Fbookkeeping%400.30.0) 
* Notable changes for users:
  * Improvements on RunFilters:
    * Numerical input now accepts operators (<, <=, =, =>, >);
    * Text inputs accept list of strings separated by commas;
    * RunQuality filter is now represented with checkboxes;
  * Tags UX improvements:
    * Tags are sorted alphabetically across the platform;
    * Tags selection is now uniform across the platform;
  * Fixes a bug in which a run entry could duplicate a runNumber;
  * Improves UX for table cells which are wider than space allows;
* Notable changes for developers:
  * `GET` RUNS API:
    * `nDetectors` and `nFLPS` filter needs to provide both operator and limit for the values;
    * `environmentId` is now `environmentIds` allowing for multiple values separated by comma;
    * `runQuality` is now `runQualities` allowing for multiple values separated by comma;
  
## [0.29.0](https://github.com/AliceO2Group/Bookkeeping/releases/tag/%40aliceo2%2Fbookkeeping%400.29.0) 
* Notable changes for users:
  * Improves Run-Overview page to better display information;
  * Improves usability of LHC Fills page;
  * Bug fixes for systems with no tags;

## [0.28.0](https://github.com/AliceO2Group/Bookkeeping/releases/tag/%40aliceo2%2Fbookkeeping%400.28.0) 
* Notable changes for users:
  * Introduces support for AliECS - End Of Run - Reason;
  * Introduces support for LHC Fills Data;
* Notable changes for developers:
  * Adds new `eor_reasons` and `reason_types` SQL tables and migration scripts;
  * Adds new lhc_fills SQL Table and migration scripts;
  * Adds API routes to retrieve lhc fills data individually or collectively; 
  * Adds API routes to retrieve eor reasons data individually or collectively; 

## [0.27.0](https://github.com/AliceO2Group/Bookkeeping/releases/tag/%40aliceo2%2Fbookkeeping%400.27.0) 
* Notable changes for users:
  * Introduces support for AliECS environments;
* Notable changes for developers:
  * Adds new Env SQL Table and migration scripts
  * Adds a new page to display all environments
  * `GET /api/environments` && `GET /api/environments/:envId` - Adds API routes to retrieve environments data
  * `POST /api/environments` && `PUT /api/environments/:envId` - Adds API routes to store environment data
  * Generates new OpenAPI GO plugin to include environments manipulation methods

## [0.26.1](https://github.com/AliceO2Group/Bookkeeping/releases/tag/%40aliceo2%2Fbookkeeping%400.26.1) 
* Notable changes for users:
  * Improves UX when users would input negative filter values;

## [0.26.0](https://github.com/AliceO2Group/Bookkeeping/releases/tag/%40aliceo2%2Fbookkeeping%400.26.0) 
* Notable changes for users:
  * Fixes a bug in which filters would not work due to cached date on server side;
  * Admin users can specify emails and mattermost channels at TAG creation time;
  * Fixes a bug in which admin users were not correctly identified;
* Notable changes for developers:
  * `POST /api/tags/` - Add emails and mattermost channels for a tag if user has admin privileges;

## [0.25.0](https://github.com/AliceO2Group/Bookkeeping/releases/tag/%40aliceo2%2Fbookkeeping%400.25.0) 
* Notable changes for users:
  * RUN Filters Improvements:
    * Allow users to specify start and stop filters with time;
  * Admin users can edit tags by adding emails and mattermost channels;
  * Fixes a bug in which infinite mode would display duplicated data;
  * Opens log details if log tree contains one log only;
* Notable changes for developers:
  * `PUT /api/tags/:id` - Update the emails and mattermost channels for a tag if user has admin privileges;
  * `GET /api/tags/name` - Expects a query parameter `name` to return one tag with specified name;

## [0.24.0](https://github.com/AliceO2Group/Bookkeeping/releases/tag/%40aliceo2%2Fbookkeeping%400.24.0) 
* Notable changes for users:
  * RUN Filters Improvements:
    * Allows users to filter by DD, DCS, EPN with ON,OFF or ANY
  * RUN Exports:
    * [FIXED] - exporting a list of runs by their runNumber would not retrieve the whole list;
    * `o2TimeStart`, `o2TimeStop`, `o2TrgStart`, `o2TrgStop` converts timestamps to user friendly date formats;
  * LOG Creation:
    * [FIXED] - removes duplicated `runNumbers` when creating a log entry instead of throwing error;
  * TAGS Page:
    * Displays new tag information: `email` and `mattermost` groups;
* Notable changes for developers:
  * `/api/runs` - listRuns - accepts multiple `runNumbers` for filtering;
  * `/api/runs` - listRuns - improves filtering for `dcs`, `dd_flp`, `epn`;
  * `/api/tags` - listTags - accepts multiple `ids`, `texts`, `emails` and/or `mattermosts` as filters;

## [0.23.0](https://github.com/AliceO2Group/Bookkeeping/releases/tag/%40aliceo2%2Fbookkeeping%400.23.0) 
* Notable changes for developers:
  * Add as new feature the option to send email and mattermost log creation notification;

## [0.22.0](https://github.com/AliceO2Group/Bookkeeping/releases/tag/%40aliceo2%2Fbookkeeping%400.22.0) 
* Notable changes for developers:
  * Path for storing attachments of logs is now configurable via ATTACHMENT_PATH env;

## [0.21.1](https://github.com/AliceO2Group/Bookkeeping/releases/tag/%40aliceo2%2Fbookkeeping%400.21.1) 
* Notable changes for developers:
  * Adds `run_quality` back to validation of `EndRun` request to ensure backwards compatibility;

## [0.21.0](https://github.com/AliceO2Group/Bookkeeping/releases/tag/%40aliceo2%2Fbookkeeping%400.21.0) 
* Notable changes for users:
  * Run Quality is now displayed in both `Run-Statistics` and `Run-Details` pages;
  * Users are now able to update the quality of a run (`good`, `test`, `bad`);
  * Users can filter `Run-Statistics` table by run quality;
  * Bug fixed in which a page would not load if a run was missing properties;
* Notable changes for developers:
  * CPP API:
    * Adds validation of URL and API token;
    * Adds `/status` path;
    * Improved error and exception handling;
    * Fixed CMake config;
  * Adds migration file for `run_quality` column so that enum accepts `test` as well;

## [0.20.0](https://github.com/AliceO2Group/Bookkeeping/releases/tag/%40aliceo2%2Fbookkeeping%400.20.0) 
* Notable changes for users:
  * All tables were refactored and are now fixed in width, reducing the text displayed if it is longer than the space;
  * Tables take into consideration the user's screen space and adapt accordingly on first load;
  * New log creation button placed on top of the navigation bar so that it can be accessed from any page;
  * Users are allowed to copy the content of a log;
  * "Reply logs" with no title will inherit the title of the parent log;
* Notable changes for developers:
  * `ca-certificates` dependency in docker updated
  
## [0.19.0](https://github.com/AliceO2Group/Bookkeeping/releases/tag/%40aliceo2%2Fbookkeeping%400.19.0) 
* Notable changes for users:
  * Tables from `Logs`, `Runs` and `Home` pages benefit of a new button `More`, making the tables not actionable anymore; This will allows the users to easily copy table values;
  * Fixes a bug in which users were not able to download attachments;
  * In case of no tags in the system, run filter box will now inform the user about it;
* Notable changes for developers:
  * New API route added: status for providing information on bookkeeping and database;
  * Adds new GitHub workflow to improve release & deployment procedures;
  * Server will boot up even if database is not up and running;
  * Refactors configuration loading files;
  * Updates dependencies versions to avoid security flaws;
  
## [0.18.0] 
* Updates dependencies versions to avoid security flaws
* Updates Dockerfile and fixes lint issues
* Allow users to insert replies to logs without having to specify a title
* Updates Run Details page to make use of the unused space and display logs for the run by default
* Updates Tag Details page to show logs for the tag by default
* Run Filters will inform users if there are no tags created
* Fixes a bug in which updating the tags of a run would hide the logs for the run

## [0.17.12]
* Added run filter to run-overview table [#433]https://github.com/AliceO2Group/Bookkeeping/pull/433
* Changed verification of Title [#432]https://github.com/AliceO2Group/Bookkeeping/pull/432

## [0.17.11]
* Changes made to the database and go-api-bindings[#420]https://github.com/AliceO2Group/Bookkeeping/pull/420
    * New field to be added to the RUNS table.
        - name: detectors
            - type: SET 
                - ALTER TABLE runs ADD detectors SET('CPV', 'EMC', 'FDD', 'FT0', 'FV0', 'HMP', 'ITS', 'MCH', 'MFT', 'MID', 'PHS', 'TOF', 'TPC', 'TRD', 'TST', 'ZDC');
                - ALTER TABLE runs modify detectors SET('CPV', 'EMC', 'FDD', 'FT0', 'FV0', 'HMP', 'ITS', 'MCH', 'MFT', 'MID', 'PHS', 'TOF', 'TPC', 'TRD', 'TST', 'ZDC');
                
## [0.17.10]
* Make /logs, /flps and /attachment routes private again [#419] https://github.com/AliceO2Group/Bookkeeping/pull/419

## [0.17.9]
* Added optional chaining to usecases.

## [0.17.8]
* updated dockerfile from version node:12.18.1-alpine3.12 to node:16.9.1-alpine3.12
* Made api/log and api/flp public [#415] (https://github.com/AliceO2Group/Bookkeeping/pull/415)
* log-overview changed id to runNumber [#416] (https://github.com/AliceO2Group/Bookkeeping/pull/416)

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

## [0.17.4]

* Added text and made the UI more clear. Log create and run detail was unclear on how the tags were implemented. [#398](https://github.com/AliceO2Group/Bookkeeping/pull/398)
* There was a unique error that when occured it made the title repeated in create log. This was prevented with changing the create tag file. [#397](https://github.com/AliceO2Group/Bookkeeping/pull/397)
* Added an extra function that grabs all tags for the log creation page [#395] (https://github.com/AliceO2Group/Bookkeeping/pull/395)
* When the log encouters an error and the user goes back to the page. Some fields were not reset. now all fields will be reset so the user have a blank slate to create a new log. [#394](https://github.com/AliceO2Group/Bookkeeping/pull/394)

## [0.17.3]

* Bumped patch version to 0.17.3

## [0.17.2]

* O2B-410 CPP-api-client can now be updated with the unqiue combination of flpName and runNumber instead of a auto incrementend integer. [$388] (https://github.com/AliceO2Group/Bookkeeping/pull/388)
* O2B-419 Fixed an issue where the log creation got a bug when both tag and attachment was selected. The issue was with multiform data and the way it accepts array data. [#386](https://github.com/AliceO2Group/Bookkeeping/pull/386)

## [0.17.1] 

* Updated @aliceo2/web-ui version from 1.15.1 to 1.18.2. A bug fix that adds a name to JWT token for the bookkeeping team. https://github.com/AliceO2Group/WebUi/releases/tag/%40aliceo2%2Fweb-ui%401.18.2

* O2B-399 Add message in tags select box([#369](https://github.com/AliceO2Group/Bookkeeping/pull/369])
* O2B-398 Improve display of Main tab in Run Details page ([#364]https://github.com/AliceO2Group/Bookkeeping/pull/364])
* O2B-400 Update tags are fixed ([#370]https://github.com/AliceO2Group/Bookkeeping/pull/370)]

## [0.17.0] 

* Reverted ibm-openapi-validator to version 0.44.0 in the bookkeeping/.github/workflows/openapi.yml file. Version 0.46.0 has problems with invalid configuration with validaterc. The GitHub checks for OpenApi / validate pull request would fail with version 0.46.0. However version 0.44.0 does not have this problem and the checks will pass, ready for the pull request to be merged with the master. This is a temporary solution and we should later try to fix the OpenApi/validate with the newest version 0.46.0.

## [0.14.0](https://github.com/AliceO2Group/Bookkeeping/compare/v0.13.0...v0.14.0) (2020-09-18)


### Features

* Anonymous logs are now possible ([#194](https://github.com/AliceO2Group/Bookkeeping/issues/194)) ([93d983b](https://github.com/AliceO2Group/Bookkeeping/commit/93d983b25c090b5f96f62904e9f5880025f2ab6f))
* Associated tags now visible on log detail screen ([#193](https://github.com/AliceO2Group/Bookkeeping/issues/193)) ([0eec605](https://github.com/AliceO2Group/Bookkeeping/commit/0eec605a0a519b13bc12065140b893acbe6338a3))

## [0.13.0](https://github.com/AliceO2Group/Bookkeeping/compare/v0.6.0...v0.13.0) (2020-09-08)


### Features

* Add functionality to filter by author name ([b358524](https://github.com/AliceO2Group/Bookkeeping/commit/b3585246de0325a73d495b77e9b882e152f96c62))
* Add functionality to filter by creation date ([274174d](https://github.com/AliceO2Group/Bookkeeping/commit/274174d3feadf65da75e69dcc64dd3663a021b92))
* Add functionality to filter by title ([4e0c52e](https://github.com/AliceO2Group/Bookkeeping/commit/4e0c52ec16e8310a73e25095c7ae728a1540f1ff))
* added displaying logs by subsystem ([fa78705](https://github.com/AliceO2Group/Bookkeeping/commit/fa787051bdd20c6e3fbdd200790a99069f038818))
* added overview and detail screen for subsystem ([9ede071](https://github.com/AliceO2Group/Bookkeeping/commit/9ede0716df6d955b20804d8fe29e91be001074d4))
* Added Support Forum link to profile dropdown ([7c1bcd6](https://github.com/AliceO2Group/Bookkeeping/commit/7c1bcd6f0a0d62e611227732062d801152b4a4bd))
* added test files for subsystem-overview ([5399a6f](https://github.com/AliceO2Group/Bookkeeping/commit/5399a6f528b3bde45a1aff5dfcc032a35c08fb67))
* Rebuilt filter components to support multiple filter types through dropdowns ([d251f5d](https://github.com/AliceO2Group/Bookkeeping/commit/d251f5d07edd6ef4f9fc619d3790151cd57c224f))


### Bug Fixes

* added jsdoc return descriptions ([b9ba9c3](https://github.com/AliceO2Group/Bookkeeping/commit/b9ba9c31a2954d9e31cd9625f82f52b789cdec65))
* added log-subsystems seed ([38af419](https://github.com/AliceO2Group/Bookkeeping/commit/38af419983bbf6a139c6979cab4f6bd9f3098c43))
* added LogsBySubsystem to the index file ([8aef110](https://github.com/AliceO2Group/Bookkeeping/commit/8aef1104afd6eb999431e3619da98270f113f030))
* added subsystems to log API-source ([71de72b](https://github.com/AliceO2Group/Bookkeeping/commit/71de72bf0b2821c1340b32fe3ea30041fdee46f6))
* added subsystems to the logdetail view ([213adff](https://github.com/AliceO2Group/Bookkeeping/commit/213adffd84157dfe72e97dfd324328f544526227))
* added various syntax fixes ([2f19404](https://github.com/AliceO2Group/Bookkeeping/commit/2f194048e134b84ce00ad32be548305516a52bb7))
* fixed import issue on LogRepository ([e54391d](https://github.com/AliceO2Group/Bookkeeping/commit/e54391d0d953c45fe7b8403024128d911e12dfa1))
* fixed syntax in testsuite subsystems ([dfb937a](https://github.com/AliceO2Group/Bookkeeping/commit/dfb937ad33b34269156e9e9e2e8f3c685abcaeb4))
* Long attachment names are now wrapped, minor CSS improvements ([#180](https://github.com/AliceO2Group/Bookkeeping/issues/180)) ([4ee7ed4](https://github.com/AliceO2Group/Bookkeeping/commit/4ee7ed45a7d14cc6a117a8bae8dd05dc09f4e1a5))
* Pagination values no longer reset when navigating away from logs overview ([0c84a09](https://github.com/AliceO2Group/Bookkeeping/commit/0c84a0933aaac3b43672bb611dd948779d9c71d5))
* Prevented run numbers overflowing beyond the log details table ([#176](https://github.com/AliceO2Group/Bookkeeping/issues/176)) ([a822b84](https://github.com/AliceO2Group/Bookkeeping/commit/a822b84b1d122b10f4846c4d0691d8c8b25cf077))
* Restored row ids ([6ee1a3b](https://github.com/AliceO2Group/Bookkeeping/commit/6ee1a3b88ebeac32301bb10fc08eed6bb5d8f941))
* **docker:** unsatisfiable constraints ([cf02a6f](https://github.com/AliceO2Group/Bookkeeping/commit/cf02a6f05948a95ccbd73b90dff64bc8aa9c29e0))
* **ui:** HyperMD editor not properly removed ([ded9d7c](https://github.com/AliceO2Group/Bookkeeping/commit/ded9d7c628a4ff4ea45907a9979c9f44398e6dfa))

## [0.6.0](https://github.com/AliceO2Group/Bookkeeping/compare/v0.5.0...v0.6.0) (2020-06-26)


### Features

* added and updated controllers, routers, middleware and utils in server for attachments ([096c27c](https://github.com/AliceO2Group/Bookkeeping/commit/096c27c6c932fba5785c26a3472e9762aa8bfe52))
* Added attachment Adapter and repository ([782cb00](https://github.com/AliceO2Group/Bookkeeping/commit/782cb00356d9208aea53d7450b5121d2442f5a61))
* Added attachment dtos ([002155d](https://github.com/AliceO2Group/Bookkeeping/commit/002155d57dabd29103f780ba0800686418b7d914))
* added Attachment model ([cf0d3c4](https://github.com/AliceO2Group/Bookkeeping/commit/cf0d3c44b184ffac35694541e7d1716ccf926fcc))
* Added Attachment related DTOs and entities ([ca394a9](https://github.com/AliceO2Group/Bookkeeping/commit/ca394a94d98552e45b9231fe68af4288381ef39f))
* Added attachment related use cases ([bae2677](https://github.com/AliceO2Group/Bookkeeping/commit/bae267757f4fe0e8ae28155504af1b3979849f64))
* added attachments to openapi ([f1caee7](https://github.com/AliceO2Group/Bookkeeping/commit/f1caee79e39d4ec66599036e6ed48a2d30679b20))
* added collapse feature in generic table component ([0993678](https://github.com/AliceO2Group/Bookkeeping/commit/0993678a29ce4eae517ffb20fde699dac96eedea))
* added file and files to dtovalidator ([b2da043](https://github.com/AliceO2Group/Bookkeeping/commit/b2da04306edac271f146068cf5e0993ae83c19c0))
* Added file uploading ([8fc1b8f](https://github.com/AliceO2Group/Bookkeeping/commit/8fc1b8f31c700fbd7a81266109879dc13fbbd0bd))
* added index on Attachment mime type ([10c539c](https://github.com/AliceO2Group/Bookkeeping/commit/10c539c5ec70644da03df94310f0dbd49a78b713))
* Added middleware ([60833c4](https://github.com/AliceO2Group/Bookkeeping/commit/60833c482b9e7119c89243c1de2217eb6a5a8839))
* added middleware possibility to route builder ([099ae3c](https://github.com/AliceO2Group/Bookkeeping/commit/099ae3c6f4fe942bfe76c838da20619c289537f7))
* added OpenID integration ([267e8fe](https://github.com/AliceO2Group/Bookkeeping/commit/267e8fe8df49b9643c6f591aeefe08616c70d97d))
* added startsWith and endsWith filter in QueryBuilder ([47b3abc](https://github.com/AliceO2Group/Bookkeeping/commit/47b3abc9471526a50ffd2bdf1be1a85a251b6840))
* Added tests ([bf5e660](https://github.com/AliceO2Group/Bookkeeping/commit/bf5e66082c94755fb9f5bd7e353a148c3069ae9b))
* Added tests and test assets ([a29555b](https://github.com/AliceO2Group/Bookkeeping/commit/a29555b59825c4cdd57a0cb46ae151cd6a50a433))
* Updated and added use cases needed for attachments ([1a9fd72](https://github.com/AliceO2Group/Bookkeeping/commit/1a9fd727cb1252e1e879facee5eb4fbc0d531f13))
* Updated attachment database adapter and repo ([ff03b92](https://github.com/AliceO2Group/Bookkeeping/commit/ff03b9213dcfe26bb376e5cf1169cd3feecd1203))
* updated attachment related routers and controllers ([3bbcf99](https://github.com/AliceO2Group/Bookkeeping/commit/3bbcf99e12f56849eda82b66a2dcdfcea2542f79))
* **ui:** added Emoji hint and autocomplete ([498f8de](https://github.com/AliceO2Group/Bookkeeping/commit/498f8de363cb6cf8354a927551d7ca0e2fc2b277))
* **ui:** added links to Jira and GitHub in profile dropdown ([be4fca8](https://github.com/AliceO2Group/Bookkeeping/commit/be4fca84528bbff87909e76b09bf7b52c705903d))
* use OpenID data to link user to created logs ([00afc71](https://github.com/AliceO2Group/Bookkeeping/commit/00afc71bb0d742c6fc67caa78613158c50554cc0))


### Bug Fixes

* cleanup ([55980aa](https://github.com/AliceO2Group/Bookkeeping/commit/55980aab944b982b8291cd4bfad00abf23cba552))
* cleanup of attachmentAdapter ([90a1502](https://github.com/AliceO2Group/Bookkeeping/commit/90a15022848bf9e8d9be80df4a1792e34c830508))
* CreateTagDto can have a token in the query ([9785e7d](https://github.com/AliceO2Group/Bookkeeping/commit/9785e7d3e4aad86daba13ba0412077390efa44e4))
* Fixed some problems ([3888955](https://github.com/AliceO2Group/Bookkeeping/commit/3888955bbb62a8151e0f4ef191538bdb046d887e))
* Removed useless filename from DTO ([9bf91bb](https://github.com/AliceO2Group/Bookkeeping/commit/9bf91bb1e699d0fa048592fdddc8166b5769311b))
* **docker:** updated unsatisfiable constraints ([ee3b6ee](https://github.com/AliceO2Group/Bookkeeping/commit/ee3b6ee06e480c44f1ed8d824a2e4657adefe51a))
* **ui:** RemoteData failure can be a Framework error which are not JSON:API conform ([0ecec06](https://github.com/AliceO2Group/Bookkeeping/commit/0ecec06cd71ca60519a18259535adb86fd6522c0))
* **ui:** set column width during loading of Log overview to prevent resizing ([5d9f7bf](https://github.com/AliceO2Group/Bookkeeping/commit/5d9f7bf684abbb81f3596a3412a8091c9e48ff07))
* tag list of a log incomplete when filtering based tags ([3ad21f3](https://github.com/AliceO2Group/Bookkeeping/commit/3ad21f39deae93d2a3be79841c112158c86e280f))

## [0.5.0](https://github.com/AliceO2Group/Bookkeeping/compare/v0.4.0...v0.5.0) (2020-06-12)


### Features

* **ui:** added tag filtering with AND/OR operators to the filters component ([cf96571](https://github.com/AliceO2Group/Bookkeeping/commit/cf96571327ad2145c1d9f8f93f15c20c070c2c58))
* added between option for WhereQueryBuilder ([d37ad45](https://github.com/AliceO2Group/Bookkeeping/commit/d37ad45db4df420e05b7fdb3eb38f9038c7b434e))
* added DELETE /api/subsystems/subsystemId endpoint ([0dd0c35](https://github.com/AliceO2Group/Bookkeeping/commit/0dd0c35f32e757b9f84668b953911911612e0c0e))
* added GET /api/subsystems/subsystemId endpoint ([8e7544c](https://github.com/AliceO2Group/Bookkeeping/commit/8e7544c810d762d25152ed176c101ede9705954e))
* added GET /api/subystems endpoint ([986e7a3](https://github.com/AliceO2Group/Bookkeeping/commit/986e7a34db88f5c039ed1efbb52abd441955587f))
* added JWT configuration ([96cf435](https://github.com/AliceO2Group/Bookkeeping/commit/96cf4350b647a33049b22cb47038fd6220c5e8db))
* added markdown preview in the detail view ([fe5d9d5](https://github.com/AliceO2Group/Bookkeeping/commit/fe5d9d51ce1a987f2d8ebbcf25f9a59a4f937008))
* added not option for WhereQueryBuilder ([c11c37a](https://github.com/AliceO2Group/Bookkeeping/commit/c11c37a23b6f4339e9cb54c2654055454230eb83))
* added oneOf and allOf options for WhereQueryBuilder ([a9fbb7f](https://github.com/AliceO2Group/Bookkeeping/commit/a9fbb7f4d95ed119c79c65a1cc24d30d018f5f9d))
* added POST /api/subsystems endpoint ([ec08049](https://github.com/AliceO2Group/Bookkeeping/commit/ec080492284f80c9a2bf3770be96a082ef4fb1dc))
* allow AND/OR filtering by tag id on the logs endpoint ([3733ae2](https://github.com/AliceO2Group/Bookkeeping/commit/3733ae2e76cff6b73e46726968c677f885c0a340))
* allow deepmerging multiple objects ([3495484](https://github.com/AliceO2Group/Bookkeeping/commit/3495484122b739b4ada075ea0aeb7e022ab79d97))
* allow users to reply on other logs ([035c0bb](https://github.com/AliceO2Group/Bookkeeping/commit/035c0bb904e524a6f3d3dd943dbde1ea660b86de))
* **markdown:** Added the HyperMD lib locally and added a Markdown box instead of a generic textarea to the create screen ([faca6e1](https://github.com/AliceO2Group/Bookkeeping/commit/faca6e152ff6905ce6bc45bbc65a5c995a80f611))
* **ui:** added Alice O2 favicon ([a17b09b](https://github.com/AliceO2Group/Bookkeeping/commit/a17b09b7843b23b049df1743ed92902433493034))
* **ui:** added table-hover class ([da23191](https://github.com/AliceO2Group/Bookkeeping/commit/da23191dc8017712a4da8487d72e8bf6acfa412f))
* **ui:** added Tag detail view screen ([e508f28](https://github.com/AliceO2Group/Bookkeeping/commit/e508f28194b42879db9732f5e02c1dd3fb265744))
* **ui:** added Tag overview screen ([85c3057](https://github.com/AliceO2Group/Bookkeeping/commit/85c30570d1ea311a63fce2ab3d0c488a3038ed31))
* **ui:** include comma separated tags on the Log table view ([aee65d7](https://github.com/AliceO2Group/Bookkeeping/commit/aee65d77cea8e8bc7eb20a336749185774a0042f))
* **ui:** redirect to overview if no tag id is provided ([53d6a6f](https://github.com/AliceO2Group/Bookkeeping/commit/53d6a6ff0e513ff6a5e891b88546bd9fc7848dae))
* **ui:** scroll to the selected Log entry on detail view ([7e1cb32](https://github.com/AliceO2Group/Bookkeeping/commit/7e1cb32c5e8291ebf0e2ab2ad603221ba4189549))


### Bug Fixes

* **docker:** added bash to all targets ([7db5ad8](https://github.com/AliceO2Group/Bookkeeping/commit/7db5ad862c0d27ff23fe873685ee523c3cb6e2c4))
* **docker:** bump ca-certificates from 20191127-r1 to 20191127-r2 ([727cea4](https://github.com/AliceO2Group/Bookkeeping/commit/727cea43dedd827413882f104f770ea2e635b07c))
* **docker:** updated unsatisfiable constraints ([003c2f6](https://github.com/AliceO2Group/Bookkeeping/commit/003c2f67eb18e7b96080475507f666a9c3dc3294))
* **ui:** autoscrolling not completely going down on long Log threads ([035b455](https://github.com/AliceO2Group/Bookkeeping/commit/035b45553c01577295558fc60a7941be452e2ad7))
* **ui:** trigger scrollTo on both create and update ([59c6ebc](https://github.com/AliceO2Group/Bookkeeping/commit/59c6ebc2826482502f5fbb9da2901bed7ecbac29))
* **ui:** use ternary instead of boolean expression as an expression wil result in a false text ([e9ab282](https://github.com/AliceO2Group/Bookkeeping/commit/e9ab2824a681768c89740013fc35fcd0fe09fd43))
* **ui:** width of Markdown box when creating an entry should be 100% ([2271219](https://github.com/AliceO2Group/Bookkeeping/commit/2271219de3e212f7f6ffe5e2851c8f79024df5f4))
* do not call process.exit in test modus as this affects mocha ([9ad965b](https://github.com/AliceO2Group/Bookkeeping/commit/9ad965b60109267b3052a729031d024b7c30646c))
* resolved issues ([eb4c1a4](https://github.com/AliceO2Group/Bookkeeping/commit/eb4c1a4aea0ac624ae8b143e8736abe7c149ef7a))
* toTreeView should traverse all children ([677377b](https://github.com/AliceO2Group/Bookkeeping/commit/677377b6c72293ed5cfae3dd6a7198b4b0b0c399))
* use 201 for Created instead of 301, naming of variables ([b2477d9](https://github.com/AliceO2Group/Bookkeeping/commit/b2477d96efe810ab42685b0eb743062df4543822))

## [0.4.0](https://github.com/AliceO2Group/Bookkeeping/compare/v0.3.0...v0.4.0) (2020-05-29)


### Features

* Added association execution on models ([e2faf43](https://github.com/AliceO2Group/Bookkeeping/commit/e2faf43b7be5cde7255f3d70d4da47c149ac3e09))
* added associations on log, run and user ([ea979d3](https://github.com/AliceO2Group/Bookkeeping/commit/ea979d35503c65df4c8f579f6bbff4c1fa1ef3c1))
* Added automatic timestamps ([3953877](https://github.com/AliceO2Group/Bookkeeping/commit/3953877ea3a72b02ca02e16e8330b6639eb661d3))
* Added create log screen ([8b0ff45](https://github.com/AliceO2Group/Bookkeeping/commit/8b0ff456c956ae83f5826f21317db5d65710b3cc))
* added DELETE /api/tags/:tagId endpoint ([b9aa839](https://github.com/AliceO2Group/Bookkeeping/commit/b9aa839a2342f407ec18115ea2e6add362ade110))
* Added epn role model and migration ([7a83ee3](https://github.com/AliceO2Group/Bookkeeping/commit/7a83ee3bcd30b0efce2723aa18c49f87dc6a234a))
* added Epn, FLp, Log, Run, Tag and User models ([322b739](https://github.com/AliceO2Group/Bookkeeping/commit/322b739637d44fdeb5dc17cbef93feef3c360440))
* Added flp role model and migration ([56c2608](https://github.com/AliceO2Group/Bookkeeping/commit/56c2608a0e27ab026b9b010215e73a7615a4edf2))
* added GET /api/logs/{logId}/tree endpoint ([031899e](https://github.com/AliceO2Group/Bookkeeping/commit/031899e0a4e1dd70a961741fa84e86b6d546cd3b))
* added GET /api/tags endpoint ([784c17d](https://github.com/AliceO2Group/Bookkeeping/commit/784c17d8027ed8e80fded23a30f031e0de9dd75b))
* added GET /api/tags endpoint ([7911fcf](https://github.com/AliceO2Group/Bookkeeping/commit/7911fcf9618822c0a56b5127ace5d7fa1199a215))
* added GET /api/tags/{tagId} endpoint ([b2d5f62](https://github.com/AliceO2Group/Bookkeeping/commit/b2d5f628b66ff6f79d5fe2a5d04df993da634733))
* added GET /api/tags/{tagId}/logs endpoint ([f6d4918](https://github.com/AliceO2Group/Bookkeeping/commit/f6d4918d34b4801c0f45389a71f9861ab2163740))
* added GET /logs/{logId}/tags endpoint ([b15508e](https://github.com/AliceO2Group/Bookkeeping/commit/b15508eb74c49c7393fd927be7532e10908613b2))
* added GET /logs/{logId}/tags endpoint ([e9699d4](https://github.com/AliceO2Group/Bookkeeping/commit/e9699d4713586a947b6d22ed6dc3b5636e7a38f6))
* added indexes on Log ([e804ebb](https://github.com/AliceO2Group/Bookkeeping/commit/e804ebb24a9c740453c273a7da87dc0034d7d638))
* added indexes on the subtype and origin of Log ([85d82c5](https://github.com/AliceO2Group/Bookkeeping/commit/85d82c52fae16d327dd855df74a2d48563a94c7f))
* Added log model and migration ([801aaf6](https://github.com/AliceO2Group/Bookkeeping/commit/801aaf626c8937a011a48a5322c7e50f6cd64538))
* Added logruns and add associations migration ([bf208e8](https://github.com/AliceO2Group/Bookkeeping/commit/bf208e8c09ee936d38940b0a58ceb2ea72ba0e9a))
* added meta section to GET /api/logs ([b50cc92](https://github.com/AliceO2Group/Bookkeeping/commit/b50cc92f4586a01d4ee372d2d25ad73ff6f353e1))
* Added more models to index ([1fc6549](https://github.com/AliceO2Group/Bookkeeping/commit/1fc65498a735d38f633fee314114bf63f9432efa))
* added multiple /tags endpoints ([09d8c83](https://github.com/AliceO2Group/Bookkeeping/commit/09d8c8373c791c0a87547680290ce2d91c6489e6))
* added OpenAPI converter ([0614c25](https://github.com/AliceO2Group/Bookkeeping/commit/0614c25098e620525d7ff97814c04fbe07da40e1))
* added option to configure database port ([2df0905](https://github.com/AliceO2Group/Bookkeeping/commit/2df09056d6b27ef8fa344fdc7f37df066ad84726))
* added origin filtering on /api/logs ([8496133](https://github.com/AliceO2Group/Bookkeeping/commit/8496133b4eedb052ed5ce02468ebcd1f7c7fb2f2))
* added POST /api/tags endpoint ([dd4fbca](https://github.com/AliceO2Group/Bookkeeping/commit/dd4fbca8453bef49187f8452cecc32e69bede144))
* added Subsystem model ([91708ee](https://github.com/AliceO2Group/Bookkeeping/commit/91708eec017cb3b8ca8bb119c8e518578014786f))
* added Swagger UI integration ([679b153](https://github.com/AliceO2Group/Bookkeeping/commit/679b15321b310a25606912edbaf8cc6eebaf15d8))
* added tags ([bce046f](https://github.com/AliceO2Group/Bookkeeping/commit/bce046fc8aca794211b09831f1304309e5b2548c))
* Added working log pagination (with hardcoded logs per page) ([2cc3f1d](https://github.com/AliceO2Group/Bookkeeping/commit/2cc3f1d95e74783a626e4c6f8429021b02c6e94e))
* allow filtering by parent log id ([31b7ad9](https://github.com/AliceO2Group/Bookkeeping/commit/31b7ad9f12f4fd20107e2e36106cf1e15d4da585))
* allow filtering by root log id ([9b031f6](https://github.com/AliceO2Group/Bookkeeping/commit/9b031f650c6846b709c53a44244142d4516ae545))
* Allowed user to select amount of logs per page ([ba3440f](https://github.com/AliceO2Group/Bookkeeping/commit/ba3440fcfc39f924d4a86d8f6785f6b16f1dca10))
* overview pagination ([0f0c2b9](https://github.com/AliceO2Group/Bookkeeping/commit/0f0c2b9ef71dfe0f28cf93dd0340742fdce44b89))
* **openapi:** added default response UnexpectedError ([d9b525e](https://github.com/AliceO2Group/Bookkeeping/commit/d9b525e832f13975dfb50499dc760f0111d4df05))
* **openapi:** added IBM OpenAPI validator ([3c66898](https://github.com/AliceO2Group/Bookkeeping/commit/3c6689865bfa86f0f07deac16c596ee6d3e45f01))
* **openapi:** added security scheme ([21d8e76](https://github.com/AliceO2Group/Bookkeeping/commit/21d8e76c0aa8482712628d3521a12a4df59fa014))
* **ui:** added loading spinner ([a56ae58](https://github.com/AliceO2Group/Bookkeeping/commit/a56ae58e8aeb629361e3781142f22f45d7505474))
* Added run model and migration ([a9a3daa](https://github.com/AliceO2Group/Bookkeeping/commit/a9a3daac291460a9fb9b8acdc64a1e07f16ee009))
* Added tags association ([8055798](https://github.com/AliceO2Group/Bookkeeping/commit/80557983ffd432423cbfef384f2781096e80fa70))
* allow pagination on /api/logs ([b7a3e5a](https://github.com/AliceO2Group/Bookkeeping/commit/b7a3e5a25ecfbf433247cae6b8f5b80e2230a06a))
* allow sorting on /api/logs ([3b574d9](https://github.com/AliceO2Group/Bookkeeping/commit/3b574d9d1a9ff053f55c6809cd10fca2bc246776))
* detail view of a Log should use the tree format ([183f058](https://github.com/AliceO2Group/Bookkeeping/commit/183f058019c722be4a3130844f573309ce48087a))
* **ui:** added width steps of 5% ([2d20784](https://github.com/AliceO2Group/Bookkeeping/commit/2d20784622611d7827000823db19f20b3bceb743))
* Added tag model and migration ([eecf12e](https://github.com/AliceO2Group/Bookkeeping/commit/eecf12eaceac8416e5a7cd6ae1022bb26eab25b5))
* added timezone config ([3d85e16](https://github.com/AliceO2Group/Bookkeeping/commit/3d85e16ba6526fb4c8f6337898fc368a1ed01aa8))
* Added user model and migration ([3403a4f](https://github.com/AliceO2Group/Bookkeeping/commit/3403a4fa56145a0d6dd7ca25be9485c975a638a9))
* dedicated Docker Compose for staging ([3dec5cf](https://github.com/AliceO2Group/Bookkeeping/commit/3dec5cff73c4ae62b33ba00dec9607a500af39ff))
* filtering on GET /api/logs ([f20dcb0](https://github.com/AliceO2Group/Bookkeeping/commit/f20dcb07bdfdd67ad7905cbd216a649823391f82))
* Implemented a generic object-to-table mapper ([7dbce76](https://github.com/AliceO2Group/Bookkeeping/commit/7dbce765e8e9ef0538ea5d1cb1647c4865d61ede))


### Bug Fixes

* count should not include associations ([d08d92c](https://github.com/AliceO2Group/Bookkeeping/commit/d08d92cd2983c51efc5c336566e112a7b225806d))
* DTO validation should not abort early ([d3f5b31](https://github.com/AliceO2Group/Bookkeeping/commit/d3f5b31f0ea3932caf802aa800712300ba0750b2))
* methods of QueryBuilder should return the instance ([656a009](https://github.com/AliceO2Group/Bookkeeping/commit/656a009e340cba94e6b28c230b35715e4cccc7c6))
* **database:** include charset and collate in database creation ([03ce9c6](https://github.com/AliceO2Group/Bookkeeping/commit/03ce9c6b00eee8a9e6048f70155c6a8b5b677f1a))
* **database:** removed unnecessary foreign key specification ([3d657bf](https://github.com/AliceO2Group/Bookkeeping/commit/3d657bf66c1f5d3f5c43f91fd4902b62714cc358))
* **database:** set migrationStorageTableName value in the configuration ([d1e1c7c](https://github.com/AliceO2Group/Bookkeeping/commit/d1e1c7c3179c8114de90c5ccb97cb66687f1fb28))
* **docker:** include spec directory ([12bf56c](https://github.com/AliceO2Group/Bookkeeping/commit/12bf56c6b69f385026e6629823008e0c58f1026b))
* **license:** added missing file headers ([a5d7961](https://github.com/AliceO2Group/Bookkeeping/commit/a5d79619e255f6b008c8faf22882b6bf1344aa9d))
* **openapi:** 404 response should not be a Bad Request ([c885e52](https://github.com/AliceO2Group/Bookkeeping/commit/c885e527a443b56784811907699224dae6e2ee7c))
* **openapi:** added missing request bodies ([c95fb31](https://github.com/AliceO2Group/Bookkeeping/commit/c95fb3172e4ae7bbf52d12aef21c4d0255b09f0a))
* **openapi:** added missing request body for POST /api/logs ([400d6ec](https://github.com/AliceO2Group/Bookkeeping/commit/400d6ece6426706b61288f8aafcdb4840a2275f0))
* **openapi:** added missing request body for POST /api/tags ([490c944](https://github.com/AliceO2Group/Bookkeeping/commit/490c944a60fed69f7e4dfc09b0f166b8e75f274a))
* **openapi:** an entity id must be atleast 1 ([8035efe](https://github.com/AliceO2Group/Bookkeeping/commit/8035efecaa7d73bc313f13d42382a2ddc02f7df1))
* **openapi:** query parameters should have style deepObject ([e2e240f](https://github.com/AliceO2Group/Bookkeeping/commit/e2e240fc77f31e2a4deab83a7d1938c9ce030920))
* **openapi:** switched description of LogText and LogTitle ([057a3f3](https://github.com/AliceO2Group/Bookkeeping/commit/057a3f3ed8b439590c09a937b895502b83c692ca))
* **openapi:** use $ref requesty bodies schema's ([c996044](https://github.com/AliceO2Group/Bookkeeping/commit/c99604432069a89efa002c5ff6029d8a3fbd1f28))
* **ui:** added viewport meta tag ([2980584](https://github.com/AliceO2Group/Bookkeeping/commit/29805842cc47e6a0025a668af4c9cc358ec49ad9))
* **ui:** filter limiting now working properly ([e139aef](https://github.com/AliceO2Group/Bookkeeping/commit/e139aef6c66595f6fe20017fa85c7b98fe50a1bc))
* **ui:** removed bottom margin of table ([e11543b](https://github.com/AliceO2Group/Bookkeeping/commit/e11543b815230b7aea46ee8d95ecb4d227ee2da4))
* **ui:** table should have a header and body group ([101a0fa](https://github.com/AliceO2Group/Bookkeeping/commit/101a0faa738d537e13d24ff940cb93179b186ad0))
* added missing fields ([ac9b3ba](https://github.com/AliceO2Group/Bookkeeping/commit/ac9b3ba400a420860acfed53c7a1e1d797f7a735))
* Added mount of scripts directory in the container ([a6b7f74](https://github.com/AliceO2Group/Bookkeeping/commit/a6b7f744bd223aa1a3ff96ffb13d7b5bec1f1afb))
* Added some options to user log association ([0705aae](https://github.com/AliceO2Group/Bookkeeping/commit/0705aae287981d06de805acd3c361f39dbf7ab99))
* Added user seeder ([c867114](https://github.com/AliceO2Group/Bookkeeping/commit/c867114b8eb6cc4508475f15a8805f0af5d7f1b4))
* changed capitalized drop table names to lowercase ([32f3347](https://github.com/AliceO2Group/Bookkeeping/commit/32f334739a09db86f9325f5dc3779dd1474ab645))
* changed user 0 to 1 ([5b3ff32](https://github.com/AliceO2Group/Bookkeeping/commit/5b3ff32f83b8f342f844e924158a716d92e2f4c6))
* Cleaned seeders ([8a19a44](https://github.com/AliceO2Group/Bookkeeping/commit/8a19a4415064512bae63b09fb5c5db428eb5b5f8))
* Get the headers dynamically and filter out the field not needed for the table ([99a31f4](https://github.com/AliceO2Group/Bookkeeping/commit/99a31f4592b5104cc6594645fff7ae3a1fe46bb9))
* Log detail no longer shows error on refresh ([2194aca](https://github.com/AliceO2Group/Bookkeeping/commit/2194aca52e0c4c4e4060d268c5fd2cfbe4e74c96))
* overview table column mapping ([ba04766](https://github.com/AliceO2Group/Bookkeeping/commit/ba04766c8ea22601e38461035d4a02273981b674))
* removed id ([e80d1d0](https://github.com/AliceO2Group/Bookkeeping/commit/e80d1d09d41629d5a2e032b34cf90c24549359e3))
* removed migration skeleton ([f03a595](https://github.com/AliceO2Group/Bookkeeping/commit/f03a5957ed72171cc25f7fa428881eea75a038b9))
* Renamed Log.js to log.js ([5b3a78f](https://github.com/AliceO2Group/Bookkeeping/commit/5b3a78f433f37fd606245dfd87d2c75b7b0b9365))
* Restored filtering functionality ([0df675a](https://github.com/AliceO2Group/Bookkeeping/commit/0df675ac2207cc9b98390655bb15f1c8cde89a65))
* **ui:** removed bottom margin of table ([8e2cfc7](https://github.com/AliceO2Group/Bookkeeping/commit/8e2cfc757be3e0d7a35ba5f9b04443f3ab41b436))
* **ui:** table should have a header and body group ([0ae99f8](https://github.com/AliceO2Group/Bookkeeping/commit/0ae99f8ecd1775b8f9c424977f49a6b9c6177e6e))
* log user relation ([ddd0d2e](https://github.com/AliceO2Group/Bookkeeping/commit/ddd0d2ee99dbeb2fcf8356009b86d7ab95eab1c2))
* re-create database in the test environment ([0aad7ea](https://github.com/AliceO2Group/Bookkeeping/commit/0aad7ea960607fc69de0ef72321b5b43e70325ea))
* renamed model flproles to flprole ([f135ee7](https://github.com/AliceO2Group/Bookkeeping/commit/f135ee72be509d0769c8dd64c88fbb5e710897d7))
* renamed runs tablename ([71d6a93](https://github.com/AliceO2Group/Bookkeeping/commit/71d6a93553aff06800a2e2963fda775a256f2678))
* restored original casing of userid in the Log adapter ([4430ee1](https://github.com/AliceO2Group/Bookkeeping/commit/4430ee1898405e5b51d4d865dfeaa90f16105adf))
* snake_cased table names ([97d1a26](https://github.com/AliceO2Group/Bookkeeping/commit/97d1a26846cac8ba751278dca511242a726435f8))
* user_id cant be 0 ([830f1b3](https://github.com/AliceO2Group/Bookkeeping/commit/830f1b3b8aa2f21ae0c7aa23b521c40111430321))
* wrong arg use ([6963305](https://github.com/AliceO2Group/Bookkeeping/commit/6963305837cc7553323c87ce68754c18e9b994ac))

# [0.3.0](https://github.com/AliceO2Group/Bookkeeping/compare/v0.2.0...v0.3.0) (2020-05-08)


### Bug Fixes

* Added executable permission on docker build script ([2299c2d](https://github.com/AliceO2Group/Bookkeeping/commit/2299c2de9f11929e30b0d7a3f189bd2448bf5fd7))
* addressed bug that brought down code coverage ([9d6608f](https://github.com/AliceO2Group/Bookkeeping/commit/9d6608f7aeb798bcf744b72827c67d33267efcdf))
* Addressed bug which would cause log detail page to fetch every log entry ([2a87b58](https://github.com/AliceO2Group/Bookkeeping/commit/2a87b5824f0fcea2b2e3e8a42c5eee88eb5892f1))
* database should use UTF-8 encoding ([344c1c9](https://github.com/AliceO2Group/Bookkeeping/commit/344c1c9ddab572da314dc07fcdbf0173a0699cf5))
* Fix the mapping error (x is undefined)  in the detail view ([60eda29](https://github.com/AliceO2Group/Bookkeeping/commit/60eda293793dab1947845900b335052688d9b9a1))
* route error handler should distinguish between async and regular functions ([5bbd025](https://github.com/AliceO2Group/Bookkeeping/commit/5bbd025a28d33bf3746a5b0e8e0bd76677daa197))
* use try catch to return instead of Promise catch ([7373267](https://github.com/AliceO2Group/Bookkeeping/commit/7373267b9f8363353161bf21c5b3a0d3183f5117))
* **docker:** added missing node_modules volume ([cce1233](https://github.com/AliceO2Group/Bookkeeping/commit/cce123384c7e945ffb2bde9405b44184ce40982e))
* **docker:** production compose should expose port 80 ([302c745](https://github.com/AliceO2Group/Bookkeeping/commit/302c745ae7e601bb5c1e211968ffd16514255c47))
* **docker:** wait for database to be up ([c6c3fd7](https://github.com/AliceO2Group/Bookkeeping/commit/c6c3fd79a8be8ec57818f5e9255228ed201c6f22))
* **spec:** use relative instead of absolute server url ([90d7cb8](https://github.com/AliceO2Group/Bookkeeping/commit/90d7cb86eca90a44df5daa0c5e7656d8336e3d6d))
* **test:** test should only start the application once ([df16d2d](https://github.com/AliceO2Group/Bookkeeping/commit/df16d2de56ed46eec1a09ad9077309ee15896bda))


### Features

* added Application interface ([3c3b488](https://github.com/AliceO2Group/Bookkeeping/commit/3c3b488c3fe315d309da980445d50cd795153b70))
* added Configuration ([57655be](https://github.com/AliceO2Group/Bookkeeping/commit/57655be667cd6828449123468b2738ff4bc2a3dd))
* added count method to Repository ([d8319b5](https://github.com/AliceO2Group/Bookkeeping/commit/d8319b55bee85c0c57b7a429ab2b6f6da4b0ef6e))
* added CreateLogUseCase ([5e24f73](https://github.com/AliceO2Group/Bookkeeping/commit/5e24f73fdb436f01bf9e9eaad3f13ab3ea1ab14b))
* added Database interface ([fdf97e2](https://github.com/AliceO2Group/Bookkeeping/commit/fdf97e2e8c6a3b8b1ed9c5efec1dd85870014324))
* added dedicated test database ([0e905a5](https://github.com/AliceO2Group/Bookkeeping/commit/0e905a584a6d4e9862f74776a4df4d319fdf924e))
* added GetDeployInformationUseCase ([eac217f](https://github.com/AliceO2Group/Bookkeeping/commit/eac217fe49bdc193cf637772af21e933683e9e97))
* added isInTestMode method to Application ([e56c70d](https://github.com/AliceO2Group/Bookkeeping/commit/e56c70dd72b514c2f9193a59f1ed03c7556bf4d5))
* added Log adapter ([fed335a](https://github.com/AliceO2Group/Bookkeeping/commit/fed335a73dae483b9be3794b90e448154dcf1031))
* added Log model and repository implementation ([be96df7](https://github.com/AliceO2Group/Bookkeeping/commit/be96df7188ac6d0396738d4404952b9883ee8526))
* added Logger interface and implementation ([015859b](https://github.com/AliceO2Group/Bookkeeping/commit/015859b1a3460fc78cfaf56193bd2d7eddf4df3f))
* added population sql ([cc1d9b5](https://github.com/AliceO2Group/Bookkeeping/commit/cc1d9b5054b6e5ae1bf78870e1811c70bddeae2d))
* added Sequelize CLI ([d45658b](https://github.com/AliceO2Group/Bookkeeping/commit/d45658bdb8a66383a6ad29c674a04d86cf0da56f))
* added Sequelize database ([a5d80b8](https://github.com/AliceO2Group/Bookkeeping/commit/a5d80b87dc349401d6df3fd22498c1ffa9f43d45))
* added Sequelize migration ([bcdfb40](https://github.com/AliceO2Group/Bookkeeping/commit/bcdfb40940795e5e96d70e0efe7d7ca75b64ffb2))
* added Sequelize seeder ([b3301c7](https://github.com/AliceO2Group/Bookkeeping/commit/b3301c7ba2332f117ece3d2194da7ad03882403c))
* added Structure package ([ca7dcc6](https://github.com/AliceO2Group/Bookkeeping/commit/ca7dcc657b6d0e5a20ee6715f54aa7579cf0040d))
* added TransactionHelper ([4649722](https://github.com/AliceO2Group/Bookkeeping/commit/4649722160b94408c546bde6e0154e0f77ce002b))
* implemented graceful shutdown process ([0088052](https://github.com/AliceO2Group/Bookkeeping/commit/0088052b74dce052231efe87e401658ccf0c3687))
* mount MariaDB data directory on host ([11f0e56](https://github.com/AliceO2Group/Bookkeeping/commit/11f0e567535933d3c669d965e5a811f8cf805172))



# [0.2.0](https://github.com/AliceO2Group/Bookkeeping/compare/v0.1.0...v0.2.0) (2020-04-24)


### Bug Fixes

* **docker:** production compose should expose port 80 ([302c745](https://github.com/AliceO2Group/Bookkeeping/commit/302c745ae7e601bb5c1e211968ffd16514255c47))
* **docs:** markdown depth ([a30cbb6](https://github.com/AliceO2Group/Bookkeeping/commit/a30cbb617a27fddfed2436358c838e8a290d621e))
* Added code for coverage compatibility in the tests ([8301188](https://github.com/AliceO2Group/Bookkeeping/commit/8301188b08f97ca779dd833d5256b7e0715d1460))
* Added licenses ([fd0a064](https://github.com/AliceO2Group/Bookkeeping/commit/fd0a0644c734cd117347d9a6cd4d0785bc192198))
* Adjusted in indent in Model.js ([e80ae57](https://github.com/AliceO2Group/Bookkeeping/commit/e80ae5702e5fb8ba872e07ba1943e58aebbc40a5))
* Changed the structure of the tests and added an empty line between methods in Overview.js ([ce16582](https://github.com/AliceO2Group/Bookkeeping/commit/ce16582c1b0418a62a73fb652992b9d0a2a07933))
* Extended timeout on the filter test ([2ae6781](https://github.com/AliceO2Group/Bookkeeping/commit/2ae67812d188d3d01d99c240ed6ef92593e8830a))
* Fixed appendPath utility and its test ([334d4c2](https://github.com/AliceO2Group/Bookkeeping/commit/334d4c2a688a29ccf70d7b01e6a2738df504144e))
* Fixed deepmerge in appendPath utility ([2d51a70](https://github.com/AliceO2Group/Bookkeeping/commit/2d51a70899bb34ab630f74affa88c3e9e6cf90dd))
* Fixed indentation ([4fc26d6](https://github.com/AliceO2Group/Bookkeeping/commit/4fc26d61c3d801f491afc23df537ae235d7cd088))
* Fixed jdoc in controllers and routes ([ca86375](https://github.com/AliceO2Group/Bookkeeping/commit/ca8637565bd94c6a29fe0ad46c84802de13914d1))
* Fixed linting erros ([d201276](https://github.com/AliceO2Group/Bookkeeping/commit/d20127685c87484730cfcf45662e9f52333b6814))
* Fixed route argument inheritance issue ([a8134fd](https://github.com/AliceO2Group/Bookkeeping/commit/a8134fd3fe92808782a4b969870a8b905b78dd72))
* Fixed the compatiblity issue with Firefox ([70b7d1a](https://github.com/AliceO2Group/Bookkeeping/commit/70b7d1a07e88487468b3129f22649639511d81f2))
* NGINX does not yet have a production configuration ([94955e1](https://github.com/AliceO2Group/Bookkeeping/commit/94955e13d71556ae41d2b29cbc7dbcd4ab4f7ca3))
* Removed the tags header, added comment in the start-dev script for its purpose ([2424e0b](https://github.com/AliceO2Group/Bookkeeping/commit/2424e0b0b8d9b735ba1af59f41ac45a75ab99123))
* Renamed tag and user controller to be a bit more verbose ([b0de0c6](https://github.com/AliceO2Group/Bookkeeping/commit/b0de0c62f285f916035bbc9e2205f2532d1f7fb3))
* route /tag is not plural ([efecacd](https://github.com/AliceO2Group/Bookkeeping/commit/efecacd73316fe40de2c687c73e666fa92d39ed8))
* starting the application via NPM not Node ([860b5ab](https://github.com/AliceO2Group/Bookkeeping/commit/860b5aba8b161002bc41e24ada520a5457aa34a5))
* starting the application via NPM not Node ([8d444a9](https://github.com/AliceO2Group/Bookkeeping/commit/8d444a91f32358972628bbdb7f3f6328bf392b44))


### Features

* Added appendPath to route builder ([d3d3ebd](https://github.com/AliceO2Group/Bookkeeping/commit/d3d3ebd7a8db7454e6d40bb2b5a9458f58980e7d))
* added appendPath utility ([9a740ad](https://github.com/AliceO2Group/Bookkeeping/commit/9a740ad4d3bbe7d31857e72c9099012e62ea9704))
* Added attachment endpoint ([dfba079](https://github.com/AliceO2Group/Bookkeeping/commit/dfba079de104e199c70d10311be468ed3fad8f77))
* Added auth endpoints ([39066f8](https://github.com/AliceO2Group/Bookkeeping/commit/39066f836ed10374a052f62ef5e348299d5886f6))
* Added createpdf endpoint ([724f854](https://github.com/AliceO2Group/Bookkeeping/commit/724f85462f11f4adf9adb685e0cddd67ff28de61))
* Added deepmerge dependency ([e854ac3](https://github.com/AliceO2Group/Bookkeeping/commit/e854ac3ca4538538746d7e19ff413e4edc5ee215))
* Added deepmerge wrapper ([0e1ea71](https://github.com/AliceO2Group/Bookkeeping/commit/0e1ea719c46e25c75e843c0437d8205c5fa9d9e8))
* Added detail screen ([e0bc9e3](https://github.com/AliceO2Group/Bookkeeping/commit/e0bc9e30b701cae19014c7c0a6c83fb87de93c6c))
* Added flp endpoint ([6f0c890](https://github.com/AliceO2Group/Bookkeeping/commit/6f0c8907af9efaffc6df22069e4d88468b257901))
* added GetAllLogsUseCase ([64eeb62](https://github.com/AliceO2Group/Bookkeeping/commit/64eeb62c00f833a0bf6202c2ab29a4964e7c2fb2))
* added GetServerInformationUseCase ([c368b20](https://github.com/AliceO2Group/Bookkeeping/commit/c368b2019a3d388e11d3f69779347f8f21fd5a9e))
* Added logs endpoint ([dc85779](https://github.com/AliceO2Group/Bookkeeping/commit/dc85779ddd7b3bf6c08cc84043962277de62da9a))
* added Nginx integration ([0d7868a](https://github.com/AliceO2Group/Bookkeeping/commit/0d7868a05ff4dc794b8f3d9a0387b7814a095d10))
* Added overviews endpoint ([57b64bb](https://github.com/AliceO2Group/Bookkeeping/commit/57b64bb5f0e0d16ac577932872c7fd1194de1b96))
* Added reusable table components and start on the mock table with static data ([e899de4](https://github.com/AliceO2Group/Bookkeeping/commit/e899de4cc8f437a813ae3a58e5adac3c5d240cce))
* Added routerBuilder ([995f8a1](https://github.com/AliceO2Group/Bookkeeping/commit/995f8a1532367798fba175cb7855cb6f22c827b5))
* Added runs endpoint ([8e1c15a](https://github.com/AliceO2Group/Bookkeeping/commit/8e1c15a4873656c08df23ef8a750c7e1a34da800))
* Added settings endpoint ([1b03bf7](https://github.com/AliceO2Group/Bookkeeping/commit/1b03bf70e42d295e4b48490e3cd87ff73120a377))
* Added subsystem controller ([7564524](https://github.com/AliceO2Group/Bookkeeping/commit/7564524e6e99c069f6534836b186dae91b432db6))
* Added subsystems router ([521c828](https://github.com/AliceO2Group/Bookkeeping/commit/521c8282b0e302d6bfe8093372959da638d0737d))
* Added tags controller and route ([00866d1](https://github.com/AliceO2Group/Bookkeeping/commit/00866d1339bf1ca6b9122f915bdd043af6eac0e5))
* Added tests ([a7e1047](https://github.com/AliceO2Group/Bookkeeping/commit/a7e1047b3b42418024ae453d3cc2142f1b89b895))
* Added user controller ([c0a5f75](https://github.com/AliceO2Group/Bookkeeping/commit/c0a5f75111287de5ebf7292e8234d21d0d69f4ac))
* Added user route ([4b3506d](https://github.com/AliceO2Group/Bookkeeping/commit/4b3506d1655c46132669c32f6483bee099c8db22))
* Added utils index ([8cffbbd](https://github.com/AliceO2Group/Bookkeeping/commit/8cffbbd6854d210a70818dc62606970447f00107))
* allow Framework to override interfaces ([623181d](https://github.com/AliceO2Group/Bookkeeping/commit/623181d9191190e4ce3d27782d82f12589cc39b5))
* Codecov integration for backend ([032ea1c](https://github.com/AliceO2Group/Bookkeeping/commit/032ea1c29ff5f6253ba0a9103118d485d3384e3b))
* ESLint integration ([c86b116](https://github.com/AliceO2Group/Bookkeeping/commit/c86b1166f558839c920c267ea86b58f72b2b89df))
* GitHub actions integrations for backend ([db06cb3](https://github.com/AliceO2Group/Bookkeeping/commit/db06cb396081227e4a9e493ace7f10f92beb5c0f))
* GitHub actions integrations for frontend ([d5dd04f](https://github.com/AliceO2Group/Bookkeeping/commit/d5dd04f773f8f0f40091ebb15e6e99894c41684a))
* GitHub actions integrations for spec ([db62696](https://github.com/AliceO2Group/Bookkeeping/commit/db62696bcd167fda789b92ae6cd01922d2babece))
* Got filtering working, reflects on the actual table now ([5b56dcc](https://github.com/AliceO2Group/Bookkeeping/commit/5b56dcc511a468666688a046138fdc92fa0afcff))
* Upgraded appendPath utility ([40f366b](https://github.com/AliceO2Group/Bookkeeping/commit/40f366b1964536c87de6efdbdc3f081d0e45c9b8))

# [0.1.0](https://github.com/AliceO2Group/Bookkeeping/compare/v0.0.0...v0.1.0) (2020-03-03)


### Features

* added Nginx integration ([fb27bef](https://github.com/AliceO2Group/Bookkeeping/commit/fb27befe2b55800c3666aab501a0834d7bf0ed96))
* added Nginx integration ([0d7868a](https://github.com/AliceO2Group/Bookkeeping/commit/0d7868a05ff4dc794b8f3d9a0387b7814a095d10))
* Code coverage reporting to Codecov ([42ebcee](https://github.com/AliceO2Group/Bookkeeping/commit/42ebcee817ee1581d2b2f60a7c5a990b6b8732a6))
* Codecov integration for backend ([032ea1c](https://github.com/AliceO2Group/Bookkeeping/commit/032ea1c29ff5f6253ba0a9103118d485d3384e3b))
* Continuous Integration using GitHub actions ([9939709](https://github.com/AliceO2Group/Bookkeeping/commit/993970923bf2be95469043057e02f84f1cc953b4))
* ESLint integration ([9ce0624](https://github.com/AliceO2Group/Bookkeeping/commit/9ce06241103f9b5891ca56ff2e771002cb245cd6))
* ESLint integration ([c86b116](https://github.com/AliceO2Group/Bookkeeping/commit/c86b1166f558839c920c267ea86b58f72b2b89df))
* GitHub actions integrations for backend ([db06cb3](https://github.com/AliceO2Group/Bookkeeping/commit/db06cb396081227e4a9e493ace7f10f92beb5c0f))
* GitHub actions integrations for frontend ([d5dd04f](https://github.com/AliceO2Group/Bookkeeping/commit/d5dd04f773f8f0f40091ebb15e6e99894c41684a))
* GitHub actions integrations for spec ([db62696](https://github.com/AliceO2Group/Bookkeeping/commit/db62696bcd167fda789b92ae6cd01922d2babece))
