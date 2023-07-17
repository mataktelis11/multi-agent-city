// Multi agent city main script

////////////////////// Global Simulation Parameters ////////////////////////////////

// Map size
var numRows = 30; 			// Number of rows in the grid 80
var numCols = 30; 			// Number of columns in the grid 80

// Map entities number
var numAgents = 10; 		// Number of agents 10
var numGoals = 2; 			// Number of goals 5
var numWalls = 70;			// Number of walls 730
var numEnergyPots = 40;	    // Number of energy pots 100
var numGold = 40;			// Number of gold tokens 45

// Prices and Energy
var agentEnergy = 120;		// Base/Max energy of an agent 35
var energyPotPrice = 1;		// Price of Energy pot in gold
var mapPrice = 1;			// Price of map in gold
var energyPerPot = 60;		// Energy points given by one pot

var delay = 40;             // dey between ticks of the simulation

///////////////////////////////////////////////////////////////////////////

// agent fields
var agents;
var agentStartingPositions;
var agent_memory;
var energyValues;
var collectedGold;
var collectedPots;
var goalsFound;
var paths;
var pathIndex;
var agentInitialPos;

var agentSteps;
var agentsExecutingPlan;
var agentDone;
var numAgentsDone;

var trade;
var numOfTrades;

var goals;

// main map grid
var grid = createGrid(numRows, numCols);

var bfsGrid = createGrid(numRows, numCols);

// UI variables
var stop = false;
var monitorAgent = 0;
var currentIteration = 0;

/////////////////////////////////////////////////////////////////////////

////////////// utility functions /////////////////////////

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


function containsAgent(obj, list) {
    var i;
    for (i = 0; i < list.length; i++) {
        if (list[i].row === obj.row && list[i].col === obj.col) {
            return i;
        }
    }
    return -1;
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

///////////////////////////////////

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
    
        var y = Math.floor(entities[k]/numRows);
        var x = entities[k] - (y*numRows);
        agents.push({ row: x, col: y });
        k = k + 1;
    }
    
    for (var i = 0; i < numGoals; i++) {
        var y = Math.floor(entities[k]/numRows);
        var x = entities[k] - (y*numRows);
        grid[x][y] = i+1;
        goals.push({ row: x, col: y });
        k = k + 1;
    }

    for (var i = 0; i < numWalls; i++) {
        var y = Math.floor(entities[k]/numRows);
        var x = entities[k] - (y*numRows);
        grid[x][y] = -1;
        k = k + 1;
    }
    
    for (var i = 0; i < numEnergyPots; i++) {
        var y = Math.floor(entities[k]/numRows);
        var x = entities[k] - (y*numRows);
        grid[x][y] = -2;
        k = k + 1;
    }
    
    for (var i = 0; i < numGold; i++) {
        var y = Math.floor(entities[k]/numRows);
        var x = entities[k] - (y*numRows);
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

            //cell.innerText = bfsGrid[i][j];


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


    if(goalsFound[index] == numGoals){

        // draw agent planned path
        for(var k=0; k<paths[index].length; k++){
            var step = paths[index][k];

            table.rows[step.row].cells[step.col].className = "path";
        }

        // redraw the goals
        for(var k=0; k<numGoals; k++){
            var goal = goals[k];
            table.rows[goal.row].cells[goal.col].className = "goal";
        }


        //agentInitialPos[i]

        table.rows[agentInitialPos[index].row].cells[agentInitialPos[index].col].className = "initial"

    }




    table.rows[agentStartingPositions[index].row].cells[agentStartingPositions[index].col].className = "start"

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


// explore blind
function make_a_move(i){
    var curr_mem = agent_memory[i];
    curr_mem[agents[i].row][agents[i].col] = true;

    var neighbors = getAllNeighbors(agents[i]);
    neighbors = shuffle(neighbors);

    var possibleChoices = [];

    for(var k=0; k<neighbors.length; k++){

        var x = neighbors[k].row;
        var y = neighbors[k].col;

        
        if(grid[x][y]>0){
            // found a goal
            if(curr_mem[x][y] != true){
                console.log(`Agent ${i} found a goal`)
                goalsFound[i] += 1;
            }
        }

        if(containsObject(neighbors[k],agents)){
            // found an agent
        }	

        curr_mem[x][y] = true;


        if(grid[x][y]==0 && !containsObject(neighbors[k],agents)){
            possibleChoices.push(neighbors[k]);
        }

    }

    for(var k=0; k<neighbors.length; k++){

        var x = neighbors[k].row;
        var y = neighbors[k].col;

        if((grid[x][y]==-2 || grid[x][y]==-3) && energyValues[i] <= energyPerPot*2){
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

    if(possibleChoices.length==0){
        console.log("EMPTY SEARCH") // THIS BREAKS THE PROGRAM - add a modal
        var myModal = new bootstrap.Modal(document.getElementById('errorModal'), {
            keyboard: false
        });
        myModal.toggle();
    }

    return possibleChoices[getRndInteger(0, possibleChoices.length - 1)];
}


////// BFS : source -> https://levelup.gitconnected.com/solve-a-maze-with-python-e9f0580979a1 ////

function make_step(k,agent) {

    var curr_mem = agent_memory[agent];

    for (var i = 0; i < numRows; i++) {

        for (var j = 0; j < numCols; j++) {
            if(bfsGrid[i][j]==k){

                if(i>0 && bfsGrid[i-1][j]==0 && curr_mem[i-1][j]==true && grid[i-1][j]!=-1){
                    bfsGrid[i-1][j]=k+1;
                }

                if(j>0 && bfsGrid[i][j-1]==0 && curr_mem[i][j-1]==true && grid[i][j-1]!=-1){
                    bfsGrid[i][j-1]=k+1;
                }

                if(i<numRows-1 && bfsGrid[i+1][j]==0 && curr_mem[i+1][j]==true && grid[i+1][j]!=-1){
                    bfsGrid[i+1][j]=k+1;
                }

                if(j<numCols-1 && bfsGrid[i][j+1]==0 && curr_mem[i][j+1]==true && grid[i][j+1]!=-1){
                    bfsGrid[i][j+1]=k+1;
                }
            }
        }
    }
}



function bfs(start,end,agent){
    // run bfs
    step = 0;
    bfsGrid = createGrid(numRows, numCols);
    bfsGrid[start.row][start.col] = 1;

    while(bfsGrid[end.row][end.col] == 0){
        step += 1;
        make_step(step,agent);

    }

    // construct the path
    path = [];
    path.push(end);
    reverse_step = bfsGrid[end.row][end.col];

    var i = end.row;
    var j = end.col;

    while(reverse_step>1){

        if(i>0 && bfsGrid[i-1][j]==reverse_step-1){
            i = i - 1;
            path.push({row:i, col:j})
            reverse_step -= 1;
        } else if(j>0 && bfsGrid[i][j-1]==reverse_step-1){
            j = j - 1;
            path.push({row:i, col:j})
            reverse_step -= 1;
        }else if(i<numRows-1 && bfsGrid[i+1][j]==reverse_step-1){
            i = i + 1;
            path.push({row:i, col:j})
            reverse_step -= 1;
        } else if(j<numCols-1 && bfsGrid[i][j+1]==reverse_step-1){
            j = j + 1;
            path.push({row:i, col:j})
            reverse_step -= 1;
        }
    }



    return path.reverse();
}

///////////////////////////////////////////////////////////////










function checkEnd() {
    var sum = 0;
    for (var i = 0; i < numAgents; i++) {

        if(!agentDone[i])
            sum += energyValues[i];

        // if(agentDone[i])
        //     return true;
    }

    if(sum==0)
        return true;
    
    return false;
}



// run simulation of one step
function update(isStep) {

    if(stop && !isStep) return;

    currentIteration= currentIteration + 1;

    // Move each agent
    for (var i = 0; i < numAgents; i++) {

        if(energyValues[i]==0)
            continue;

        // check for possible trades
        if(trade){


            for(var k=0; k<agents.length; k++){
                if(agents[i].row == agents[k].row && agents[i].col == agents[k].col && i!=k){
                    console.log(`Agent ${i} could trade with agent ${k}`);


                    // if low energy and no collected pots
                    if(energyValues[i] < energyPerPot && collectedPots[i] == 0){
                        
                        if(collectedPots[k]>0 && collectedGold[i]>=energyPotPrice){
                            collectedPots[k] -= 1;
                            collectedPots[i] += 1;
                            collectedGold[i] -= energyPotPrice;
                            collectedGold[k] +=energyPotPrice;

                            numOfTrades[i] += 1;
                            numOfTrades[k] += 1;
                            console.log(`Agent ${i} bought an energy pot from agent ${k}`);
                        }
                    }

                    if(collectedGold[k]>=mapPrice && energyValues[k]>0){

                        collectedGold[i] += mapPrice;
                        collectedGold[k] -= mapPrice;



                        agent_memory[i] = uniteMemories(agent_memory[i],agent_memory[k]);
                        agent_memory[k] = agent_memory[i];


                        var both = 0;

                        for(var g=0; g<goals.length; g++){
                            console.log(`g: ${g} (x, y) = (${goals[g].row}, ${goals[g].col})`)
                            console.log(`agent_memory[i][goals[g].row][goals[g].col] = ${agent_memory[i][goals[g].row][goals[g].col]}`)
                            if(agent_memory[i][goals[g].row][goals[g].col]){
                                both += 1;
                            }                               
                        }

                        console.log(`Both ${both}`)
                        goalsFound[i] = both;
                        goalsFound[k] = both;

                        numOfTrades[i] += 1;
                        numOfTrades[k] += 1;
                        console.log(`Agent ${i} sold his map agent ${k}`);
                    }


                }
            }

        }
        
        // check if agent has found all the goals
        if(goalsFound[i] == numGoals && paths[i].length == 0){

            var startinhpath = bfs(agents[i],goals[0],i);
            paths[i] = paths[i].concat(startinhpath);

            for(var g=0; g<numGoals-1; g++){
                path = bfs(goals[g],goals[g+1],i);
                paths[i] = paths[i].concat(path);
            }

            var endpath = bfs(goals[numGoals-1],agentStartingPositions[i],i);
            paths[i] = paths[i].concat(endpath);

            //alert(`Agent ${i} found all goals`)
            agentsExecutingPlan[i] = true;

            agentInitialPos[i] = agents[i];
        }


        // if agent has energy pots
        if(collectedPots[i]>0){
            // if agent's lost energy greater than energyPerPot, consume a pot
            if(agentEnergy - energyValues[i] >= energyPerPot){
                collectedPots[i] -= 1;
                energyValues[i] += energyPerPot;
            }
        }
        
        // move agent

        var nextCell;

        if(goalsFound[i] == numGoals){

            // check if agent completed the path
            if(pathIndex[i]==paths[i].length){
                agentDone[i] = true;
                numAgentsDone += 1;

                // if this is the first agent to complete the path
                if(numAgentsDone==1){
                    var div = document.getElementById('modalText');
                    div.innerText = `Agent ${i} found all goals and managed to complete his plan!\nThe simulation was paused`;

                    var myModal = new bootstrap.Modal(document.getElementById('completeModal'), {
                        keyboard: false
                    });
                    myModal.toggle();
                    pauseSimulation();
                }
                
                continue;
            }
            
            pathIndex[i] += 1;
            nextCell = paths[i][pathIndex[i]-1];
        } else{
            nextCell = make_a_move(i);
        }
  
        agents[i] = nextCell;

        energyValues[i] -= 1;
        agentSteps[i] += 1;

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
    }

    updateMonitor();
    updateMonitorTable2();

    updateGrid();
    updateGridMonitor(monitorAgent);

    

    if(!checkEnd() && !isStep){
        setTimeout(update, delay, false);
    } else if(checkEnd()){
        //alert("Simulation has ended."); // replace with modal
        var myModal = new bootstrap.Modal(document.getElementById('endmodal'), {
            keyboard: false
        });
        myModal.toggle();
    }
        
}	




function startSimulation(){

    if(checkEnd()){
        //alert("Simulation has ended. Please start a new simulation"); // replace with modal 
        var myModal = new bootstrap.Modal(document.getElementById('endmodal2'), {
            keyboard: false
        });
        myModal.toggle();
        return;
    }

    if(!stop){
        return;
    }

    stop = false;
    // Start simulation
    updateGrid();

    update(false);
}

function pauseSimulation() {
    stop = true;
}

function stepSimulation() {
    if(checkEnd()){
        //alert("Simulation has ended. Please start a new simulation"); // replace with modal 
        var myModal = new bootstrap.Modal(document.getElementById('endmodal2'), {
            keyboard: false
        });
        myModal.toggle();
        return;
    }

    if(!stop){
        return;
    }

    console.log("called")

    update(true);

}

function initializeSimulation() {

    // halt simulation
    stop = true;
    currentIteration = 0;
    
    grid = createGrid(numRows, numCols);

    goals = [];

    agents = [];
    energyValues = new Array(numAgents).fill(agentEnergy);
    collectedGold = new Array(numAgents).fill(0);
    collectedPots = new Array(numAgents).fill(0);

    goalsFound = new Array(numAgents).fill(0);
    paths = new Array(numAgents).fill([]);
    pathIndex = new Array(numAgents).fill(0);
    agentSteps = new Array(numAgents).fill(0);

    agentsExecutingPlan = new Array(numAgents).fill(false);

    agentDone = new Array(numAgents).fill(false);
    numAgentsDone = 0;
    agentInitialPos = new Array(numAgents).fill({row:0,col:0});

    trade = document.getElementById("flexCheckChecked").checked;
    numOfTrades = new Array(numAgents).fill(0);


    createEntities(numRows, numCols, numAgents, numGoals, numWalls, numEnergyPots, numGold)
    updateGrid();


    agent_memory = [];
    for(var i=0; i<agents.length; i++){
        agent_memory.push(createGridMEM(numRows, numCols));
    }

    agentStartingPositions = [];

    for(var i=0; i<agents.length; i++){
        agentStartingPositions.push(agents[i])
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

    //stepMonitor

    table = document.getElementById("stepMonitor")

    table.innerHTML="";

    var row = table.insertRow(-1);
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var cell3 = row.insertCell(2);
    cell1.innerHTML = "Agent";
    cell2.innerHTML = "Steps";
    cell3.innerHTML = "Trades";

    for(var i=0; i<agents.length; i++){
        var row = table.insertRow(-1);
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        var cell3 = row.insertCell(2);
        cell1.innerHTML = i;
        cell2.innerHTML = "0";
        cell3.innerHTML = "0";
    }



    updateGridMonitor(monitorAgent);

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

    // source: https://stackoverflow.com/questions/20673959/how-to-add-new-li-to-ul-onclick-with-javascript


    var ul = document.getElementById("goalcoors");
    ul.innerHTML = "";
    for(var i=0; i<goals.length; i++){
        var li = document.createElement("li");
        li.appendChild(document.createTextNode(`Goal ${i}: (x,y) = (${goals[i].row}, ${goals[i].col})`));
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
        else {
            table.rows[i+1].cells[3].innerHTML = energyValues[i];

            if(agentsExecutingPlan[i] && !agentDone[i])
                table.rows[i+1].cells[3].innerHTML += " ⚙️"

            if(agentDone[i])
                table.rows[i+1].cells[3].innerHTML += " ✅"
        }
            
    }	
}

function updateMonitorTable2(){
    var table = document.getElementById("stepMonitor")

    for(var i=0; i<agents.length; i++){
        table.rows[i+1].cells[1].innerHTML = agentSteps[i];
        table.rows[i+1].cells[2].innerHTML = numOfTrades[i];
    }	
}


// on load:
initializeSimulation();