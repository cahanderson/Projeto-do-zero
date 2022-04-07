import Prismic from "@prismicio/client"
import { DefaultClient } from '@prismicio/client/types/client';

export function getPrismicClient(req?: unknown):DefaultClient{
  const prismic = Prismic.client(process.env.POINTER_PRISMIC!, {
    req,
    /* accessToken: process.env.PRISMIC_ACCESS_TOKEN, */
  });

  return prismic;
}
