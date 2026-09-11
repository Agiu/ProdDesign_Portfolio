^Context
## Trinity is on the rise — but its digital presence hasn't caught up.

==Founded in 1869==, Trinity University sits on a 125-acre hilltop campus near downtown San Antonio and is consistently ranked among the nation's top liberal arts colleges. The academic experience centers on close mentorship, with a student-to-faculty ratio around 9 to 1 across a student body of roughly 2,500 to 2,600.

![](https://media.kaelub.com/TrinityEdu/1.png)

```stats
$2B | Endowment, unheard of for a school this size in the south | Banknote
25% | 2025 acceptance rate, down from roughly 50% a decade ago | Scale
153% | Growth in applicants over the last 15 years | Users
60% | Of students graduate debt free | GraduationCap
```

These numbers show an accelerating institution, but the website carrying them continued to ==bloat==.

==Published in 2016–2017 and mostly unchanged since==, Trinity.edu still worked well for a surveyor or a lurker, but not a prospect student wanting to make a decision, not the current student trying to find information about their classes, nor a curious parent. ==Information was fragmented==. 

Yes there are issues with broken components, messy text, and layouts that make eyes zig-zag, but the main focus should be ==accomodating perspectives.==

//image

> **Image slot:** the annotated current-site screenshots from slides 6–8 (the zig-zag eye path and the broken components), as `![caption](https://media.kaelub.com/TrinityEdu/2.png)`.

^Roadmap
## The Roadmap | The goal, the reasoning behind it, and where the project actually landed.

### The goal
Create new school, department, and program webpages that keep consistency with the other design elements already living on Trinity.edu, and reconfigure navigation around the end user. As Trinity continues to rise in the ranks, we needed a better user experience so that current students and prospects could find useful information quickly.

### Why
Our data showed that most people visiting the site were prospective students rather than current students. That told us one of two things was true: either there was important information missing from the current iteration of the website, or much of what was there simply wasn't needed. We wanted to change that.

> **Add here:** what the analytics actually showed — which pages the prospect traffic was landing on, what current students were failing to find, and why that split pushed the team toward schools/programs/departments instead of the homepage.

### The outcome
Due to a change in leadership, this project was completely disbanded in favor of a full site redesign. Some elements from this project are being carried into that larger redesign.

> **Add here:** which pieces survived into the full redesign and why those were the ones worth keeping — plus what you'd have done differently knowing the project would be folded into something bigger.

^UX Goal
## The User Experience Goal | Not "make it look nice." Make it fast to skim.

The overall goal wasn't to get the website to merely look nice — although that was definitely one of our sub-goals — but to give our numerous personas a way to get to insightful information from the website quickly.

The existing experience is dated, which makes a quick skim for useful information difficult. ==In the age of AI, it also makes web crawler information collection disorganized.== Most students now use AI to look for colleges, so we pushed toward making the website friendly to our AI companions too.

> **Add here:** why designing for crawlers and LLMs became an explicit goal on this project, and what that changed in practice (structure, headings, content chunking, metadata) versus designing for a human skim alone.

## Research | Page audits, outside examples, and five journey maps.

### Page audit and outside examples
For this redesign, our efforts focused on the schools, departments, and programs rather than the homepage, because the timelines we were given were much shorter.

We started with an audit of which webpages needed the most work, and opted to start at the top — the schools. We researched other institutions' school webpages, ideally liberal-arts focused, then built four different example sheets, one per Trinity school, each averaging about six examples to choose from for excellent design and UX standards. Many of those designs came from Ivy League or well-known liberal arts institutions.

Essentially: a lot of analysis of what other websites are doing well and what they could improve upon.

> **Add here:** why the schools were the right entry point rather than the homepage or the program pages, and what criteria you used to judge the outside examples — what made an example "excellent" instead of just pretty.

### Third-party UX research
We had a third-party team come in and audit the current website, and their findings only reinforced the narrative that a redesign was needed. Some issues we already knew about going in, but new ones crept up too.

```insights
San Antonio culture | The site under-represented the city and campus culture that the brand campaign leaned on. | Globe
Video headers | There was no support for a video header, which the new campaign material was built around. | Eye
Program page consistency | Program pages had drifted apart from each other with no shared structure. | Settings
Frustrating navigation | Users struggled to move between schools, departments, and programs. | Route
```

> **Add here:** how much of the third-party audit matched your own internal findings, and where you disagreed with them — an outside audit landing on the same conclusions is worth saying out loud, and so is the part you had to push back on.

### Journey maps
To understand the many perspectives on the Trinity.edu site, I created five journey maps: current student, prospective student, job applicant, alumni, and donor.

These were for gathering pain points in the current site and for telling the team where the hoops are that each of these individuals has to jump through to reach their destination.

I later used those journey maps to build an AI agent that helped us audit all 4,000+ pages on the site for the full redesign project, ==cutting the audit time down by a few months.==

```stats
5 | Journey maps: current student, prospect, job applicant, alumni, donor | Route
4,000+ | Pages audited across the full site | FileText
Months | Of audit time removed by the journey-map-driven AI agent | Clock
```

> **Add here:** how the AI agent actually worked — how the journey maps became the criteria it audited against, what it flagged well, what you had to verify by hand, and why you trusted it enough to run it across 4,000 pages.

## Wireframes | Limitations and liberation.

At first, the schools pages had to keep using the old components, due to budget and leadership priorities. But over the months of redesigning schools, programs, and departments, leadership changed and the mission became to completely redo every component in the Drupal system. It was fair game. ==So the wireframes contain a mix of old elements and new ones.==

> **Add here:** what it was like designing against constraints that dissolved mid-project — what you'd already compromised on, what you went back and reopened once the component library was fair game, and what you chose to leave alone.

### Outcomes first, vibes second
We started with statistics near the top of the hierarchy on the school sites. People want to see outcomes and then vibes, so we approached it uniformly — giving the user what they came for first.

Once the user dove into the pond — into the undergraduate or graduate pages — all programs were listed under their department. That dampened the amount of work the user had to do to find the right information. Now it's all in one place.

> **Add here:** the evidence behind "outcomes then vibes." Where that ordering came from (journey maps? the third-party audit? competitor patterns?) and why the previous marketing-first ordering was costing users.

### Honesty over marketing
We stray away from fully marketed pages almost immediately, right after the user passes the header of the schools page. Prospects want honesty and the grit of the institution — they want to know exactly what they're getting into. So we supply them with current news around campus and the upcoming events for each school.

Users also want personal anecdotes, so we include videos or photos of alumni and current students participating in the activities the schools put on.

> **Image slot:** the wireframe boards from slides 16–18 (statistics hierarchy, department-grouped program lists, news/events section). Drop them in as `![caption](https://media.kaelub.com/TrinityEdu/3.png)` once uploaded.

> **Add here:** how you sold "less marketing copy" to a marketing organization. That's usually the hardest part of a higher-ed redesign, and it's the kind of thing recruiters actually want to read about.

## Designs & Prototypes | Sleeker, more cinematic, and unfinished.

Unfortunately, the designs were never fully completed, due to the change in direction of the project. The mobile formats were finished; the desktop versions were not.

Despite that, the designs are sleeker and more cinematic than their predecessors. It's easy to tell where you are thanks to certain elements near the navbar, and the warmth of Trinity's campus comes through in the darker tones. Information is organized neatly and tells a story.

> **Image slot:** the mobile design frames from slides 20–21. Drop them in as `![caption](https://media.kaelub.com/TrinityEdu/4.png)` once uploaded.

> **Add here:** why darker tones and a more cinematic treatment for a campus known for warmth and mid-century color — the design rationale behind that direction, and how the navbar location cues work.

```button
View the project | https://shorturl.at/v0t4D | FileText
```

## Reflection

> **Add here:** what you took away from the project. It got disbanded, but you walked out with journey maps that powered a 4,000-page AI audit and components that made it into the full site redesign — worth closing on what that taught you about working inside an institution mid-leadership-change.

```recruiter
Work In Progress | This case study is adapted from a presentation I gave at Trinity University. The project was folded into a larger site redesign before the desktop designs were finished — I'm still adding imagery and process detail here. | Clock
```
