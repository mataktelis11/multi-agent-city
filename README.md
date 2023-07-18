# Multi agent city traversal
![GitHub top language](https://img.shields.io/github/languages/top/mataktelis11/multi-agent-city)
![GitHub](https://img.shields.io/github/license/mataktelis11/multi-agent-city)

A simple simulation of agents traveling in a 2d grid. The simulation runs on a static html page using Javascript. Try it [here](https://mataktelis11.github.io/multi-agent-city/).

## Introduction

In this website we run a simulation of agents doing tasks in a city. The city is a 2d grid and contains walls (obstacles) and goals. Each agent needs to visit all the goals in the grid in order and then go back to its starting position. It's important to note that the agents don't know the layout of the map initial, so they have to fist explore it to find where the goals are. Bellow is an example of the app running. The 2d grid is visualized in an html table.

<img src="https://github.com/mataktelis11/multi-agent-city/assets/61196956/1b94013a-b01d-462a-a1a7-12a88e1a46e0" width="400">

Once an agent finds all the goals in the map, it will plan it's path and proceed to follow it. Each agent has a limited amount of energy, and it's decreased by one each time it takes a step. To compensate for this, there are energy pots on the grid which the agents can collect and use to replenish some energy. Also there are gold tokens on the ground which can be collected by the agents and used. An agent can use gold in order to buy an energy pot from a neighboring agent or sell his knowledge of the map.

Under the main table we display the knowledge of a specified agent. As the agent explores the grid, it marks which cells he visited and tries to explore as much of the map as possible. Once all the goals are found, the agent will plan a path using BFS. This path visits all the goals and returns to the agent's original starting position.


The agent's knowledge of the map may increase dramatically sometimes, because it will trade knowledge with other agents.


## Usage

To run the simulation simply click "Initialize Random Simulation" on the right and then click "Start Simulation" on the top.

You can monitor the stats of each agent in the tables on the right.

Each time you click "Initialize Random Simulation" a random grid will be generated. You can click the button "Show/Hide Input fields" to see all the available parameters. In the parenthesis we specify the default value that will be used if you do not fill in the specific field. After you fill in the inputs you want, click "Initialize Random Simulation".

At any moment you can pause the simulation with the button on the top and resume it by clicking the start button again. If the simulation is paused you can use the "Step simulation" button to update the grid one step at a time.

Each agent uses **BFS** to create his plan/path. He needs to start from his current position, visit each goal in a special order and then go back to his original starting position (his home) from the beginning of the simulation. When an agent has created a plan, you can see it in his memory grid as well (yellow).



When the first agent successfully completes his task, a pop up message will appear. The simulation is paused but you can resume it to see what the rest of the agents will manage to do.


Each of the tables on the right can also be exported to a csv file by pressing the corresponding button.


## Implementation

This app consists of only Html and Javascript, so it can be deployed to Github pages and used immediately be any browser. I also used Bootstrap (5.3) to give a somewhat better look to the page.

Keep in mind that for a grid of size bigger than $50 \times 50$ the app can get slow quite easily.

## Disclaimer

- This project was made for a university project (course name is 'Intelligent Agents') in a relatively short period of time, so please don't take it too seriously. The code is obviously not optimized and I'm sure you will find errors.

- The reason I used Html and Javascript is because I wanted to also try out Github pages. I am aware this implementation is not ideal.

- Any external sources used are directly referenced in the code with URLs. Huge shout out to all those people on the internet who provided these code snippets.

- Feel free to use this code if you want.
