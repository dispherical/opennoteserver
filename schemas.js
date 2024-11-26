const { z } = require("zod")

module.exports = {
    note: z.object({
        postId: z.string(),
        userId: z.string().optional(),
        text: z.string(),
        id: z.string()
    }),
    vote: z.object({
        userId: z.string(),
        noteId: z.string(),
        score: z.number().gte(0).lte(1).step(0.5),
        forceValid: z.any().optional()
    })
}