document.getElementById("create").addEventListener("click", buildTable);

function generateMathEquation(numCount, opWeights) {
    // Функция для генерации последовательности операций с учетом правил повторения.
    // Если количество операций меньше, чем число уникальных операторов, то ищем только неиспользованные,
    // иначе допускаем те, что встречались меньше двух раз.
    function generateOpSequence(numOps, opWeights) {
      const availableOps = Object.keys(opWeights);
      const opArr = [];
      for (let i = 0; i < numOps; i++) {
        let candidateOps;
        if (i < availableOps.length) {
          // Пока можем избежать повторов – выбираем операторы, которых еще не было.
          candidateOps = availableOps.filter(op => !opArr.includes(op));
        } else {
          // Иначе допускаем операторы, в которых повторений меньше двух.
          candidateOps = availableOps.filter(op =>
            opArr.filter(x => x === op).length < 2
          );
        }
        // Если по каким-то причинам список пуст (хотя в норме он не должен быть пустым), возвращаем все с count < 2.
        if (candidateOps.length === 0) {
          candidateOps = availableOps.filter(op =>
            opArr.filter(x => x === op).length < 2
          );
        }
        // Выбираем операцию случайно с учетом весов в candidateOps.
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
  
    // Функция, которая преобразует цепочку операций (например, [ '*', '/' ]) и массив чисел в строковое представление.
    function segmentToString(segmentNumbers, chainOps) {
      let str = segmentNumbers[0].toString();
      for (let i = 0; i < chainOps.length; i++) {
        str += " " + chainOps[i] + " " + segmentNumbers[i + 1].toString();
      }
      return str;
    }
  
    // Цикл повторной генерации до тех пор, пока итоговый результат не попадет в диапазон [0, 100]
    while (true) {
      // Шаг 1. Генерируем последовательность операций.
      // Всего операций должно быть (numCount - 1)
      const opArr = generateOpSequence(numCount - 1, opWeights);
  
      // Шаг 2. Разбиваем последовательность на сегменты.
      // Операторы '+' и '-' разделяют выражение на «умножительно-делительные» цепочки.
      const segmentsOps = []; // цепочки операций для умножения/деления
      const addOps = [];      // операторы сложения/вычитания между сегментами
      let currentSegmentOps = [];
      for (const op of opArr) {
        if (op === '+' || op === '-') {
          segmentsOps.push(currentSegmentOps);
          addOps.push(op);
          currentSegmentOps = []; // начинаем новую цепочку
        } else {
          // Операции '*' и '/'
          currentSegmentOps.push(op);
        }
      }
      // Добавляем последний сегмент
      segmentsOps.push(currentSegmentOps);
  
      // Шаг 3. Для каждой цепочки генерируем числа так, чтобы промежуточные операции были корректны.
      // Для простоты выбираем числа из диапазона 1..20.
      const segments = [];
      const maxRange = 20;
      for (const chain of segmentsOps) {
        const numbers = [];
        // Начальное число в цепочке: от 1 до maxRange
        let currentValue = Math.floor(Math.random() * maxRange) + 5;
        numbers.push(currentValue);
        // Пробегаем по каждой операции в цепочке.
        for (const op of chain) {
          if (op === '*') {
            // При умножении выбираем множитель.
            const factor = Math.floor(Math.random() * maxRange) + 1;
            numbers.push(factor);
            currentValue = currentValue * factor;
          } else if (op === '/') {
            // При делении выбираем делитель так, чтобы текущее значение делилось без остатка.
            const divisors = [];
            for (let d = 1; d <= maxRange; d++) {
              if (currentValue % d === 0) {
                divisors.push(d);
              }
            }
            // На всякий случай, если делителей не найдено (теоретически 1 всегда делитель)
            if (divisors.length === 0) {
              divisors.push(1);
            }
            const divisor = divisors[Math.floor(Math.random() * divisors.length)];
            numbers.push(divisor);
            currentValue = currentValue / divisor;
          }
        }
        segments.push({ numbers, value: currentValue });
      }
  
      // Шаг 4. Собираем итоговое выражение.
      // Первое значение – значение первого сегмента.
      let expressionStr = segmentToString(segments[0].numbers, segmentsOps[0]);
      let result = segments[0].value;
  
      // Применяем операции сложения/вычитания между цепочками.
      for (let i = 0; i < addOps.length; i++) {
        const op = addOps[i];
        const segIndex = i + 1;
        expressionStr += " " + op + " " + segmentToString(segments[segIndex].numbers, segmentsOps[segIndex]);
        if (op === '+') {
          result += segments[segIndex].value;
        } else if (op === '-') {
          result -= segments[segIndex].value;
        }
      }
  
      // Добавляем результат к строковому представлению
      expressionStr += " = " + result.toString();
  
      // Шаг 5. Проверяем условие итогового результата.
      if (result >= 0 && result <= 100) {
        return expressionStr;
      }
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
        arr.push(generateMathEquation(numCount - 1, opWeights)); 
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
            arr.push(generateMathEquation(numCount - 1, opWeights)); 
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
    let removalConfig = {};

    const maxRemoveCount = Math.min(totalNumbers - 3, totalNumbers);

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
            opWeights = { "+": 5, "-": 5, "*": 5, "/": 5 };
            break;
        case 'medium':
            opWeights = { "+": 4, "-": 4, "*": 6, "/": 6 };
            break;
        case 'hard':
            opWeights = { "+": 2, "-": 2, "*": 8, "/": 8 };
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