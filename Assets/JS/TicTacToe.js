const newField = [0, 1, 2, 3, 4, 5, 6, 7, 8];
const banners = document.querySelector('.banners');
const table = document.querySelector('table');
const blocks = document.querySelectorAll('td');
const xButton = document.querySelector('#x');
const oButton = document.querySelector('#o');
const h2 = document.querySelector('h2');
const resetButton = document.querySelector('#reset')
let user = '', machine = '', player = 'user', field = [...newField];

init();

function init() {
	assign();
}

function assign() {
	resetButton.addEventListener('click', function() {reset();});
	const buttons = document.querySelectorAll('.buttons');
	buttons.forEach(function(el) {
		el.addEventListener('click', function() {
			user = this.value;
			if (user === 'X') {machine = 'O';} else {machine = 'X';}
			xButton.style.display = 'none';
			oButton.style.display = 'none';
			resetButton.style.display = 'inline-block';
			blocks.forEach(function(el) {
				el.addEventListener('click', selectBlock);
			});
		});
	});
}

function reset() {
	user = '', machine = '', player = '', field = [...newField];
	table.style.backgroundColor = '#2a2a2a';
	banners.style.display = 'block';
	resetButton.style.display = 'none';
	xButton.style.display = 'inline-block';
	oButton.style.display = 'inline-block';
	h2.style.display = 'none';
	h2.innerText = '';
	blocks.forEach(function(el) {
		el.style.backgroundColor = '#2a2a2a';
		el.innerText = '';
		el.removeEventListener('click', selectBlock);
	});
}

function selectBlock(event) {
	player = user;
	event.target.innerText = player;
	field[event.target.id] = player;
	blocks[event.target.id].removeEventListener('click', selectBlock);
	console.log(field);
	if (!checkWin(field, player, 'user', false) && !checkTie(field, false)) {machinePlays();}
}

function machinePlays() {
	player = machine;
	let x;
	let empty = getEmpty(field);
	if ((empty.length === 8) && (field[0] === user || field[2] === user || field[6] === user || field[8] === user)) {
		x = 4;
	}	else if ((empty.length === 8) && (field[4] === user)) {
		x = 0;
	}	else if (empty.length === 6 && checkDiagonals(1) !== false) {
		x = checkDiagonals(1);
	} 	else if (empty.length === 6 && checkDiagonals(2) !== false) {
		x = checkDiagonals(2);
	} 	else {
		x = (computeMove(field, 0).index);
		if (!terminal(x) && (typeof checkRowsColumns(field) === 'number')) {
			x = checkRowsColumns(field);
		}
	}
	field[x] = player;
	blocks[x].innerText = player;
	blocks[x].removeEventListener('click', selectBlock);
	console.log(field);
	if (!checkWin(field, player, 'machine', false)) {checkTie(field, false);}
}

function getEmpty(testField) {
	let task = [];
	testField.forEach(function(el, i) {
		if (typeof el === 'number') {task.push(i);}
	});
	return(task);
}

function checkDiagonals(num) {
	if (num === 1) {
		if ((field[0] === user && field[8] === user) || (field[2] === user && field[6] === user)) return 3;
	} else if (num === 2) {
		if ((field [1] === user || field[7] === user) && (field[3] === user || field[5] === user)) return 4;
	}
	return false;
}

function computeMove(current, d) {
	let depth = d + 1;
	let subject = '';
	if (depth % 2 !== 0) {subject = machine;}
	else {subject = user;}
	let empty = getEmpty(current);
	let arr = [...empty];
	let scores = [];
	for (let i = 0; i < empty.length; i++) {
		arr[i] = [...current];
		arr[i][empty[i]] = subject;
		let w = checkWin(arr[i], subject, null, true, empty[i], depth);
		let t = checkTie(arr[i], true, empty[i]);
		if (w) {scores.push(w);}
	    else if (t) {scores.push(t);}
	}
	if (scores[0] === undefined) {
		arr = [...empty];
		for (let i = 0; i < empty.length; i++) {
			arr[i] = [...current];
			arr[i][empty[i]] = subject;
		    scores.push(computeMove(arr[i], depth));
		}
	}
	let best = '';
	if (subject === user) {best = max(scores);}
	else {best = min(scores);}
	return best;
}

function max(arr) {
	let highScore = -10000;
	let selection;
	for (i = 0; i < arr.length; i++) {
		if (arr[i].score === -100) {selection = arr[i]; return selection;}
		if (arr[i].score > highScore) {highScore = arr[i].score, selection = arr[i];}
	}
	return selection;
}

function min(arr) {
	let lowScore = 10000;
	let selection;
	for (i = 0; i < arr.length; i++) {
		if (arr[i].score === 100) {selection = arr[i]; return selection;}
		if (arr[i].score < lowScore) {lowScore = arr[i].score; selection = arr[i];}
	}
	return selection;
}

function terminal(x) {
	const player = [machine, user];
	let temp = [...field];
	for (let i = 0; i < 2; i++) {
		temp[x] = player[i];
		if (checkWin(temp, player[i], null, true, x)) {return true;}
	}
	return false
}

function checkRowsColumns(testField) {
	const rowsColumns = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8]];
	let arr = getMachine(testField);
	let move;
	if (arr.length >= 1 && arr.length <= 3) {
		arr.forEach(function(el) {
			for (let i = 0; i < rowsColumns.length; i++) {
				let x = rowsColumns[i].indexOf(el);
				if (x !== -1) {
					let temp = rowsColumns[i];
					temp.splice(x, 1);
					if (typeof testField[temp[0]] === 'number' && typeof testField[temp[1]] === 'number') {move = (temp[0]); return;}
				}
			}
		});
	return move;
	}
}

function getMachine(testField) {
	let task = [];
	testField.forEach(function(el, i) {
		if (el === machine) {task.push(i);}
	});
	return(task);
}

function checkWin(testField, subject, who, isAI, move, depth) {
	const wins = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
	let test = [];
	testField.forEach(function(el, i) {
		if (el === subject) test.push(i); 
	});
	for (let i = 0; i < wins.length; i++) {
		for (let j = 0, c = 0; j < wins[i].length; j++) {
			if (test.indexOf(wins[i][j]) !== -1) {
				c++;
			}
			if (c === 3 && isAI === false) {
				win(who, wins[i]); 
				return true;
			}
			else if (c === 3 && isAI === true) {
				if (subject === machine) {return {index: move, score: 10, result: 'terminal'};}
				else {return {index: move, score: -10, result: 'terminal'};}
			}
		}
	}
	return false;
}

function checkTie(testField, isAI, move) {
	let empty = getEmpty(testField);
	if (empty[0] === undefined && isAI === false) {
		gameTie();
		return true;
	} 	else if (empty[0] === undefined && isAI === true) {
		return {index: move, score: 0};
	}
	return false;
}

function win(who, winArr) {
	let text = '', color = '';
	resetButton.style.display = 'none';
	banners.style.display = 'none';
	if (who === 'user') {color = '#2ad61d', text = 'YOU WIN!!!';}
	else {color = '#ff2100', text = 'MACHINE WINS!!!';}
	h2.innerText =  text; 
	winArr.forEach(function(el) {
		blocks[el].style.backgroundColor = color;
	});
	h2.style.display = 'block';
	setTimeout(function() {
		reset();
	}, 3500);
}

function gameTie() {
	resetButton.style.display = 'none';
	banners.style.display = 'none';
	h2.innerText = 'IT IS A TIE!!!';
	h2.style.display = 'block';
	blocks.forEach(function(el) {
		el.style.backgroundColor = '#ff7700';
	});
	setTimeout(function() {
		reset();
	}, 3500);
}
