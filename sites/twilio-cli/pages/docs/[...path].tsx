import fs from 'fs';
import path from 'path';
import { MDXComponents } from 'mdx/types';
import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next';
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';

const components: MDXComponents = {};

export default function TestPage({
  source,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return <MDXRemote {...source} components={components} />;
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [
      {
        params: { path: ['twilio-cli'] },
      },
    ],
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps<{
  source: MDXRemoteSerializeResult;
}> = async (context) => {
  const requestedPath = context.params?.path;
  if (!requestedPath) return { notFound: true };

  const filePath = Array.isArray(requestedPath)
    ? path.resolve(process.cwd(), 'docs', ...requestedPath)
    : path.resolve(process.cwd(), 'docs', requestedPath);

  const { readFile } = fs.promises;
  const markdown = await readFile(`${filePath}.mdx`, {
    encoding: 'utf-8',
  });

  const mdxSource = await serialize(markdown);
  return { props: { source: mdxSource }, revalidate: 60 };
};
