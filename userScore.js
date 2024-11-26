const { mean } = require('mathjs');
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const scoring = require("./scoring");

const MIN_VALID_RATINGS = 1;
const CRH_RATIO_THRESHOLD = 0.0;
const MEAN_NOTE_SCORE_THRESHOLD = 0.05;
const HELPFULNESS_SCORE_THRESHOLD = 0.66;


async function computeCRHRatio(userId) {
    const notes = await prisma.note.findMany({
        where: {
            userId
        }
    });

    const calculatedNotes = await Promise.all(notes.map(async note => {
        const votings = (await prisma.vote.findMany({
            where: {
                noteId: note.id
            }
        })).map(n => n.score);
        return scoring([{ id: Math.random().toString(32).slice(2), ratings: votings }])[0];
    }));
    const helpfulNotes = calculatedNotes.filter(note => note.status == "Helpful").length
    const notHelpfulNotes = calculatedNotes.filter(note => note.status == "Not Helpful").length
    return helpfulNotes - 5 * notHelpfulNotes;
}

async function computeMeanNoteScore(userId) {
    const notes = await prisma.note.findMany({
        where: {
            userId
        }
    });

    const calculatedNotes = await Promise.all(notes.map(async note => {
        const votings = (await prisma.vote.findMany({
            where: {
                noteId: note.id
            }
        })).map(n => n.score);
        return scoring([{ id: Math.random().toString(32).slice(2), ratings: votings }])[0];
    }));
    const scores = calculatedNotes.map(note => note.score);
    return mean(scores);
}
async function computeRaterHelpfulnessScore(userId) {
    const notes = await prisma.note.findMany({
        where: {
            userId
        }
    });
    const calculatedNotes = await Promise.all(notes.map(async note => {
        const votings = (await prisma.vote.findMany({
            where: {
                noteId: note.id
            }
        })).map(n => n.score);
        return scoring([{ id: Math.random().toString(32).slice(2), ratings: votings }])[0];
    }));
    const t = calculatedNotes.length
    const penality = await prisma.penality.findFirst({
        where: {
            userId: userId
        }
    })
    const p = penality?.score || 0
    if (t == 0) return 0
    return (s - p * 10) / s
}
async function validateContributor(userId) {
    const ratings = await prisma.vote.findMany({
        where: {
            userId
        }
    });
    if (ratings.length < MIN_VALID_RATINGS) return false;
    const crhRatio = await computeCRHRatio(userId);
    const meanNoteScore = computeMeanNoteScore(userId);
    const raterHelpfulnessScore = computeRaterHelpfulnessScore(userId);
    return (
        crhRatio >= CRH_RATIO_THRESHOLD &&
        meanNoteScore >= MEAN_NOTE_SCORE_THRESHOLD &&
        raterHelpfulnessScore >= HELPFULNESS_SCORE_THRESHOLD
    );
}
module.exports = validateContributor
