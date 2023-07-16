# Multi agent city traversal
A simple simulation of agents traveling in a 2d grid. The simulation runs on a static html page using Javascript.
## Introduction

In this website we run a simulation of agents doing tasks in a city. The city is a 2d grid and contains obstacles and goals. Each agent needs to visit all the goals in the grid in order and then go back to its starting position. It's important to note that the agents don't know the layout of the map initial, so they have to fist explore it to find where the goals are.

Once an agent finds all the goals in the map, it will plan it's path and proceed to follow it.

Each agent has a limited amount of energy, and it's decreased by one each time it takes a step. To compensate for this, there are energy pots on the grid which the agents can collect and use to replenish some energy.

Also there is gold on the ground which can be collected by the agents and used.

## Details

To run the simulation simply click "load default map" on the right and then click "start simulation" on the top.

You can monitor the stats of each agent in the tables on the right.


Also under the main grid there is a another grid which displays the memory of an agent. In other words the second grid displays which parts of the map an agent has visited/knows.

You can use the drop-down menu to choose which agent's memory you want to display.

You can also generate a random city grid with your own parameters. Click show input fields, fill in the parameters and then click Initialize random simulation.

At any moment you can pause the simulation with the button on the top and resume it by clicking star again.


When the simulation is paused you can also use the step button to update the simulation one frame at a time.


Each agent uses BFS to create his plan/path. He needs to start from his current position, visit each goal in a special order and then go back to his original starting position (his home) from the beginning of the simulation.

When an agent has created a plan, you can see it in his memory grid as well.


When the first agent successfully completes his task, a pop up message will appear. The simulation is paused but you can resume it to see what the rest of the agents will manage to do.


Each of the tables on the right can also be exported to a csv file.



## Disclaimer

- This project was made for a university project in a relatively short period of time, so please don't take it too seriously. The code is obviously not optimized and I'm sure you will find errors.

- Any external sources used are directly referenced in the code with URLs. Huge shout out to all those people on the internet who provided these code snippets.

- Feel free to use this code if you want.
