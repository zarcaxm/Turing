/**
 * SystemBackground renders subtle, decorative ASCII art behind the terminal UI:
 * ship schematics, sector maps, system diagnostic codes and scan diagrams.
 * It is purely decorative — low opacity, non-interactive, and always sits
 * behind the interactive interface.
 */
const SHIP_SCHEMATIC = `+--[ WY HULL SCHEMATIC // NOSTROMO-CLASS ]--+
|    ________________________________      |
|   /   FWD   |   MID    |    AFT    \\     |
|  /__________|__________|____________\\   |
|       |        DECK 04        |          |
|       +------------------------+          |
|          REACTOR CORE: NOMINAL            |
+--------------------------------------------+`;

const SECTOR_MAP = `SECTOR MAP // GRID 7-J
+---+---+---+---+---+
| . | . | # | . | . |
+---+---+---+---+---+
| . | # | . | . | # |
+---+---+---+---+---+
| # | . | . | # | . |
+---+---+---+---+---+
  NAV LOCK.......ACQUIRED`;

const SYSTEM_CODES = `SYS.KRNL.0x7F3A ......OK
AUTH.TOKEN.9921 ......OK
LIFE.SUP.PRESS .....98.4%
COOLANT.FLOW .....NOMINAL
UPLINK.WY-CORP .....SYNC
0x00FF 0x1A2B 0x44DE 0x091C`;

const SCAN_DIAGRAM = `        .-""""-.
      /          \\
     |   x    x   |
      \\    --    /
       '-.____.-'
   RANGE...... 4200 KM
   BEARING... 271 MARK 6`;

const CARGO_MANIFEST = `CARGO MANIFEST // LOT 240-Z
[X] SAMPLE CASE..... SEALED
[X] DRIVE CORE...... SEALED
[ ] O2 RESERVE...... PENDING
[ ] MED KIT......... PENDING
[X] BEACON.......... ARMED
------------------------------
MANIFEST HASH: 8C4F-91AA`;

const BULKHEAD_MAP = `BULKHEAD ACCESS // LV-04
+====+====+====+====+
| A1 | A2 || B1 | B2 |
+====+====+====+====+
   ||           ||
+====+====+====+====+
| C1 | C2 || D1 | D2 |
+====+====+====+====+
  AIRLOCK.....SEALED`;

const WARNING_PLACARD = `/\\ CAUTION /\\
------------------
ZONE: RESTRICTED
CLEARANCE: LVL-3+
------------------
REPORT ANOMALIES
TO WY-CORP CENTRAL`;

const TERMINAL_LOG = `> boot sequence....OK
> mem check........OK
> comms uplink.....OK
> queue task 0x41
> queue task 0x42
> queue task 0x43
> standing by_`;

export function SystemBackground() {
  return (
    <div className="system-background" role="presentation" aria-hidden="true">
      <pre className="system-background-block bg-block-schematic">{SHIP_SCHEMATIC}</pre>
      <pre className="system-background-block bg-block-sector">{SECTOR_MAP}</pre>
      <pre className="system-background-block bg-block-codes">{SYSTEM_CODES}</pre>
      <pre className="system-background-block bg-block-scan">{SCAN_DIAGRAM}</pre>
      <pre className="system-background-block bg-block-manifest">{CARGO_MANIFEST}</pre>
      <pre className="system-background-block bg-block-bulkhead">{BULKHEAD_MAP}</pre>
      <pre className="system-background-block bg-block-warning">{WARNING_PLACARD}</pre>
      <pre className="system-background-block bg-block-log">{TERMINAL_LOG}</pre>
    </div>
  );
}
