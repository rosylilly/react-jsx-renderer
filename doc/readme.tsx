// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import text from 'bundle-text:../README.md';
import React, { VFC } from 'react';
import MarkdownIt from 'markdown-it';
import taskLists from 'markdown-it-task-lists';

const markdown = new MarkdownIt().use(taskLists);

export const README: VFC = () => {
  const html = markdown.render(text);
  return <div className="content" dangerouslySetInnerHTML={{ __html: html }} />;
};
