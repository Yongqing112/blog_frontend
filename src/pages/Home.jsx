import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, ListGroup } from 'react-bootstrap';
import NavbarComponent from '../NavbarComponent';

export default function Home() {
  const [articles, setArticles] = useState([]);
  const navigate = useNavigate();
  const formatDate = (isoString) => new Date(isoString).toLocaleDateString('zh-TW');

  useEffect(() => {

    axios.get('http://localhost:8080/article/all')
      .then(res => {
        const sortedArticles = res.data.sort((a, b) => new Date(b.date) - new Date(a.date));
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
              <ListGroup.Item key={article.id} action onClick={() => navigate(`/article/${article.articleId}`)}>
                <strong>{article.title}</strong><br />
                <small className="text-muted">
                  發布日期：{formatDate(article.date)}
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
