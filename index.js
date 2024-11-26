import AdminJS from 'adminjs'
import AdminJSExpress from '@adminjs/express'
import { Database, Resource, getModelByName } from '@adminjs/prisma'
const { PrismaClient } = require("@prisma/client");
const crypto = require('crypto');
const prisma = new PrismaClient();
const express = require('express')
const schemas = require("./schemas")
const scoring = require("./scoring")
const userScore = require("./userScore")
const app = express()
const port = 3000
AdminJS.registerAdapter({ Database, Resource })
const adminOptions = {
    resources: [{
      resource: { model: getModelByName('Note'), client: prisma },
      options: {},
    }, {
      resource: { model: getModelByName('Vote'), client: prisma },
      options: {},
    }, {
      resource: { model: getModelByName('Penality'), client: prisma },
      options: {},
    }],
  }
const admin = new AdminJS(adminOptions)
console.log(admin.options.rootPath)
const adminRouter = AdminJSExpress.buildRouter(admin)
app.use(admin.options.rootPath, adminRouter)

app.delete('/api/votes', async (req, res) => {
    var { noteId } = req.query
    const oldNote = await prisma.vote.findFirst({
        where: {
            noteId
        }
    })
    if (!oldNote) return res.status(400).json({ success: false, error: "Note not found." });
    await prisma.vote.delete({
        where: {
            id: oldNote.id
        }
    })
    res.json({ success: true })
})

app.post('/api/notes', async (req, res) => {
    const { postId, userId, text } = req.query
    const id = crypto.randomUUID()
    const parse = schemas.note.safeParse({ ...req.query, id })
    const { success } = parse
    if (!success) return res.json(parse)
    const note = await prisma.note.create({
        data: {
            id: crypto.randomUUID(),
            postId, userId, text

        }
    });
    res.json({ success: true, ...note })
})
app.delete('/api/votes', async (req, res) => {
    var { noteId, userId } = req.query
    const oldVote = await prisma.vote.findFirst({
        where: {
            userId, noteId
        }
    })
    if (!oldVote) return res.status(400).json({ success: false, error: "Vote not found." });
    await prisma.vote.delete({
        where: {
            id: oldVote.id
        }
    })
    res.json({ success: true })
})
app.post('/api/votes', async (req, res) => {
    var { noteId, userId, score, forceValid } = req.query
    req.query.score = parseInt(score)
    const parse = schemas.vote.safeParse(req.query)
    var { success } = parse
    if (!success) return res.status(400).json(parse)
    const note = await prisma.note.findFirst({
        where: {
            id: noteId
        }
    })

    if (!note) return res.status(400).json({ success: false, error: "Note does not exist." });
    const oldVote = await prisma.vote.findFirst({
        where: {
            userId, noteId
        }
    })
    const valid = forceValid || await userScore(userId)

    if (oldVote) {
        const record = await prisma.vote.update({
            where: {
                id: oldVote.id
            },
            data: {
                score: parseInt(score),
                valid: !!Boolean(valid)
            }
        })
        return res.json({ success: true, ...record })
    } else {
        const record = await prisma.vote.create({
            data: {
                id: crypto.randomUUID(),
                userId,
                noteId,
                score: parseInt(score),
                valid: !!Boolean(valid)
            }
        })
        return res.json({ success: true, ...record })

    }
})
app.get('/api/getNotesForPost/:id', async (req, res) => {
    const { id } = req.params
    var notes = await prisma.note.findMany({
        where: {
            postId: id
        }
    })
    const calculatedNotes = await Promise.all(notes.map(async note => {
        const ratings = (await prisma.vote.findMany({
            where: {
                noteId: note.id,
                valid: true
            }
        })).map(vote => vote.score)
        return { ...scoring([{ ...note, ratings }])[0], ...note }
    }))
    console.log(calculatedNotes)
    res.json(calculatedNotes)
})
app.listen(port, () => {
    console.log(`Opennoteserver is listening on port ${port}`)
})

