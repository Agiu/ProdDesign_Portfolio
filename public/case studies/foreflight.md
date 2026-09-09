## Brief Context| ForeFlight builds the electronic flight bag most U.S. general aviation pilots fly with — flight planning, weather briefings, charts, and a digital logbook that has to hold up the same way a paper one does. I joined the Logbook pod for the summer as a software engineer working directly alongside product design.

```recruiter
Heads Up | Some specifics below are generalized — this project touches live pilot and flight data, so exact numbers, internal names, and teammates are intentionally softened or withheld.
```

Two things filled the twelve weeks: a running list of quality-of-life fixes the Logbook and flight-plan review teams had been meaning to get to, and one larger project — automatically reconciling a pilot's recorded track logs with their logbook.

## Quality-of-Life, One Ticket at a Time | Before the bigger project had a shape, I spent the first few weeks pairing with product design on smaller friction points pilots had been flagging through support tickets and in-app feedback.

- Logbook entries that required re-entering the same tail number and aircraft type on every flight
- A flight-plan review screen that buried weight-and-balance warnings below the fold
- Manual entry fields with no validation, quietly letting in bad dates and durations
- Currency and rating reminders that couldn't be dismissed once a pilot had already acted on them

Working from design mocks and the existing design system, I shipped each of these end to end — front end and the API changes behind them — reviewed by an engineering mentor and checked against the design team's own pilot testing panel before merging.

## The Bigger Project: Logbooks Meet Track Logs | ForeFlight already records a GPS track log for nearly every flight. Pilots still fill out their logbook by hand afterward, copying over times and routes ForeFlight had already recorded automatically.

```stats
12 | weeks on the Logbook pod | Clock
4 | quality-of-life fixes shipped | ClipboardList
1 | matching engine, spec to pilot testing | Route

```

The idea: when a pilot opens an unfinished logbook entry, match it against a recent track log and offer to fill it in — total time, route, and aircraft — for a one-tap confirm instead of a blank form.

### Why Matching Isn't Trivial

A clean one-to-one match between a track log and a logbook entry is the easy case. Most real flights aren't that clean.

```insights
Touch-and-goes look like several flights to a naive matcher | A single pattern session can produce a dozen short landing-to-landing segments that should collapse into one logbook line. | Route
Diversions break simple start/end matching | A flight that lands somewhere other than its filed destination still needs to match the entry the pilot actually logs. | MapPin
Multi-leg trips span more than one track log | A pilot flying three legs in a day may want one entry per leg, or one combined entry — the matcher has to support either. | Waves
Overlapping and duplicate tracks | Two devices recording the same flight, or a re-imported track after a sync issue, shouldn't offer the same match twice. | SplitSquareHorizontal

```

==I designed the matching engine around a scoring pass rather than a strict rule set:== candidate track logs are scored against an open entry on time overlap, airport proximity at each end, and aircraft, then the highest-confidence match is surfaced — never auto-applied. The pilot always sees and confirms what's being filled in before it touches their logbook.

### Building the Review Flow With Design

Because a logbook is a legal record pilots may need for a checkride or an FAA audit, we treated auto-fill as a suggestion the pilot approves, never a silent write. I worked closely with product design on a small set of rules for the review screen:

```rules
Show the match, don't just apply it — every suggested entry surfaces the track log it came from before it fills anything in.
Make the low-confidence case visible — segmented or ambiguous matches are flagged instead of picked silently.
Leave a way out — a pilot can always detach a suggested match and fill in the entry by hand instead.

```

### Where It Landed

By the end of the internship, the matching engine was reconciling track logs against open entries end to end, with the review screen in front of it in testing with the design team's usability panel. ==The goal going into launch is to get a pilot from an empty logbook entry to a single confirm tap== for the flights where a track log already has everything ForeFlight needs.

## Reflection

This was my first time writing software where a mistake doesn't just look bad — it can misstate a legal flight record — which changed how I thought about defaults, confirmations, and what a system should never do silently. Aviation software also runs on its own vocabulary (touch-and-goes, currency, weight-and-balance) that took real conversation with pilots and the design team to actually understand before I could design a matcher around it.

I came into the internship as the engineer on a design-heavy pod, and I left with a much better sense of how to sit next to a product designer through an entire flow — not just build what a spec says, but push back on what a review screen should show, hide, or ask twice before it writes to something a pilot can't easily undo.

**- Caleb Aguiar**
