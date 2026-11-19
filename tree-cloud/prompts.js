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
    {id:"bird", title:"Bird dropped a seed", note:"A bird flew by and left you a seed. Small things still find you.", gift:"Seedling"},
    {id:"bee", title:"Bee left honey", note:"A bee stopped by and left some honey. You're doing better than you think.", gift:"Honey"},
    {id:"rain", title:"Soft rain brought a mushroom", note:"It rained a little, and a mushroom popped up. Growth happens quietly too.", gift:"Mushroom"},
    {id:"butterfly", title:"Butterfly left a wildflower", note:"A butterfly passed through and left a wildflower. Keep going — you're growing.", gift:"Wildflower"},
    {id:"snail", title:"Snail left a tiny sprout", note:"A snail took its time getting here, and left you a sprout. Slow is still growing.", gift:"Sprout"},
    {id:"ladybug", title:"Ladybug took a break on a leaf", note:"A ladybug stopped by for a pit stop. You need breaks too, remember to take it.", gift:"Leaf"},
    {id:"firefly", title:"Firefly dropped a glow-seed", note:"A firefly flew past and left a little light behind. Keep it for the darker days.", gift:"Glow-seed"},
    {id:"wind", title:"Wind blew in a dandelion seed", note:"The wind carried a seed all the way to your garden. Some good things just arrive.", gift:"Dandelion"},
    {id:"frog", title:"Frog hopped by with a lily pad", note:"A frog hopped through and left a lily pad. Even the small visitors leave something behind.", gift:"Lily Pad"},
    {id:"sun", title:"Morning sun warmed a sunflower sprout", note:"The sun came out for a bit and warmed up a sprout. Warmth counts too.", gift:"Sunflower Sprout"},
    {id:"robin", title:"Robin sang a song", note:"A robin landed on a branch and sang a little song — a tiny concert, just for you.", gift:"Songbird"},
    {id:"caterpillar", title:"Caterpillar chomping leaves", note:"A caterpillar is chomping its way through the leaves in your garden — don't forget to eat today too!", gift:"Leaf"},
    {id:"dewdrop", title:"Dewdrop sparkled", note:"A dewdrop caught the morning light and sparkled — small things can shine.", gift:"Dewdrop"},
    {id:"heartcloud", title:"Heart-shaped cloud", note:"A cloud drifted by shaped like a heart — know that you're loved by someone in this universe.", gift:"Cloud"},
    {id:"squirrel", title:"Squirrel buried an acorn", note:"A squirrel buried an acorn in the garden — something good is growing, even if you can't see it yet.", gift:"Acorn"},
    {id:"dragonfly", title:"Dragonfly shook off worries", note:"A dragonfly hovered over the garden for a moment — it shook off its worries then flew away feeling lighter.", gift:"Dragonfly"},
    {id:"breeze", title:"Gentle breeze", note:"A gentle breeze rustled the leaves — can you feel the breath of life?", gift:"Breeze"},
    {id:"mushroom2", title:"Tiny mushroom overnight", note:"A tiny mushroom popped up overnight — good things show up even when you're not looking.", gift:"Mushroom"},
    {id:"star", title:"Falling star", note:"A star fell across the night sky — look at that, a special wink just for you!", gift:"Starlight"},
    {id:"rainbow", title:"Rainbow after rain", note:"A rainbow appeared after the rain — the storm passed, and look what it left.", gift:"Rainbow"},
    {id:"hedgehog", title:"Hedgehog footprint", note:"A hedgehog shuffled through and left a tiny footprint — you're not alone in this garden.", gift:"Footprint"},
    {id:"seed", title:"Forgotten seed sprouted", note:"A seed you forgot about sprouted — you'll sow what you reap in due time.", gift:"Seedling"}
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
  BYO_COLOURS: ["#40916c","#d9a441","#e07a9a","#7b5ea7","#48cae4","#2d6a4f","#e07a2f","#b7c8e4"],
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
    "Joshua Tree":{shape:"joshua", leaf:"#74c69d", leaf2:"#40916c", trunk:"#6b4a2b", sway:3, speed:0.7, height:1.0},
    "Date Palm":{shape:"palm", leaf:"#40916c", leaf2:"#74c69d", trunk:"#8a5a2b", sway:7, speed:1.4, height:1.05},
    "Mesquite Tree":{shape:"mesquite", leaf:"#2d6a4f", leaf2:"#40916c", trunk:"#5a3a22", sway:4, speed:0.9, height:0.9},
    "Prickly Pear Cactus":{shape:"pads", leaf:"#40916c", leaf2:"#74c69d", trunk:"#2d6a4f", sway:2, speed:0.5, height:0.7},
    "Sagebrush":{shape:"sage", leaf:"#a8b8a0", leaf2:"#8fa8bb", trunk:"#6b6a5a", sway:6, speed:2.2, height:0.65},
    "Ocotillo":{shape:"ocotillo", leaf:"#c1440e", leaf2:"#e07a2f", trunk:"#6b4a2b", sway:8, speed:1.8, height:0.95},
    "Aloe Vera":{shape:"rosette", leaf:"#74c69d", leaf2:"#40916c", trunk:"#2d6a4f", sway:2, speed:0.8, height:0.55},
    "Agave":{shape:"rosette", leaf:"#8fa8bb", leaf2:"#5b7a8c", trunk:"#3a4a5a", sway:3, speed:0.6, height:0.7},
    "Desert Rose":{shape:"rose", leaf:"#e07a9a", leaf2:"#d9a441", trunk:"#6b4a2b", sway:3, speed:1.1, height:0.6},
    "Golden Barrel Cactus":{shape:"barrel", leaf:"#74c69d", leaf2:"#d9a441", trunk:"#40916c", sway:2, speed:0.9, height:0.5},
    "Willow":{shape:"willow", leaf:"#74c69d", leaf2:"#40916c", trunk:"#6b4a2b", sway:8, speed:1.2, height:1.0},
    "Oak":{shape:"oak", leaf:"#2d6a4f", leaf2:"#40916c", trunk:"#5a3a22", sway:4, speed:0.8, height:1.0},
    "Pine":{shape:"pine", leaf:"#1b4332", leaf2:"#2d6a4f", trunk:"#6b4a2b", sway:2, speed:0.6, height:1.1},
    "Holly Bush":{shape:"bush", leaf:"#1b4332", leaf2:"#c1440e", trunk:"#2d6a4f", sway:3, speed:1.0, height:0.7},
    "Sage Bush":{shape:"sage", leaf:"#74c69d", leaf2:"#a8b8a0", trunk:"#6b6a5a", sway:5, speed:2.0, height:0.65},
    "River Birch Shrub":{shape:"birch", leaf:"#b7e4c7", leaf2:"#74c69d", trunk:"#d9d9d9", sway:5, speed:1.6, height:0.75},
    "Fern":{shape:"fern", leaf:"#40916c", leaf2:"#74c69d", trunk:"#2d6a4f", sway:6, speed:1.5, height:0.6},
    "Bamboo":{shape:"bamboo", leaf:"#74c69d", leaf2:"#40916c", trunk:"#2d6a4f", sway:4, speed:1.3, height:1.1},
    "Succulent":{shape:"rosette", leaf:"#74c69d", leaf2:"#b7e4c7", trunk:"#2d6a4f", sway:2, speed:0.7, height:0.55},
    "Wildflower Fern":{shape:"fern", leaf:"#74c69d", leaf2:"#e07a9a", trunk:"#2d6a4f", sway:6, speed:1.7, height:0.65},
    "Nebula Pine":{shape:"pine", leaf:"#7b5ea7", leaf2:"#48cae4", trunk:"#3a3a5a", sway:2, speed:0.6, height:1.1},
    "Moon Willow":{shape:"willow", leaf:"#b7c8e4", leaf2:"#d9d9d9", trunk:"#5a5a6e", sway:8, speed:1.2, height:1.0},
    "Comet Oak":{shape:"oak", leaf:"#5b7a8c", leaf2:"#b7e4c7", trunk:"#3a3a5a", sway:4, speed:0.9, height:1.0},
    "Asteroid Shrub":{shape:"bush", leaf:"#8a8a9a", leaf2:"#5a5a6e", trunk:"#3a3a4a", sway:3, speed:0.8, height:0.7},
    "Stardust Sage":{shape:"sage", leaf:"#b7a8e4", leaf2:"#8fa8bb", trunk:"#5a5a6e", sway:6, speed:2.1, height:0.65},
    "Lunar Cactus":{shape:"pads", leaf:"#b7c8e4", leaf2:"#d9a441", trunk:"#5a5a6e", sway:2, speed:0.5, height:0.7},
    "Star Fern":{shape:"fern", leaf:"#b7e4c7", leaf2:"#fff3b0", trunk:"#3a3a5a", sway:6, speed:1.5, height:0.6},
    "Moon Bamboo":{shape:"bamboo", leaf:"#b7c8e4", leaf2:"#74c69d", trunk:"#5a5a6e", sway:4, speed:1.3, height:1.1},
    "Galaxy Succulent":{shape:"rosette", leaf:"#7b5ea7", leaf2:"#48cae4", trunk:"#3a3a5a", sway:2, speed:0.7, height:0.55},
    "Nova Bloom":{shape:"rose", leaf:"#fff3b0", leaf2:"#e07a9a", trunk:"#3a3a5a", sway:3, speed:1.1, height:0.6}
  },
  /* Build Your Own special plants: golden / glowing / rainbow touches, sparkle on finish. */
  BYO_PROFILES: {
    "Golden Oak":{shape:"oak", leaf:"#d9a441", leaf2:"#fff3b0", trunk:"#5a3a22", sway:4, speed:0.8, height:1.05},
    "Gem Pine":{shape:"pine", leaf:"#48cae4", leaf2:"#b7e4c7", trunk:"#3a3a5a", sway:2, speed:0.6, height:1.1},
    "Sun Palm":{shape:"palm", leaf:"#e07a2f", leaf2:"#d9a441", trunk:"#8a5a2b", sway:7, speed:1.4, height:1.05},
    "Rainbow Sage":{shape:"sage", leaf:"#e07a9a", leaf2:"#7b5ea7", trunk:"#6b6a5a", sway:6, speed:2.2, height:0.65},
    "Moon Cactus":{shape:"pads", leaf:"#b7c8e4", leaf2:"#fff3b0", trunk:"#5a5a6e", sway:2, speed:0.5, height:0.7},
    "Ember Bush":{shape:"bush", leaf:"#c1440e", leaf2:"#e07a2f", trunk:"#6b4a2b", sway:3, speed:1.0, height:0.7},
    "Aurora Fern":{shape:"fern", leaf:"#48cae4", leaf2:"#7b5ea7", trunk:"#2d6a4f", sway:6, speed:1.5, height:0.6},
    "Starlight Bloom":{shape:"rose", leaf:"#fff3b0", leaf2:"#b7c8e4", trunk:"#3a3a5a", sway:3, speed:1.1, height:0.6},
    "Golden Aloe":{shape:"rosette", leaf:"#d9a441", leaf2:"#74c69d", trunk:"#2d6a4f", sway:2, speed:0.8, height:0.55}
  },
  /* One motion signature per species — silhouette, palette, sway AND motion are all unique. */
  MOTION: {
    "Joshua Tree":"fork", "Date Palm":"flutter", "Mesquite Tree":"sway", "Prickly Pear Cactus":"wobble",
    "Sagebrush":"shiver", "Ocotillo":"whip", "Aloe Vera":"pulse", "Agave":"pulse", "Desert Rose":"bloom",
    "Golden Barrel Cactus":"pulse", "Willow":"ripple", "Oak":"sway", "Pine":"sway", "Holly Bush":"twinkle",
    "Sage Bush":"shiver", "River Birch Shrub":"sway", "Fern":"unfurl", "Bamboo":"segment", "Succulent":"pulse",
    "Wildflower Fern":"unfurl", "Nebula Pine":"twinkle", "Moon Willow":"twinkle", "Comet Oak":"twinkle",
    "Asteroid Shrub":"sway", "Stardust Sage":"shiver", "Lunar Cactus":"glow", "Star Fern":"twinkle",
    "Moon Bamboo":"glow", "Galaxy Succulent":"twinkle", "Nova Bloom":"bloom",
    "Golden Oak":"twinkle", "Gem Pine":"twinkle", "Sun Palm":"flutter", "Rainbow Sage":"shiver",
    "Moon Cactus":"glow", "Ember Bush":"bloom", "Aurora Fern":"unfurl", "Starlight Bloom":"bloom", "Golden Aloe":"pulse"
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
