/* ============================================================
 *  Liturgical calendar (Roman Rite, Ordinary Form)
 *  Dependency-free, offline. Everything keys off the Easter
 *  computus so it is correct for any year.
 *
 *  Scope / honesty:
 *   - Seasons, colors, and fast/abstinence rules are accurate.
 *   - Ascension & Corpus Christi use the UNIVERSAL-CALENDAR
 *     Thursday; some countries (incl. most US dioceses) transfer
 *     them to the following Sunday.
 *   - The saint-of-the-day table is a curated subset of the major
 *     solemnities, feasts, and popular memorials — not exhaustive.
 * ============================================================ */
(function () {
  "use strict";

  function D(y, m, d) { return new Date(y, m - 1, d); } // m: 1-12
  function addDays(dt, n) { const r = new Date(dt); r.setDate(r.getDate() + n); return r; }
  function ymd(dt) {
    return dt.getFullYear() + "-" +
      String(dt.getMonth() + 1).padStart(2, "0") + "-" +
      String(dt.getDate()).padStart(2, "0");
  }
  function mmdd(dt) {
    return String(dt.getMonth() + 1).padStart(2, "0") + "-" + String(dt.getDate()).padStart(2, "0");
  }
  function weeksBetween(a, b) { return Math.round((b - a) / (7 * 86400000)); }
  function ordinal(n) {
    const words = ["Zeroth", "First", "Second", "Third", "Fourth", "Fifth", "Sixth", "Seventh",
      "Eighth", "Ninth", "Tenth", "Eleventh", "Twelfth", "Thirteenth", "Fourteenth", "Fifteenth",
      "Sixteenth", "Seventeenth", "Eighteenth", "Nineteenth", "Twentieth", "Twenty-first",
      "Twenty-second", "Twenty-third", "Twenty-fourth", "Twenty-fifth", "Twenty-sixth",
      "Twenty-seventh", "Twenty-eighth", "Twenty-ninth", "Thirtieth", "Thirty-first",
      "Thirty-second", "Thirty-third", "Thirty-fourth"];
    return words[n] || n + "th";
  }

  // Gregorian Easter (Meeus/Jones/Butcher)
  function easter(year) {
    const a = year % 19, b = Math.floor(year / 100), c = year % 100;
    const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return D(year, month, day);
  }

  // Colors → display hex (for the indicator dot)
  const COLOR_HEX = {
    Green: "#4a8a4f", Violet: "#7a5ba6", White: "#efe9da",
    Red: "#b23b3b", Rose: "#d98aa6", None: "#7a7f88",
  };

  // Curated fixed-date table. rank: solemnity | feast | memorial
  // color omitted ⇒ inherits the season color.
  const FIXED = {
    "01-01": { name: "Mary, Mother of God", rank: "solemnity", color: "White" },
    "01-06": { name: "The Epiphany of the Lord", rank: "solemnity", color: "White" },
    "01-25": { name: "Conversion of St. Paul", rank: "feast", color: "White" },
    "01-28": { name: "St. Thomas Aquinas", rank: "memorial" },
    "02-02": { name: "Presentation of the Lord", rank: "feast", color: "White" },
    "02-22": { name: "Chair of St. Peter", rank: "feast", color: "White" },
    "03-19": { name: "St. Joseph, Spouse of the BVM", rank: "solemnity", color: "White" },
    "03-25": { name: "The Annunciation of the Lord", rank: "solemnity", color: "White" },
    "04-25": { name: "St. Mark, Evangelist", rank: "feast", color: "Red" },
    "04-29": { name: "St. Catherine of Siena", rank: "memorial" },
    "05-01": { name: "St. Joseph the Worker", rank: "memorial" },
    "05-03": { name: "Sts. Philip and James, Apostles", rank: "feast", color: "Red" },
    "05-31": { name: "The Visitation of the BVM", rank: "feast", color: "White" },
    "06-13": { name: "St. Anthony of Padua", rank: "memorial" },
    "06-24": { name: "Nativity of St. John the Baptist", rank: "solemnity", color: "White" },
    "06-29": { name: "Sts. Peter and Paul, Apostles", rank: "solemnity", color: "Red" },
    "07-03": { name: "St. Thomas, Apostle", rank: "feast", color: "Red" },
    "07-11": { name: "St. Benedict, Abbot", rank: "memorial" },
    "07-22": { name: "St. Mary Magdalene", rank: "feast", color: "White" },
    "07-25": { name: "St. James, Apostle", rank: "feast", color: "Red" },
    "07-31": { name: "St. Ignatius of Loyola", rank: "memorial" },
    "08-06": { name: "The Transfiguration of the Lord", rank: "feast", color: "White" },
    "08-10": { name: "St. Lawrence, Deacon & Martyr", rank: "feast", color: "Red" },
    "08-15": { name: "The Assumption of the BVM", rank: "solemnity", color: "White" },
    "08-24": { name: "St. Bartholomew, Apostle", rank: "feast", color: "Red" },
    "08-28": { name: "St. Augustine, Bishop & Doctor", rank: "memorial" },
    "08-29": { name: "The Passion of St. John the Baptist", rank: "memorial", color: "Red" },
    "09-08": { name: "Nativity of the BVM", rank: "feast", color: "White" },
    "09-14": { name: "Exaltation of the Holy Cross", rank: "feast", color: "Red" },
    "09-21": { name: "St. Matthew, Apostle & Evangelist", rank: "feast", color: "Red" },
    "09-29": { name: "Sts. Michael, Gabriel & Raphael", rank: "feast", color: "White" },
    "10-02": { name: "The Holy Guardian Angels", rank: "memorial", color: "White" },
    "10-04": { name: "St. Francis of Assisi", rank: "memorial" },
    "10-07": { name: "Our Lady of the Rosary", rank: "memorial", color: "White" },
    "10-18": { name: "St. Luke, Evangelist", rank: "feast", color: "Red" },
    "10-28": { name: "Sts. Simon and Jude, Apostles", rank: "feast", color: "Red" },
    "11-01": { name: "All Saints", rank: "solemnity", color: "White" },
    "11-02": { name: "All Souls' Day", rank: "feast", color: "Violet" },
    "11-09": { name: "Dedication of the Lateran Basilica", rank: "feast", color: "White" },
    "11-30": { name: "St. Andrew, Apostle", rank: "feast", color: "Red" },
    "12-06": { name: "St. Nicholas, Bishop", rank: "memorial" },
    "12-08": { name: "The Immaculate Conception", rank: "solemnity", color: "White" },
    "12-12": { name: "Our Lady of Guadalupe", rank: "memorial", color: "White" },
    "12-25": { name: "The Nativity of the Lord (Christmas)", rank: "solemnity", color: "White" },
    "12-26": { name: "St. Stephen, First Martyr", rank: "feast", color: "Red" },
    "12-27": { name: "St. John, Apostle & Evangelist", rank: "feast", color: "White" },
    "12-28": { name: "The Holy Innocents", rank: "feast", color: "Red" },
  };

  function computeYear(y) {
    const e = easter(y);
    const ashWed = addDays(e, -46);
    const lent1 = addDays(ashWed, 4);     // first Sunday of Lent
    const palm = addDays(e, -7);
    const holyThu = addDays(e, -3);
    const goodFri = addDays(e, -2);
    const holySat = addDays(e, -1);
    const divineMercy = addDays(e, 7);
    const ascension = addDays(e, 39);
    const pentecost = addDays(e, 49);
    const trinity = addDays(e, 56);
    const corpus = addDays(e, 60);
    const sacredHeart = addDays(e, 68);

    const dec24 = D(y, 12, 24);
    const sun4 = addDays(dec24, -dec24.getDay());   // 4th Sunday of Advent
    const advent1 = addDays(sun4, -21);
    const christKing = addDays(advent1, -7);

    const epiph = D(y, 1, 6);
    const baptism = addDays(epiph, ((7 - epiph.getDay()) % 7) || 7); // Sunday after Jan 6

    const dec25 = D(y, 12, 25);
    const holyFamily = dec25.getDay() === 0 ? D(y, 12, 30)
      : addDays(dec25, ((7 - dec25.getDay()) % 7) || 7);

    const moveable = {};
    const m = (dt, name, rank, color) => (moveable[ymd(dt)] = { name, rank, color });
    m(ashWed, "Ash Wednesday", "feria", "Violet");
    m(palm, "Palm Sunday of the Passion", "sunday", "Red");
    m(holyThu, "Holy Thursday (Lord's Supper)", "solemnity", "White");
    m(goodFri, "Good Friday of the Lord's Passion", "solemnity", "Red");
    m(holySat, "Holy Saturday", "solemnity", "None");
    m(e, "Easter Sunday of the Resurrection", "solemnity", "White");
    m(divineMercy, "Divine Mercy Sunday (2nd of Easter)", "sunday", "White");
    m(ascension, "The Ascension of the Lord", "solemnity", "White");
    m(pentecost, "Pentecost Sunday", "solemnity", "Red");
    m(trinity, "The Most Holy Trinity", "solemnity", "White");
    m(corpus, "The Most Holy Body & Blood of Christ", "solemnity", "White");
    m(sacredHeart, "The Most Sacred Heart of Jesus", "solemnity", "White");
    m(christKing, "Our Lord Jesus Christ, King of the Universe", "solemnity", "White");
    m(baptism, "The Baptism of the Lord", "feast", "White");
    m(holyFamily, "The Holy Family", "feast", "White");

    return {
      e, ashWed, lent1, palm, holyThu, goodFri, holySat, easter: e,
      pentecost, christKing, advent1, baptism, dec24, dec25, moveable,
    };
  }

  function getDay(date) {
    const y = date.getFullYear();
    const C = computeYear(y);
    const k = ymd(date);
    const isSun = date.getDay() === 0;
    const isFri = date.getDay() === 5;

    // ---- season + base color ----
    let season, seasonKey, color, note = "";
    if (k >= ymd(C.advent1) && k <= ymd(C.dec24)) {
      season = "Advent"; seasonKey = "advent"; color = "Violet";
      note = "Prepare the way of the Lord.";
    } else if (k >= ymd(C.dec25) || k <= ymd(C.baptism)) {
      season = "Christmas"; seasonKey = "christmas"; color = "White";
      note = "The Word became flesh.";
    } else if (k >= ymd(C.ashWed) && k < ymd(C.holyThu)) {
      season = "Lent"; seasonKey = "lent"; color = "Violet";
      note = "Prayer, fasting, and almsgiving.";
    } else if (k >= ymd(C.holyThu) && k <= ymd(C.holySat)) {
      season = "Sacred Triduum"; seasonKey = "triduum"; color = "White";
      note = "The Lord's Passion, death, and rest in the tomb.";
    } else if (k >= ymd(C.easter) && k <= ymd(C.pentecost)) {
      season = "Easter"; seasonKey = "easter"; color = "White";
      note = "Christ is risen. Alleluia.";
    } else {
      season = "Ordinary Time"; seasonKey = "ot"; color = "Green";
      note = "Grow in the daily following of Christ.";
    }

    // ---- celebration ----
    let title = null, rank = "feria";
    const mv = C.moveable[k];
    const fx = FIXED[mmdd(date)];

    function applyFixed(f) { title = f.name; rank = f.rank; if (f.color) color = f.color; }

    if (mv) {
      title = mv.name; rank = mv.rank; if (mv.color) color = mv.color;
    } else if (isSun && (seasonKey === "advent" || seasonKey === "lent" || seasonKey === "easter")) {
      if (fx && fx.rank === "solemnity") applyFixed(fx);
      else {
        let start, label, n;
        if (seasonKey === "advent") { start = C.advent1; label = "of Advent"; }
        else if (seasonKey === "lent") { start = C.lent1; label = "of Lent"; }
        else { start = C.easter; label = "of Easter"; }
        n = weeksBetween(start, date) + 1;
        title = `${ordinal(n)} Sunday ${label}`;
        rank = "sunday";
        if ((seasonKey === "advent" && n === 3) || (seasonKey === "lent" && n === 4)) color = "Rose";
      }
    } else if (isSun && seasonKey === "ot") {
      if (fx && (fx.rank === "solemnity" || fx.rank === "feast")) applyFixed(fx);
      else {
        let n;
        if (k < ymd(C.ashWed)) n = weeksBetween(C.baptism, date) + 1;
        else n = 34 - weeksBetween(date, C.christKing);
        title = `${ordinal(n)} Sunday in Ordinary Time`;
        rank = "sunday";
      }
    } else if (isSun && seasonKey === "christmas") {
      if (fx && fx.rank === "solemnity") applyFixed(fx);
      else { title = "The Lord's Day — Christmas Season"; rank = "sunday"; }
    } else if (fx) {
      applyFixed(fx);
    }

    if (!title) {
      const w = { advent: "Advent Weekday", christmas: "Christmas Weekday", lent: "Lenten Weekday",
        triduum: "Sacred Triduum", easter: "Easter Weekday", ot: "Weekday in Ordinary Time" };
      title = w[seasonKey];
    }

    // ---- fast & abstinence ----
    const fast = k === ymd(C.ashWed) || k === ymd(C.goodFri);
    const abstinence = fast || (seasonKey === "lent" && isFri);
    const fridayPenance = isFri && !abstinence;

    return {
      date: k, season, seasonKey, color, colorHex: COLOR_HEX[color] || COLOR_HEX.Green,
      title, rank, note, fast, abstinence, fridayPenance,
    };
  }

  window.Liturgical = { getDay: getDay, easter: easter };
})();
