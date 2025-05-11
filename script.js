window.onload = createEmptyTable
const board = document.getElementById("board");
const width = 320 // 455 350
const height = 260
let emptyCellCounter = 0
let COMPLEXITY_TYPE = "EASY_LEVEL"
//document.getElementById("create").addEventListener("click", buildTable);

const fullscreenButton = document.getElementById("fullscreenButton");
const labelsComplexityRadioButtons = document.querySelectorAll("#complexity-level label")

// Fullscreen logic
fullscreenButton.addEventListener("click", () => {
    if (fullscreenButton.children[0].innerHTML === "fullscreen") {
        document.documentElement.requestFullscreen()
        fullscreenButton.children[0].innerHTML = "fullscreen_exit"
        changeWidthDependFullscreenMode("on")
    } else {
        document.exitFullscreen()
        fullscreenButton.children[0].innerHTML = "fullscreen"
        changeWidthDependFullscreenMode("off")
    }
})

document.addEventListener('fullscreenchange', exitFullscreen, false)

function exitFullscreen() {
    if (document.fullscreenElement === null) {
        fullscreenButton.children[0].innerHTML = "fullscreen"
        changeWidthDependFullscreenMode("off")
    }
}

function changeWidthDependFullscreenMode(mode) {
    if (mode === "on")
        document.body.setAttribute("style", "max-width: 100%;")
    if (mode === "off")
        document.body.setAttribute("style", "max-width: 776px;")
}

labelsComplexityRadioButtons.forEach(label => {
    label.onfocus = (event) =>
        event.target.querySelector(".inner").style.setProperty("--change-opacity", "1")
    label.onblur = (event) =>
        event.target.querySelector(".inner").style.setProperty("--change-opacity", "0")
    label.onclick = () => { COMPLEXITY_TYPE = label.children[0].value }
})

function generateUniqueMathEquations(numEquations, numCount, opWeights, maxNumber, minNumber) {
    const equations = [];
    const usedResults = new Set();

    const positionUsedNumbers = Array(numCount).fill().map(() => new Set());

    function generateMathEquation(numCount, opWeights) {
        const equationNumbers = new Set();

        function isPrime(n) {
            if (n < 2) return false;
            for (let i = 2; i <= Math.sqrt(n); i++) {
                if (n % i === 0) return false;
            }
            return true;
        }

        function getDivisors(n) {
            const divisors = [];
            for (let i = 1; i <= n; i++) {
                if (n % i === 0) {
                    divisors.push(i);
                }
            }
            return divisors;
        }

        function getRandomNumber(min = 1, max = 50, excludeSet, position) {
            let num;
            let attempts = 0;
            const maxAttempts = 25;

            do {
                num = Math.floor(Math.random() * (max - min + 1)) + min;
                attempts++;
                if (attempts >= maxAttempts) {
                    if (!excludeSet.has(num)) break;

                    if (attempts >= maxAttempts * 1.5) {
                        num = Math.floor(Math.random() * (max - min + 1)) + min;
                        break;
                    }
                }
            } while (
                excludeSet.has(num) ||
                (position !== undefined && positionUsedNumbers[position].has(num)) ||
                (isPrime(num) && num > 10)
            );

            excludeSet.add(num);
            if (position !== undefined) {
                positionUsedNumbers[position].add(num);
            }
            return num;
        }

        function generateOpSequence(numOps, opWeights) {
            const availableOps = Object.keys(opWeights);
            const opArr = [];

            for (let i = 0; i < numOps; i++) {
                let candidateOps = availableOps.filter(op =>
                    opArr.filter(x => x === op).length < Math.ceil(numOps / availableOps.length)
                );

                if (i > 0) {
                    if (opArr[i - 1] === '*') {
                        candidateOps = candidateOps.filter(op => op !== '/');
                    } else if (opArr[i - 1] === '/') {
                        candidateOps = candidateOps.filter(op => op !== '*');
                    }
                }

                if (candidateOps.length === 0) {
                    candidateOps = availableOps;
                    if (i > 0 && (opArr[i - 1] === '*' || opArr[i - 1] === '/')) {
                        candidateOps = candidateOps.filter(op => op !== '*' && op !== '/');
                        if (candidateOps.length === 0) {
                            candidateOps = ['+', '-'];
                        }
                    }
                }

                let totalWeight = candidateOps.reduce((sum, op) => sum + opWeights[op], 0);
                let rand = Math.random() * totalWeight;
                let chosen;

                for (let op of candidateOps) {
                    if (rand < opWeights[op]) {
                        chosen = op;
                        break;
                    }
                    rand -= opWeights[op];
                }

                if (!chosen) chosen = candidateOps[candidateOps.length - 1];
                opArr.push(chosen);
            }

            return opArr;
        }

        function buildEquation(numCount, opWeights) {
            const numbers = [];
            const operations = generateOpSequence(numCount - 1, opWeights);
            console.log(operations);
            const tokens = [];
            let expression = '';
        
            let firstNum = getRandomNumber(minNumber, maxNumber, equationNumbers, 0);
            if (firstNum == null) return null;
        
            numbers.push(firstNum);
            tokens.push(firstNum);
            equationNumbers.add(firstNum);
            positionUsedNumbers[0].add(firstNum);
        
            for (let i = 0; i < operations.length; i++) {
                const op = operations[i];
                let nextNum;
                let attempts = 0;
                const maxAttempts = 20;
                let valid = false;
        
                while (attempts < maxAttempts && !valid) {
                    attempts++;
        
                    let shouldAvoid = new Set();
                    if (i > 0 && operations[i - 1] === '*' && op === '/') {
                        shouldAvoid.add(numbers[i]);
                    } else if (i > 0 && operations[i - 1] === '/' && op === '*') {
                        shouldAvoid.add(numbers[i]);
                    }
        
                    if (op === '+') {
                        nextNum = getRandomNumber(minNumber, maxNumber, equationNumbers, i + 1);
                    } else if (op === '-') {
                        const maxSub = numbers[i];
                        if (maxSub <= 1) continue;
                        nextNum = getRandomNumber(minNumber, Math.min(maxNumber, maxSub - 1), equationNumbers, i + 1);
                    } else if (op === '*') {
                        const maxFactor = 10;
                        const factors = [];
        
                        for (let j = 2; j <= maxFactor; j++) {
                            if (!equationNumbers.has(j) && !positionUsedNumbers[i + 1].has(j) && !shouldAvoid.has(j)) {
                                factors.push(j);
                            }
                        }
        
                        if (factors.length === 0) continue;
                        nextNum = factors[Math.floor(Math.random() * factors.length)];
                    } else if (op === '/') {
                        const prevNum = numbers[numbers.length - 1];
                        const divisors = getDivisors(prevNum).filter(d =>
                            d !== 1 &&
                            d !== prevNum &&
                            d <= 20 &&
                            !equationNumbers.has(d) &&
                            !positionUsedNumbers[i + 1].has(d) &&
                            !shouldAvoid.has(d)
                        );
        
                        if (divisors.length === 0) continue;
                        nextNum = divisors[Math.floor(Math.random() * divisors.length)];
                    }
        
                    if (nextNum === undefined) continue;
        
                    if ((op === '+' || op === '-') && nextNum === 0) continue;
                    if ((op === '*' || op === '/') && nextNum === 1) continue;
        
                    valid = true;
        
                    numbers.push(nextNum);
                    operations[i] = op;
                    tokens.push(op);
                    tokens.push(nextNum);
                    equationNumbers.add(nextNum);
                    positionUsedNumbers[i + 1].add(nextNum);
                }
        
                if (!valid) {
                    return null;
                }
            }
        
            expression = tokens.join(' ');
            let result;
            try {
                result = eval(expression);
            } catch (e) {
                return null;
            }
        
            if (!Number.isInteger(result) || result <= 0 || result > 100 || usedResults.has(result)) {
                return null;
            }
        
            return {
                expression,
                result,
                numbers,
                operations
            };
        }
        

        let result = null;
        let attempts = 0;
        const maxAttempts = 40;

        while (result === null && attempts < maxAttempts) {
            attempts++;
            equationNumbers.clear();
            result = buildEquation(numCount, opWeights);
        }

        if (result === null) {

            return buildSimpleEquation(numCount, opWeights);
        }

        return {
            equation: result.expression + " = " + result.result,
            result: result.result
        };
    }

    function buildSimpleEquation(numCount, opWeights) {
        const numbers = [];
        const operations = [];
        const equationNumbers = new Set();

        let currentValue;
        let firstPosition = true;

        for (let i = 2; i <= 20; i++) {
            if (!positionUsedNumbers[0].has(i)) {
                currentValue = i;
                positionUsedNumbers[0].add(i);
                firstPosition = false;
                break;
            }
        }

        if (firstPosition) {
            currentValue = Math.floor(Math.random() * 19) + 2; // 2-20
        }

        numbers.push(currentValue);
        equationNumbers.add(currentValue);

        let lastOpNum = null;
        let lastOp = null;

        for (let i = 1; i < numCount; i++) {
            const availableOps = Object.keys(opWeights);
            let candidateOps = [...availableOps];

            if (lastOp === '*') {
                candidateOps = candidateOps.filter(op => op !== '/');
            } else if (lastOp === '/') {
                candidateOps = candidateOps.filter(op => op !== '*');
            }

            if (candidateOps.length === 0) {
                candidateOps = ['+', '-']; 
            }

            let nextOp;

            const opWeightSum = candidateOps.reduce((sum, op) => sum + opWeights[op], 0);
            let rand = Math.random() * opWeightSum;

            for (let op of candidateOps) {
                if (rand < opWeights[op]) {
                    nextOp = op;
                    break;
                }
                rand -= opWeights[op];
            }

            if (!nextOp) nextOp = candidateOps[candidateOps.length - 1];
            operations.push(nextOp);

            let nextNum;
            let attempts = 0;
            const maxAttempts = 20;
            let valid = false;

            let shouldAvoid = new Set();
            if (lastOp === '*' && nextOp === '/') {
                shouldAvoid.add(lastOpNum);
            } else if (lastOp === '/' && nextOp === '*') {
                shouldAvoid.add(lastOpNum);
            }

            while (!valid && attempts < maxAttempts) {
                attempts++;

                const availableNumbers = [];
                for (let j = 1; j <= 20; j++) {
                    if (!equationNumbers.has(j) && !positionUsedNumbers[i].has(j) && !shouldAvoid.has(j)) {
                        availableNumbers.push(j);
                    }
                }

                if (availableNumbers.length === 0) {
                    for (let j = 1; j <= 20; j++) {
                        if (!equationNumbers.has(j) && !shouldAvoid.has(j)) {
                            availableNumbers.push(j);
                        }
                    }
                }

                if (availableNumbers.length === 0) {
                    for (let j = 1; j <= 20; j++) {
                        if (!equationNumbers.has(j)) {
                            availableNumbers.push(j);
                        }
                    }
                }

                if (availableNumbers.length === 0) {
                    nextNum = Math.floor(Math.random() * 20) + 1;
                } else {
                    nextNum = availableNumbers[Math.floor(Math.random() * availableNumbers.length)];
                }

                let nextResult;

                if (nextOp === '+') {
                    nextResult = currentValue + nextNum;
                    valid = nextResult <= 100 && !usedResults.has(nextResult) && nextNum !== 0;
                }
                else if (nextOp === '-') {
                    if (nextNum >= currentValue) {
                        if (attempts < maxAttempts / 2) {
                            continue;
                        } else {
                            nextNum = Math.max(1, Math.floor(currentValue / 2));
                        }
                    }
                    nextResult = currentValue - nextNum;
                    valid = nextResult > 0 && !usedResults.has(nextResult) && nextNum !== 0;
                }
                else if (nextOp === '*') {
                    const maxFactor = Math.floor(100 / currentValue);
                    if (maxFactor < 2) {
                        nextOp = '+';
                        operations[operations.length - 1] = '+';
                        continue;
                    }

                    if (nextNum > maxFactor) {
                        if (attempts < maxAttempts / 2) {
                            continue;
                        } else {
                            nextNum = Math.min(nextNum, maxFactor);
                        }
                    }
                    nextResult = currentValue * nextNum;
                    valid = nextResult <= 100 && !usedResults.has(nextResult) && nextNum !== 1;
                }
                else if (nextOp === '/') {
                    if (currentValue % nextNum !== 0 || nextNum === 1 || nextNum === currentValue) {
                        if (attempts < maxAttempts / 2) {
                            continue;
                        } else {
                            const divisors = getDivisors(currentValue).filter(d =>
                                d !== 1 && d !== currentValue && !equationNumbers.has(d) && !shouldAvoid.has(d) && d <= 20
                            );

                            if (divisors.length > 0) {
                                nextNum = divisors[Math.floor(Math.random() * divisors.length)];
                            } else {
                                nextOp = '+';
                                operations[operations.length - 1] = '+';
                                continue;
                            }
                        }
                    }

                    nextResult = currentValue / nextNum;
                    valid = Number.isInteger(nextResult) && !usedResults.has(nextResult) && nextNum !== 1;
                }

                if (valid && nextResult === currentValue) {
                    valid = false;
                }

                if (!valid && attempts >= maxAttempts) {
                    nextOp = '+';
                    operations[operations.length - 1] = '+';

                    nextNum = Math.min(10, 100 - currentValue);
                    if (nextNum <= 0) nextNum = 3; 

                    currentValue += nextNum;
                    valid = true;
                }

                if (valid) {
                    numbers.push(nextNum);
                    equationNumbers.add(nextNum);
                    lastOpNum = nextNum; 
                    lastOp = nextOp;
                    currentValue = nextResult;
                    positionUsedNumbers[i].add(nextNum);
                }
            }
        }

        let equation = numbers[0].toString();
        for (let i = 0; i < operations.length; i++) {
            equation += " " + operations[i] + " " + numbers[i + 1];
        }

        return {
            equation: equation + " = " + currentValue,
            result: currentValue
        };
    }

    for (let i = 0; i < numEquations; i++) {
        let equationData;
        let attempts = 0;
        const maxAttempts = 50; 

        do {
            equationData = generateMathEquation(numCount, opWeights);
            attempts++;
            if (attempts >= maxAttempts) {
                console.warn("Warning: Could not generate enough unique equations with unique results.");
                break;
            }
        } while (equations.includes(equationData.equation) || usedResults.has(equationData.result));

        usedResults.add(equationData.result);
        equations.push(equationData.equation);
    }

    return equations;
}

function findVerticalExpression(datasets, numbers) {
    return numbers.map((num, i) => {
        const dataset = datasets[i];

        if (!dataset) return num.toString();

        const matches = dataset.filter(item => item.value === num);

        if (matches.length > 0) {
            const randomMatch = matches[Math.floor(Math.random() * matches.length)];
            return randomMatch.expression + ' = ' + num;
        }

        return num.toString();
    });
}

function getVerticalExpression(numbersArray, datasets) {
    const extractNumbers = expr => expr.match(/\d+/g).map(Number);

    return numbersArray.map(expr => {
        const numbers = extractNumbers(expr);
        return findVerticalExpression(datasets, numbers);
    });
}

function calculateCombinationsWithOrder(numbers, operations) {
    let results = [];
    let memo = new Map(); 

    function evaluate(expression) {
        if (memo.has(expression)) {
            return memo.get(expression); 
        }

        try {
            const result = eval(expression);
            if (Number.isInteger(result) && result > 0 && result < 100) {
                memo.set(expression, result);
                return result;
            }
        } catch (e) {}

        return null;
    }

    function generateExpressions(index, expression, currentValue) {
        if (index === numbers.length) {
            results.push({ expression, value: currentValue });
            return;
        }

        for (let op of operations) {
            let newExpression = `${expression} ${op} ${numbers[index]}`;
            let newValue = evaluate(newExpression);

            if (newValue !== null && newValue > 0 && newValue < 100) {
                generateExpressions(index + 1, newExpression, newValue);
            }
        }
    }

    generateExpressions(1, `${numbers[0]}`, numbers[0]);
    console.log(results);
    return results;
}

function findPossibleEquations(arrays, operations) {
    const targetResults = arrays.pop();
    const results = [];

    function evaluate(expression) {
        try {
            if (expression.includes("/")) {
            const numbers = expression.split(/[\+\-\*\/]/).map(num => parseInt(num.trim()));
            const operators = expression.match(/[\+\-\*\/]/g);

            for (let i = 0; i < operators.length; i++) {
                if (operators[i] === "/") {
                    const dividend = numbers[i];
                    const divisor = numbers[i + 1];

                    if (dividend % divisor !== 0 || dividend / divisor <= 0) {
                        return null;
                    }
                }
            }
        }

            const result = eval(expression);
            if (targetResults.includes(result) && result < 100) {
                results.push(expression + " = " + result);
            }
        } catch (e) {

        }
    }

    function generateExpressions(arrays, index, currentExpression) {
        if (index === arrays.length) {
            evaluate(currentExpression);
            return;
        }

        for (let num of arrays[index]) {
            for (let op of operations) {
                generateExpressions(
                    arrays,
                    index + 1,
                    `${currentExpression} ${op} ${num}`
                );
            }
        }
    }

    for (let num of arrays[0]) {
        generateExpressions(arrays, 1, `${num}`);
    }

    return results;
}

function getNumbersFromExpressions(expressions) {
    const operandArrays = [];
    const resultArray = [];

    expressions.forEach(expression => {
        const parts = expression.split('=');

        const leftPart = parts[0].trim();
        const result = parseInt(parts[1].trim(), 10);
        resultArray.push(result);

        const numbers = leftPart.match(/\d+/g).map(num => parseInt(num, 10));

        numbers.forEach((num, index) => {
            if (!operandArrays[index]) {
                operandArrays[index] = [];
            }
            operandArrays[index].push(num);
        });
    });

    return [...operandArrays, resultArray];
}


function getMathEquations(numCount, rowCount, opWeights, min, max) {
    numCount = numCount == 5 ? 3 : 4;
    rowCount = rowCount == 5 ? 3 : 4;
    let arr = [];
    let verticalEquations = [];
    let eqs = generateUniqueMathEquations(rowCount - 1, numCount - 1, opWeights, max, min);

    eqs.forEach(eq => {
        arr.push(eq);
    });

    for (let i = 0; i < 20; i++) {
        const separatedNumbers = getNumbersFromExpressions(arr);

        let calculatedResults = [];
        const operations = ['+', '-', '*', '/'];
        let valuesArray = [];

        separatedNumbers.forEach(array => {
            calculatedResults.push(calculateCombinationsWithOrder(array, operations));
        });

        calculatedResults.forEach(entry => {
            valuesArray.push(entry.map(i => i.value));
        });

        const resultExpressions = findPossibleEquations(valuesArray, operations);

        if (resultExpressions.length > 0) {
            const finalResult = getVerticalExpression(resultExpressions, calculatedResults);

            let indFR;
            let attempts = 0;

            do {
                indFR = Math.floor(Math.random() * finalResult.length);
                attempts++;
            } while (attempts < finalResult.length && verticalEquations.includes(resultExpressions[indFR]));

            if (!verticalEquations.includes(resultExpressions[indFR])) {
                arr.push(resultExpressions[indFR]);
                verticalEquations = finalResult[indFR];
                break;
            }
        } else {
            arr.length = 0;
            eqs.length = 0;
            eqs = generateUniqueMathEquations(rowCount - 1, numCount - 1, opWeights, max, min);
            eqs.forEach(eq => {
                arr.push(eq);
            });
        }
    }

    return { horizontal: arr, vertical: verticalEquations };
}

function createMatsMatrix(data) {
    const { horizontal, vertical } = data;

    const rows = horizontal.length * 2 - 1;
    const cols = vertical.length * 2 - 1;

    console.log(data);

    const matrix = Array.from({ length: rows }, () => Array(cols).fill(' '));

    horizontal.forEach((equation, i) => {
        const row = i * 2;
        equation.split(' ').forEach((char, j) => {
            if (char === '/') {
                char = ':';
            }
            if (char === '*') {
                char = '×';
            }
            if (char === '-') {
                char = '–';
            }
            matrix[row][j] = char;
        });
    });

    vertical.forEach((equation, i) => {
        const col = i * 2;
        equation.split(' ').forEach((char, j) => {
            if (char === '/') {
                char = ':';
            }
            if (char === '*') {
                char = '×';
            }
            if (char === '-') {
                char = '–';
            }
            matrix[j][col] = char;
        });
    });

    return matrix;
}

function getRemovalConfig(complexity, matrix) {
    const totalNumbers = matrix.flat().filter(cell => !isNaN(cell) && cell !== ' ').length;

    let minRemove = 0;
    let maxRemove = 0;

    switch (complexity) {
        case 'EASY_LEVEL':
            if (totalNumbers <= 9) {
                [minRemove, maxRemove] = [2, 3];
            } else if (totalNumbers <= 12) {
                [minRemove, maxRemove] = [2, 4];
            } else {
                [minRemove, maxRemove] = [3, 5];
            }
            break;

        case 'MEDIUM_LEVEL':
            if (totalNumbers <= 9) {
                [minRemove, maxRemove] = [3, 5];
            } else if (totalNumbers <= 12) {
                [minRemove, maxRemove] = [5, 7];
            } else {
                [minRemove, maxRemove] = [6, 9];
            }
            break;

        case 'HARD_LEVEL':
            if (totalNumbers <= 9) {
                [minRemove, maxRemove] = [6, 7];
            } else if (totalNumbers <= 12) {
                [minRemove, maxRemove] = [8, 10];
            } else {
                [minRemove, maxRemove] = [10, 13];
            }
            break;

        default:
            [minRemove, maxRemove] = [3, 5];
            break;
    }

    return {
        minRemove: minRemove,
        maxRemove: maxRemove
    };
}

function emptyRandomCells(matrix, complexity) {
    const { minRemove, maxRemove } = getRemovalConfig(complexity, matrix);
    const totalCells = matrix.length * matrix[0].length;
    const totalNumbers = matrix.flat().filter(cell => !isNaN(cell) && cell !== null).length;

    const removeCount = Math.floor(Math.random() * (maxRemove - minRemove + 1)) + minRemove;

    const actualRemoveCount = Math.min(removeCount, totalNumbers);

    let digitCells = [];
    for (let row = 0; row < matrix.length; row++) {
        for (let col = 0; col < matrix[row].length; col++) {
            if (!isNaN(matrix[row][col]) && matrix[row][col] !== " ") {
                digitCells.push({ row, col, value: matrix[row][col] });
            }
        }
    }

    if (actualRemoveCount > digitCells.length) {
        return;
    }

    let emptyCells = new Set();
    while (emptyCells.size < actualRemoveCount) {
        const randomIndex = Math.floor(Math.random() * digitCells.length);
        emptyCells.add(randomIndex);
    }

    emptyCells.forEach(index => {
        const { row, col, value } = digitCells[index];
        matrix[row][col] = null;
    });

    return { matrix };
}

function getCompexity(complexity) {
    let opWeights = {};
    let min = 0;
    let max = 0;

    switch (complexity) {
        case 'EASY_LEVEL':
            opWeights = { "+": 5, "-": 5, "*": 3, "/": 1 };
            [min, max] = [1, 30];
            break;
        case 'MEDIUM_LEVEL':
            opWeights = { "+": 5, "-": 5, "*": 5, "/": 3 };
            [min, max] = [10, 50];
            break;
        case 'HARD_LEVEL':
            opWeights = { "+": 3, "-": 4, "*": 5, "/": 4 };
            [min, max] = [20, 70];
            break;
    }

    return {opWeights, min, max};
}

let initialMatrix = [];
let initialFilledMatrix = [];

function buildTable() {
    if (board.children.length !== 0)
        board.removeChild(board.children[0]);

    const table = document.createElement("table")
    table.setAttribute("cellspacing", "0")
    table.setAttribute("id", "game-board")
    board.appendChild(table)

    const {opWeights, min, max} = getCompexity(COMPLEXITY_TYPE);

    const resSize = document.getElementById("size").value.split("*");

    let numCount = parseInt(resSize[0], 10);
    let  rowCount = parseInt(resSize[1], 10);

    const data = getMathEquations(numCount, rowCount, opWeights, min, max);
    const matrix = createMatsMatrix(data);
    initialMatrix = JSON.parse(JSON.stringify(matrix));

    const { matrix: finalMatrix } = emptyRandomCells(matrix, COMPLEXITY_TYPE);
    initialFilledMatrix = JSON.parse(JSON.stringify(finalMatrix));

    finalMatrix.forEach((row, rowIndex) => {
        const tr = document.createElement('tr');
        table.appendChild(tr)
        row.forEach((cell, colIndex) => {
            const td = document.createElement("td");
            td.setAttribute("style", `width: ${width / Number(rowCount)}px; height: ${height / Number(rowCount)}px;`);
            tr.appendChild(td);

            if (cell === null) {
                td.setAttribute('contenteditable', 'true');
                td.setAttribute('data-row', rowIndex);
                td.setAttribute('data-col', colIndex);
                td.setAttribute("style", `font-size: ${200 / Number(rowCount)}px;`);
                td.addEventListener('keydown', handleKeyDown);  
                td.addEventListener('input', handleInput);
            } else if (cell === ' ') {
                td.classList.add('unused-cell');
            } else {
                td.style.background = "#ECECEC"
                const divStringWrapper = document.createElement("div");
                divStringWrapper.setAttribute("class", "content-wrapper");
                divStringWrapper.setAttribute("id", `game-board-base-element${rowIndex + colIndex}`);
                divStringWrapper.setAttribute("style", `width: ${width / Number(rowCount)}px; height: ${height / Number(rowCount)}px; background: #ECECEC;`);
                divStringWrapper.style.fontSize = `${200 / Number(rowCount)}px`;
                divStringWrapper.innerHTML = cell;
                td.appendChild(divStringWrapper);
            }

            tr.appendChild(td);
        });
    });

    resetCheckButton();
}

function handleKeyDown(event) {
    const maxLength = 1; 
    if (event.target.textContent.length > maxLength && event.key !== 'Backspace') {
        event.preventDefault(); 
        showHint(event.target, `Використовуй однозначні або двозначні числа`);
    }
}

function handleInput(event) {
    let input = event.target.textContent.trim();

    if (!/^\d*$/.test(input)) {
        event.target.textContent = input.replace(/\D/g, '');
        showHint(event.target, "Вводь лише числа");
    }

    event.target.style.background = '';

    resetCheckButton();
}

function showHint(targetCell, message) {
    const oldHint = board.querySelector(".input-hint");
    if (oldHint) {
        oldHint.remove();
    }

    const hint = document.createElement("div");
    hint.textContent = message;
    hint.className = "input-hint";

    hint.style.position = "absolute";
    hint.style.background = "#fff";
    hint.style.color = "#333";
    hint.style.fontSize = "1em";
    hint.style.fontFamily = '"IBM Plex Sans", Arial, sans-serif'
    hint.style.padding = "4px 10px";
    hint.style.border = "1px solid #aaa";
    hint.style.borderRadius = "4px";
    hint.style.boxShadow = "0 2px 6px rgba(0,0,0,0.2)";
    hint.style.zIndex = 1000;

    const table = document.getElementById("game-board");
    const containerRect = table.getBoundingClientRect();
    const cellRect = targetCell.getBoundingClientRect();

    hint.style.top = `${cellRect.top - containerRect.top + 75}px`;
    hint.style.left = `${cellRect.left - containerRect.left + 100}px`;

    board.appendChild(hint);

    setTimeout(() => hint.remove(), 2500);
}

function resetPuzzle() {
    const table = document.getElementById("game-board");
    const rows = table.getElementsByTagName('tr');

    for (let i = 0; i < initialFilledMatrix.length; i++) {
        const row = initialFilledMatrix[i];
        const tr = rows[i];
        const cells = tr.getElementsByTagName('td');
        for (let j = 0; j < row.length; j++) {
            const cell = cells[j];
            if (row[j] === null) {
                cell.textContent = '';
                cell.style.backgroundColor = '';
            }
        }
    }

    resetCheckButton();
}

function checkPuzzle() {
    const checkButton = document.getElementById("check");
    const table = document.getElementById("game-board");
    const tableInfo = Array.from(table.rows).map(row =>
        Array.from(row.cells).map(td => {
            const div = td.querySelector("div.content-wrapper");
            return div ? div.textContent.trim() : td.textContent.trim();
        })
    );

    if (!isGameBoardFilled(table)) {
        checkButton.removeAttribute("onclick");
        checkButton.innerHTML = "Заповни усі клітинки";
        return;
    }

    const { columnsFailsIndexes, rowsFailsIndexes } = checkMatrix(tableInfo);

    let flag = true;

    for (let i = 0; i < table.rows.length; i++) {
        for (let j = 0; j < table.rows[i].cells.length; j++) {
            const cell = table.rows[i].cells[j];
            if (cell.getAttribute('contenteditable') !== null) {
                const inInvalidRow = rowsFailsIndexes.includes(i);
                const inInvalidCol = columnsFailsIndexes.includes(j);
    
                if (inInvalidRow || inInvalidCol) {
                    cell.style.backgroundColor = "rgb(205, 0, 28)";
                    flag = false;
                } else {
                    cell.style.backgroundColor = "rgb(163, 215, 110)";
                }
            }
        }
    }

    if (flag) {
        checkButton.classList.add("correct");
        checkButton.classList.remove("cta-primary");
        checkButton.removeAttribute("onclick");
        checkButton.innerHTML = "Правильно";
    }
    else {
        checkButton.classList.add("wrong");
        checkButton.classList.remove("cta-primary");
        checkButton.removeAttribute("onclick");
        checkButton.innerHTML = "Неправильно";
    }
}

function isGameBoardFilled(game_board) {
    const arrayTr = game_board.children
    for (let i = 0; i < arrayTr.length; i++) {
        const arrayTd = arrayTr[i].children
        for (let j = 0; j < arrayTd.length; j++) {
            if (arrayTd[j].textContent === '' && arrayTd[j].classList.value !==("unused-cell"))
                return false;
        }
    }
    return true
}

function checkMatrix(matrix) {
    function checkEquation(equation) {
        const equalsIndex = equation.indexOf("=");
        const expression = equation.slice(0, equalsIndex).trim();
        const result = equation.slice(equalsIndex + 1).trim();
        const resultNumber = parseInt(result);
        return eval(expression) == resultNumber;
    }

    const normalizedMatrix = matrix.map(row =>
        row.map(cell => cell.replace('×', '*').replace(':', '/').replace('–', '-'))
    )

    const evenRows = normalizedMatrix.filter((_, rowIndex) => rowIndex % 2 === 0)
        .map(row => row.join(' '));

    const evenColumns = [];
    for (let i = 0; i < normalizedMatrix[0].length; i++) {
        if (i % 2 === 0) {
            const columnValues = normalizedMatrix.map(row => row[i]).join(' ');
            evenColumns.push(columnValues);
        }
    }

    function getFailedIndexes(results, step = 2, offset = 0) {
        return results
            .map((value, i) => value === false ? i * step + offset : -1)
            .filter(index => index !== -1);
    }

    const columnsFails = evenColumns.map(checkEquation);
    const rowsFails = evenRows.map(checkEquation);

    const columnsFailsIndexes = getFailedIndexes(columnsFails);
    const rowsFailsIndexes = getFailedIndexes(rowsFails);

    return { columnsFailsIndexes, rowsFailsIndexes };
}

function createEmptyTable() {
    if (board.children.length !== 0)
        board.removeChild(board.children[0])

    const game_table = document.createElement("table")
    game_table.setAttribute("cellspacing", "0")
    board.appendChild(game_table)

    for (let i = 1; i <= 5; i++) {
        const tr = document.createElement('tr');
        game_table.appendChild(tr)
        for (let j = 1; j <= 5; j++) {
            const td = document.createElement('td');
            td.setAttribute("style", `width: ${width / Number(5)}px; height: ${height / Number(5)}px;`)
            tr.appendChild(td)
            td.appendChild(emptySellGenerator())
        }
    }

    const checkButton = document.getElementById("check");
    checkButton.removeAttribute("onclick");
    checkButton.innerHTML = "Перевірити";
}

function emptySellGenerator() {
    const div = document.createElement("div");
    div.setAttribute("id", `empty-cell-${emptyCellCounter++}`);
    div.setAttribute("style", `width: ${width / Number(5)}px; height: ${height / Number(5)}px;`);
    return div;
}

function resetCheckButton() {
    const checkButton = document.getElementById("check");
    checkButton.classList.remove("wrong");
    checkButton.classList.remove("correct");
    checkButton.classList.add("cta-primary");
    checkButton.setAttribute("onclick", "checkPuzzle()");
    checkButton.innerHTML = "Перевірити";
}