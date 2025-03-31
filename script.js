document.getElementById("create").addEventListener("click", buildTable);

function generateMathEquation(numCount, opWeights) {
    const operations = ['+', '-', '*', '/'];
    const weightedOperations = [];

    for (const op in opWeights) {
        for (let i = 0; i < Math.floor(opWeights[op] * 100); i++) {
            weightedOperations.push(op);
        }
    }

    let numbers, equation, result;

    do {
        numbers = [];
        equation = "";

        for (let i = 0; i < numCount - 1; i++) {
            numbers.push(Math.floor(Math.random() * 30) + 5);
        }

        equation = numbers[0].toString();
        let currentValue = numbers[0];

        for (let i = 1; i < numbers.length; i++) {
            let operation = weightedOperations[Math.floor(Math.random() * weightedOperations.length)];
            let operand = numbers[i];

            if (operation === '/') {
                let validDivisors = [];
                for (let d = 1; d <= currentValue; d++) {
                    if (currentValue % d === 0) validDivisors.push(d);
                }

                if (validDivisors.length > 0) {
                    operand = validDivisors[Math.floor(Math.random() * validDivisors.length)];
                } else {
                    operand = 1;
                }
            }

            let tempValue = eval(`${currentValue} ${operation} ${operand}`);

            if (operation === '/' && !Number.isInteger(tempValue)) {
                continue; 
            }

            equation += ` ${operation} ${operand}`;
            currentValue = tempValue;
        }

        result = evaluateEquation(equation);

    } while (result < 1 || result > 100 || !Number.isInteger(result));

    equation += ` = ${result}`;
    return equation;
}

function evaluateEquation(equation) {
    try {
        let result = eval(equation);
        return Number.isInteger(result) ? result : null;
    } catch (error) {
        return null;
    }
}

const findVerticalExpression = (datasets, numbers) => {
    return numbers.map(num => {
        for (const dataset of datasets) {
        const found = dataset.find(item => item.value === num);
        if (found) return found.expression + ' = ' + num;
        }
        return num.toString();
    });
};

const getVerticalExpression = (numbersArray, datasets) => {
    let result = [];
    numbersArray.forEach(e => {
        result.push(e.match(/\d+/g).map(Number))
    });
    return result.map(numbers => (
        findVerticalExpression(datasets, numbers)
    ));
};

function calculateCombinationsWithOrder(numbers, operations) {
    let results = [];

    function evaluate(expression) {
        try {
            const result = eval(expression);
            if (Number.isInteger(result) && result > 0 && result < 100) {
                results.push({ expression, value: result });
            }
        } catch (e) {

        }
    }

    function generateExpressions(index, expression) {
        if (index === numbers.length) {
            evaluate(expression);
            return;
        }

        for (let op of operations) {
            generateExpressions(index + 1, `${expression} ${op} ${numbers[index]}`);
        }
    }

    generateExpressions(1, `${numbers[0]}`);
    return results;
}

function findPossibleEquations(arrays, operations) {
    const targetResults = arrays.pop();
    const results = [];

    function evaluate(expression) {
        try {
            const result = eval(expression);
            if (targetResults.includes(result) && result < 100) {
                results.push(expression + " = " + result );
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


function getMathEquations(numCount, rowCount, opWeights){
    let arr = []; 
    let verticalEquations = [];
    for(let i = 0; i < rowCount - 1; i++){
        arr.push(generateMathEquation(numCount, opWeights)); 
    }

    for(let i = 0; i < 10; i++){
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

        if(resultExpressions.length > 0){
        const finalResult = getVerticalExpression(resultExpressions, calculatedResults); 

        let indFR = finalResult.indexOf(finalResult[Math.floor(Math.random()*finalResult.length)]); 

        arr.push(resultExpressions[indFR]); 

        verticalEquations = finalResult[indFR]; 
        break;
        }
        else{
        arr.length = 0;
        for(let i = 0; i < rowCount - 1; i++){
            arr.push(generateMathEquation(numCount, opWeights)); 
        }
        }
    }
    return {horizontal: arr, vertical: verticalEquations}; 
}

function createMatsMatrix(data) {
    const { horizontal, vertical } = data;

    const rows = horizontal.length * 2 - 1; 
    const cols = vertical.length * 2 - 1;

    const matrix = Array.from({ length: rows }, () => Array(cols).fill(' '));

    horizontal.forEach((equation, i) => {
        const row = i * 2; 
        equation.split(' ').forEach((char, j) => {
            if(char === '/'){
                char = '÷';
            }
            if(char === '*'){
                char = '×';
            }
            matrix[row][j] = char; 
        });
    });

    vertical.forEach((equation, i) => {
        const col = i * 2; 
        equation.split(' ').forEach((char, j) => {
            if(char === '/'){
                char = '÷';
            }
            if(char === '*'){
                char = '×';
            }
            matrix[j][col] = char;
        });
    });

    return matrix;
}

function getRemovalConfig(complexity, matrix) {
    const totalNumbers = matrix.flat().filter(cell => !isNaN(cell) && cell !== ' ').length;
    console.log(totalNumbers);
    let removalConfig = {};

    const maxRemoveCount = Math.min(totalNumbers - 3, totalNumbers);
    console.log(maxRemoveCount)

    switch (complexity) {
        case 'easy':
            removalConfig = {
                minRemove: 3,
                maxRemove: Math.min(5, maxRemoveCount)
            };
            break;
        case 'medium':
            removalConfig = {
                minRemove: 5,
                maxRemove: Math.min(7, maxRemoveCount)
            };
            break;
        case 'hard':
            removalConfig = {
                minRemove: 7,
                maxRemove: Math.min(10, maxRemoveCount)
            };
            break;
    }

    return removalConfig;
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

function getCompexity(complexity){
    let opWeights = {};

    switch (complexity){
        case 'easy':
            opWeights = { "+": 0.25, "-": 0.25, "*": 0.25, "/": 0.25 };
            break;
        case 'medium':
            opWeights = { "+": 0.2, "-": 0.2, "*": 0.4, "/": 0.2 };
            break;
        case 'hard':
            opWeights = { "+": 0.1, "-": 0.1, "*": 0.5, "/": 0.3 };
            break;
    }

    return opWeights;
}

let initialMatrix = [];
let initialFilledMatrix = [];

function buildTable() {
    const table = document.getElementById("puzzle");
    table.innerHTML = '';

    const complexity = document.getElementById("complexity").value;
    const opWeights = getCompexity(complexity);

    const resSize = document.getElementById("size").value.split("*");

    const numCount = parseInt(resSize[0], 10);
    const rowCount = parseInt(resSize[1], 10);

    const data = getMathEquations(numCount, rowCount, opWeights);
    const matrix = createMatsMatrix(data);
    initialMatrix = JSON.parse(JSON.stringify(matrix));

    const { matrix: finalMatrix } = emptyRandomCells(matrix, complexity);
    initialFilledMatrix = JSON.parse(JSON.stringify(finalMatrix));

    finalMatrix.forEach((row, rowIndex) => {
        const tr = document.createElement('tr');
        row.forEach((cell, colIndex) => {
            const td = document.createElement('td');
            
            if (cell === null) {
                td.classList.add('empty');
                td.setAttribute('contenteditable', 'true');
                td.setAttribute('data-row', rowIndex);
                td.setAttribute('data-col', colIndex);
                td.addEventListener('input', handleUserInput);
            } else if (cell === ' ') {
                td.classList.add('unused-cell');
            } else {
                td.textContent = cell;
            }
            
            tr.appendChild(td);
        });
        table.appendChild(tr);
    });

    document.getElementById("resetButton").addEventListener("click", resetPuzzle);
    document.getElementById("checkButton").addEventListener("click", checkPuzzle);
}

function handleUserInput(event) {
    let input = event.target.textContent.trim();
    if (!/^\d*$/.test(input)) {
        event.target.textContent = input.replace(/\D/g, '');
    }
}

function resetPuzzle() {
    const table = document.getElementById("puzzle");
    const rows = table.getElementsByTagName('tr');

    for (let i = 0; i < initialFilledMatrix.length; i++) {
        const row = initialFilledMatrix[i];
        const tr = rows[i];
        const cells = tr.getElementsByTagName('td');
        for (let j = 0; j < row.length; j++) {
            const cell = cells[j];
            if (row[j] === null) {
                cell.textContent = '';
                cell.classList.add('empty');
            } else {
                cell.textContent = row[j];
            }
            cell.style.backgroundColor = '';
        }
    }
}

function checkPuzzle() {
    const table = document.getElementById("puzzle");
    const rows = table.getElementsByTagName('tr');

    for (let i = 0; i < table.rows.length; i++) {
        for (let j = 0; j < table.rows[i].cells.length; j++) {
            const cellValue = table.rows[i].cells[j].innerText; 
            const matrixValue = initialMatrix[i][j];

            if (cellValue === matrixValue) {
                if(matrixValue !== ' '){
                    table.rows[i].cells[j].style.backgroundColor = "rgb(163, 215, 110)";
                }
            } else {
                if(matrixValue !== ' '){
                    table.rows[i].cells[j].style.backgroundColor = "rgb(180, 77, 90)";
                }
            }
        }
    }
}