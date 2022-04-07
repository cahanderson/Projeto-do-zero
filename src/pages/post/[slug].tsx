import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import Header from '../../components/Header';
import Prismic from '@prismicio/client'

import { getPrismicClient } from '../../services/prismic';

import style from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Post {
    first_publication_date: string | null;
    data: {
      title: string;
      banner: {
        url: string;
      };
      author: string;
      content: {
        heading: string;
        body: {
          text: string;
        }[];
      }[];
    };
  }

interface PostProps {
  post: Post;
}

export default function Post({post}:PostProps) {

const totalWords = post.data.content.reduce((total, contentItem) => {
  total += contentItem.heading.split(' ').length;

  const word = contentItem.body.map(item => item.text.split(' ').length)
  word.map(word=> (total+=word));
  return total;
},0);
const readTime = Math.ceil(totalWords / 200)

  const router = useRouter();

  if(router.isFallback){
    return <h1>Carregando...</h1>    
  }
  
  const formatedDate = format(
    new Date(post.first_publication_date),
    'dd MMM yyyy',
    {
      locale: ptBR
    }
  )
  return(
    <>
    <Header /> 
    <img src="/banner.png" className={styles.banner} alt="Banner" />
    <main className={style.container}>
      <div className={styles.post}>
        <div className={styles.postTop}>
          <h1>{post.data.title}</h1>
            <ul>
              <li>
                <FiCalendar />
                {formatedDate}
              </li>
              <li>
                <FiUser />
                {post.data.author}
              </li>
              <li>
                <FiClock />
                {`${readTime} min`}
              </li>
            </ul>
        </div>
        {post.data.content.map(content =>{
          return(
            <article key={content.heading}>
              <h2>{content.heading}</h2>
              <div
                className={styles.content}
                dangerouslySetInnerHTML={{
                  __html:RichText.asHtml(content.body),
                }}
              />
            </article>
          )
        })}
      </div>
      <div className={style.content}>
        <strong>
          Lorem ipsum dolor sit, amet consectetur adipisicing elit. 
        </strong>
        <p>
          Quidem nam quia impedit qui iure dolore at debitis ab asperiores quaerat laboriosam odio,
           error tenetur enim pariatur fugiat culpa et sequi?
        </p>
          
      </div>
    </main>
    </>
  )
}

export const getStaticPaths:GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([Prismic.Predicates.at('document.type','publications')]);
  const paths = posts.results.map(post =>{
    return{
      params:{
        slug: post.uid
      },
    };
  });
  return{
    paths,
    fallback:'blocking'
  }
};

export const getStaticProps:GetStaticProps = async ({params}) => {
  const {slug} = params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('publications',String(slug),{});
  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      author: response.data.author,
      banner: {
        url: response.data.banner.url,
      },
      content: response.data.content.map(content =>{
        return{
          heading:content.heading,
          body:[...content.body]
        };
      }),
      },
    };

  return{props:{post}}
}
