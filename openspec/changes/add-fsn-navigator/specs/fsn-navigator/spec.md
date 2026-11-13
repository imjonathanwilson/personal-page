## ADDED Requirements

### Requirement: Content-driven 3D file system
The homepage SHALL render the site content tree (`fsTree`) as an fsn-style 3D landscape where directories are pedestals, files are blocks on their parent pedestal, and wires connect parents to children.

#### Scenario: Scene reflects content tree
- **WHEN** the homepage loads in a WebGL-capable browser
- **THEN** a pedestal is rendered for `/` and each top-level directory, each labelled with its name

#### Scenario: File block height reflects size
- **WHEN** two files of different `size` sit on the same pedestal
- **THEN** the larger file's block is taller

### Requirement: Directory navigation
Users SHALL be able to navigate into directories and back out.

#### Scenario: Enter a directory
- **WHEN** the user clicks the `projects` pedestal
- **THEN** the camera moves to it and the breadcrumb reads `/ > projects`

#### Scenario: Go up a level
- **WHEN** the user presses Escape or the back button while in `/projects`
- **THEN** the current path becomes `/`

### Requirement: Open files in the terminal
Selecting a file SHALL show its contents in the terminal window.

#### Scenario: Open a text file
- **WHEN** the user clicks `/about/bio.txt`
- **THEN** the terminal shows `cat /about/bio.txt` followed by the file body

#### Scenario: Open a link file
- **WHEN** the user clicks `/links/github.lnk`
- **THEN** the GitHub profile opens in a new tab

### Requirement: Graceful degradation
The site SHALL remain fully usable without the 3D scene.

#### Scenario: No WebGL
- **WHEN** WebGL is unavailable or `NEXT_PUBLIC_FSN=0`
- **THEN** the terminal-only page renders with no console errors

#### Scenario: Reduced motion
- **WHEN** the user prefers reduced motion
- **THEN** camera moves cut instantly and shader pulsing is disabled

### Requirement: Lazy loading
The 3D libraries SHALL NOT be part of the initial page bundle.

#### Scenario: Bundle split
- **WHEN** the site is built
- **THEN** three.js and R3F are emitted in a chunk loaded after the initial page
