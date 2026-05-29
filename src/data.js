/* Default Catholic prayer library.
 * Each entry: { key, title, text, timeOfDay, points, defaultActive }
 * `key` is a stable identifier so seeded prayers survive re-seeding and merges.
 */
window.DEFAULT_PRAYERS = [
  // ---------------- MORNING ----------------
  {
    key: "morning-offering",
    title: "Morning Offering",
    timeOfDay: "morning",
    points: 1,
    defaultActive: true,
    text:
      "O Jesus, through the Immaculate Heart of Mary, I offer You my prayers, works, joys, and sufferings of this day, in union with the Holy Sacrifice of the Mass throughout the world. I offer them for all the intentions of Your Sacred Heart: the salvation of souls, reparation for sin, and the reunion of all Christians. Amen.",
  },
  {
    key: "sign-of-the-cross",
    title: "Sign of the Cross",
    timeOfDay: "morning",
    points: 1,
    defaultActive: true,
    text: "In the name of the Father, and of the Son, and of the Holy Spirit. Amen.",
  },
  {
    key: "our-father",
    title: "Our Father",
    timeOfDay: "morning",
    points: 1,
    defaultActive: true,
    text:
      "Our Father, who art in heaven, hallowed be Thy name; Thy kingdom come; Thy will be done on earth as it is in heaven. Give us this day our daily bread; and forgive us our trespasses as we forgive those who trespass against us; and lead us not into temptation, but deliver us from evil. Amen.",
  },
  {
    key: "hail-mary",
    title: "Hail Mary",
    timeOfDay: "morning",
    points: 1,
    defaultActive: true,
    text:
      "Hail Mary, full of grace, the Lord is with thee. Blessed art thou amongst women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.",
  },
  {
    key: "glory-be",
    title: "Glory Be",
    timeOfDay: "morning",
    points: 1,
    defaultActive: true,
    text:
      "Glory be to the Father, and to the Son, and to the Holy Spirit. As it was in the beginning, is now, and ever shall be, world without end. Amen.",
  },
  {
    key: "apostles-creed",
    title: "Apostles' Creed",
    timeOfDay: "morning",
    points: 2,
    defaultActive: false,
    text:
      "I believe in God, the Father Almighty, Creator of heaven and earth; and in Jesus Christ, His only Son, our Lord; who was conceived by the Holy Spirit, born of the Virgin Mary, suffered under Pontius Pilate, was crucified, died, and was buried. He descended into hell; on the third day He rose again from the dead; He ascended into heaven, is seated at the right hand of God the Father Almighty; from there He will come to judge the living and the dead. I believe in the Holy Spirit, the holy catholic Church, the communion of saints, the forgiveness of sins, the resurrection of the body, and life everlasting. Amen.",
  },

  // ---------------- AFTERNOON ----------------
  {
    key: "angelus",
    title: "The Angelus",
    timeOfDay: "afternoon",
    points: 2,
    defaultActive: true,
    text:
      "V. The Angel of the Lord declared unto Mary,\nR. And she conceived of the Holy Spirit. (Hail Mary)\n\nV. Behold the handmaid of the Lord,\nR. Be it done unto me according to thy word. (Hail Mary)\n\nV. And the Word was made flesh,\nR. And dwelt among us. (Hail Mary)\n\nV. Pray for us, O holy Mother of God,\nR. That we may be made worthy of the promises of Christ.\n\nLet us pray. Pour forth, we beseech Thee, O Lord, Thy grace into our hearts; that we, to whom the Incarnation of Christ Thy Son was made known by the message of an angel, may by His Passion and Cross be brought to the glory of His Resurrection. Through the same Christ our Lord. Amen.",
  },
  {
    key: "divine-mercy",
    title: "Divine Mercy (3 o'clock prayer)",
    timeOfDay: "afternoon",
    points: 1,
    defaultActive: true,
    text:
      "You expired, Jesus, but the source of life gushed forth for souls, and the ocean of mercy opened up for the whole world. O Fount of Life, unfathomable Divine Mercy, envelop the whole world and empty Yourself out upon us. O Blood and Water, which gushed forth from the Heart of Jesus as a fount of mercy for us, I trust in You.",
  },
  {
    key: "decade-rosary",
    title: "A Decade of the Rosary",
    timeOfDay: "afternoon",
    points: 3,
    defaultActive: false,
    text:
      "Announce the mystery. Pray one Our Father, ten Hail Marys, and one Glory Be, meditating on the life of Christ. Close with the Fatima Prayer:\n\nO my Jesus, forgive us our sins, save us from the fires of hell, lead all souls to Heaven, especially those in most need of Thy mercy. Amen.",
  },

  // ---------------- EVENING ----------------
  {
    key: "examination",
    title: "Examination of Conscience",
    timeOfDay: "evening",
    points: 2,
    defaultActive: true,
    text:
      "Place yourself in the presence of God and give thanks for the day. Ask the Holy Spirit for light to see clearly. Review the hours that have passed: where did you respond to grace, and where did you fall short? Where was God present, and did you notice Him? Resolve, with His help, to do better tomorrow.",
  },
  {
    key: "act-of-contrition",
    title: "Act of Contrition",
    timeOfDay: "evening",
    points: 1,
    defaultActive: true,
    text:
      "O my God, I am heartily sorry for having offended Thee, and I detest all my sins because of Thy just punishments, but most of all because they offend Thee, my God, who art all good and deserving of all my love. I firmly resolve, with the help of Thy grace, to sin no more and to avoid the near occasions of sin. Amen.",
  },
  {
    key: "st-michael",
    title: "Prayer to St. Michael",
    timeOfDay: "evening",
    points: 1,
    defaultActive: true,
    text:
      "St. Michael the Archangel, defend us in battle. Be our protection against the wickedness and snares of the devil. May God rebuke him, we humbly pray; and do thou, O Prince of the heavenly host, by the power of God, cast into hell Satan and all the evil spirits who prowl about the world seeking the ruin of souls. Amen.",
  },
  {
    key: "guardian-angel",
    title: "Guardian Angel Prayer",
    timeOfDay: "evening",
    points: 1,
    defaultActive: false,
    text:
      "Angel of God, my guardian dear, to whom God's love commits me here, ever this day be at my side, to light and guard, to rule and guide. Amen.",
  },
  {
    key: "act-of-faith",
    title: "Act of Faith",
    timeOfDay: "evening",
    points: 1,
    defaultActive: false,
    text:
      "O my God, I firmly believe that Thou art one God in three Divine Persons, Father, Son, and Holy Spirit. I believe that Thy Divine Son became man and died for our sins, and that He will come to judge the living and the dead. I believe these and all the truths which the Holy Catholic Church teaches, because Thou hast revealed them, who canst neither deceive nor be deceived. Amen.",
  },
];

/* A couple of starter tasks to show how the to-do section works. */
window.DEFAULT_TODOS = [
  { key: "read-scripture", title: "Read Scripture (10 min)", points: 2, defaultActive: true },
  { key: "examine-charity", title: "One act of charity", points: 2, defaultActive: true },
  { key: "exercise", title: "Exercise / train the body", points: 1, defaultActive: false },
];
