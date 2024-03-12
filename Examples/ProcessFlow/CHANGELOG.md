# Change Log

## 2.6.4 (12/03/2024)

* Fix handling of same information carried by multiple flows into or out of a step.
* Fix flow from Start or to End carrying information

## 2.6.3 (09/01/2024)

* Fix development environment vulnerability in follow-redirects

## 2.6.2 (18/10/2023)

* Fix development environment vulnerability in @Babel/traverse

## 2.6.1 (24/08/2023)

* Upgrade webpack version file plugin

## 2.6.0 (17/07/2023)

* Added BPMN shapes and flows

## 2.5.1 (15/07/2023)

* Remove vulnerabilities in development environment dependencies (semver)

## 2.5.0 (25/08/2022)

* Add support for horizontal swim-lanes

## 2.1.0 (11/08/2022)

* Add configuration to style JSON object to control whether the Input and Output swim-lanes are drawn

## 2.0.3 (29/07/2022)

* Correct spellings

## 2.0.2 (19/07/2022)

* Remove vulnerabilities in development environment dependencies

## 2.0.1 (20/05/2022)

* Improve visibility of flow labels

## 2.0.0 (18/05/2022)

* Add capability to test if navigation to a process element is available
* Add header graph
  * This can be setup to be permanently visible above a process flow diagram when scrolling and is intended to replace the swimlane watermarks

## 1.4.5 (18/05/2022)

* Bug fix in I/O type error handling
* Remove vulnerabilities in development environment dependencies

## 1.4.4 (21/04/2022)

* Minor improvement to flow merges

## 1.4.3 (21/04/2022)

* Remove vulnerabilities in development environment dependencies

## 1.4.1 (20/04/2022)

* Do not report short straight lines routed by the fallback router as routing failures

## 1.4.0 (20/04/2022)

* Allow reservation of source and/or target ports for flows

## 1.3.1 (08/04/2022)

* Correct test for steps with circular flows sharing same row

## 1.3.0 (05/04/2022)

* Add support for flows containing information
  * treat such info as an output from the source of the flow and an input to the target of the flow

## 1.2.16 (28/03/2022)

* Align side ports to grid to increase chances of routing success
* Remove vulnerabilities in development environment dependencies

## 1.2.15 (22/03/2022)

* Improve row vertical alignment with grid for further improvement with flow merging

## 1.2.14 (18/03/2022)

* Allow sub process as process step
* Check for valid I/O element types

## 1.2.13 (14/03/2022)

* Improve flow merging

## 1.2.12 (07/02/2022)

* Remove vulnerabilities in development environment dependencies

## 1.2.11 (15/12/2021)

* Further correction to pending off page connector processing

## 1.2.10 (14/12/2021)

* Further improvement to test on steps being too close to share row

## 1.2.9 (14/12/2021)

* Correction to pending off page connector processing
* Remove magic string

## 1.2.8 (30/11/2021)

* Allow off page connectors on same row in step group
  * Assign group to off page connectors so that input connector can share same row as target

## 1.2.7 (17/11/2021)

* Allow for narrow lanes / wide steps in spacing adjustment
  * Include step in adjoining lane above decision when deciding to increase padding

## 1.2.6 (15/11/2021)

* Fix failure to report failed auto-routing
  * Failure could occur after upgrade to JointJS v3.4.4 in v1.2.5
* Allow steps with off page connectors to share row

## 1.2.5 (08/11/2021)

* an upgrade to v3.4.4 of JointJs to remove all remaining vulnerabilities
* a slight drawing performance improvement provided by JointJs v3.4.4

## 1.2.4 (03/11/2021)

* Improved detection of steps being too close to share the same row
* Do not report straight line routes as failing auto-routing

## 1.2.3 (01/11/2021)

* A fix for clicking on off-page connectors in Internet Explorer. The function to scroll to the other end isn’t supported in IE, so IE11 has the standard highlight/un-highlight behaviour.

## 1.2.2 (01/11/2021)

* Build environment updated to webpack 5
* The majority of vulnerabilities in the development environment have been removed
* The 2 high severity vulnerabilities in the production code have been removed, but a new moderate severity vulnerability remains

## 1.2.0 (25/10/2021)

* Improve auto routing success
  * Control drawing order of flows to improve routing success
  * Display warning in BA for any flows that couldn’t be auto-routed

## 1.1.6 (24/10/2021)

* Improve routing of output link marked as a flow

## 1.1.5 (23/10/2021)

* Fix label position for horizontal flow to multi-lane step in next lane

## 1.1.4 (22/10/2021)

* Fix bug in step swim-lane error reporting
* Fix CSS for swim-lane  watermark text
  * You will need to reset the CSS styling to pick up this change

## 1.1.3 (15/10/2021)

* Fix for missing line jumps
* Handle line jumps over more than 2 lines
* Improve alignment of multiple flows from a step

## 1.1.2 (12/10/2021)

* Configuration of label position on individual flows
* Configuration to prevent a chosen step sharing row with next step (line break)
* Prevent a decision step sharing a row with step in next lane if lanes are too narrow
* Configure colour of Input and Output lanes in CSS
* Fix for bug in handling large decision step

## 1.0.51 (25/09/2021)

* Fix for bug in handling large decision step

## 1.0.50 (24/09/2021)

* Navigation from off-page connector to other end of flow
* Line jumps on horizontal (or by configuration vertical) lines only
  * There is a performance hit for this, which is largely removed in version 1.2.5
* Various flow routing improvements

## 1.0.33 (19/08/2021)

* Added flexibility in configuration of Actor swim-lane colour

## 1.0.32 (13/08/2021)

* Addition of a larger decision shape

## 1.0.31 (11/08/2021)

* Better control of Start/End shape when width is increased

## 1.0.30 (11/08/2021)

* Various flow routing improvements

## 1.0.29 (02/08/2021)

* Fix for Internet Explorer on Army Hosting Environment
  * This is at the expense of re-introducing vulnerabilities
  * Removal of all vulnerabilities with support for IE11 not achieved until v1.2.5

## 1.0.22 (26/07/2021)

* Improve port selection for decision steps
* Configuration of Actor swim-lane colour

## 1.0.21 (26/07/2021)

* Checks for I/O on Start and End steps
* Removal of vulnerabilities

## 1.0.19 (25/05/2021)

* Removal of vulnerabilities
* Multi-lane step validation (warning in BA) to ensure multi-lane steps are in contiguous lanes
* A fix to order swim lanes by order of appearance (I believe this mode is only used in COMPASS Subs)
* Note: breaks compatibility with IE11. This is fixed in v1.0.29

## 1.0.18 (28/04/2021)

* Add support for label on input link

## 1.0.17 (27/04/2021)

* Add support for multi-line flow labels
* Add I/O lane watermark
* Loosen constraint on swimlane width to reduce wasted horizontal space

## 1.0.16 (27/04/2021)

* Introduce custom router for flows
* Add test for self-referential flows
* Undo npm module upgrades done in version 1.0.8
  * Remain on JointJS version 3.3, but revert other modules to earlier versions to allow the custom viz to render on AHE infrastructure

## 1.0.8 (22/04/2021)

* Remove extra vertical gap above input page connector
* Upgrade JointJS from 3.2 to 3.3
  * Denial of Service and Prototype Pollution vulnerabilities in versions before 3.3.0
  * Breaks support on AHE, fixed in v1.0.16

## 1.0.7 (21/04/2021)

* Add validation for Step type
* Off-page connectors are not valid step types
* Improve flow routing to off page connectors
* Handle highlighting triggered by click on off page connector / flow
* Improve handling of multiple off-page input connectors
* Correct StepFlow data shape label in "Configure Information Shown..."
