import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, ListGroup } from 'react-bootstrap';
import NavbarComponent from '../NavbarComponent';

export default function Home() {
  const [articles, setArticles] = useState([]);
  const navigate = useNavigate();
  
  const timeAgo = (isoString) => {
    const now = new Date();
    const past = new Date(isoString);
    const seconds = Math.floor((now - past) / 1000);
  
    const intervals = [
      { label: '年', seconds: 31536000 },
      { label: '個月', seconds: 2592000 },
      { label: '天', seconds: 86400 },
      { label: '小時', seconds: 3600 },
      { label: '分鐘', seconds: 60 },
      { label: '秒', seconds: 1 },
    ];
  
    for (const interval of intervals) {
      const count = Math.floor(seconds / interval.seconds);
      if (count >= 1) {
        return `${count} ${interval.label}前`;
      }
    }
  
    return '剛剛';
  };

  useEffect(() => {

    axios.get('http://localhost:8080/article/all')
      .then(res => {
        const sortedArticles = 
        res.data
        .filter(article => !article.isDeleted)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
        setArticles(sortedArticles);
      })
      .catch(err => {
        console.error('取得文章失敗', err);
      });
  }, []);

  return (
    <>

      <NavbarComponent />

      <Container className="mt-5 text-center">
        <h1>歡迎來到 Blog !！</h1>
      </Container>

      <Container className="mt-4">
        <h3>📚 所有文章列表：</h3>
        <ListGroup className="mt-3">
          {articles.length > 0 ? (
            articles.map(article => (
              <ListGroup.Item key={article.articleId} action onClick={() => navigate(`/article/${article.articleId}`)}>
                <strong>{article.title}</strong><br />
                <p className="text-muted">{article.content.split('\n')[0]}</p>
                <small className="text-muted">
                {timeAgo(article.date)}
                </small>
              </ListGroup.Item>
            ))
          ) : (
            <p>目前尚無文章。</p>
          )}
        </ListGroup>
      </Container>

    </>
  );
}
