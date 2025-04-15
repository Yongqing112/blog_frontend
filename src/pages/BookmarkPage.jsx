import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, ListGroup, Alert, Button } from 'react-bootstrap';
import NavbarComponent from '../NavbarComponent';
import { useAuth } from '../AuthContext';

export default function BookmarkPage() {
  const { user } = useAuth();
  const [articles, setArticles] = useState([]);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const formatDate = (isoString) => new Date(isoString).toLocaleDateString('zh-TW');

  useEffect(() => {
    if (!user) {
      setMessage('請先登入才能查看收藏文章');
      return;
    }

    axios.get(`http://localhost:8080/article/bookmark/${user.userId}`, { withCredentials: true })
      .then(async res => {
        const articleIds = res.data;

        if (articleIds.length === 0) {
          setMessage('尚未收藏任何文章');
          return;
        }

        const articleList = await Promise.all(
          articleIds.map(id => axios.get(`http://localhost:8080/article/${id}`))
        );

        setArticles(articleList.map(a => a.data));
      })
      .catch(err => {
        console.error('取得收藏失敗', err);
        setMessage('取得收藏資料失敗，請稍後再試');
      });
  }, [user]);

  return (
    <>
      <NavbarComponent />
      <Container className="mt-5 text-center">
        <h1>我的收藏文章</h1>
      </Container>

      <Container className="mt-4">
        {message && <Alert variant="info">{message}</Alert>}

        <ListGroup className="mt-3">
          {articles.map(article => (
            <ListGroup.Item key={article.articleId} action onClick={() => navigate(`/article/${article.articleId}`)}>
              <strong>{article.title}</strong><br />
              <small className="text-muted">
                發布日期：{formatDate(article.date)}
              </small>
            </ListGroup.Item>
          ))}
        </ListGroup>

        <Button className="mt-4" onClick={() => navigate(-1)}>← 返回上一頁</Button>
      </Container>
    </>
  );
}
