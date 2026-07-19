## Overview

Minigolf is an old American delight, now found on bustling city corridors and the occasional wealthy backyard. Full golf is hard to design for the masses, but minigolf made the game approachable by shortening the holes, lowering the cost, and simplifying the tooling (putter). Its core philosophy, shared with arcade games and other mass-produced experiences, is walk-up-and-play: you get your bearings in seconds and immediately start playing whatever's in front of you.

==The challenge for this project wasn’t the concept. Instead it was finding the balance between complexity and clarity that allows for it to stay walk-up-and-play.==  So how do you actually make it more fun?

![Final Experience](https://media.kaelub.com/Minigolf/1.png)

My group and I started with themes that felt nostalgic to us. We explored old arcade games, amusement parks, and water concepts before falling for circus theming. Circuses invite spontaneity and lean on organic materials like wood and greenery, and we saw the theme as a way to add potential fun rather than friction.

![Initial ideas and potential aesthetics to use for our project](https://media.kaelub.com/Minigolf/2.jpg)

Unfortunately, we thought we had an advantage due to our theme. We got so absorbed in repurposing old props and stacking circus features that the design turned complex and messy. It drifted away from the walk-up-and-play experience we set out to build, and we didn't notice until we were deep in it. So how did we get out?

## Collaborative Golf As A Concept

As a group, we began by sketching out interactions our players will end up experiencing regardless of theming. Essentially building up the technology behind it before grounding them in a setting which will come later. 

![Cohort-wide critique where people selected which ideas sounded best](https://media.kaelub.com/Minigolf/3.JPG)

After a critique session, we discussed lots about creating something collaborative, extremely player oriented. Concepts like: deathrun, where you have one player be a nemesis of another player — attempting to prevent them from finishing tasks; draw together, a concept where you draw a path for the golf ball to follow and you need to work as a team to solve the puzzle of getting that ball to a hole; race golf — a concept where players race against each other to the main hole. There were many more, but this describes the headspace my group was in when creating ideas for interactions.

![After-critique Ideation Board](https://media.kaelub.com/Minigolf/4.jpg)

So we went forward with a few ideas:

```insights
Surf Golf | The player leans and shifts their weight to bend the course itself. | Waves
Draw Together | One player builds the path in real time while another navigates the ball. | Pencil
Smash Putt | A physical, break-things concept where obstacles get knocked over or revealed by your shots. | Hammer
```

From what we saw during the critique session, there was a recurring hesitation which was almost always about feasibility. Critics loved the interactions but questioned how a mechanically actuated surface or a course built in real time would actually get built.

After much discussion, we went on to create prototypes for an idea that seemed most feasible, which was a new version of ‘Draw Together’.

## Creating a Fun Game Is Hard...

To sell the idea to the class, I created a video that would demonstrate what this new ‘Draw Together’ concept is:

```youtube
gjN8E-eonEY
```

It was fun to put together, however what we discovered during the filming process, the two player interaction posed many friction issues, even while we played it.

```insights
Feasibility & Budget | We were thinking of using acrylic tiles, but it would go over budget very quickly. | Banknote
Setup Time | Walking up and playing works, but the setup process takes a while. | ClockAlert
Fragility | Lots of moving parts, things could break easily. | TriangleAlert
```

==So we came together and created a new temporary concept and playtested it!==



### User Testing

All 3 of our participants were males, ranged from 20-30s, had previous experience with mini golf, and were from outside the cohort.

```stats
3 | Total Participants (Males, 20-30s) | Users
100% | Had previous mini golf experience | Target
2 | Play modes tested (Build vs. Prebuilt) | Gamepad2
```

==We had participants start with mode 1:== building the course themselves and then asked them to do ==mode 2:== walk up and play. We asked a standard set of quantitative and qualitative questions after each mode then had a general debrief to finish the session. 

Not surprising (in theory), but always surprising in practice, users interacted with the course differently than we expected.

==We realized that we require clearer guidelines for how our courses should be interacted with.==

```insights
Mode Preferences | Some preferred building their own course, while others liked the surprise of playing a prebuilt one to focus on the challenge. | SplitSquareHorizontal
Clarity Pain Point | Players were unsure where to place obstacles and how to orient pieces during 'build' mode. | CircleHelp
Theme & Fun | The circus theme was clear and well-liked, and the fun meter averaged 7.5 (which was okay). | Smile
```

```youtube
hwR3-oH-lSk
```

==We also found that the circus theme was very clear, and well liked. But the fun meter was hitting an average of 7.5, which was ok.==

### Setting Up Guardrails

Time was running out and we needed to fix these issues or perhaps re-think what we’re trying to create. We came together at the end and established some ground rules that we didn’t have before.


```rules
Cut out iterations that will introduce friction such as variability to ideally get rid of thousands of guidelines that will plague the walk-up-and-play fundamentals.
For set design, bring it closer to traditional minigolf. Many of our peers were steering away, we needed at least one that takes us back… our nostalgic idea came back full circle for this.
Create clearer instructions.
```

### Here's how it's looking after those guideline changes

```youtube
v5mqxpzxcH8
```

## Onwards, Toward the Finish Line

==One of my groupmates and I went to Home Depot to start building out the environment.== We bought the cheapest wood we could find to act as our floorboards — and to attach interactive materials.
The other half of my group redesigned the layout to be more adventurous but leading and I planned, built, and programmed an interactive part of our course.

![Home Depot trip to start building our course](https://media.kaelub.com/Minigolf/8.jpg)

### Building the interactive bits

I personally created an on-brand loop-te-loop feature that the ball travels through when the player hits it hard enough, then wrote out some code for an IR sensor to trigger circus lights to emit. 

```ide
let toggle = false
let stopTime = 0
let strip = light.createStrip(pins.A2, 60)
strip.setBrightness(255)
// 1. Turn on buffering. Changes will now be saved in
// memory (an array) instead of being sent to the
// strip one by one.
strip.setBuffered(true)
let isReady = true
forever(function () {
    if (pins.A0.digitalRead() == false && isReady == true) {
        isReady = false
        stopTime = control.millis() + 5000
        while (control.millis() < stopTime) {
            // This loop now just updates the CPX's internal
            // memory super fast
            for (let i = 0; i <= 63; i++) {
                if (toggle == true) {
                    if (i % 2 == 0) {
                        strip.setPixelColor(i, 0xff0000)
                    } else {
                        strip.setPixelColor(i, 0xff8000)
                    }
                } else {
                    if (i % 2 == 0) {
                        strip.setPixelColor(i, 0xff8000)
                    } else {
                        strip.setPixelColor(i, 0xff0000)
                    }
                }
            }
            // 2. Push the entire memory array to the LED strip
            // all at exactly the same time!
            strip.show()
            toggle = !(toggle)
            pause(500)
        }
        // Turn off the lights
        light.clear()
        strip.clear()
        // 3. Because we are buffering, we MUST call show()
        // after clear() to push the "off" state
        strip.show()
        pause(15000)
        isReady = true
    } else if (isReady == true) {
        // Keep everything off while waiting
        light.clear()
        strip.clear()
        strip.show()
    }
})
```

This essentially boils down to allowing detection of an IR sensor that is connected to a CPX. On detect, whatever pin A0 is affected by, loop through a sequence of different colors back and forth, creating that quintessential warm lightbulb on a sign effect that many circuses have.

To make sure we dont have the lights on the entire time, I set a timer on the code to turn the lights off after 5 seconds, and then a delay for 15 seconds to make sure that the lights aren't going off every time a player is playing the course. 


### Lights In Action
```youtube
kF8Cdi1qclY
```

### Other Additions
After the lights were complete, I worked on solidifying the loop I created, adding cardboard and studier paper to make it more visually appealing to the audience. My groupmmate added in the design and colors.

![Fire Loop and Design completed by a teammate of mine, I made the structure](https://media.kaelub.com/Minigolf/6.jpg)

I personally felt like we didn’t have enough to bring in the surprise element of our course yet, so I went ahead and (while under the weather) built another interactive area near the hill my groupmate Alex created. This allowed for a shortcut to the main hole that people so desperately tried to get to when playing the game. It turned into a fun competition that may or may not go the way people intended.

![Work in progress picture of the shortcut a player could make. Built it in a few hours and solidified it for play the next day.](https://media.kaelub.com/Minigolf/7.jpg)


## A Minigolf Course Built On Nostalgia and Spontaneity 

```youtube
ebmZ0KxAh34
```

Despite how difficult it was to find a balance between complexity and clarity, I think we got our minigolf course as close as possible to our original intent of having it be walk-up-and-play while striking that balance of a frictionless experience.

I would have changed many things about our course, however given the time constraint of 10 weeks, I am proud of what we created.

We were one of the only groups that built a robust interactive course, where nothing broke down over the span of 3 hours that this was up. Probably an unimpressive time, however, many groups had issues with their code going off and never turning back on, or not working at all.

Here are some stats that I collected during the MHCI+D Golfing day:

```stats
70+ | People played our game | Users
20 | People used the shortcut I created | Route
1 | Former Head of Research at Meta Reality Labs played our game | Star
```


```youtube
HKwCD0e1efs
```