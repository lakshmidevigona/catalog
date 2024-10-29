const fs = require('fs');

function decodeValue(base, value) {
    return parseInt(value, base);
}

function gaussianElimination(matrix, n) {
    for (let i = 0; i < n; i++) {
        // Partial pivoting
        let maxRow = i;
        for (let k = i + 1; k < n; k++) {
            if (Math.abs(matrix[k][i]) > Math.abs(matrix[maxRow][i])) {
                maxRow = k;
            }
        }
        [matrix[i], matrix[maxRow]] = [matrix[maxRow], matrix[i]]; // Swap rows

        // Normalize pivot row
        for (let j = i + 1; j < n; j++) {
            let factor = matrix[j][i] / matrix[i][i];
            for (let k = i; k <= n; k++) {
                matrix[j][k] -= factor * matrix[i][k];
            }
        }
    }

    // Back substitution
    let result = new Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
        result[i] = matrix[i][n] / matrix[i][i];
        for (let j = i + 1; j < n; j++) {
            result[i] -= (matrix[i][j] / matrix[i][i]) * result[j];
        }
    }
    return result;
}

function findConstantTerm(fileName) {
    const data = fs.readFileSync(fileName, 'utf8');
    const jsonData = JSON.parse(data);

    const n = jsonData.keys.n;
    const k = jsonData.keys.k;

    const points = [];
    for (const [key, obj] of Object.entries(jsonData)) {
        if (key === "keys") continue;
        const x = parseInt(key, 10);
        const y = decodeValue(parseInt(obj.base, 10), obj.value);
        points.push([x, y]);
    }

    if (points.length < k) {
        throw new Error(`Not enough points to solve the polynomial. Minimum required is ${k}, but got ${points.length}`);
    }

    // Construct matrix for Gaussian elimination
    const matrix = Array.from({ length: k }, () => new Array(k + 1).fill(0));
    for (let i = 0; i < k; i++) {
        const [xi, yi] = points[i];
        for (let j = 0; j < k; j++) {
            matrix[i][j] = Math.pow(xi, j); // xi^j
        }
        matrix[i][k] = yi; // y value
    }

    // Solve for coefficients using Gaussian elimination
    const coefficients = gaussianElimination(matrix, k);
    return Math.round(coefficients[0]); // Return the constant term c
}

function main() {
    try {
        const secret1 = findConstantTerm('input2.json');
        console.log('Secret value for Test Case 1:', secret1);

        const secret2 = findConstantTerm('input1.json');
        console.log('Secret for Test Case 2:', secret2);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

main();
