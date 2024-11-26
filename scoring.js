const math = require('mathjs');


const HELPFUL_THRESHOLD = 0.4;
const NOT_HELPFUL_THRESHOLD = -0.05;
const MINIMUM_RATINGS = 3;
const MAX_FACTOR_MAGNITUDE = 0.5;
const REGULARIZATION_LAMBDA_I = 0.15;
const REGULARIZATION_LAMBDA_F = 0.03;

const mean = (arr) => arr.reduce((sum, val) => sum + val, 0) / arr.length;

function matrixFactorization(noteRaterMatrix, factors = 1, iterations = 1000) {
    const numNotes = noteRaterMatrix.length;
    const numRaters = noteRaterMatrix[0].length;

    const noteFactors = Array(numNotes).fill().map(() => math.random([factors]));
    const raterFactors = Array(numRaters).fill().map(() => math.random([factors]));
    const noteIntercepts = Array(numNotes).fill(0);
    const raterIntercepts = Array(numRaters).fill(0);

    for (let iter = 0; iter < iterations; iter++) {
        for (let i = 0; i < numNotes; i++) {
            for (let j = 0; j < numRaters; j++) {
                const rating = noteRaterMatrix[i][j];
                if (rating === null) continue; 

                const predictedRating =
                    mean([noteIntercepts[i], raterIntercepts[j], math.dot(noteFactors[i], raterFactors[j])]);
                const error = rating - predictedRating;

                for (let k = 0; k < factors; k++) {
                    const gradient = error - REGULARIZATION_LAMBDA_F * noteFactors[i][k];
                    noteFactors[i][k] += 0.01 * gradient;
                    raterFactors[j][k] += 0.01 * gradient;
                }
                noteIntercepts[i] += 0.01 * (error - REGULARIZATION_LAMBDA_I * noteIntercepts[i]);
                raterIntercepts[j] += 0.01 * (error - REGULARIZATION_LAMBDA_I * raterIntercepts[j]);
            }
        }
    }

    return { noteIntercepts, noteFactors };
}
function rankNotes(notes) {
    const noteRaterMatrix = notes.map((note) => {
        return note.ratings.map((rating) => (rating !== undefined ? rating : null));
    });

    const { noteIntercepts, noteFactors } = matrixFactorization(noteRaterMatrix);

    return notes.map((note, index) => {
        const helpfulnessScore = noteIntercepts[index];
        const factorMagnitude = math.norm(noteFactors[index]);

        if (note.ratings.length < MINIMUM_RATINGS) {
            return { id: note.id, status: "Needs More Ratings", score: helpfulnessScore };
        } else if (helpfulnessScore > HELPFUL_THRESHOLD /*&& factorMagnitude < MAX_FACTOR_MAGNITUDE*/) {
            return { id: note.id, status: "Helpful", score: helpfulnessScore };
        } else if (helpfulnessScore < NOT_HELPFUL_THRESHOLD) {
            return { id: note.id, status: "Not Helpful", score: helpfulnessScore };
        } 
    });
}

module.exports = rankNotes
