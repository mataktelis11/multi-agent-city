// Multi agent city main script

////////////////////// Global Parameters ////////////////////////////////

// Map size
var numRows = 30; 			// Number of rows in the grid 80
var numCols = 30; 			// Number of columns in the grid 80

// Map entities
var numAgents = 6; 		// Number of agents 10
var numGoals = 3; 			// Number of goals 5
var numWalls = 100;			// Number of walls 730
var numEnergyPots = 40;	// Number of energy pots 100
var numGold = 2;			// Number of gold tokens 45

var agentEnergy = 120;		// Base/Max energy of an agent 35

// Prices
var energyPotPrice = 2;		// Price of Energy pot in gold
var mapPrice = 3;			// Price of map in gold

var energyPerPot = 40;		// Energy points given by one pot


var agent_memory;

var monitorAgent = 0;

var currentIteration = 0;

var grid = createGrid(numRows, numCols);
var agents;
var energyValues;
var collectedGold;
var collectedPots;

var stop = false;

///////////////////////////////////////////////////////////////////////

// utility functions
function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min+ 1) ) + min;
}


function containsObject(obj, list) {
    var i;
    for (i = 0; i < list.length; i++) {
        if (list[i].row === obj.row && list[i].col === obj.col) {
            return true;
        }
    }
    return false;
}

// source: https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffle(array) {
    let currentIndex = array.length,  randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }

    return array;
}

// initialize  2D grid
function createGrid(rows, cols) {
    var grid = [];
    for (var i = 0; i < rows; i++) {
        var row = [];
        for (var j = 0; j < cols; j++) {
            row.push(0);
        }
        grid.push(row);
    }
    return grid;
}


function createGridMEM(rows, cols) {
    var grid = [];
    for (var i = 0; i < rows; i++) {
        var row = [];
        for (var j = 0; j < cols; j++) {
            row.push(false);
        }
        grid.push(row);
    }
    return grid;
}	

        
function createEntities(numRows, numCols, numAgents, numGoals, numWalls, numEnergyPots, numGold) {
    all = [...Array(numRows*numCols).keys()];
    all =  shuffle(all); 
    
    entities = all.slice(0,numAgents + numGoals + numWalls + numEnergyPots + numGold);
    
    k = 0;
    
    for (var i = 0; i < numAgents; i++) {
    
        var y = Math.floor(entities[k]/numCols);
        var x = entities[k] - (y*numCols);
        agents.push({ row: x, col: y });
        
        k = k + 1;
    }
    
    for (var i = 0; i < numGoals; i++) {
        var y = Math.floor(entities[k]/numCols);
        var x = entities[k] - (y*numCols);
        grid[x][y] = i;
        k = k + 1;
    }

    for (var i = 0; i < numWalls; i++) {
        var y = Math.floor(entities[k]/numCols);
        var x = entities[k] - (y*numCols);
        grid[x][y] = -1;
        k = k + 1;
    }
    
    for (var i = 0; i < numEnergyPots; i++) {
        var y = Math.floor(entities[k]/numCols);
        var x = entities[k] - (y*numCols);
        grid[x][y] = -2;
        k = k + 1;
    }
    
    for (var i = 0; i < numGold; i++) {
        var y = Math.floor(entities[k]/numCols);
        var x = entities[k] - (y*numCols);
        grid[x][y] = -3;
        k = k + 1;
    }
}





// Update grid and display
function updateGrid() {
    var table = document.getElementById("grid");
    table.innerHTML = "";

    for (var i = 0; i < numRows; i++) {
        var row = document.createElement("tr");
        for (var j = 0; j < numCols; j++) {
            var cell = document.createElement("td");
            
            var obj = { row: i, col: j };
            //console.log(obj)
            
            if (grid[i][j] === -3) {
                
                cell.className = "empty";

                var element = document.createElement("div");
                element.className = "gold";
                cell.appendChild(element);

                

            } else if (grid[i][j] === -2) {

                cell.className = "empty";

                var element = document.createElement("div");
                element.className = "energypot";
                cell.appendChild(element);

                
            } else if (grid[i][j] === -1) {
                cell.className = "wall";
            } else if (grid[i][j] > 0) {
                cell.className = "goal";
            } else {
                cell.className = "empty";
            }

            row.appendChild(cell);
        }
        table.appendChild(row);
    }
    
    
    // draw agents
    for (var i = 0; i < numAgents; i++) {
        var agentCell = agents[i];

        var agentTd = table.rows[agentCell.row].cells[agentCell.col];
        var agentElement = document.createElement("div");
        agentElement.className = "agent";
        agentTd.appendChild(agentElement);
    }
    
    var par = document.getElementById("iteration");
    par.innerHTML = "Iteration: " + currentIteration;
}


function updateGridMonitor(index) {
    var table = document.getElementById("monitorTable");
    table.innerHTML = "";

    var curr_mem = agent_memory[index];

    for (var i = 0; i < numRows; i++) {
        var row = document.createElement("tr");
        for (var j = 0; j < numCols; j++) {
            var cell = document.createElement("td");
            
            var obj = { row: i, col: j };
            //console.log(obj)
            
            if (curr_mem[i][j] === true) {
                cell.className = "visited";
                if(grid[i][j]==-1){
                    cell.className = "wall";
                }else if(grid[i][j]>0){
                    cell.className = "goal";
                }
            } else {
                cell.className = "empty";
            }



            row.appendChild(cell);
        }
        table.appendChild(row);
    }

    // draw agent
    var agentCell = agents[index];

    var agentTd = table.rows[agentCell.row].cells[agentCell.col];
    var agentElement = document.createElement("div");
    agentElement.className = "agent";
    agentTd.appendChild(agentElement);

}

// get neighboring cells
function getNeighbors(cell) {

    var neighbors = [];
                
    // all possible neighbors
    var leftNeighbor = { row: cell.row, col: cell.col - 1 };
    var rightNeighbor = { row: cell.row, col: cell.col + 1 };
    var topNeighbor = { row: cell.row - 1, col: cell.col };
    var bottomNeighor = { row: cell.row + 1, col: cell.col };

    

    // check left neighbor
    if (cell.col > 0 && grid[cell.row][cell.col-1]!=-1 && !containsObject(leftNeighbor,agents)) {
        neighbors.push(leftNeighbor);
    }

    // check right neighbor
    if (cell.col < numCols - 1 && grid[cell.row][cell.col+1]!=-1 && !containsObject(rightNeighbor,agents)) {
        neighbors.push(rightNeighbor);
    }

    // check top neighbor
    if (cell.row > 0 && grid[cell.row-1][cell.col]!=-1 && !containsObject(topNeighbor,agents)) {
        neighbors.push(topNeighbor);
    }

    // check bottom neighbor
    if (cell.row < numRows - 1 && grid[cell.row+1][cell.col]!=-1 && !containsObject(bottomNeighor,agents)) {
        neighbors.push(bottomNeighor);
    }

    return neighbors;
}


// get neighboring cells
function getAllNeighbors(cell) {

    var neighbors = [];
                
    // all possible neighbors
    var leftNeighbor = { row: cell.row, col: cell.col - 1 };
    var rightNeighbor = { row: cell.row, col: cell.col + 1 };
    var topNeighbor = { row: cell.row - 1, col: cell.col };
    var bottomNeighor = { row: cell.row + 1, col: cell.col };

    

    // check left neighbor
    if (cell.col > 0) {
        neighbors.push(leftNeighbor);
    }

    // check right neighbor
    if (cell.col < numCols - 1) {
        neighbors.push(rightNeighbor);
    }

    // check top neighbor
    if (cell.row > 0) {
        neighbors.push(topNeighbor);
    }

    // check bottom neighbor
    if (cell.row < numRows - 1) {
        neighbors.push(bottomNeighor);
    }

    return neighbors;
}


// get next cell for agent
function getNextCell(cell) {
    var neighbors = getNeighbors(cell);



    return neighbors[getRndInteger(0, neighbors.length - 1)];
}

// explore blind
function make_a_move(i){

    
    var curr_mem = agent_memory[i];
    curr_mem[agents[i].row][agents[i].col] = true;

    var neighbors = getNeighbors(agents[i]);

    for(var k=0; k<neighbors.length; k++){
        if(curr_mem[neighbors[k].row][neighbors[k].col] == false)
            return neighbors[k];
    }

    return neighbors[getRndInteger(0, neighbors.length - 1)];
}


function make_a_move2(i){

    
    var curr_mem = agent_memory[i];
    curr_mem[agents[i].row][agents[i].col] = true;

    var neighbors = getNeighbors(agents[i]);

    neighbors = shuffle(neighbors);

    for(var k=0; k<neighbors.length; k++){
        curr_mem[neighbors[k].row][neighbors[k].col] = true;
    }

    for(var k=0; k<neighbors.length; k++){
        var neighborsDeep = getNeighbors(neighbors[k]);
        neighborsDeep = shuffle(neighborsDeep);

        if(neighborsDeep.length==0){
            console.log("EMPTY DEEP search")
            continue;
        }
            

        for(var j=0; j<neighborsDeep.length; j++){
            if(curr_mem[neighborsDeep[j].row][neighborsDeep[j].col] == false)
                return neighborsDeep[j];
        }

        
    }

    if(neighbors.length==0){
            console.log("EMPTY SEARCH") // THIS BREAKS THE PROGRAM
        }

    return neighbors[getRndInteger(0, neighbors.length - 1)];
}

function make_a_move3(i){
    var curr_mem = agent_memory[i];
    curr_mem[agents[i].row][agents[i].col] = true;

    var neighbors = getAllNeighbors(agents[i]);
    neighbors = shuffle(neighbors);

    var possibleChoices = [];

    for(var k=0; k<neighbors.length; k++){

        var x = neighbors[k].row;
        var y = neighbors[k].col;

        curr_mem[x][y] = true;

        if(grid[x][y]>0){
            // found a goal
        }

        if(containsObject(neighbors[k],agents)){
            // found an agent
        }	

        if(grid[x][y]==0 && !containsObject(neighbors[k],agents)){
            possibleChoices.push(neighbors[k]);
        }

    }

    for(var k=0; k<neighbors.length; k++){

        var x = neighbors[k].row;
        var y = neighbors[k].col;

        if(grid[x][y]==-2 && energyValues[i] <= energyPerPot*2){
            return neighbors[k];
        }

        var neighborsDeep = getAllNeighbors(neighbors[k]);
        neighborsDeep = shuffle(neighborsDeep);


        if(neighborsDeep.length==0){
            console.log("EMPTY DEEP search")
            continue;
        }
            

        for(var j=0; j<neighborsDeep.length; j++){
            if(curr_mem[neighborsDeep[j].row][neighborsDeep[j].col] == false && grid[x][y]==0 && !containsObject(neighborsDeep[j],agents))
                return neighbors[k];
        }
    }		

    return possibleChoices[getRndInteger(0, possibleChoices.length - 1)];

}

function checkEnd() {
    var sum = 0;
    for (var i = 0; i < numAgents; i++) {
        sum += energyValues[i];
    }

    if(sum==0)
        return true;
    
    return false;
}



// run simulation of one step
function update() {

    if(stop) return;

    // Move each agent
    for (var i = 0; i < numAgents; i++) {

        if(energyValues[i]==0)
            continue;

        // if agent has energy pots
        if(collectedPots[i]>0){
            // if agent's lost energy greater than energyPerPot, consume a pot
            if(agentEnergy - energyValues[i] >= energyPerPot){
                collectedPots[i] -= 1;
                energyValues[i] += energyPerPot;
            }
        }
        

        var currentCell = agents[i];
        //var nextCell = getNextCell(currentCell);
        var nextCell = make_a_move3(i);
        agents[i] = nextCell;

        energyValues[i] -= 1;

        if(grid[nextCell.row][nextCell.col] == -3){
            console.log(`Agent ${i} collected gold`);
            grid[nextCell.row][nextCell.col] = 0;
            collectedGold[i] += 1;
        }

        if(grid[nextCell.row][nextCell.col] == -2){
            console.log(`Agent ${i} collected energy Pot`);
            grid[nextCell.row][nextCell.col] = 0;
            collectedPots[i] += 1;
        }

        //grid[currentCell.row][currentCell.col] = 1;
        //grid[nextCell.row][nextCell.col] = 1;
        
    }

    updateMonitor();

    updateGrid();
    updateGridMonitor(monitorAgent);
    // itetation limit
    currentIteration= currentIteration + 1;

    if(!checkEnd())
        setTimeout(update, 40);
}	




function startSimulation(){

    stop = false;
    // Start simulation
    updateGrid();

    update();

}

function pauseSimulation() {
    stop = true;
}

function initializeSimulation() {

    // halt simulation
    stop = true;
    currentIteration = 0;
    
    grid = createGrid(numRows, numCols);

    agents = [];
    energyValues = new Array(numAgents).fill(agentEnergy);
    collectedGold = new Array(numAgents).fill(0);
    collectedPots = new Array(numAgents).fill(0);

    createEntities(numRows, numCols, numAgents, numGoals, numWalls, numEnergyPots, numGold)
    updateGrid();


    agent_memory = [];
    for(var i=0; i<agents.length; i++){
        agent_memory.push(createGridMEM(numRows, numCols));
    }




    var table = document.getElementById("monitor")

    table.innerHTML="";

    var row = table.insertRow(-1);
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var cell3 = row.insertCell(2);
    var cell4 = row.insertCell(3);
    cell1.innerHTML = "Agent";
    cell2.innerHTML = "Energy Pots";
    cell3.innerHTML = "Gold";
    cell4.innerHTML = "Energy";

    for(var i=0; i<agents.length; i++){
        var row = table.insertRow(-1);
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        var cell3 = row.insertCell(2);
        var cell4 = row.insertCell(3);
        cell1.innerHTML = i;
        cell2.innerHTML = "0";
        cell3.innerHTML = "0";
        cell4.innerHTML = agentEnergy;
    }	


    // <li><a class="dropdown-item">0</a></li>
    // 		  <li><a class="dropdown-item">1</a></li>
    // 		  <li><a class="dropdown-item">2</a></li>


    var ul = document.getElementById("monitorUIlist");

    ul.innerHTML = "";

    for(var i=0; i<agents.length; i++){
        var li = document.createElement("li");
        li.appendChild(document.createTextNode(i));
        li.setAttribute("class", "dropdown-item");
        li.setAttribute("onclick", "setMonitorAgent("+i+")");
        ul.appendChild(li);
    }	

}


function setMonitorAgent(index) {
    monitorAgent = index;
    updateGridMonitor(monitorAgent);
    var button = document.getElementById('monitorUIbutton');
    button.innerText = index;
}

function updateMonitor(){
    var table = document.getElementById("monitor")

    for(var i=0; i<agents.length; i++){
        table.rows[i+1].cells[1].innerHTML = collectedPots[i];
        table.rows[i+1].cells[2].innerHTML = collectedGold[i];

        if(energyValues[i]==0)
            table.rows[i+1].cells[3].innerHTML = "0 ☠️";
        else
            table.rows[i+1].cells[3].innerHTML = energyValues[i];
    }	
}

// on load:
initializeSimulation();