import type { NextApiRequest, NextApiResponse } from 'next'
import { unstable_getServerSession } from "next-auth";
import prisma from '../../../lib/prisma'
import { authOptions } from '../../../lib/auth'

// DELETE /api/post/:id
// PUT /api/post/:id
export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  const postId = req.query.id;

  const session = await unstable_getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).send({ message: 'Unauthorized' });
  }

  if (req.method === "DELETE") {
    const post = await prisma.post.delete({
      where: { id: String(postId) },
    });
    res.json(post);
  } else if (req.method === "PUT") {
    const { title, content } = req.body;
    const post = await prisma.post.update({
      where: { id: String(postId) },
      data: {
        title: title ?? undefined,
        content: content ?? undefined,
      },
    });
    res.json(post);
  } else {
    throw new Error(
      `The HTTP ${req.method} method is not supported at this route.`
    );
  }
}
