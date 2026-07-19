## About WOS (WIP)

Who Owns Seattle is a data visualizer that presents a timeline of ownership through multiple neighborhoods in the downtown Seattle area. It reveals economic patterns and companies or notable developers who dictate the landscape of downtown Seattle using some publicly accessible data from King County. 

![](https://media.kaelub.com/WOS/1.png)

![](https://media.kaelub.com/WOS/2.png)

![](https://media.kaelub.com/WOS/3.png)


## A little history | ==An urban studies interest of mine, sorry==

Seattle’s downtown area has seen a dramatic price increase in the last few decades. What once was a shipyard and supply chain dock is now one of the most important tech centers on Earth. I recently visited downtown and was struck by the aesthetic architectural differences between two neighborhoods located downtown: Pioneer Square and South Lake Union. Pioneer square still exudes old Seattle—exposed brick, not ADA compliant or earthquake proof, but still lots of character; while the other pushes a corporate and sleek narrative meant only for tech bros, salarymen, and wealthy individuals. 

These neighborhoods are just a few miles apart from each other, and in the same economic bubble, but are vastly different despite both areas looking roughly the same 50-70 years ago.

![](https://media.kaelub.com/WOS/4.jpg)

## Look at how different the buildings look, now!
Through Paul Allen’s assistance (Co Founder of Microsoft), in the 90s, South Lake Union was meant to become something similar to New York City’s Central Park through an initiative titled the ‘Seattle Commons’.

![Citation: https://www.historylink.org/File/8252](https://media.kaelub.com/WOS/5.png)

However, as much as I would have personally enjoyed this, the resolution in the 90s did not pass. So Paul Allen had to turn it into something profitable through his real estate company called [Vulcan Real Estate](https://vulcanrealestate.com/).

Over the years this company has turned Paul Allen’s estate into a multibillion dollar real estate portfolio by just developing on the land that was initially meant to house a park for Seattleites to use. So what did Vulcan do with all that land? 


## Who Owns Seattle?

I wanted to dive deeper into what this company has turned South Lake Union into, and track how the landscape has changed hands over time. I also wanted to take advantage of some artificial intelligence to speed up the process of this project, so I utilized Claude to help me find data and develop part of an app to tell a story about data through time.

Downtown Seattle has many owners, obviously, but the richest tend to dictate who gets to live in that area because of their real estate developmental decisions. If there's a need for more housing, especially for workers, a growing economy will make more expensive housing to accommodate for the rising land costs so they could potentially turn a profit after a few years. 

==As of late the Seattle downtown real estate market has been declining due to increased development in apartment buildings as well as migration of office workers to remote work — less office space usage which accounts for a large portion of buildings in downtown Seattle.==


==Remote work is great for convenience and from a workers' rights standpoint.== Unfortunately it's not particularly great for companies if most workers live in the suburbs — essentially destroying foot traffic downtown and declining the economic benefits there once was for businesses, as seen during COVID. This is another story I will not completely dive into, it's a difficult problem to solve — not everyone will be happy.

In short, large corporations can dictate a geographical economy easily and influence attributes of a city that goes past economics. It shapes the look and the experience people strolling around the city. 

## Parsing King County Data | ==For fun I tend to look at King County's Parcel Viewer, my interest in maps collides heavily with real estate data using this platform.==

### Legality Disclaimer
I'm doing this as a personal project and will not be publishing the entire codebase due to the fragility of the data i've collected from King County. Since I'm a student at UW not doing sponsored research, I do not have access to any datasets that have protected data, i.e. owner names — which I need for this project to work.

In the future I could directly contact King County to work in tandem, however I wanted to try building a suitable prototype first.

### Creating a tool to parse public king county webpages
Because King County's parcel dataset is locked behind a paywall, I had to create a new method to collect parcel data. I essentially built a python and javascript webscraper that goes to a parcel address in the king county parcel viewer and returns back the html tables seen on that page. It's dirty, but it gets the job done.

I then created another tool using Claude to automate the parcel collection process. This would have been 2 days of total work to map the entire SLU area, instead it took me 30 minutes — thanks Claude.

![Code Snippet to parse king county parcel viewer](https://media.kaelub.com/WOS/7.png)

Initially I let the parsing tool parse whatever it dictated as the SLU area, however I realized if I had more control my results would be better — go figure.

![Some parcel numbers used for the initial SLU data collection](https://media.kaelub.com/WOS/6.png)

Parcel numbers are a really good uniqueID for a database, so instead of addresses king county uses parcel numbers to uniquely identify each property within its borders. Making it much easier for me to collect the right data from the online website — parcel numbers are part of the field you can query the tool with, thankfully.

```button 
View the tool and automater | https://github.com/Kaelubagu/King-County-Data-Parser |FileMap
```




```recruiter
Work In Progress | This case study represents a project I am actively working on. Check back later for more updates on the app design and data visualizations! I'm Currently working on the data analysis and making a spreadsheet into a database. | Clock
```


