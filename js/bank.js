// Comment bank for Economics (see bank-cs.js for Computer Science).
// Structure: BANK[tier] where tier is 'A', 'B', or 'C'.
// Each tier has: s1 (opening), s2_academic, s2_effort, s2_behaviour, s3 (close), s4 (padding).
// Placeholders: [FULL_NAME], [SHORT_NAME], [THEIR], [THEM], [THEY]
// To add a subject: create a bank file, register it in BANKS (state.js) and add it to SUBJECT_BANKS.

const BANK = {
  A: {
    s1:[
      "[FULL_NAME] has delivered an outstanding performance in Economics this term.",
      "[FULL_NAME] has excelled this term, demonstrating exceptional analytical ability in Economics.",
      "[FULL_NAME] has produced exemplary work in Economics throughout this term.",
      "[FULL_NAME] consistently demonstrates brilliant insight into economic theory and practice.",
      "[FULL_NAME] has been a standout student, achieving an excellent standard across all units."
    ],
    s2_academic:[
      "[SHORT_NAME] should refine essay structure to fully maximise marks on extended response questions.",
      "[SHORT_NAME] can improve further by strengthening critical evaluation skills in exam responses.",
      "[SHORT_NAME] would benefit from linking economic models more explicitly to real-world case studies.",
      "[SHORT_NAME] should aim for greater precision with technical definitions under exam pressure.",
      "[SHORT_NAME] is encouraged to explore alternative economic perspectives more thoroughly in answers."
    ],
    s2_effort:[
      "[SHORT_NAME] should ensure that strong classroom performance is matched by equally diligent independent study.",
      "[SHORT_NAME] would reach an even higher standard by investing more time in self-directed revision.",
      "[SHORT_NAME] is encouraged to push further through independent reading and regular exam practice.",
      "[SHORT_NAME] must ensure that effort outside the classroom matches the quality shown in assessments.",
      "[SHORT_NAME] can unlock [THEIR] full potential by committing more consistently to independent study."
    ],
    s2_behaviour:[
      "[SHORT_NAME] should sustain their high standard of conduct and remain fully focused in all lessons.",
      "[SHORT_NAME] is encouraged to channel energy productively and remain consistently engaged in class.",
      "[SHORT_NAME] should maintain focus and avoid distractions to ensure their excellent ability is realised.",
      "[SHORT_NAME] must ensure classroom conduct consistently matches their impressive academic ability.",
      "[SHORT_NAME] is reminded to maintain a professional and focused approach during all learning activities."
    ],
    s3:[
      "A superb term — with this dedication, a top final grade is firmly within reach.",
      "With this level of commitment, [SHORT_NAME] is on track for an outstanding final result.",
      "This exceptional standard sets a strong platform for continued success in final exams.",
      "I look forward to seeing [SHORT_NAME] carry this momentum into the final examinations.",
      "An outstanding effort — [SHORT_NAME] should feel very proud of this achievement."
    ],
    s4:[
      "This has been a truly superb term for [SHORT_NAME].",
      "I am very proud of [SHORT_NAME]'s commitment and achievements this term.",
      "[SHORT_NAME] should feel very proud of what has been achieved this term.",
      "This outstanding effort reflects exactly the right attitude towards learning."
    ]
  },
  B: {
    s1:[
      "[FULL_NAME] has shown solid progress in Economics and a good grasp of core concepts.",
      "[FULL_NAME] has worked consistently well this term, achieving a sound standard throughout.",
      "[FULL_NAME] demonstrates a reliable understanding of key economic principles and models.",
      "[FULL_NAME] has made good progress and engages positively with economic topics this term.",
      "[FULL_NAME] shows a competent understanding of demand, supply, and market mechanisms."
    ],
    s2_academic:[
      "[SHORT_NAME] should focus on linking cause-and-effect chains more clearly in exam answers.",
      "[SHORT_NAME] needs to improve accuracy when drawing and interpreting economic diagrams.",
      "[SHORT_NAME] would benefit from using economic terminology with greater consistency in answers.",
      "[SHORT_NAME] must manage exam time more carefully, especially during extended response questions.",
      "[SHORT_NAME] is encouraged to take a more analytical approach rather than a descriptive one."
    ],
    s2_effort:[
      "[SHORT_NAME] must commit to more consistent independent study and revision to consolidate learning.",
      "[SHORT_NAME] should invest greater effort into completing homework and revision tasks thoroughly.",
      "[SHORT_NAME] needs to demonstrate more consistent dedication to this subject inside and outside class.",
      "[SHORT_NAME] would benefit greatly from dedicating more time to independent revision between lessons.",
      "[SHORT_NAME] is encouraged to take greater ownership of [THEIR] learning and prioritise regular revision."
    ],
    s2_behaviour:[
      "[SHORT_NAME] must demonstrate more consistent focus and self-discipline during lessons to reach [THEIR] potential.",
      "[SHORT_NAME] should improve classroom conduct and ensure they are fully engaged for the entire lesson.",
      "[SHORT_NAME] needs to take a more disciplined approach in class to create a more productive learning environment.",
      "[SHORT_NAME] is expected to show greater respect for the learning environment and improve focus in lessons.",
      "[SHORT_NAME] would benefit from channelling [THEIR] energy more productively and remaining on task during class."
    ],
    s3:[
      "With focused revision, [SHORT_NAME] is well-placed to push into the top grade boundary.",
      "Consistent practice and targeted revision will help [SHORT_NAME] achieve an A grade.",
      "A positive term — continued effort will lead to strong improvement in final exams.",
      "The A grade is within reach if identified gaps are addressed systematically.",
      "Maintaining this effort and building on strengths will ensure continued improvement."
    ],
    s4:[
      "A positive term overall, and [SHORT_NAME] should aim to maintain this momentum.",
      "With continued effort, the top grade is well within [SHORT_NAME]'s reach.",
      "I look forward to seeing [SHORT_NAME] build further on this solid foundation.",
      "With continued focus, [SHORT_NAME] has every chance of a strong final result."
    ]
  },
  C: {
    s1:[
      "[FULL_NAME] has worked to establish a foundational understanding of Economics this term.",
      "[FULL_NAME] shows some engagement with core economic topics and a cooperative class attitude.",
      "[FULL_NAME] has contributed positively to class and is beginning to develop economic awareness.",
      "[FULL_NAME] demonstrates a growing grasp of fundamental economic concepts across key topics.",
      "[FULL_NAME] has shown willingness to engage and is developing [THEIR] understanding of the subject."
    ],
    s2_academic:[
      "[SHORT_NAME] must prioritise regular revision to consolidate understanding across all topics.",
      "[SHORT_NAME] needs to improve the quality of analytical responses under exam conditions.",
      "[SHORT_NAME] should focus on building stronger written responses beyond surface description.",
      "[SHORT_NAME] must dedicate more time to practising exam questions under timed conditions.",
      "[SHORT_NAME] needs to develop a more disciplined and consistent approach to independent study."
    ],
    s2_effort:[
      "[SHORT_NAME] must significantly increase effort levels, both in class and in independent study, to make progress.",
      "[SHORT_NAME] needs to show much greater dedication to revision and homework to improve their understanding.",
      "[SHORT_NAME] is expected to put in more effort outside of lessons if they wish to see meaningful improvement.",
      "[SHORT_NAME] should take greater responsibility for [THEIR] learning and commit to a regular revision schedule.",
      "[SHORT_NAME] must prioritise this subject more seriously and invest time in consistent, focused revision."
    ],
    s2_behaviour:[
      "[SHORT_NAME] must significantly improve classroom behaviour and take a more focused approach to learning.",
      "[SHORT_NAME] is expected to show greater self-discipline and ensure conduct supports [THEIR] own learning.",
      "[SHORT_NAME] needs to take responsibility for behaviour in class and demonstrate a more mature approach.",
      "[SHORT_NAME] must address classroom conduct as a priority, as it is directly affecting [THEIR] progress.",
      "[SHORT_NAME] is strongly encouraged to refocus their attitude towards learning and show greater commitment."
    ],
    s3:[
      "With greater focus and revision, [SHORT_NAME] has the ability to improve significantly.",
      "I encourage [SHORT_NAME] to seek additional support and engage more with revision materials.",
      "A more structured revision plan will help [SHORT_NAME] reach their true potential.",
      "There is clear room for improvement — consistent effort will lead to better results.",
      "I look forward to seeing [SHORT_NAME] apply themselves more fully in the coming term."
    ],
    s4:[
      "Revision and practice will be the key to improvement.",
      "I look forward to seeing [SHORT_NAME] make meaningful progress next term.",
      "I encourage [SHORT_NAME] to seek support and use all available resources.",
      "I remain confident that [SHORT_NAME] can make real progress with the right focus."
    ]
  }
};
