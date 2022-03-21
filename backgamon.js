var canvas;
var ctx;

var cv_width = 1600;//canvas width
var cv_height = 800;//canvas height

var sc_width = screen.width;//screen width
var sc_height = screen.height;//screen height

var brown_cube_show = false;//a var meant to check if the brown side cubes should show
var blue_cube_show = false;//a var meant to check if the blue side cubes should show

var rows = [];//the rows on the board, built with row objects

var ta_width;//rows width
var ta_height;//rows height

var peices_list;//the list of all the peices
var current_peice;
var peices_blue_out = [];
var peices_brown_out = [];

var blue_can_out = false;
var brown_can_out = true;
//both of those arrays are meant to translate the actuale index of a row on the board to the sorted order of rows that the player can move to
//for example the player moves one row from row 1 > 0 if he is brown
var brown_starting_point = [11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
var blue_starting_point = [23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 12, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

var turn = 0;//if turn is divided by 2 than its blue's turn, otherwise its brown's turn

//the function that loads the board and the peices
function on_page_load() {
    draw_board();
    draw_peices();
    canvas.addEventListener('mousemove', moving_a_peice);//adding an event listener of mouse move to track if the player pressed the mouse
}
//the function which runs the game
function run_game() {
    redrawboard();
    redraw();
    detectLeftButton();
    show_cubes();
    check_can_out();
    if (check_win() == "blue") {
        text("blue won", cv_width / 2, cv_height / 2, "blue");
        timer = "";
    }
    if (check_win() == "brown") {
        text("brown won", cv_width / 2, cv_height / 2, "brown");
        timer = "";
    }
    show_massege_no_move();
}

var timer = setInterval(run_game, 1000 / 30);//adding a timer to run the game at a certain rate
var radius = ta_width / 4;// the radius of the peices 

class peices {//peices object for all the game peices
    //every peice has a color an x and a y which are changing according to the players mouse and a row that changes as well
    constructor(radius, x, y, color, row) {//getting the variables and building an object of a peice on the board
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.row = row;
    }
    getx() {
        return this.x;
    }
    gety() {
        return this.y;
    }
    getcolor() {
        return this.color;
    }
    getradius() {
        return this.radius
    }
    getrow() {
        return this.row;
    }
    setx(new_x) {
        this.x = new_x;
    }
    sety(new_y) {
        this.y = new_y;
    }
    setrow(new_row) {
        this.row = new_row;
    }
    drawpeice() {//a function that draws the peice from the build function page
        init();
        draw_circle(this.getx(), this.gety(), this.getradius(), this.getcolor());
    }
}
class row {
    //every row has an x and a y and width and height and a list od peices it contains
    constructor(x, y, width, peicesinrow) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.peicesinrow = peicesinrow;//the list of peices in the row 
    }
    getx() {
        return this.x;
    }
    gety() {
        return this.y;
    }
    getwidth() {
        return this.width;
    }
    getheight() {
        return this.height;
    }
    getpeices() {
        return this.peicesinrow;
    }
    addpeice(peice) {//adding a peice to the row
        this.peicesinrow.push(peice);
    }
    removelastpeice() {//removing the last peice from a row
        return this.peicesinrow.pop()
    }
}
class cube {
    //every cube has an x and a y and a number on it, i sorted two cubes to each side so i can draw them in different colors 
    constructor(number, x, color) {
        this.number = number;
        this.x = x;
        this.color = color;
    }
    changenum() {
        this.number = Math.floor(Math.random() * (6 - 1 + 1)) + 1;//getting a random number from 1 - 6
    }
    get_color() {
        return this.color;
    }
    showblue() {//showing the blue cubes 
        text(this.number, this.x, cv_height / 2, "blue");
    }
    showbrown() {//showing the brown cubes
        text(this.number, this.x, cv_height / 2, "brown");
    }
    set_num(new_num) {//setting the number on the cube 
        this.number = new_num;
    }
    get_num() {
        return this.number;
    }
    getx() {
        return this.x;
    }
}

//creating 2 cubes to each player
var cube_blue1 = new cube(0, cv_width / 2 - 100);
var cube_blue2 = new cube(0, cv_width / 2 - 130);
var cube_brown1 = new cube(0, cv_width / 2 + 100);
var cube_brown2 = new cube(0, cv_width / 2 + 130);

function draw_board() {//drawing the board
    draw_rect(0, 0, cv_width, cv_height, "#5a2907", "white");
    draw_rect(cv_width / 2 - 2, 0, 4, cv_height, "black");//the separating line
    var x = 0;
    var y = 0;
    ta_width = cv_width / 12//the width of a row 
    ta_height = cv_height / 2 - 100//height of a row
    for (var i = 0; i < 12; i++) {//drawing the top rows
        if (i % 2 == 0) {
            draw_triangle(x, y, x + ta_width, y, x + (ta_width / 2), ta_height, "black")
            rows[i] = new row(x, y, ta_width, []);//adding the rows to the list of rows
        }
        else {
            draw_triangle(x, y, x + ta_width, y, x + (ta_width / 2), ta_height, "white")
            rows[i] = new row(x, y, ta_width, []);
        }
        x += ta_width//to draw the next adding value to the x
    }
    x = 0
    y = cv_height//drawing the bottom rows
    for (var i = 0; i < 12; i++) {
        if (i % 2 != 0) {
            draw_triangle(x, y, x + ta_width, y, x + (ta_width / 2), y - ta_height, "black")
            rows[12 + i] = new row(x, y, ta_width, []);
        }
        else {
            draw_triangle(x, y, x + ta_width, y, x + (ta_width / 2), y - ta_height, "white")
            rows[12 + i] = new row(x, y, ta_width, []);
        }
        x += ta_width
    }
}
function redrawboard() {
    //drawing the board again without changing the list of rows
    draw_rect(1600, 0, 200, cv_height, "gray", "black");
    draw_rect(0, 0, cv_width, cv_height, "#5a2907", "white");
    draw_rect(cv_width / 2 - 2, 0, 4, cv_height, "black")
    var x = 0
    var y = 0
    ta_width = cv_width / 12
    ta_height = cv_height / 2 - 100
    for (var i = 0; i < 12; i++) {
        if (i % 2 == 0) {
            draw_triangle(x, y, x + ta_width, y, x + (ta_width / 2), ta_height, "black")
        }
        else {
            draw_triangle(x, y, x + ta_width, y, x + (ta_width / 2), ta_height, "white")
        }
        x += ta_width
    }
    x = 0
    y = cv_height
    for (var i = 0; i < 12; i++) {
        if (i % 2 != 0) {
            draw_triangle(x, y, x + ta_width, y, x + (ta_width / 2), y - ta_height, "black")
        }
        else {
            draw_triangle(x, y, x + ta_width, y, x + (ta_width / 2), y - ta_height, "white")
        }
        x += ta_width
    }
}
function draw_peices() {
    //////drawing all the peices for the first time 
    radius = ta_width / 4;
    var x1 = cv_width - radius - radius;//preparing a x value to draw the first ones
    var y1 = radius;

    var y2 = y1 + 2 * radius;//secoend one in the line 
    var y3 = cv_height - radius;//bottom line  
    var y4 = y3 - 2 * radius;//secoend in bottom line

    peices_list = [new peices(radius, x1, y1, "brown", 11), new peices(radius, x1, y2, "brown", 11),
    new peices(radius, x1, y3, "blue", 23), new peices(radius, x1, y4, "blue", 23)];//adding them to the list of peices

    //drawing the starting posiotion with rows 6, 8, 12 full in the bottom and the top
    var x = x1 - 5 * ta_width;
    var y = radius;
    for (var i = 0; i < 5; i++) {//6th row top
        peices_list.push(new peices(radius, x, y, "blue", 6));
        y += 2 * radius;
    }

    y = cv_height - radius;

    for (var i = 0; i < 5; i++) {//6th row bottom
        peices_list.push(new peices(radius, x, y, "brown", 18));
        y -= 2 * radius;
    }

    x = x1 - 7 * ta_width;
    y = radius
    for (var i = 0; i < 3; i++) {//8th row top
        peices_list.push(new peices(radius, x, y, "blue", 4));
        y += 2 * radius;
    }

    y = cv_height - radius;
    for (var i = 0; i < 3; i++) {//8th row bottom
        peices_list.push(new peices(radius, x, y, "brown", 16))
        y -= 2 * radius;
    }



    x = radius + ta_width / 4
    y = radius
    for (var i = 0; i < 5; i++) {//12th row top
        peices_list.push(new peices(radius, x, y, "brown", 0))
        y += 2 * radius;
    }

    y = cv_height - radius;
    for (var i = 0; i < 5; i++) {//12th row bottom
        peices_list.push(new peices(radius, x, y, "blue", 12))
        y -= 2 * radius
    }

    //adding the peices to the row they are in
    for (var i = 0; i < peices_list.length; i++) {
        rows[peices_list[i].getrow()].addpeice(peices_list[i]);
    }
    ////drawing all the peices
    //for (var i = 0; i < 3; i++) {
    //    var peice = new peices(radius, rows[6].getx() + 2 * radius, radius + 2 * radius * rows[6].getpeices().length, "blue", 6 + 12)
    //    rows[6].addpeice(peice)
    //    var peice1 = new peices(radius, rows[6 + 12].getx() + 2 * radius, cv_height - (radius + 2 * radius * rows[6 + 12].getpeices().length), "brown", 6 + 12)
    //    rows[6 + 12].addpeice(peice1)
    //}
    //for (var i = 0; i < 3; i++) {
    //    var peice = new peices(radius, rows[7].getx() + 2 * radius, radius + 2 * radius * rows[7].getpeices().length, "blue", 7)
    //    rows[7].addpeice(peice)
    //    var peice1 = new peices(radius, rows[7 + 12].getx() + 2 * radius, cv_height - (radius + 2 * radius * rows[7 + 12].getpeices().length), "brown", 7 + 12)
    //    rows[7 + 12].addpeice(peice1)
    //}
    //for (var i = 0; i < 3; i++) {
    //    var peice = new peices(radius, rows[8].getx() + 2 * radius, radius + 2 * radius * rows[8].getpeices().length, "blue", 8)
    //    rows[8].addpeice(peice)
    //    var peice1 = new peices(radius, rows[8 + 12].getx() + 2 * radius, cv_height - (radius + 2 * radius * rows[8 + 12].getpeices().length), "brown", 8 + 12)
    //    rows[8 + 12].addpeice(peice1)
    //}
    //for (var i = 0; i < 3; i++) {
    //    var peice = new peices(radius, rows[9].getx() + 2 * radius, radius + 2 * radius * rows[9].getpeices().length, "blue", 9)
    //    rows[9].addpeice(peice)
    //    var peice1 = new peices(radius, rows[9 + 12].getx() + 2 * radius, cv_height - (radius + 2 * radius * rows[9 + 12].getpeices().length), "brown", 9 + 12)
    //    rows[9 + 12].addpeice(peice1)
    //}
    //for (var i = 0; i < 2; i++) {
    //    var peice = new peices(radius, rows[10].getx() + 2 * radius, radius + 2 * radius * rows[10].getpeices().length, "blue", 10)
    //    rows[10].addpeice(peice)
    //    var peice1 = new peices(radius, rows[10 + 12].getx() + 2 * radius, cv_height - (radius + 2 * radius * rows[10 + 12].getpeices().length), "brown", 10 + 12)
    //    rows[10 + 12].addpeice(peice1)
    //}
    //var peice = new peices(radius, rows[23].getx() + 2 * radius, cv_height - (radius + 2 * radius * rows[23].getpeices().length), "blue", 23)
    //rows[23].addpeice(peice)
    //var peice1 = new peices(radius, rows[11].getx() + 2 * radius, radius + 2 * radius * rows[11].getpeices().length, "brown", 11)
    //rows[11].addpeice(peice1)
    //for (var i = 0; i < rows.length; i++) {
    //    var curr_row = rows[i];
    //    for (var j = 0; j < curr_row.getpeices().length; j++) {
    //        curr_row.getpeices()[j].drawpeice()
    //    }
    //}
}
function redraw() {//redrawing all the peices
    for (var i = 0; i < rows.length; i++) {
        var curr_row = rows[i];
        for (var j = 0; j < curr_row.getpeices().length; j++) {
            curr_row.getpeices()[j].drawpeice()
        }
    }
    for (var i = 0; i < eaten_peices_blue.getpeices().length; i++) {
        eaten_peices_blue.getpeices()[i].drawpeice();
    }
    for (var i = 0; i < eaten_peices_brown.getpeices().length; i++) {
        eaten_peices_brown.getpeices()[i].drawpeice();
    }
}


function intersects(x, y, cx, cy, r) {//checking if an x and a y are inside an object
    var dx = x - cx;
    var dy = y - cy;
    return dx * dx + dy * dy <= r * r;//furmula of distance in circles, returning if the x and the y are in the circle
}
function detectLeftButton(event) {//using an event to detect left click on the button
    if (event != null) {
        if ("buttons" in event) {
            return event.buttons > 0;
        }

    }
}
//related to the function
var found = false;//if we find a peice that we pressed on it becomes true 
var initial = true;//the initial state in order to return the peice to the initial placement if the move was invalid
var initialx;
var initialy;
var initialrow;
var handling_eaten = false;
var outing = false;
var eaten_peices_blue = new row(cv_width / 2, cv_height / 2 + 50, 2 * radius, [])
var eaten_peices_brown = new row(cv_width / 2, cv_height / 2 - 50, 2 * radius, [])
var eaten_brown = false;
var eaten_blue = false;
function moving_a_peice(event) {
    const rect = canvas.getBoundingClientRect();//concidering the gap between the canvas and the screeen
    if (current_peice != null) {//moving the peice with the nouse x and y
        current_peice.setx(event.clientX - rect.left);
        current_peice.sety(event.clientY - rect.top);
    }
    for (var i = 0; i < rows.length; i++) {
        if (detectLeftButton(event)) {//if the client pressed a button 
            if (turn % 2 == 0) {//blue
                console.log(eaten_peices_blue.getpeices().length);
                if (eaten_peices_blue.getpeices().length > 0) {
                    if (intersects(eaten_peices_blue.getpeices()[eaten_peices_blue.getpeices().length - 1].getx(), eaten_peices_blue.getpeices()[eaten_peices_blue.getpeices().length - 1].gety(), (event.clientX - rect.left), (event.clientY - rect.top), ta_width / 4)) {
                        if (cube_blue1.get_num() != 0 || cube_blue2.get_num() != 0) {
                            handling_eaten = true;
                            current_peice = eaten_peices_blue.getpeices()[eaten_peices_blue.getpeices().length - 1];//if the turn was valid setting the peice to current peice
                            found = true;//we found the peice
                            if (initial == true) {//setting initials
                                initial = false;
                                initialx = eaten_peices_blue.getx()
                                initialy = current_peice.gety();
                            }
                        }
                    }
                }
                else {
                    if (rows[i].getpeices().length != 0) {//checking for every row if a peice in it has been clicked
                        if (!found && intersects(rows[i].getpeices()[0].getx(), rows[i].getpeices()[rows[i].getpeices().length - 1].gety(), (event.clientX - rect.left), (event.clientY - rect.top), ta_width / 4)) {
                            //after checking the interaction im checking if the move is valid
                            if ((turn % 2 == 0 && rows[i].getpeices()[rows[i].getpeices().length - 1].getcolor() == "blue" && (cube_blue1.get_num() != 0 || cube_blue2.get_num() != 0)) || ((turn % 2 != 0 && rows[i].getpeices()[rows[i].getpeices().length - 1].getcolor() == "brown") && (cube_brown1.get_num() != 0 || cube_brown2.get_num() != 0))) {
                                current_peice = rows[i].getpeices()[rows[i].getpeices().length - 1];//if the turn was valid setting the peice to current peice
                                found = true;//we found the peice
                                if (initial == true) {//setting initials
                                    initial = false;
                                    initialx = rows[i].getpeices()[0].getx();
                                    initialy = rows[i].getpeices()[rows[i].getpeices().length - 1].gety();
                                    initialrow = i;
                                }
                            }
                        }
                    }
                }
            }
            else {
                console.log(eaten_peices_blue.getpeices().length);
                if (eaten_peices_brown.getpeices().length > 0) {
                    if (intersects(eaten_peices_brown.getpeices()[eaten_peices_brown.getpeices().length - 1].getx(), eaten_peices_brown.getpeices()[eaten_peices_brown.getpeices().length - 1].gety(), (event.clientX - rect.left), (event.clientY - rect.top), ta_width / 4)) {
                        if (cube_brown1.get_num() != 0 || cube_brown2.get_num() != 0) {
                            handling_eaten = true;
                            current_peice = eaten_peices_brown.getpeices()[eaten_peices_brown.getpeices().length - 1];//if the turn was valid setting the peice to current peice
                            found = true;//we found the peice
                            if (initial == true) {//setting initials
                                initial = false;
                                initialx = eaten_peices_brown.getx()
                                initialy = current_peice.gety();
                            }
                        }
                    }
                }
                else {
                    if (rows[i].getpeices().length != 0) {//checking for every row if a peice in it has been clicked
                        if (!found && intersects(rows[i].getpeices()[0].getx(), rows[i].getpeices()[rows[i].getpeices().length - 1].gety(), (event.clientX - rect.left), (event.clientY - rect.top), ta_width / 4)) {
                            //after checking the interaction im checking if the move is valid
                            if ((turn % 2 == 0 && rows[i].getpeices()[rows[i].getpeices().length - 1].getcolor() == "blue" && (cube_blue1.get_num() != 0 || cube_blue2.get_num() != 0)) || ((turn % 2 != 0 && rows[i].getpeices()[rows[i].getpeices().length - 1].getcolor() == "brown") && (cube_brown1.get_num() != 0 || cube_brown2.get_num() != 0))) {
                                current_peice = rows[i].getpeices()[rows[i].getpeices().length - 1];//if the turn was valid setting the peice to current peice
                                found = true;//we found the peice
                                if (initial == true) {//setting initials
                                    initial = false;
                                    initialx = rows[i].getpeices()[0].getx();
                                    initialy = rows[i].getpeices()[rows[i].getpeices().length - 1].gety();
                                    initialrow = i;
                                }
                            }
                        }
                    }
                }
            }
        }
        else {//when the button is released...
            if (current_peice != null) {
                console.log("here");
                if (!handling_eaten) {
                    console.log("passed");
                    var cur_row = checkrow(current_peice.getx(), current_peice.gety(), initialrow, current_peice);//checking if the row is standing in the rules and returning the row
                    if (current_peice.getx() > 1600) {
                        if (current_peice.getcolor() == "brown" && check_can_out("brown") && out_available_by_cubes(initialrow)) {
                            rows[initialrow].removelastpeice();
                            peices_brown_out.push(current_peice);
                            if (cube_brown1.get_num() == 0 && cube_brown2.get_num() == 0) {
                                turn += 1;
                                brown_cube_show = false;
                                blue_cube_show = false;
                            }
                        }
                        else if (current_peice.getcolor() == "blue" && check_can_out("blue") && out_available_by_cubes(initialrow)) {
                            rows[initialrow].removelastpeice();
                            peices_blue_out.push(current_peice);
                            if (cube_blue1.get_num() == 0 && cube_blue2.get_num() == 0) {
                                turn += 1;
                                brown_cube_show = false;
                                blue_cube_show = false;
                            }
                        }
                        else {
                            current_peice.setx(initialx);
                            current_peice.sety(initialy);
                            current_peice.setrow(initialrow);
                        }
                    }
                    else if (cur_row != -1 && check_movenment_by_cubes(initialrow, cur_row, current_peice)) {//checking if the move fits the cubes
                        console.log("found")
                        current_peice.setx(rows[cur_row].getx() + 2 * radius);//setting the x value
                        if (cur_row > 11) {//bottom
                            current_peice.sety(cv_height - (2 * radius * rows[cur_row].getpeices().length + radius));
                        }
                        else {//top
                            current_peice.sety(2 * radius * rows[cur_row].getpeices().length + radius);
                        }
                        rows[cur_row].addpeice(current_peice);//adding the peice to the new row
                        rows[initialrow].getpeices().pop()//removig it from the initial row
                        current_peice.setrow(cur_row);
                        if (current_peice.getcolor() == "brown") {//removing the cubes and updating the turns 
                            if (cube_brown1.get_num() == 0 && cube_brown2.get_num() == 0) {
                                turn += 1;
                                brown_cube_show = false;
                                blue_cube_show = false;
                            }
                        }
                        if (current_peice.getcolor() == "blue") {
                            if (cube_blue1.get_num() == 0 && cube_blue2.get_num() == 0) {
                                turn += 1;
                                brown_cube_show = false;
                                blue_cube_show = false;
                            }
                        }
                    }
                    else {//if the move was invalid setting the peice back to the initail state
                        current_peice.setx(initialx);
                        current_peice.sety(initialy);
                        current_peice.setrow(initialrow);
                    }
                }
                else {
                    var cur_row = checkrow_eaten(current_peice.getx(), current_peice.gety(), current_peice, initialrow);
                    if (turn % 2 == 0) {//blue
                        if (cur_row == blue_starting_point[cube_blue1.get_num() - 1] || cur_row == blue_starting_point[cube_blue2.get_num() - 1]) {
                            if (check_going_over_peice(cur_row, current_peice) == 2) {
                                current_peice.setx(rows[cur_row].getx() + 2 * radius);//setting the x value
                                if (cur_row > 11) {//bottom
                                    current_peice.sety(cv_height - (2 * radius * rows[cur_row].getpeices().length + radius));
                                }
                                else {//top
                                    current_peice.sety(2 * radius * rows[cur_row].getpeices().length + radius);
                                }
                                rows[cur_row].addpeice(current_peice);//adding the peice to the new row
                                eaten_peices_blue.removelastpeice()//removig it from the initial row
                                current_peice.setrow(cur_row);
                                if (cube_blue1.get_num() == 0 && cube_blue2.get_num() == 0) {
                                    turn += 1;
                                    brown_cube_show = false;
                                    blue_cube_show = false;
                                }
                                handling_eaten = false;
                                if (!double_blue1 && !double_blue2) {//if the player has a double than he has 4 turns and the doubles are turning fales before the cubes turn to 0
                                    if (cur_row == blue_starting_point[cube_blue1.get_num() - 1])
                                        cube_blue1.set_num(0);
                                    else {
                                        cube_blue2.set_num(0);
                                    }
                                }
                                else if (double_blue1 && double_blue2)
                                    double_blue1 = false;
                                else if (!double_blue1 && double_blue2)
                                    double_blue2 = false;
                            }
                            else {
                                current_peice.setx(initialx);
                                current_peice.sety(initialy);
                                current_peice.setrow(initialrow);
                            }
                        }
                        else {
                            current_peice.setx(initialx);
                            current_peice.sety(initialy);
                            current_peice.setrow(initialrow);
                        }
                    }
                    else {
                        if (cur_row == brown_starting_point[cube_brown1.get_num() - 1] || cur_row == brown_starting_point[cube_brown2.get_num() - 1]) {
                            if (check_going_over_peice(cur_row, current_peice) == 2) {
                                current_peice.setx(rows[cur_row].getx() + 2 * radius);//setting the x value
                                if (cur_row > 11) {//bottom
                                    current_peice.sety(cv_height - (2 * radius * rows[cur_row].getpeices().length + radius));
                                }
                                else {//top
                                    current_peice.sety(2 * radius * rows[cur_row].getpeices().length + radius);
                                }
                                rows[cur_row].addpeice(current_peice);//adding the peice to the new row
                                eaten_peices_brown.removelastpeice()//removig it from the initial row
                                current_peice.setrow(cur_row);
                                if (cube_brown1.get_num() == 0 && cube_brown2.get_num() == 0) {
                                    turn += 1;
                                    brown_cube_show = false;
                                    blue_cube_show = false;
                                }
                                handling_eaten = false;
                                if (!double_brown1 && !double_brown2) {//if the player has a double than he has 4 turns and the doubles are turning false before the cubes turn to 0
                                    if (cur_row == brown_starting_point[cube_brown1.get_num() - 1])
                                        cube_brown1.set_num(0);
                                    else {
                                        cube_brown2.set_num(0);
                                    }
                                }
                                else if (double_brown1 && double_brown2)
                                    double_brown1 = false;
                                else if (!double_brown1 && double_brown2)
                                    double_brown2 = false;
                            }
                            else {
                                current_peice.setx(initialx);
                                current_peice.sety(initialy);
                                current_peice.setrow(initialrow);
                            }
                        }
                        else {
                            current_peice.setx(initialx);
                            current_peice.sety(initialy);
                            current_peice.setrow(initialrow);
                        }
                    }
                }
            }
            found = false;
            current_peice = null;
            initial = true;
        }
    }
}



function find_row_position(color, row) {//finding the position of the row in the sorted list of moves
    if (color == "brown") {
        for (var i = 0; i < brown_starting_point.length; i++) {
            if (brown_starting_point[i] == row) {
                console.log(i);
                return i;
            }
        }
    }
    if (color == "blue") {
        for (var i = 0; i < blue_starting_point.length; i++) {
            if (blue_starting_point[i] == row) {
                console.log(i);
                return i;
            }
        }
    }
}
function check_going_back(initial_row, cur_row, peice) {//check if the player went back (invalid)
    //getting the placements of the initial place and the current one and seeing wether the current place is bigger than the initial one
    if (peice.getcolor() == "brown") {
        var index_initial1;
        for (var i = 0; i < brown_starting_point.length; i++) {
            if (initial_row == brown_starting_point[i]) {
                index_initial1 = i;
            }
        }
        var index_cur_row1;
        for (var j = 0; j < brown_starting_point.length; j++) {
            if (cur_row == brown_starting_point[j]) {
                index_cur_row1 = j;
            }
        }
        return (index_cur_row1 > index_initial1);
    }
    if (peice.getcolor() == "blue") {
        var index_initial2;
        for (var i = 0; i < blue_starting_point.length; i++) {
            if (initial_row == blue_starting_point[i]) {
                index_initial2 = i;
            }
        }
        var index_cur_row2;
        for (var j = 0; j < blue_starting_point.length; j++) {
            if (cur_row == blue_starting_point[j]) {
                index_cur_row2 = j;
            }
        }
        return (index_cur_row2 > index_initial2);
    }
    return true;
}
function check_movenment_by_cubes(initial_row, cur_row, peice) {
    //checking if the move fits the cubes
    console.log("in")
    if (turn % 2 == 0) {//blue
        if (find_row_position("blue", cur_row) - find_row_position("blue", initial_row) == cube_blue1.get_num() && check_going_over_peice(cur_row, peice) == 2) {//checking if the move is like the first cube and that its valid of going over other peice from the other color       
            if (!double_blue1 && !double_blue2)//if the player has a double than he has 4 turns and the doubles are turning fales before the cubes turn to 0
                cube_blue1.set_num(0);
            else if (double_blue1 && double_blue2)
                double_blue1 = false;
            else if (!double_blue1 && double_blue2)
                double_blue2 = false;
            return true;
        }
        if (find_row_position("blue", cur_row) - find_row_position("blue", initial_row) == cube_blue2.get_num() && check_going_over_peice(cur_row, peice) == 2) {//secoend cube 
            if (!double_blue1 && !double_blue2)
                cube_blue2.set_num(0);
            else if (double_blue1 && double_blue2)
                double_blue1 = false;
            else if (!double_blue1 && double_blue2)
                double_blue2 = false;
            return true;
        }
        if (find_row_position("blue", cur_row) - find_row_position("blue", initial_row) == cube_blue1.get_num() + cube_blue2.get_num() && check_going_over_peice(cur_row, peice) == 2) {//the sum of them
            if (check_going_over_peice(blue_starting_point[find_row_position("blue", cur_row, peice) - cube_blue1.get_num()], peice) == 2 || check_going_over_peice(blue_starting_point[find_row_position("blue", cur_row, peice) - cube_blue2.get_num()], peice) == 2) {//checking that both moves are fine 
                cube_blue1.set_num(0);
                cube_blue2.set_num(0);
                return true;
            }
        }
        console.log("false");
        return false;
    }
    if (turn % 2 != 0) {//same goes for brown
        if (find_row_position("brown", cur_row) - find_row_position("brown", initial_row) == cube_brown1.get_num() && check_going_over_peice(cur_row, peice) == 2) {
            if (!double_brown1 && !double_brown2)
                cube_brown1.set_num(0);
            if (!double_brown1 && double_brown2)
                double_brown2 = false;
            if (double_brown1 && double_brown2)
                double_brown1 = false;

            return true;
        }
        if (find_row_position("brown", cur_row) - find_row_position("brown", initial_row) == cube_brown2.get_num() && check_going_over_peice(cur_row, peice) == 2) {
            if (!double_brown1 && !double_brown2)
                cube_brown2.set_num(0);
            if (!double_brown1 && double_brown2)
                double_brown2 = false;
            if (double_brown1 && double_brown2)
                double_brown1 = false;

            return true;
        }
        if (find_row_position("brown", cur_row) - find_row_position("brown", initial_row) == cube_brown1.get_num() + cube_brown2.get_num() && check_going_over_peice(cur_row, peice) == 2) {
            if (check_going_over_peice(brown_starting_point[find_row_position("brown", cur_row, peice) - cube_brown1.get_num()], peice) == 2 || check_going_over_peice(brown_starting_point[find_row_position("brown", cur_row, peice) - cube_brown2.get_num()], peice) == 2) {
                if (!double_brown1 && !double_brown2) {
                    cube_brown1.set_num(0);
                    cube_brown2.set_num(0);
                }
                else {
                    double_brown1 = false;
                    double_brown2 = false;
                }
                return true;

            }
        }
        console.log("false");
        return false;
    }
}


function checkrow(x, y, initial_row, peice) {//returning the row i need to move the peice to
    for (var i = 0; i < rows.length / 2; i++) {
        if ((rows[i].getx() < x && rows[i].getx() + rows[i].getwidth() > x)) {
            if (y < (cv_height / 2) && i != initial_row && check_going_back(initial_row, i, peice)) {
                return i;//returning the row i need to move the peice to
            }
            if (y > (cv_height / 2) && i + 12 != initial_row && check_going_back(initial_row, i + 12, peice)) {
                return i + 12;//if the peice is pointig to the lowere part of the board
            }
        }
    }
    return -1;
}
function checkrow_eaten(x, y, peice, initial_row) {//returning the row i need to move the peice to
    for (var i = 0; i < rows.length / 2; i++) {
        if ((rows[i].getx() < x && rows[i].getx() + rows[i].getwidth() > x)) {
            if (y < (cv_height / 2) && i != initial_row) {
                return i;//returning the row i need to move the peice to
            }
            if (y > (cv_height / 2) && i + 12 != initial_row) {
                return i + 12;//if the peice is pointig to the lowere part of the board
            }
        }
    }
    return -1;
}

function check_possible_move() {
    if (turn % 2 == 0) {        
        for (var i = 0; i < rows.length; i++) {
            if (rows[i].getpeices().length > 0) {
                var peice = rows[i].getpeices()[rows[i].getpeices().length - 1];
                if (!(out_available_by_cubes(peice.getrow()) && check_can_out("blue"))) {
                    return true;
                }
                if (peice.getcolor() == "blue" && turn % 2 == 0) {
                    if (check_going_over_peice(blue_starting_point[find_row_position("blue", peice.getrow()) + cube_blue1.get_num()], peice, true) == 2 || check_going_over_peice(blue_starting_point[find_row_position("blue", peice.getrow()) + cube_blue2.get_num()], peice, true) == 2) {
                        return true;
                    }
                    return false;
                }
            }
        }
        return true;
    }
    else {
        for (var i = 0; i < rows.length; i++) {
            if (rows[i].getpeices().length > 0) {
                var peice = rows[i].getpeices()[rows[i].getpeices().length - 1];
                if (!(out_available_by_cubes(peice.getrow()) && check_can_out("brown"))) {
                    return true;
                }
                if (peice.getcolor() == "brown" && turn % 2 != 0) {
                    if (check_going_over_peice(brown_starting_point[find_row_position("brown", peice.getrow()) + cube_brown1.get_num()], peice, true) == 2 || check_going_over_peice(brown_starting_point[find_row_position("brown", peice.getrow()) + cube_brown2.get_num()], peice, true) == 2) {
                        return true;
                    }
                    return false;
                }
            }
        }
        return true;
    }
}

function check_possible_move_eaten(peice) {
    if (peice != null) {
        if (peice.getcolor() == "blue") {
            if (check_going_over_peice(blue_starting_point[cube_blue1.get_num() - 1], peice, true) == 2 || check_going_over_peice(blue_starting_point[cube_blue2.get_num() - 1], peice, true) == 2) {
                return true;
            }
            return false;
        }
        if (peice.getcolor() == "brown") {
            if (check_going_over_peice(brown_starting_point[cube_brown1.get_num() - 1], peice, true) == 2 || check_going_over_peice(brown_starting_point[cube_brown2.get_num() - 1], peice, true) == 2) {
                return true;
            }
            return false;
        }
    }
    else {
        return true;
    }

}



function check_going_over_peice(cur_row, peice, check = false) {//if the player wants to move to a row that is full with the other color he cant
    if (peice.getcolor() == "blue") {
        if (rows[cur_row].getpeices().length > 0) {
            if (rows[cur_row].getpeices().length > 1 && rows[cur_row].getpeices()[rows[cur_row].getpeices().length - 1].getcolor() == "brown") {
                return 3;//false
            }
            if (rows[cur_row].getpeices().length == 1 && rows[cur_row].getpeices()[0].getcolor() != peice.getcolor()) {
                if (check != true) {
                    cur_peice = rows[cur_row].getpeices()[rows[cur_row].getpeices().length - 1]
                    cur_peice.setx(eaten_peices_brown.getx());
                    cur_peice.sety(2 * radius * eaten_peices_brown.getpeices().length + eaten_peices_brown.gety());
                    eaten_peices_brown.addpeice(cur_peice);
                    eaten_brown = true;
                    rows[cur_row].removelastpeice();
                }
                return 2;//true
            }
            else {
                return 2;//true
            }

        }
        else {
            return 2;//true
        }
    }
    if (peice.getcolor() == "brown") {
        if (rows[cur_row].getpeices().length > 0) {
            if (rows[cur_row].getpeices().length > 1 && rows[cur_row].getpeices()[rows[cur_row].getpeices().length - 1].getcolor() == "blue") {
                return 3;//false
            }
            if (rows[cur_row].getpeices().length == 1 && rows[cur_row].getpeices()[0].getcolor() != peice.getcolor()) {
                if (check != true) {
                    var cur_peice = rows[cur_row].getpeices()[rows[cur_row].getpeices().length - 1];
                    cur_peice.setx(eaten_peices_blue.getx());
                    cur_peice.sety(2 * radius * eaten_peices_blue.getpeices().length + eaten_peices_blue.gety());
                    eaten_peices_blue.addpeice(cur_peice);
                    eaten_blue = 2;
                    rows[cur_row].removelastpeice();
                }
                return 2;//true
            }
            else {
                return 2;//true
            }
        }
        else {
            return 2;//true
        }
    }
}

function out_available_by_cubes(initial_row) {
    if (turn % 2 == 0) {//blue
        var cube_1 = false;
        var cube_2 = false;
        var enter = false;
        var canceled_double = false;
        if ((23 - find_row_position("blue", initial_row) < cube_blue1.get_num() - 1 && move_available_before_out("blue", cube_blue1, initialrow)) || 23 - find_row_position("blue", initial_row) == cube_blue1.get_num() - 1) {//checking if the move is like the first cube and that its valid of going over other peice from the other color       
            if (!double_blue1 && !double_blue2)//if the player has a double than he has 4 turns and the doubles are turning fales before the cubes turn to 0
                cube_1 = true;
            else if (double_blue1 && double_blue2) {
                double_blue1 = false;
                canceled_double = true;
            }
            else if (!double_blue1 && double_blue2) {
                double_blue2 = false;
                canceled_double = true;
            }
            enter = true;
        }
        if ((23 - find_row_position("blue", initial_row) < cube_blue2.get_num() && move_available_before_out("blue", cube_blue2, initialrow)) || 23 - find_row_position("blue", initial_row) == cube_blue2.get_num() - 1) {//secoend cube 
            if (!double_blue1 && !double_blue2 && !canceled_double)
                cube_2 = true;
            else if (double_blue1 && double_blue2 && !enter)
                double_blue1 = false;
            else if (!double_blue1 && double_blue2 && !enter)
                double_blue2 = false;
            enter = true;
        }
        if (cube_1 && cube_2) {
            if (cube_blue1.get_num() < cube_blue2.get_num())
                cube_blue1.set_num(0);
            else
                cube_blue2.set_num(0);
        }
        if (cube_1 && !cube_2)
            cube_blue1.set_num(0);

        if (!cube_1 && cube_2)
            cube_blue2.set_num(0);

        return enter;
    }
    if (turn % 2 != 0) {//same goes for brown
        var cube_1 = false;
        var cube_2 = false;
        var enter = false;
        var canceled_double = false;
        if ((23 - find_row_position("brown", initial_row) < cube_brown1.get_num() && move_available_before_out("brown", cube_brown1, initialrow)) || 23 - find_row_position("brown", initial_row) == cube_brown1.get_num() - 1) {
            if (!double_brown1 && !double_brown2) {
                cube_1 = true;
                canceled_double = true;
            }
            if (!double_brown1 && double_brown2) {
                double_brown2 = false;
                canceled_double = true;
            }
            if (double_brown1 && double_brown2)
                double_brown1 = false;
            enter = true;
        }
        if ((23 - find_row_position("brown", initial_row) < cube_brown2.get_num() && move_available_before_out("brown", cube_brown2, initialrow)) || 23 - find_row_position("brown", initial_row) == cube_brown2.get_num() - 1) {
            if (!double_brown1 && !double_brown2 && !canceled_double)
                cube_2 = true;
            if (!double_brown1 && double_brown2 && !enter)
                double_brown2 = false;
            if (double_brown1 && double_brown2 && !enter)
                double_brown1 = false;
            enter = true;
        }
        if (cube_1 && cube_2) {
            if (cube_brown1.get_num() < cube_brown2.get_num())
                cube_brown1.set_num(0);
            else
                cube_brown2.set_num(0);
        }
        if (cube_1 && !cube_2)
            cube_brown1.set_num(0);

        if (!cube_1 && cube_2)
            cube_brown2.set_num(0);
        return enter;
    }
}
function move_available_before_out(color, cube, cur_row) {
    if (color == "blue") {
        if (rows[blue_starting_point[blue_starting_point.length - 1 - cube.get_num()]].getpeices().length != 0 && rows[blue_starting_point[blue_starting_point.length - 1 - cube.get_num()]].getpeices()[0].getcolor() == "blue")
            return false;
        else {
            for (var i = cur_row - 1; i > 5; i--) {
                if (rows[i].getpeices().length > 0 && rows[i].getpeices()[0].getcolor() == "blue") {
                    return false;
                }
            }
        }
        return true;
    }
    if (color == "brown") {
        if (rows[brown_starting_point[brown_starting_point.length - 1 - cube.get_num()]].getpeices().length != 0 && rows[brown_starting_point[brown_starting_point.length - 1 - cube.get_num()]].getpeices()[0].getcolor() == "brown")
            return false;
        else {
            for (var i = cur_row - 1; i > 17; i--) {
                if (rows[i].getpeices().length > 0 && rows[i].getpeices()[0].getcolor() == "brown") {
                    return false;
                }
            }
        }
        return true;
    }
}

//checking the double cubes
var double_blue1 = false;
var double_blue2 = false;
var double_brown1 = false;
var double_brown2 = false;
var no_move = false;
function rollblue() {//rolling the dice of blue 
    if (turn % 2 == 0 && cube_blue1.get_num() == 0 && cube_blue2.get_num() == 0) {
        cube_blue1.set_num(1);
        cube_blue2.set_num(1);
        cube_blue1.changenum();
        cube_blue2.changenum();
        if ((eaten_peices_blue.getpeices().length != 0 && check_possible_move_eaten(eaten_peices_blue.getpeices()[eaten_peices_blue.getpeices().length - 1])) || (!eaten_peices_blue.getpeices().length != 0 && check_possible_move())) {
            if (cube_blue1.get_num() == cube_blue2.get_num()) {
                double_blue1 = true;
                double_blue2 = true;
            }
            brown_cube_show = false;
            blue_cube_show = true;
            no_move = false;
        }
        else {
            turn += 1;
            no_move = true;
            cube_blue1.set_num(0);
            cube_blue2.set_num(0);
        }
    }
}

function show_massege_no_move() {
    if (no_move) {
        text("no possible move", cv_width / 2, cv_height / 2, "black");
    }
}

function rollbrown() {//rolling the dice of brown
    if (turn % 2 != 0 && cube_brown1.get_num() == 0 && cube_brown2.get_num() == 0) {
        cube_brown1.set_num(1);
        cube_brown2.set_num(1);
        cube_brown1.changenum();
        cube_brown2.changenum();
        if ((eaten_peices_brown.getpeices().length != 0 && check_possible_move_eaten(eaten_peices_brown.getpeices()[eaten_peices_brown.getpeices().length - 1])) || (!eaten_peices_brown.getpeices().length != 0 && check_possible_move())) {
            if (cube_brown1.get_num() == cube_brown2.get_num()) {
                double_brown1 = true;
                double_brown2 = true;
            }
            brown_cube_show = true;
            blue_cube_show = false;
            no_move = false;
        }
        else {
            turn += 1;
            no_move = true;
            cube_brown1.set_num(0);
            cube_brown2.set_num(0);
        }
    }
}

function show_cubes() {//showing the cubes on the canvas 
    if (brown_cube_show) {
        cube_brown1.showbrown();
        text("-", cube_brown1.getx() + 17, cv_height / 2, "brown");
        cube_brown2.showbrown();
    }
    if (blue_cube_show) {
        cube_blue1.showblue();
        text("-", cube_blue1.getx() - 10, cv_height / 2, "blue");
        cube_blue2.showblue();
    }
}

function check_can_out(color) {
    if (color == "blue") {
        var count = 0;
        for (var i = 23; i > 23 - 6; i--) {
            for (var j = 0; j < rows[blue_starting_point[i]].getpeices().length; j++) {
                if (rows[blue_starting_point[i]].getpeices()[j].getcolor() == "blue") {
                    count += 1;
                }
            }
        }
        return count == (15 - peices_blue_out.length);
    }
    if (color == "brown") {
        var count = 0;
        for (var i = 23; i > 23 - 6; i--) {
            for (var j = 0; j < rows[brown_starting_point[i]].getpeices().length; j++) {
                if (rows[brown_starting_point[i]].getpeices()[j].getcolor() == "brown") {
                    count += 1;
                }
            }
        }
        return count == (15 - peices_brown_out.length);
    }
}

function check_win() {
    if (peices_blue_out.length == 15) {
        return "blue";
    }
    if (peices_brown_out.length == 15) {
        return "brown";
    }
    else {
        return ""
    }
}