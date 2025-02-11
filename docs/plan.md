# The plan for job-nobber

Note: phases can overlap in some places

### Phase 1

* many steps
* got paid

### Phase 2

* convert specification into markdown document in docs
* create mockup outline for data in docs
* create express endpoints for all major data types, jobs, visits, events, etc
  * boilerplate code
* create mock data endpoint in express
  * a list of 3 json objects with mocked data
* wire react up to data type endpoints
  * petty print json to a <div><pre> for client to see actual data

### Phase 3

* work with client and the data type data from phase 1
* massage react and mocked data until it is exactly what he wants
* client signs off on the final draft

### Phase 4

* create queries into jobber to get the exact data from the final draft
* create express endpoints as needed
* create tests

### Phase 5

#### add data caching

  * schedule to poll jobber and dump to database
  * wire react up to view data from database
  * wire react up to change notifications from database

### Phase 6

#### add end-user communication

  * switch to a real authentication system
    * auth is REALLY hard to get right, and REALLY bad when you inevitably don't get it right
  * user mapping?
    * role based from real auth?
  * end-user add note to job, visit, etc, data into database, not jobber
  * chat?  integrate 3rd party service, too much complexity for what he is paying

### Phase 7

  * documentation
  * tests

### Phase 8

* get paid again
