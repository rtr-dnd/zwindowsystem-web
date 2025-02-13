import { GetStaticPaths, GetStaticProps, NextPage } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Head from "next/head";
import fs from 'fs'
import markdownToHtml from "zenn-markdown-html";
import { JSDOM } from 'jsdom'
import styles from '../../styles/Docs.module.scss'
import { whatIsIt } from "../../content/content";
import { DocsProps, TableOfContent } from "../../compontents/common";
import TOC from "../../compontents/TOC";
import Header from "../../compontents/Header";
import Sidenav, { SidenavPath } from "../../compontents/Sidenav";
import DocsNav from "../../compontents/DocsNav";
import { useTranslation } from "next-i18next";

type PathParams = {
  id: string
}

export const getStaticPaths: GetStaticPaths<PathParams> = async ({ locales }) => {
  let paths: any = []
  whatIsIt.articles.forEach((e) => {
    locales?.forEach((l) => {
      paths.push({ params: { id: e.path }, locale: l })
    })
  })
  return {
    paths: paths,
    fallback: false
  }
}

export const getStaticProps: GetStaticProps = async ({ params, locale }) => {
  const content = fs.readFileSync(
    `content/what_is_it/${params!.id}/${locale}.md`, 'utf-8')
  const rawHtmlContent = markdownToHtml(content)
  const htmlContent = rawHtmlContent.replaceAll('<img src="', `<img src="/images/what_is_it/${params!.id}/`)
  const domHtml = new JSDOM(htmlContent).window.document

  const headings = domHtml.querySelectorAll<HTMLElement>("h2")
  const tableOfContent: TableOfContent[] = []
  headings.forEach((element) => {
    const level = element.tagName
    const title = element.innerHTML.split("</a> ")[1]
    const href = '#' + element.id
    tableOfContent.push({ level: level, title: title, href: href })
  })

  const contentIndex = whatIsIt.articles.findIndex((e) => e.path == params!.id)
  const nextContent = contentIndex == whatIsIt.articles.length - 1 ? null :  whatIsIt.articles[contentIndex + 1].path
  const previousContent = contentIndex == 0 ? null : whatIsIt.articles[contentIndex - 1].path

  return {
    props: {
      ...(await serverSideTranslations(locale!, ['common'])),
      html: htmlContent,
      tableOfContent: tableOfContent,
      nextContent: nextContent,
      previousContent: previousContent
    }
  }
}

const WhatIsIt: NextPage<DocsProps> = ({ html, tableOfContent, nextContent, previousContent }) => {
  const { t } = useTranslation('common')

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <Header />
        <section className={styles.body}>
          <Sidenav kind={SidenavPath.whatIsIt}/>
          <article className={styles.article}>
            <div className={styles.content}>
              <div className={styles.markdowninjection}
                dangerouslySetInnerHTML={{ __html: html }}
              />
              <DocsNav
                next={nextContent == null ? undefined : {
                  path: nextContent,
                  title: t(['what_is_it', 'articles', nextContent].join('.'))
                }}
                previous={previousContent == null ? undefined : {
                  path: previousContent,
                  title: t(['what_is_it', 'articles', previousContent].join('.'))
                }}
              />
            </div>
            <TOC toc={tableOfContent} />
          </article>
        </section>
      </main>
    </div>
  )
}

export default WhatIsIt
