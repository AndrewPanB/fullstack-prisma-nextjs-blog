import type { NextApiRequest, NextApiResponse } from 'next'
import { unstable_getServerSession } from "next-auth";
import prisma from '../../../lib/prisma'
import { authOptions } from '../../../lib/auth'

// PUT /api/publish/:id
export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  const postId = req.query.id;

  const session = await unstable_getServerSession(req, res, authOptions);

  if (session) {
    const post = await prisma.post.update({
      where: { id: String(postId) },
      data: { published: true },
    });
    res.json(post);
  } else {
    res.status(401).send({ message: 'Unauthorized' })
  }
}
