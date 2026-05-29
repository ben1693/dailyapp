/* ============================================================
 *  Confession companion content
 *  Examination of conscience (Ten Commandments + Precepts),
 *  the rite, and the Act of Contrition.
 *
 *  Items may carry a `states` array to focus them by state in
 *  life. Items with no `states` are universal and always shown.
 *  state keys: single | married | father | work
 * ============================================================ */
window.EXAMEN = [
  {
    n: "I", title: "I am the Lord your God; you shall have no other gods before me.",
    sub: "Faith, hope, love, and the worship due to God alone.",
    items: [
      { id: "c1-1", q: "Have I made God the true center of my life, or have I put money, success, pleasure, or comfort in His place?" },
      { id: "c1-2", q: "Have I neglected daily prayer, or prayed only out of habit without my heart?" },
      { id: "c1-3", q: "Have I doubted or denied the faith, or remained silent when I should have professed it?" },
      { id: "c1-4", q: "Have I dabbled in superstition, horoscopes, the occult, or the New Age?" },
      { id: "c1-5", q: "Have I despaired of God's mercy, or presumed upon it to keep sinning?" },
      { id: "c1-6", q: "Have I led my household in prayer and faith?", states: ["married", "father"] },
    ],
  },
  {
    n: "II", title: "You shall not take the name of the Lord your God in vain.",
    sub: "Reverence for the holy name of God.",
    items: [
      { id: "c2-1", q: "Have I used God's name, or that of Jesus, Mary, or the saints, carelessly, in anger, or as a curse?" },
      { id: "c2-2", q: "Have I spoken irreverently of holy things, or made jokes that mock the faith?" },
      { id: "c2-3", q: "Have I broken a vow or promise made to God?" },
      { id: "c2-4", q: "Have I failed to correct others who blaspheme in my presence?" },
    ],
  },
  {
    n: "III", title: "Remember to keep holy the Lord's Day.",
    sub: "Sunday worship and rest.",
    items: [
      { id: "c3-1", q: "Have I missed Mass on Sunday or a holy day through my own fault?" },
      { id: "c3-2", q: "Have I arrived late, left early, or been deliberately distracted at Mass?" },
      { id: "c3-3", q: "Have I done or required unnecessary servile work on Sunday?" },
      { id: "c3-4", q: "Have I failed to make Sunday a day of rest, family, and the Lord?" },
      { id: "c3-5", q: "Have I demanded work of others that kept them from worship?", states: ["work"] },
    ],
  },
  {
    n: "IV", title: "Honor your father and your mother.",
    sub: "Family, authority, and the duties of one's state.",
    items: [
      { id: "c4-1", q: "Have I shown disrespect, neglect, or ingratitude toward my parents or elders?" },
      { id: "c4-2", q: "Have I disobeyed or dishonored lawful authority?" },
      { id: "c4-3", q: "Have I cared for aging parents or family members in need?" },
      { id: "c4-4", q: "Have I been impatient, harsh, or absent as a husband — failing to love my wife as Christ loves the Church?", states: ["married"] },
      { id: "c4-5", q: "Have I neglected the religious formation, discipline, or time owed to my children?", states: ["father"] },
      { id: "c4-6", q: "Have I been a poor example to those who look up to me?", states: ["father", "married"] },
      { id: "c4-7", q: "Have I dishonored my parents by rebellion or by hiding how I live?", states: ["single"] },
    ],
  },
  {
    n: "V", title: "You shall not kill.",
    sub: "Reverence for life, soul and body — yours and others'.",
    items: [
      { id: "c5-1", q: "Have I harbored anger, hatred, or a desire for revenge? Have I refused to forgive?" },
      { id: "c5-2", q: "Have I harmed others by word or deed, or wished them harm?" },
      { id: "c5-3", q: "Have I led others into sin by my example, words, or scandal?" },
      { id: "c5-4", q: "Have I abused alcohol or drugs, or neglected my health and the care of my body?" },
      { id: "c5-5", q: "Have I been reckless or endangered others' lives?" },
      { id: "c5-6", q: "Have I cooperated in, supported, or stayed silent about abortion or other attacks on life?" },
      { id: "c5-7", q: "Have I nursed bitterness within my family instead of seeking peace?", states: ["married", "father"] },
    ],
  },
  {
    n: "VI", title: "You shall not commit adultery.",
    sub: "Chastity and the dignity of the body. Examine honestly, in God's mercy.",
    items: [
      { id: "c6-1", q: "Have I been unfaithful to my wife in act, word, or thought?", states: ["married"] },
      { id: "c6-2", q: "Have I viewed pornography or sought out impure images or videos?" },
      { id: "c6-3", q: "Have I committed impure acts alone or with others?" },
      { id: "c6-4", q: "Have I failed to guard my eyes, or fed lust through media and conversation?" },
      { id: "c6-5", q: "Have I treated others as objects rather than as persons made in God's image?" },
      { id: "c6-6", q: "Have I been immodest, or led others toward impurity?" },
      { id: "c6-7", q: "Have I pursued purity in dating with respect for the other person?", states: ["single"] },
    ],
  },
  {
    n: "VII", title: "You shall not steal.",
    sub: "Justice, honesty, and the right use of goods.",
    items: [
      { id: "c7-1", q: "Have I stolen, cheated, or kept what is not mine?" },
      { id: "c7-2", q: "Have I been honest in my work, my taxes, and my debts?" },
      { id: "c7-3", q: "Have I given a fair day's work, or wasted time and resources owed to my employer?", states: ["work"] },
      { id: "c7-4", q: "Have I been greedy or attached to possessions? Have I neglected the poor?" },
      { id: "c7-5", q: "Have I failed to provide responsibly for my family?", states: ["married", "father"] },
      { id: "c7-6", q: "Have I damaged others' property or failed to make restitution?" },
    ],
  },
  {
    n: "VIII", title: "You shall not bear false witness against your neighbor.",
    sub: "Truth, reputation, and the tongue.",
    items: [
      { id: "c8-1", q: "Have I lied, exaggerated, or deceived?" },
      { id: "c8-2", q: "Have I gossiped, or harmed someone's reputation by detraction or calumny?" },
      { id: "c8-3", q: "Have I revealed secrets I was bound to keep?" },
      { id: "c8-4", q: "Have I failed to defend the good name of others?" },
      { id: "c8-5", q: "Have I refused to admit fault, or shifted blame onto others?" },
    ],
  },
  {
    n: "IX", title: "You shall not covet your neighbor's wife.",
    sub: "Purity of heart and custody of the eyes.",
    items: [
      { id: "c9-1", q: "Have I entertained lustful thoughts or fantasies?" },
      { id: "c9-2", q: "Have I desired someone who is not mine, or longed for what is forbidden?" },
      { id: "c9-3", q: "Have I placed myself in situations that endanger my purity?" },
      { id: "c9-4", q: "Have I cherished my wife's heart, or compared her unfavorably to others?", states: ["married"] },
    ],
  },
  {
    n: "X", title: "You shall not covet your neighbor's goods.",
    sub: "Contentment against envy and greed.",
    items: [
      { id: "c10-1", q: "Have I been envious of others' success, talents, or possessions?" },
      { id: "c10-2", q: "Have I been greedy, or measured my worth by what I own?" },
      { id: "c10-3", q: "Have I been ungrateful for the gifts God has given me?" },
      { id: "c10-4", q: "Have I let ambition crowd out God and family?" },
    ],
  },
  {
    n: "✦", title: "The Precepts of the Church",
    sub: "The minimum duties of a practicing Catholic.",
    items: [
      { id: "p-1", q: "Have I attended Mass on all Sundays and holy days of obligation?" },
      { id: "p-2", q: "Have I confessed my serious sins at least once a year?" },
      { id: "p-3", q: "Have I received Holy Communion at least during the Easter season?" },
      { id: "p-4", q: "Have I observed the days of fasting and abstinence?" },
      { id: "p-5", q: "Have I helped to provide for the material needs of the Church?" },
    ],
  },
];

window.EXAMEN_STATES = [
  { key: "all", label: "General examination" },
  { key: "single", label: "Single / unmarried" },
  { key: "married", label: "Married man" },
  { key: "father", label: "Father / parent" },
  { key: "work", label: "In the workplace" },
];

/* Steps of the rite. {SINCE} is replaced with the personalized line. */
window.CONFESSION_STEPS = [
  "Prepare: ask the Holy Spirit for light, then prayerfully examine your conscience.",
  "Be sorry: make an act of contrition in your heart, resolving to avoid sin and its occasions.",
  "Greet the priest: make the Sign of the Cross and say — “Bless me, Father, for I have sinned. {SINCE}”",
  "Confess your sins simply and honestly, telling any grave sins in kind and number. Do not excuse or explain away.",
  "Listen to the priest's counsel and accept the penance he gives.",
  "Pray the Act of Contrition when he asks.",
  "Receive absolution — as the priest speaks the words, your sins are forgiven by Christ.",
  "Give thanks to God, and complete your penance soon after.",
];

window.ACT_OF_CONTRITION =
  "O my God, I am heartily sorry for having offended Thee, and I detest all my sins because of Thy just punishments, but most of all because they offend Thee, my God, who art all good and deserving of all my love. I firmly resolve, with the help of Thy grace, to sin no more and to avoid the near occasions of sin. Amen.";
