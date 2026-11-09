/**
 * Collects RSVPs and wishes in a Google Sheet.
 *
 * Setup (see the README for the full steps):
 *  1. Create a Google Sheet, then Extensions -> Apps Script, and paste this file.
 *  2. Project Settings -> Script properties -> add SECRET = a long random string
 *     (use the same value as GOOGLE_SCRIPT_SECRET in the website's environment).
 *  3. Deploy -> New deployment -> Web app -> Execute as: Me, Who has access: Anyone.
 *     Copy the /exec URL into GOOGLE_SCRIPT_URL.
 *
 * Rows land in a tab called "RSVP": Timestamp | Name | Attendance | Wishes | Language.
 * Check-ins land in a tab called "Check-in": Timestamp | Name | Table | Pax | Distance (m).
 * After changing this file, Deploy -> Manage deployments -> edit -> New version, so the live URL uses it.
 */
const SHEET_NAME = "RSVP";
const HEADERS = ["Timestamp", "Name", "Attendance", "Wishes", "Language"];
const CHECKIN_SHEET = "Check-in";
const CHECKIN_HEADERS = ["Timestamp", "Name", "Table", "Pax", "Distance (m)"];

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
  }
  return sh;
}

function checkinSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(CHECKIN_SHEET);
  if (!sh) sh = ss.insertSheet(CHECKIN_SHEET);
  if (sh.getLastRow() === 0) {
    sh.appendRow(CHECKIN_HEADERS);
    sh.setFrozenRows(1);
  }
  return sh;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// stop guest text from being read as a spreadsheet formula
function safe_(value) {
  const s = String(value == null ? "" : value).slice(0, 1000);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function authorized_(secret) {
  const expected = PropertiesService.getScriptProperties().getProperty("SECRET");
  return !!expected && secret === expected;
}

// a guest sends their RSVP, or checks in at the venue
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    if (!authorized_(data.secret)) return json_({ ok: false, error: "unauthorized" });
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      if (data.type === "checkin") {
        // a guest arrived at the venue: its own tab, so the RSVP list stays clean
        checkinSheet_().appendRow([new Date(), safe_(data.name), safe_(data.table), safe_(data.pax), safe_(data.distance)]);
      } else {
        sheet_().appendRow([new Date(), safe_(data.name), safe_(data.attendance), safe_(data.message), safe_(data.lang)]);
      }
    } finally {
      lock.releaseLock();
    }
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

// the website reads the latest wishes (names and messages only; attendance stays private)
function doGet(e) {
  if (!authorized_(e.parameter.secret)) return json_({ ok: false, error: "unauthorized" });
  const sh = sheet_();
  const last = sh.getLastRow();
  if (last < 2) return json_({ ok: true, wishes: [] });
  const rows = sh.getRange(2, 1, last - 1, 5).getValues();
  const wishes = rows
    .filter(function (r) {
      return String(r[3]).trim() !== "";
    })
    .map(function (r) {
      return { at: new Date(r[0]).getTime(), name: String(r[1]), message: String(r[3]) };
    })
    .sort(function (a, b) {
      return b.at - a.at;
    })
    .slice(0, 50);
  return json_({ ok: true, wishes: wishes });
}
