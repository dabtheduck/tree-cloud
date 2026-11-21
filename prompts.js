/* Tree Cloud — prompt banks. Edit freely: each layer is a question kind.
   Kinds: "grounding" (yes/no, with a remark shown after the tap if its tag fits),
   "short" (statements: "List ..." with a full stop, no question mark),
   "open" (deeper, open-ended — the repository of good things).
   Layer templates: Tree = 8 layers, Shrub = 6, Flower = 4. A session never repeats a prompt.
   Grounding set rule: no same set of 6 grounding questions ever repeats (questions may reuse).
   Christian bonus questions are NOT in here — they are parked (KIV), toggle not built yet. */
window.TC_PROMPTS = {
  grounding: [
    {q:"Do you have 2 legs?", remark:"good to have them on standby in case you need to run from your problems...just joking, stand firm through your problems instead!", tag:"Yes"},
    {q:"Do you have 2 eyes?", remark:"I didn't ask if they work perfectly. Just having eyes is good enough", tag:"Yes"},
    {q:"Do you have a kidney?", remark:"kidneys help us filter out waste, isn't that so nice of them?", tag:"Yes"},
    {q:"Are you able to poop?", remark:"if you can't poop, toxins build up in your body. so every poop is worth celebrating", tag:"Both"},
    {q:"Can you smell?", remark:"if you can't smell, you can't taste well. but then again, if you can't smell well, maybe you win because you can't smell farts", tag:"Both"},
    {q:"Do you get to use a clean toilet?", remark:"cleanliness is such a gift, a gift from other human hands", tag:"Both"},
    {q:"Can you see the sky?", remark:"look at the clouds! and the patches of sky!!", tag:"Yes"},
    {q:"Are you in a country where you don't have to worry about natural disasters?", remark:"if no, condolences and may you always be safe", tag:"No"},
    {q:"Are you in a country where you don't have to fear being bombed?", remark:"if no, take care and may you always be safe", tag:"No"},
    {q:"Are you able to stand without using a walking stick?", remark:"nothing against walking sticks, but isn't it a blessing to have the strength to move around without each step being a risk to your life", tag:"Yes"},
    {q:"Is there at least one food item in your fridge right now?", remark:"no way your fridge is completely empty...did you eat it all?", tag:"Both"},
    {q:"Are you able to drink water without it leaking out of your mouth?", remark:"yeah, imagine if you can't, you'll be watering the ground wherever you go", tag:"Yes"},
    {q:"Can you feel your feet if you place it on the floor?", remark:"if you can't, you're either levitating or have nerve issues with your feet", tag:"No"},
    {q:"Did you breathe in the last minute?", remark:"some sick people struggle to breathe every second, really makes you treasure the little things we take for granted", tag:"Yes"},
    {q:"Can you hear something right now — even something small?", remark:"and if you can't hear anything, isn't it great you can't hear the annoying things in life? auto-mute function :) ", tag:"Both"},
    {q:"Do you have a place to sit down?", remark:"yay, take a pause, rest for a bit.", tag:"Yes"},
    {q:"Can you wiggle your fingers?", remark:"great, at least we know that's one part of you that's working for sure!", tag:"Yes"},
    {q:"Is there light where you are right now?", remark:"light from the sun, light from electricity...all quite a privilege to have", tag:"Yes"},
    {q:"Do you have clean water to drink?", remark:"isn't it great not to have to worry about what we drink?", tag:"Yes"},
    {q:"Can you feel the air on your skin?", remark:"good to know your mechanoreceptors are working", tag:"Yes"},
    {q:"Do you have a roof over your head right now?", remark:"even if the roof isn't yours, that's okay! any bit of shade from the sun or rain is great", tag:"Yes"},
    {q:"Can you swallow without it hurting?", remark:"let's just say this is such an underrated thing to be thankful for. sore throats are horrible.", tag:"Yes"},
    {q:"Did you eat something today?", remark:"if you haven't, do take care of yourself and try to get a meal in when you can!", tag:"No"},
    {q:"Can you see one colour you like right now?", remark:"at least you're not entirely colour blind! and if you can't see colour, at least you can see something!", tag:"Both"},
    {q:"Is your heart still beating?", remark:"great, you're alive!", tag:"Yes"},
    {q:"Do you have at least one braincell left in your brain?", remark:"the answer is definitely yes, takes a lot of braincells to have you simply exist", tag:"Yes"},
    {q:"Can you feel pain?", remark:"if yes, yay your nerves are working!", tag:"Yes"},
    {q:"Do you have a bed to sleep in?", remark:"a bed is such a luxury — some people sleep on the floor every night", tag:"Yes"},
    {q:"Can you move your toes?", remark:"tiny movements, still working!", tag:"Yes"},
    {q:"Do you have shoes to wear outside?", remark:"imagine walking on hot pavement barefoot at noon...", tag:"Yes"},
    {q:"Can you blink without it hurting?", remark:"blinking is free, and you do it about 15,000 times a day", tag:"Yes"},
    {q:"Can you smile?", remark:"if you think you don't have the energy to do so, just remember that it barely even takes 1 calorie worth of energy to smile...so just smile, I can guarantee you will feel better, though your problems may persist.", tag:"Both"},
    {q:"Is there a tap with running water near you?", remark:"turn it on and water just comes out — wild when you think about it", tag:"Yes"},
    {q:"Do you have clothes on right now?", remark:"hey, at least you're not in your birthday suit in public!", tag:"Yes"},
    {q:"Can you stand up from where you're sitting?", remark:"no crane needed, that was all you...be proud of your working muscles and joints", tag:"Yes"},
    {q:"Do you have a toothbrush?", remark:"or are you growing cavities in there HAHAH", tag:"Yes"},
    {q:"Can you take a deep breath without coughing?", remark:"lungs doing their job, quietly", tag:"Yes"},
    {q:"Do you have a blanket?", remark:"warmth on demand, that's a win", tag:"Yes"},
    {q:"Do you have a window you can look out of?", remark:"a free TV channel, and it's always on", tag:"Yes"},
    {q:"Can you open your mouth wide?", remark:"jaw works at least you can still yawn when the bad things in life repeat so often they start getting a little boring", tag:"Yes"},
    {q:"Is there food in your kitchen cupboard?", remark:"even instant noodles count, don't be picky", tag:"Both"}
  ],
  short: [
    "List one small thing you noticed today.",
    "List one sound that was okay today.",
    "List one thing that didn't go wrong.",
    "List one person who was kind to you today, even a little.",
    "List one thing your body did for you today.",
    "List one small comfort you had today.",
    "List one thing you can see right now that you don't hate.",
    "List one minute today that was alright.",
    "List one thing you managed to do today, however small.",
    "List one smell, taste or texture you liked today.",
    "List one thing you're glad is over.",
    "List one thing you want to remember from today.",
    "List one thing that made you breathe a sigh of relief.",
    "List one thing in this room you are grateful for.",
    "List one thing that went better than you feared.",
    "List one thing you did today that took some effort.",
    "List one thing that was easier than you expected.",
    "List one thing you fixed, finished, or tidied today.",
    "List one person you are glad exists today.",
    "List one thing you ate or drank that was actually good.",
    "List one place today that felt okay to be in.",
    "List one thing you are not worrying about right now.",
    "List one song that you love.",
    "List one thing your hands did today that helped.",
    "List one thing you saw that you'd love to remember.",
    "List one conversation you had that made your day brighter.",
    "List one good conversation that keeps replaying in your head.",
    "List one moment to keep in your pocket to look back on throughout the day.",
    "List one preference you have that someone took note of before.",
    "List one thing that really matters to you in life.",
    "List one habit that you already have that's good.",
    "List one promise that you've kept to another person.",
    "List one way you've shown up for another person.",
    "List one way other people have shown up for you.",
    "List one quote you live by.",
    "List one joke or meme that you can't forget.",
    "List one thing that will make you laugh no matter how bad your day is going.",
    "List one item that you own that you can't do without.",
    "List one thing you can do that's somewhat unique. (e.g. double jointed, stick out your tongue and touch your nose, etc.)",
    "List one fun thing you hope to do in the future.",
    "List one fun thing you did today. (e.g. sleep in, walked on a sidewalk curb, did the chicken dance etc.)",
    "List one picture on your camera roll that makes you smile.",
    "List one good reason to get out and touch some grass. (aka one small moment to detox from staring at screens all day)",
    "List one cloud that you've seen recently that you find cute. (describe it)",
    "List one word you can't spell. (ok now learn how to spell it to feel great about yourself, look at that personal growth!)",
    "List one thing you have that others might need. (e.g. a skill, an item, a connection, a person, etc. Wow, don't you feel rich.)",
    "List one funny thing that happened recently.",
    "List one unexpected thing that happened recently."
  ],
  open: [
    "What's the most pivotal point of today that made it so great?",
    "What is one thing today you would want to happen again tomorrow?",
    "What did you do today that you are quietly proud of?",
    "Who made today better, and what exactly did they do?",
    "What is something good that almost didn't happen today?",
    "What moment from today would you want to make sure you remember?",
    "What did today teach you about what you actually need?",
    "What is one thing you are grateful for that you usually overlook?",
    "Describe a small moment today when you felt like yourself.",
    "What helped you get through the hardest part of today?",
    "What is one thing today that felt like a gift, even a tiny one?",
    "If today had a title, what would it be — and why?",
    "What are you looking forward to, even just a little?",
    "What did someone do today that you want to thank them for?",
    "What part of today do you want to have more of?",
    "What would you tell yourself this morning, knowing how today went?",
    "What was the best 5 minutes of today?",
    "What did you do today that future-you would thank you for?",
    "Who would you want to tell about today, and what would you say first?",
    "What went right today that you had nothing to do with?",
    "What is one thing today that made the day feel like yours?",
    "What small win today would you have missed a year ago?",
    "What did you enjoy today that cost nothing?",
    "What part of today do you want more of next week?",
    "Who made you laugh today, even a little — what happened?",
    "What are you carrying into tomorrow from today that is actually good?",
    "What made you sad today? What made the sad less painful?",
    "What part of today would you like to change tomorrow?",
    "Which part of today was so good that you wouldn't want to change it?",
    "What was one peaceful moment you had today?",
    "What was one happy moment you had today?",
    "What was one sad moment you had today?",
    "What was one silly moment you had today?",
    "What was one thing that happened (or that you read about/learnt about/heard about) today that blew your mind?",
    "What would you want to tell future you about how this year has been so far?",
    "Where have you gone today? What happened at those places?",
    "When did you wake up today? What did you wake up for?",
    "Were you excited for anything today?",
    "What's one thing you're looking forward to in the next few days?"
  ],
  noFallbacks: [
    "That's okay — noticing it still counts.",
    "Thanks for your honest answer.",
    "Oh wow, sometimes life does suck huh!",
    "Fair enough — you don't have to feel good about everything.",
    "Yeah, that one's hard. Moving on, no pressure.",
    "Thanks for being real about it.",
    "Okay, that counts too — you showed up and answered.",
    "Noted. That one was a tough one."
  ],
  congrats: [
    "Look at you — you nurtured a new [plant]!",
    "You grew a [plant] today. Look at that.",
    "Another [plant] in your garden. You did that.",
    "From a stump to this [plant]. Nice growing.",
    "You showed up and grew a [plant]. That's the whole win.",
    "A new [plant], grown by you, on a day you actually got through.",
    "Look at your garden — one [plant] taller than it was this morning.",
    "You watered it with answers. It grew into a [plant].",
    "Not bad for a day that started rough — you grew a [plant].",
    "Your garden's a little fuller now, because of you — say hello to your new [plant]."
  ],
  randomEvents: [
    {id:"bird", title:"Wild Sprout", note:"A bird flew by and dropped a seed into your garden — now a wild sprout is growing there!", gift:"Wild Sprout"},
    {id:"bee", title:"Bee left honey", note:"A bee stopped by and left some honey. You're doing better than you think.", gift:"Honey"},
    {id:"rain", title:"Rain Mushroom", note:"A soft rain passed over your clouds — a little rain mushroom appeared in the damp corner!", gift:"Rain Mushroom"},
    {id:"butterfly", title:"Wildflower", note:"A butterfly visited your garden, stayed a while, and left a wildflower behind!", gift:"Wildflower"},
    {id:"snail", title:"Snail left a tiny sprout", note:"A snail took its time getting here, and left you a sprout. Slow is still growing.", gift:"Snail Sprout"},
    {id:"ladybug", title:"Ladybug took a break on a leaf", note:"A ladybug stopped by for a pit stop. You need breaks too, remember to take it.", gift:"Ladybug Leaf"},
    {id:"firefly", title:"Firefly dropped a glow-seed", note:"A firefly flew past and left a little light behind. Keep it for the darker days.", gift:"Glow-seed"},
    {id:"wind", title:"Wind blew in a dandelion seed", note:"The wind carried a seed all the way to your garden. Some good things just arrive.", gift:"Dandelion Seed"},
    {id:"frog", title:"Frog hopped by with a lily pad", note:"A frog hopped through and left a lily pad. Even the small visitors leave something behind.", gift:"Lily Pad"},
    {id:"sun", title:"Morning sun warmed a sunflower sprout", note:"The sun came out for a bit and warmed up a sprout. Warmth counts too.", gift:"Sunflower Sprout"},
    {id:"robin", title:"Robin sang a song", note:"A robin landed on a branch and sang a little song — a tiny concert, just for you.", gift:"Robin's Song"},
    {id:"caterpillar", title:"Caterpillar chomping leaves", note:"A caterpillar is chomping its way through the leaves in your garden — don't forget to eat today too!", gift:"Hungry Caterpillar"},
    {id:"dewdrop", title:"Dewdrop sparkled", note:"A dewdrop caught the morning light and sparkled — small things can shine.", gift:"Morning Dewdrop"},
    {id:"heartcloud", title:"Heart-shaped cloud", note:"A cloud drifted by shaped like a heart — know that you're loved by someone in this universe.", gift:"Heart Cloud"},
    {id:"squirrel", title:"Squirrel buried an acorn", note:"A squirrel buried an acorn in the garden — something good is growing, even if you can't see it yet.", gift:"Buried Acorn"},
    {id:"dragonfly", title:"Dragonfly shook off worries", note:"A dragonfly hovered over the garden for a moment — it shook off its worries then flew away feeling lighter.", gift:"Dragonfly Wings"},
    {id:"breeze", title:"Gentle breeze", note:"A gentle breeze rustled the leaves — can you feel the breath of life?", gift:"Gentle Breeze"},
    {id:"mushroom2", title:"Tiny mushroom overnight", note:"A tiny mushroom popped up overnight — good things show up even when you're not looking.", gift:"Mushroom"},
    {id:"star", title:"Falling star", note:"A star fell across the night sky — look at that, a special wink just for you!", gift:"Falling Star"},
    {id:"rainbow", title:"Rainbow after rain", note:"A rainbow appeared after the rain — the storm passed, and look what it left.", gift:"Rainbow"},
    {id:"hedgehog", title:"Hedgehog footprint", note:"A hedgehog shuffled through and left a tiny footprint — you're not alone in this garden.", gift:"Hedgehog Footprint"},
    {id:"seed", title:"Forgotten seed sprouted", note:"A seed you forgot about sprouted — you'll sow what you reap in due time.", gift:"Forgotten Seed"}
  ],
  /* Mockup's shared tap-note pool: tapping a gift plant shows a random one of these. */
  GIFT_NOTES: [
    "Small growth is still growth.",
    "You don't have to feel okay to be doing okay.",
    "Resting is part of growing. Even gardens sit still sometimes.",
    "Roots grow in the dark too — the work counts even when nobody sees it.",
    "You've made it through every hard day so far. Every single one.",
    "A garden never compares itself to the garden next door.",
    "Today counts. Even the quiet parts of it.",
    "Slow days still grow things. You're proof."
  ],
  layers: {
    tree:   ["grounding","grounding","grounding","grounding","grounding","grounding","short","open"],
    shrub:  ["grounding","grounding","short","grounding","short","open"],
    flower: ["grounding","short","open","open"]
  },
  ends: { tree: "Outer Space", shrub: "Clear Sky", flower: "Full Bloom" },
  plantForMood: function(m){ m=+m||5; return m<=3 ? "tree" : (m<=6 ? "shrub" : "flower"); },
  plantLabel: { tree:"Tree", shrub:"Shrub", flower:"Flower" },
  /* 30 plants: mood tier decides TYPE, mood + universe decides SPECIES. */
  SPECIES: {
    desert: {1:"Joshua Tree",2:"Date Palm",3:"Mesquite Tree",4:"Prickly Pear Cactus",5:"Sagebrush",6:"Ocotillo",7:"Aloe Vera",8:"Agave",9:"Desert Rose",10:"Golden Barrel Cactus"},
    valley: {1:"Willow",2:"Oak",3:"Pine",4:"Holly Bush",5:"Sage Bush",6:"River Birch Shrub",7:"Fern",8:"Bamboo",9:"Succulent",10:"Wildflower Fern"},
    space:  {1:"Nebula Pine",2:"Moon Willow",3:"Comet Oak",4:"Asteroid Shrub",5:"Stardust Sage",6:"Lunar Cactus",7:"Star Fern",8:"Moon Bamboo",9:"Galaxy Succulent",10:"Nova Bloom"}
  },
  speciesFor: function(mood, world){ var w=(world==="desert"||world==="space")?world:"valley"; return (this.SPECIES[w]||{})[+mood||5] || "Plant"; },
  /* Build Your Own — exclusive special plants, one per type × world. Not in the normal 30. */
  BYO_SPECIES: {
    valley: {tree:"Golden Oak", shrub:"Rainbow Sage", flower:"Aurora Fern"},
    desert: {tree:"Sun Palm", shrub:"Ember Bush", flower:"Golden Aloe"},
    space:  {tree:"Gem Pine", shrub:"Moon Cactus", flower:"Starlight Bloom"}
  },
  BYO_COLOURS: ["#43a047","#d99a1f","#f06a9a","#8e6bc8","#4a90d9","#2aa198","#e07a2e","#cfd6dd"], /* mockup exactly, in order; Natural (empty) is the default, added in app.js */
  /* BYO steps, topic-filled. Tree 8 = 2 yes/no openers + 6 steps; Shrub 6 = steps 3-8; Flower 4 = steps 5-8. */
  byoSteps: function(type, topic){
    var t = topic || "this";
    var all = [
      {kind:"grounding", q:"Did "+t+" play a good part in your life recently?", remark:"", tag:""},
      {kind:"grounding", q:"Was there one moment related to "+t+" that did not hurt?", remark:"", tag:""},
      {kind:"short", q:"List one positive fact about "+t+".", remark:"", tag:""},
      {kind:"open", q:"What's one thing in the world that makes "+t+" possible?", remark:"", tag:""},
      {kind:"short", q:"List one small wonderful thing you noticed about "+t+" today.", remark:"", tag:""},
      {kind:"short", q:"List one kindness to do with "+t+" — given or received.", remark:"", tag:""},
      {kind:"open", q:"What's one good memory you made recently that's related to "+t+"?", remark:"", tag:""},
      {kind:"open", q:"I'm thankful for "+t+" because...", remark:"", tag:""}
    ];
    if (type==="shrub") return all.slice(2);
    if (type==="flower") return all.slice(4);
    return all;
  },
  byoSpeciesFor: function(type, world){ var w=(world==="desert"||world==="space")?world:"valley"; return (this.BYO_SPECIES[w]||{})[type] || "Plant"; },
  /* Per-species animation profile: shape family, colours, sway amplitude/speed, height.
     Families share a draw routine; every species differs in silhouette, colour, sway or height. */
  PROFILES: {
    "Joshua Tree":{shape:"joshua", leaf:"#5a7d3a", leaf2:"#7a9a4a", trunk:"#6b4a2f", accent:"#d8c98a", sway:4, speed:0.6, height:1.0, twinkle:false, glow:false},
    "Date Palm":{shape:"palm", leaf:"#3e9a4a", leaf2:"#66bb6a", trunk:"#8a6136", accent:"#e8a317", sway:7, speed:1.7, height:1.05, twinkle:false, glow:false},
    "Mesquite Tree":{shape:"mesquite", leaf:"#6a9a3f", leaf2:"#8aba5a", trunk:"#5d4037", accent:"#c89b6a", sway:6, speed:0.9, height:0.9, twinkle:false, glow:false},
    "Prickly Pear Cactus":{shape:"pads", leaf:"#2f8a4a", leaf2:"#43a047", trunk:"#2f8a4a", accent:"#e86a8a", sway:5, speed:0.9, height:0.7, twinkle:false, glow:false},
    "Sagebrush":{shape:"sage", leaf:"#9aa88a", leaf2:"#c2cdb2", trunk:"#8a7a5f", accent:"#d8dfc9", sway:4, speed:2.4, height:0.65, twinkle:false, glow:false},
    "Ocotillo":{shape:"ocotillo", leaf:"#7a8a4a", leaf2:"#9aba5a", trunk:"#8a4a3a", accent:"#e23b2e", sway:11, speed:1.4, height:0.95, twinkle:false, glow:false},
    "Aloe Vera":{shape:"rosette", leaf:"#4a9a6a", leaf2:"#7aba8a", trunk:"#4a9a6a", accent:"#a5d6a7", sway:3, speed:0.6, height:0.55, twinkle:false, glow:false},
    "Agave":{shape:"rosette", leaf:"#5a8a9a", leaf2:"#8ab4c2", trunk:"#5a8a9a", accent:"#d6e8ec", sway:2, speed:0.5, height:0.7, twinkle:false, glow:false},
    "Desert Rose":{shape:"rose", leaf:"#3e7d32", leaf2:"#57a75a", trunk:"#c2a88a", accent:"#f06a9a", sway:5, speed:0.9, height:0.6, twinkle:false, glow:false},
    "Golden Barrel Cactus":{shape:"barrel", leaf:"#d99a1f", leaf2:"#e8b84a", trunk:"#3e7d32", accent:"#f2d06b", sway:4, speed:0.9, height:0.5, twinkle:false, glow:false},
    "Willow":{shape:"willow", leaf:"#57a75a", leaf2:"#8fd07e", trunk:"#6e4a2a", accent:"#cdeac0", sway:9, speed:1.0, height:1.0, twinkle:false, glow:false},
    "Oak":{shape:"oak", leaf:"#2e7d32", leaf2:"#43a047", trunk:"#7a4e2a", accent:"#8a6136", sway:5, speed:0.5, height:1.0, twinkle:false, glow:false},
    "Pine":{shape:"pine", leaf:"#1f5c2e", leaf2:"#2e7d32", trunk:"#5d4037", accent:"#43a047", sway:2, speed:0.4, height:1.1, twinkle:false, glow:false},
    "Holly Bush":{shape:"bush", leaf:"#1f6b2e", leaf2:"#2e7d32", trunk:"#5d4037", accent:"#e23b2e", sway:2, speed:0.5, height:0.7, twinkle:false, glow:false},
    "Sage Bush":{shape:"sage", leaf:"#7a9a7a", leaf2:"#a8bfa8", trunk:"#6e5a4a", accent:"#b39ddb", sway:5, speed:1.0, height:0.65, twinkle:false, glow:false},
    "River Birch Shrub":{shape:"birch", leaf:"#66bb6a", leaf2:"#a5d6a7", trunk:"#e8e0d0", accent:"#ffffff", sway:6, speed:1.5, height:0.75, twinkle:false, glow:false},
    "Fern":{shape:"fern", leaf:"#2e7d32", leaf2:"#66bb6a", trunk:"#388e3c", accent:"#8fd07e", sway:7, speed:1.2, height:0.6, twinkle:false, glow:false},
    "Bamboo":{shape:"bamboo", leaf:"#43a047", leaf2:"#8fd07e", trunk:"#7cb342", accent:"#c5e1a5", sway:6, speed:1.3, height:1.1, twinkle:false, glow:false},
    "Succulent":{shape:"rosette", leaf:"#6ab894", leaf2:"#a8d8b8", trunk:"#6ab894", accent:"#f2b8d0", sway:2, speed:0.6, height:0.55, twinkle:false, glow:false},
    "Wildflower Fern":{shape:"fern", leaf:"#388e3c", leaf2:"#66bb6a", trunk:"#388e3c", accent:"#f06a9a", sway:7, speed:1.2, height:0.65, twinkle:false, glow:false, flowers:true},
    "Nebula Pine":{shape:"pine", leaf:"#5e3a9a", leaf2:"#2aa198", trunk:"#3a2a5a", accent:"#c39bff", sway:4, speed:0.7, height:1.1, twinkle:true, glow:true},
    "Moon Willow":{shape:"willow", leaf:"#a8c8e8", leaf2:"#d6e8ff", trunk:"#6b6f7a", accent:"#ffe9a3", sway:10, speed:0.8, height:1.0, twinkle:true, glow:false},
    "Comet Oak":{shape:"oak", leaf:"#2e6b7a", leaf2:"#e07a2e", trunk:"#5a3a4a", accent:"#ffd94d", sway:6, speed:1.1, height:1.0, twinkle:true, glow:false},
    "Asteroid Shrub":{shape:"bush", leaf:"#7a7f8a", leaf2:"#9aa0ab", trunk:"#5d636e", accent:"#c9ccd4", sway:2, speed:0.4, height:0.7, twinkle:false, glow:false},
    "Stardust Sage":{shape:"sage", leaf:"#b8a8d8", leaf2:"#d8c8f0", trunk:"#6b5a7a", accent:"#ffe9a3", sway:5, speed:1.3, height:0.65, twinkle:true, glow:false},
    "Lunar Cactus":{shape:"pads", leaf:"#a8d8b8", leaf2:"#d6f0dd", trunk:"#7ab894", accent:"#ffe9a3", sway:5, speed:0.8, height:0.7, twinkle:false, glow:true},
    "Star Fern":{shape:"fern", leaf:"#4a6ac2", leaf2:"#7a9ae8", trunk:"#3a4a8a", accent:"#ffe9a3", sway:6, speed:1.0, height:0.6, twinkle:true, glow:false},
    "Moon Bamboo":{shape:"bamboo", leaf:"#a8c8e8", leaf2:"#d6e8ff", trunk:"#8aa8c8", accent:"#ffe9a3", sway:6, speed:1.1, height:1.1, twinkle:true, glow:true},
    "Galaxy Succulent":{shape:"rosette", leaf:"#7a5ac2", leaf2:"#4aa8a2", trunk:"#7a5ac2", accent:"#f2b8d0", sway:3, speed:0.7, height:0.55, twinkle:true, glow:true},
    "Nova Bloom":{shape:"rose", leaf:"#388e3c", leaf2:"#57a75a", trunk:"#388e3c", accent:"#ff8a3d", sway:5, speed:1.0, height:0.6, twinkle:true, glow:true}
  },
  /* Build Your Own special plants: golden / glowing / rainbow touches, sparkle on finish. */
  BYO_PROFILES: {
    "Golden Oak":{shape:"oak", leaf:"#c98f1b", leaf2:"#f2c14e", trunk:"#7a4e2a", accent:"#ffe9a3", sway:6, speed:0.6, height:1.05, twinkle:true, glow:true},
    "Gem Pine":{shape:"pine", leaf:"#7a5ac2", leaf2:"#2aa198", trunk:"#3a2a5a", accent:"#ffe9a3", sway:3, speed:0.6, height:1.1, twinkle:true, glow:true},
    "Sun Palm":{shape:"palm", leaf:"#d99a1f", leaf2:"#7aba4a", trunk:"#8a6136", accent:"#ff8a3d", sway:8, speed:1.8, height:1.05, twinkle:true, glow:true},
    "Rainbow Sage":{shape:"sage", leaf:"#8e6bc8", leaf2:"#2aa198", trunk:"#6e5a4a", accent:"#f06a9a", sway:6, speed:1.2, height:0.65, twinkle:true, glow:false},
    "Moon Cactus":{shape:"pads", leaf:"#5a7ac2", leaf2:"#a8c8e8", trunk:"#4a5a8a", accent:"#e8f2ff", sway:4, speed:0.7, height:0.7, twinkle:true, glow:true},
    "Ember Bush":{shape:"bush", leaf:"#7a3b1e", leaf2:"#b5502a", trunk:"#4a2c1a", accent:"#ff8a3d", sway:3, speed:0.6, height:0.7, twinkle:true, glow:true},
    "Aurora Fern":{shape:"fern", leaf:"#1f8a70", leaf2:"#66d9a5", trunk:"#1f6b56", accent:"#b39ddb", sway:8, speed:1.3, height:0.6, twinkle:true, glow:true, flowers:true},
    "Starlight Bloom":{shape:"rose", leaf:"#4a6ac2", leaf2:"#7a9ae8", trunk:"#3a4a8a", accent:"#ffe9a3", sway:6, speed:1.1, height:0.6, twinkle:true, glow:true},
    "Golden Aloe":{shape:"rosette", leaf:"#c98f1b", leaf2:"#f2c14e", trunk:"#a8761a", accent:"#fff3b0", sway:3, speed:0.6, height:0.55, twinkle:true, glow:true}
  },
  /* One motion signature per species — silhouette, palette, sway AND motion are all unique. */
  MOTION: {
    "Joshua Tree":"sway", "Date Palm":"flutter", "Mesquite Tree":"sway", "Prickly Pear Cactus":"wobble",
    "Sagebrush":"shiver", "Ocotillo":"whip", "Aloe Vera":"pulse", "Agave":"pulse", "Desert Rose":"bloom",
    "Golden Barrel Cactus":"wobble", "Willow":"sway", "Oak":"sway", "Pine":"sway", "Holly Bush":"sway",
    "Sage Bush":"wobble", "River Birch Shrub":"flutter", "Fern":"unfurl", "Bamboo":"segment", "Succulent":"pulse",
    "Wildflower Fern":"unfurl", "Nebula Pine":"sway", "Moon Willow":"sway", "Comet Oak":"sway",
    "Asteroid Shrub":"pulse", "Stardust Sage":"shiver", "Lunar Cactus":"wobble", "Star Fern":"unfurl",
    "Moon Bamboo":"segment", "Galaxy Succulent":"pulse", "Nova Bloom":"bloom",
    "Golden Oak":"sway", "Gem Pine":"sway", "Sun Palm":"flutter", "Rainbow Sage":"wobble",
    "Moon Cactus":"wobble", "Ember Bush":"sway", "Aurora Fern":"unfurl", "Starlight Bloom":"bloom", "Golden Aloe":"pulse"
  },
  profileFor: function(species, color){
    var base = this.BYO_PROFILES[species] || this.PROFILES[species] || {shape:"oak", leaf:"#40916c", leaf2:"#74c69d", trunk:"#6b4a2b", sway:4, speed:1, height:1};
    var out = {}; for (var k in base) out[k]=base[k];
    out.motion = this.MOTION[species] || "sway";
    var h=0; for (var i=0;i<(species||"").length;i++) h=(h*31+(species||"").charCodeAt(i))%997;
    out.phase = h/997*Math.PI*2;
    out.special = !!this.BYO_PROFILES[species];
    if (color) { out.leaf=color; out.leaf2=color; }
    return out;
  },
  weedsForMood: function(m){ m=+m||5; return m===1?9 : m===2?8 : m===3?7 : m===4?5 : m===5?5 : m===6?4 : m===7?3 : m===8?2 : 1; },
  /* Questions used in the last 3 plants (any tier) — no question repeats within 2-3 plants. */
  _recentQs: function(){
    try { var s = JSON.parse(localStorage.getItem("tc-recent-qs")||"[]"); return s.reduce(function(a,b){ return a.concat(b); }, []); } catch(e){ return []; }
  },
  _saveRecentQs: function(qs){
    try { var s = JSON.parse(localStorage.getItem("tc-recent-qs")||"[]"); s.push(qs); if (s.length>3) s = s.slice(-3); localStorage.setItem("tc-recent-qs", JSON.stringify(s)); } catch(e){}
  },
  pick: function(kind, used){
    var bank = kind==="grounding" ? this.grounding : this[kind];
    var copy = bank.slice();
    for (var i=copy.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=copy[i]; copy[i]=copy[j]; copy[j]=t; }
    var q = function(e){ return kind==="grounding" ? e.q : e; };
    var recent = this._recentQs();
    var out = copy.find(function(e){ return used.indexOf(q(e))===-1 && recent.indexOf(q(e))===-1; })
      || copy.find(function(e){ return used.indexOf(q(e))===-1; }) || copy[0];
    return out;
  },
  buildLayers: function(plant){
    var kinds = this.layers[plant] || this.layers.tree, used = [], layers = [], self = this;
    var nGround = kinds.filter(function(k){ return k==="grounding"; }).length;
    var groundIdx = null;
    if (plant==="tree" && nGround===6) {
      /* No same set of 6 grounding questions ever repeats: pick a set, check stored sets, re-roll on collision. */
      var seen = [];
      try { seen = JSON.parse(localStorage.getItem("tc-grounding-sets")||"[]"); } catch(e){ seen=[]; }
      var tries = 0, chosen = null;
      var recentG = self._recentQs();
      while (tries++ < 300) {
        var idx = self.grounding.map(function(_,i){ return i; });
        for (var i=idx.length-1;i>0;i--){ var j=Math.floor(Math.random()*(i+1)); var t=idx[i]; idx[i]=idx[j]; idx[j]=t; }
        /* Prefer questions not used in the last 3 plants; fill with recent ones only if short. */
        var fresh = idx.filter(function(i){ return recentG.indexOf(self.grounding[i].q)===-1; });
        var pickIdx = fresh.slice(0,6);
        if (pickIdx.length < 6) { var rest = idx.filter(function(i){ return pickIdx.indexOf(i)===-1; }); pickIdx = pickIdx.concat(rest.slice(0, 6-pickIdx.length)); }
        var set = pickIdx.slice().sort(function(a,b){return a-b;});
        var key = set.join(",");
        if (seen.indexOf(key)===-1) { chosen = set; seen.push(key); if (seen.length>500) seen = seen.slice(-500); try { localStorage.setItem("tc-grounding-sets", JSON.stringify(seen)); } catch(e){} break; }
      }
      groundIdx = chosen || self.grounding.map(function(_,i){ return i; }).slice(0,6);
    }
    var gi = 0;
    kinds.forEach(function(kind){
      var entry;
      if (kind==="grounding" && groundIdx) { entry = self.grounding[groundIdx[gi++]]; }
      else { entry = self.pick(kind, used); }
      var q = kind==="grounding" ? entry.q : entry;
      used.push(q);
      layers.push({kind:kind, q:q, remark: kind==="grounding" ? entry.remark : "", tag: kind==="grounding" ? entry.tag : ""});
    });
    /* Remember this plant's questions so the next 2-3 plants rotate to fresh ones. */
    self._saveRecentQs(used.slice());
    return layers;
  }
};
