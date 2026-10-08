// English text. Every other language file has exactly this shape (checked by the tests).
//
// For translators:
// - Text in {braces} is filled in by the app. Keep each {placeholder} exactly as it is.
// - "Soroban", "anzan", "Flash Anzan", "Kyu" and "Dan" are Japanese terms used in every language.
// - Penko is the penguin teacher. He's warm, encouraging and brief.
// - Numbers are never spelled out, so sentences don't need plural forms.

export const en = {
  appName: 'Penko Soroban',
  tagline: 'Learn the abacus. Master mental math.',

  nav: {
    learn: 'Learn',
    practice: 'Practice',
    mental: 'Mental math',
    exams: 'Exams',
    progress: 'Progress',
    settings: 'Settings',
    main: 'Main',
    back: 'Back',
  },

  common: {
    continue: 'Continue',
    check: 'Check',
    start: 'Start',
    again: 'Try again',
    next: 'Next',
    done: 'Done',
    skip: 'Skip',
    close: 'Close',
    answer: 'Your answer',
    correct: 'Correct!',
    wrong: 'Not quite. The answer is {answer}.',
    of: '{n} of {total}',
    hint: 'Show me',
    undo: 'Undo',
    restart: 'Start again',
    delete: 'Delete',
    minutes: '{m} min',
    seconds: '{s} s',
    ready: 'Get ready…',
    remainder: 'remainder {r}',
  },

  places: ['ones', 'tens', 'hundreds', 'thousands', 'ten-thousands', 'hundred-thousands', 'millions', 'ten-millions'],

  abacus: {
    label: 'Soroban',
    rod: 'Rod {n}: {value}',
    rodHelp: 'Up and down arrows move the earth beads, H moves the heaven bead, left and right arrows change rod.',
    value: 'Value',
    clear: 'Clear',
    unitRod: 'Ones rod',
    showValues: 'Show rod values',
  },

  home: {
    greeting: 'Welcome to the dojo',
    intro: 'A soroban is a Japanese abacus. Learn to calculate with it step by step, then picture it in your head and calculate without it: that is mental math, or anzan.',
    start: 'Start the first lesson',
    continue: 'Continue: {lesson}',
    welcomeBack: 'Welcome back',
    allDone: 'You have finished the whole course. Keep your skills sharp with practice, mental math and exams.',
  },

  units: {
    meet: { title: 'Meet the soroban', blurb: 'Heaven and earth beads, setting and reading numbers.' },
    direct: { title: 'Direct moves', blurb: 'Add and subtract when the beads you need are free.' },
    five: { title: 'Small friends', blurb: 'Pairs that make 5, for when the earth beads run out.' },
    ten: { title: 'Big friends', blurb: 'Pairs that make 10, for carrying and borrowing.' },
    mixed: { title: 'Both friends at once', blurb: 'Big friends that need a small friend to finish.' },
    multi: { title: 'Bigger numbers', blurb: 'Several digits, long carries and lists of numbers.' },
    multiply: { title: 'Multiplication', blurb: 'Times tables on the rods, then longer numbers.' },
    divide: { title: 'Division', blurb: 'Sharing out, one digit of the answer at a time.' },
    anzan: { title: 'The soroban in your head', blurb: 'Picture the beads and calculate without the abacus.' },
  },

  course: {
    title: 'Your course',
    unit: 'Unit {n}',
    lessons: 'Lessons',
    lessonDone: 'Done',
    lessonNext: 'Up next',
    progress: '{done} of {total} lessons done',
  },

  lesson: {
    step: 'Step {n} of {total}',
    exit: 'Leave lesson',
    completeTitle: 'Lesson complete!',
    completeBody: 'Penko stamps your card.',
    nextLesson: 'Next lesson',
    backToUnit: 'Back to the unit',
    again: 'Do it again',
  },

  // Lesson activities
  activity: {
    set: 'Show {n} on the soroban.',
    setWrong: 'Not yet: compare each rod with the number.',
    setRandom: 'Show each number on the soroban.',
    read: 'What number is on the soroban?',
    guided: 'Work out {problem}. Follow the glowing beads.',
    guidedDone: 'That makes {answer}.',
    practice: 'Work it out on the soroban, one number at a time.',
    practiceTotal: 'Total so far',
    offTrackGuided: 'That isn\'t the move Penko meant. Undo it, or start this step again.',
    offTrack: 'The soroban has gone off course. Undo the last move, or set it back to {n}.',
    setBack: 'Set it back to {n}',
    problem: 'Problem {n} of {total}',
    quizFive: 'Which number makes 5 with {n}?',
    quizTen: 'Which number makes 10 with {n}?',
    quizTable: '{a} × {b} = ?',
    beadFlash: 'Watch closely: the soroban appears for a moment. What number did it show?',
    beadFlashShow: 'Show the soroban',
    mental: 'Work it out in your head, then type the answer.',
    peek: 'Peek at the soroban',
    flash: 'Numbers will flash one at a time. Add them in your head, then type the total.',
    flashRound: 'Round {n} of {total}',
    flashNumbers: 'The numbers were {numbers}.',
  },

  // What Penko says during guided moves. {d}: the digit, {place}: ones/tens/..., {c}: its friend
  guide: {
    addDirect: 'Add {d} on the {place} rod. The beads are free, so push them straight to the beam.',
    addFive: 'Add {d} on the {place} rod. It won\'t fit on the earth beads, so use its small friend: add 5, then take away {c}.',
    addTen: 'Add {d} on the {place} rod. There\'s no room, so use its big friend: take away {c}, then add 1 on the rod to the left.',
    addTenFive: 'Add {d} on the {place} rod with its big friend: take away {c}. That needs a small friend too: add {c5}, take away 5. Then add 1 on the rod to the left.',
    subDirect: 'Take away {d} on the {place} rod. Just move those beads away from the beam.',
    subFive: 'Take away {d} on the {place} rod. There aren\'t enough earth beads, so use its small friend: add {c}, then take away 5.',
    subTen: 'Take away {d} on the {place} rod. There isn\'t enough here, so borrow: take 1 from the rod to the left, then add the big friend, {c}.',
    subTenFive: 'Take away {d} on the {place} rod: take 1 from the rod to the left, then add the big friend, {c}, with its small friend: add 5, take away {c5}.',
    chain: 'The rod on the left needs a friend too. Keep following the glowing beads.',
  },

  mul: {
    prompt: 'Work out {a} × {b} on the soroban.',
    step: '{x} × {y} = {p}. Add {p} so that its last digit lands on the {place} rod.',
    done: '{a} × {b} = {answer}',
  },

  div: {
    prompt: 'Work out {a} ÷ {b}. The soroban holds what is left to share out.',
    ask: 'How many times does {b} go into {part}?',
    tooBig: '{b} × {q} = {p}. That\'s more than {part}.',
    tooSmall: '{b} × {q} = {p}. There\'s room for more.',
    zero: '{b} doesn\'t go into {part}, so this digit of the answer is 0.',
    take: 'Take away {q} × {b} = {p}, so that its last digit comes off the {place} rod.',
    done: '{a} ÷ {b} = {answer}',
    quotient: 'Answer so far',
  },

  // Penko's lessons. Each key is one thing he says.
  lessons: {
    'meet-beads': {
      title: 'Heaven and earth',
      intro: 'This is a soroban. Each upright rod shows one digit, and the bar across the middle is called the beam.',
      heaven: 'The bead above the beam is the heaven bead. When it touches the beam, it is worth 5.',
      earth: 'The four beads below the beam are earth beads. Each one pushed up to the beam is worth 1.',
      count: 'Only beads touching the beam count. This rod shows 7: the heaven bead is 5, and two earth beads make 2.',
      setEarth: 'Your turn. Show {n}: push earth beads up to the beam.',
      setHeaven: 'Now show {n}: the heaven bead is 5, then add earth beads for the rest.',
      fingers: 'A tip from real soroban classes: push earth beads up with your thumb. Use your index finger for everything else: the heaven bead, and pulling earth beads down.',
    },
    'meet-places': {
      title: 'Bigger numbers',
      places: 'Each rod is a place, just like in a written number: ones on the right, then tens, then hundreds. This soroban shows 352.',
      dots: 'See the dots on the beam? They mark every third rod, like the commas in 1,000,000, so big numbers are easy to place.',
    },
    'meet-read': {
      title: 'Reading the beads',
      intro: 'Reading is the other half. Read each rod from left to right, just like a written number. This one shows 68.',
    },
    'direct-earth': {
      title: 'Adding with earth beads',
      intro: 'When the beads you need are free, just push them in. That\'s called a direct move. Let\'s try some.',
    },
    'direct-heaven': {
      title: 'Adding 5 and more',
      intro: 'To add 5, bring the heaven bead down to the beam. To add 6, 7, 8 or 9, bring it down and push up the extra earth beads at the same time, in one pinch.',
    },
    'direct-sub': {
      title: 'Taking away',
      intro: 'Subtracting is the same moves the other way: pull earth beads down, or push the heaven bead back up.',
    },
    'direct-two': {
      title: 'Two-digit numbers',
      intro: 'With bigger numbers, start with the highest place and work to the right: tens first, then ones. That\'s how the soroban is used in Japan, and it prepares you for mental math.',
    },
    'five-meet': {
      title: 'Meet the small friends',
      problem: 'Try adding 1 to 4. All four earth beads are already up: there\'s nothing left to push! This is where small friends help.',
      friends: 'Small friends are pairs that make 5: 1 and 4, 2 and 3. When a number won\'t fit, add 5 and take away its small friend. 4 + 1: add 5, take away 4.',
    },
    'five-add': {
      title: 'Adding with small friends',
      intro: 'Let\'s use small friends to add. Penko will light up each move: add 5 first, then take away the friend.',
    },
    'five-sub': {
      title: 'Taking away with small friends',
      intro: 'Now 5 − 1. There are no earth beads to pull down! Do the opposite: add the small friend, then take away 5. 5 − 1: add 4, take away 5.',
    },
    'five-practice': {
      title: 'Small friends practice',
      intro: 'Mix it all up. Use a small friend whenever the earth beads run out.',
    },
    'ten-meet': {
      title: 'Meet the big friends',
      problem: 'Try 7 + 5. There\'s no room on this rod at all. Time for the big friends!',
      friends: 'Big friends are pairs that make 10: 1 and 9, 2 and 8, 3 and 7, 4 and 6, 5 and 5. When a number won\'t fit, take away its big friend, then add 1 on the rod to the left. That 1 is worth 10 there.',
    },
    'ten-add': {
      title: 'Adding with big friends',
      intro: '7 + 5: the big friend of 5 is 5. Take away 5 here, then add 1 on the tens rod. That gives 12.',
    },
    'ten-sub': {
      title: 'Taking away with big friends',
      intro: '12 − 5: there aren\'t enough beads on the ones rod. Borrow: take 1 from the tens rod, then add the big friend of 5, which is 5. That gives 7.',
    },
    'ten-practice': {
      title: 'Big friends practice',
      intro: 'Now all the moves you know, mixed together. Look at each rod and choose: direct, small friend or big friend.',
    },
    'mixed-add': {
      title: 'Adding with both friends',
      intro: '5 + 6: the big friend of 6 is 4, but you can\'t take 4 away from 5 directly. Take it away with a small friend (add 1, take away 5), then add 1 on the left.',
    },
    'mixed-sub': {
      title: 'Taking away with both friends',
      intro: '11 − 6: borrow 1 from the tens, then add the big friend of 6, which is 4. But 4 won\'t fit on the ones rod, so use a small friend: add 5, take away 1.',
    },
    'mixed-practice': {
      title: 'Every move together',
      intro: 'You now know every move for adding and subtracting. Let\'s put them all to work.',
    },
    'multi-carry': {
      title: 'Long carries',
      intro: 'When a carry lands on a 9, it carries again. 99 + 1 clears both nines and adds 1 on the hundreds rod.',
    },
    'multi-lists': {
      title: 'Adding lists',
      intro: 'This is how soroban students train: a column of numbers to add and subtract. Work through it one number at a time, without clearing the soroban.',
    },
    'multi-big': {
      title: 'Big numbers',
      intro: 'Three and four digits: the same moves, just more rods. Start from the left, rod by rod.',
    },
    'mul-tables': {
      title: 'Times tables warm-up',
      intro: 'Soroban multiplication uses the times tables you know, one pair of digits at a time. Let\'s warm up.',
    },
    'mul-one': {
      title: 'Multiplying by one digit',
      intro: 'To work out 34 × 6, multiply each digit of 34 by 6, starting from the left, and add each answer on the soroban.',
      places: 'Where does each answer go? 3 is in the tens, so 3 × 6 = 18 ends on the tens rod. 4 is in the ones, so 4 × 6 = 24 ends on the ones rod. Penko will show you each time.',
    },
    'mul-two': {
      title: 'Two-digit multipliers',
      intro: 'With a two-digit number like 14, do the tens digit first, then the ones digit. Each pair of digits adds its answer to the soroban, just like before.',
    },
    'div-one': {
      title: 'Dividing by one digit',
      intro: 'Division is multiplication in reverse: you take away. Put the number on the soroban and share it out, one digit of the answer at a time.',
      steps: '84 ÷ 4: how many times does 4 go into 8? 2 times. Take away 2 × 4 = 8 from the tens. Then 4 goes into 4 once: take away 4 from the ones. Nothing is left, so the answer is 21.',
    },
    'div-remainder': {
      title: 'Remainders',
      intro: 'Sometimes it doesn\'t share out evenly. Whatever is left on the soroban at the end is the remainder.',
    },
    'div-two': {
      title: 'Dividing by two digits',
      intro: 'With a two-digit divisor, estimate each digit of the answer from the first digits, then check. If you take away too much, try one less.',
    },
    'anzan-picture': {
      title: 'Picture the beads',
      intro: 'Mental math, or anzan, means moving imaginary beads in your head. First, train your eye: the soroban will appear for a moment, then disappear.',
    },
    'anzan-beads': {
      title: 'Beads in your head',
      intro: 'Now calculate without touching anything. Picture the soroban and move the beads in your mind, exactly as your fingers would.',
    },
    'anzan-flash': {
      title: 'Flash Anzan',
      intro: 'In Flash Anzan, numbers flash on the screen one at a time. Add each one to the soroban in your head as it appears.',
    },
    'anzan-graduate': {
      title: 'Graduation',
      intro: 'One last test of everything: two-digit numbers, in your head.',
      next: 'You have learned the whole soroban! Keep training in Mental math, and take the exams to earn your Kyu and Dan certificates.',
    },
  },

  free: {
    title: 'Free abacus',
    intro: 'Tap a bead to move it, just like flicking a real one. Beads touching the beam count.',
    rods: 'Rods',
  },

  practice: {
    title: 'Practice',
    intro: 'Choose what to train. Each session is short; little and often works best.',
    drillTitle: 'Abacus drills',
    drillBlurb: 'Number lists on the soroban, with the moves you choose.',
    mentalTitle: 'Mental drills',
    mentalBlurb: 'The same lists, in your head.',
    mulTitle: 'Multiplication',
    mulBlurb: 'On the soroban, one digit pair at a time.',
    divTitle: 'Division',
    divBlurb: 'Share it out on the soroban.',
    tablesTitle: 'Times tables',
    tablesBlurb: 'Quick-fire facts, against the clock.',
    friendsTitle: 'Friends quiz',
    friendsBlurb: 'Small and big friends, until they\'re automatic.',
    freeTitle: 'Free abacus',
    freeBlurb: 'Play with the beads. Nothing is scored.',
    setup: 'Set up your session',
    technique: 'Moves',
    techniques: {
      direct: 'Direct only',
      five: 'Small friends',
      ten: 'Big friends',
      all: 'Everything',
    },
    ops: 'Operations',
    opsAdd: 'Add',
    opsSub: 'Subtract',
    opsBoth: 'Both',
    digits: 'Digits',
    numbers: 'Numbers per problem',
    problems: 'Problems',
    factors: 'Size',
    remainders: 'Include remainders',
    resultTitle: 'Session complete',
    score: '{correct} of {total} correct',
    time: 'Time: {time}',
  },

  mental: {
    title: 'Mental math',
    intro: 'Calculate on the soroban in your head. Start slowly: accuracy first, then speed.',
    flashTitle: 'Flash Anzan',
    flashBlurb: 'Numbers flash one by one. Add them up in your head.',
    pictureTitle: 'Picture the soroban',
    pictureBlurb: 'A soroban flashes for a moment. Read it from memory.',
    drillsTitle: 'Mental drills',
    drillsBlurb: 'Number lists, no abacus.',
    digits: 'Digits',
    numbers: 'Numbers',
    speed: 'Seconds per number',
    rounds: 'Rounds',
    beep: 'Beep with each number',
    presets: 'Quick start',
    presetNames: ['Gentle', 'Steady', 'Quick', 'Lightning'],
  },

  exams: {
    title: 'Exams',
    intro: 'Earn your grades the way soroban students do in Japan, from 10 Kyu up to 5 Dan. Each exam has three parts: problems on the soroban, mental math and Flash Anzan.',
    note: 'These exams follow the style of Japanese soroban grading. They track your own progress; they aren\'t an official qualification.',
    kyu: '{n} Kyu',
    dan: '{n} Dan',
    passed: 'Passed',
    recommended: 'Recommended next',
    start: 'Take the exam',
    sections: {
      abacus: 'On the soroban',
      mental: 'Mental math',
      flash: 'Flash Anzan',
    },
    sectionIntro: 'Part {n} of 3: {name}',
    timeLeft: 'Time left: {time}',
    timeUp: 'Time is up for this part.',
    submit: 'Submit answer',
    scratch: 'Use the soroban to work it out, then type your answer.',
    passTitle: 'Passed!',
    passBody: 'Congratulations: you are now {grade}.',
    failTitle: 'Not this time',
    failBody: 'You need 80% overall and at least 60% in each part. Practise and try again.',
    sectionScore: '{name}: {correct} of {total}',
    certificate: 'Certificate',
    certifies: 'This certifies that you passed',
    pass: '80% to pass',
    contents: '{abacus} soroban, {mental} mental, {flash} Flash Anzan',
  },

  progress: {
    title: 'Progress',
    stampCard: 'Stamp card',
    stampCardBody: 'Every finished lesson earns a stamp.',
    certificates: 'Certificates',
    noCertificates: 'Pass an exam to earn your first certificate.',
    backup: 'Backup',
    backupBody: 'Your progress is saved in this browser only. Download a backup to keep it safe or move it to another device.',
    export: 'Download backup',
    import: 'Restore from backup',
    imported: 'Progress restored.',
    importFailed: 'That file isn\'t a Penko Soroban backup.',
    reset: 'Reset all progress',
    resetConfirm: 'Delete all your lessons, stamps, bests and certificates? This can\'t be undone.',
  },

  settings: {
    title: 'Settings',
    theme: 'Theme',
    themeSystem: 'Match my device',
    themeLight: 'Washi (light)',
    themeDark: 'Lacquer (dark)',
    language: 'Language',
    languageAuto: 'Match my device',
    sound: 'Sounds',
    rodValues: 'Show the value under each rod',
    about: 'About',
    aboutBody: 'Penko Soroban is free and open source (GPL-3.0). No account, no ads, no tracking: everything stays on your device.',
    source: 'Source code',
    plaza: 'More free apps on Penko Plaza',
  },
};

export type Strings = typeof en;
