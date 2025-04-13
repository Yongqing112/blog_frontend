import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Button, Navbar, Nav, ListGroup } from 'react-bootstrap';

export default function Home() {
  const [user, setUser] = useState(null);
  const [articles, setArticles] = useState([]);
  const navigate = useNavigate();
  const formatDate = (isoString) => new Date(isoString).toLocaleDateString('zh-TW');

  useEffect(() => {
    axios.get('http://localhost:8080/users/profile', { withCredentials: true })
      .then(res => {
        setUser(res.data);
        localStorage.setItem('userId', res.data.userId);
      })
      .catch(() => {
        setUser(null);
      });

    // 取得文章列表
    axios.get('http://localhost:8080/article/all')
    .then(res => {
      setArticles(res.data);
    })
    .catch(err => {
      console.error('取得文章失敗', err);
    });
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:8080/users/logout', null, { withCredentials: true });
      window.location.href = '/login';
    } catch {
      alert('登出失敗');
    }
  };

  return (
    <>
      <Navbar bg="light" expand="lg" className="justify-content-between">
        <Container>
          <Navbar.Brand>Blog</Navbar.Brand>
          <Nav className="d-flex gap-2">
            {user && (
              <Button variant="outline-primary" onClick={() => navigate(`/user`)}>
                個人頁面
              </Button>
            )}
            <Button variant="outline-danger" onClick={handleLogout}>
              登出
            </Button>
          </Nav>
        </Container>
      </Navbar>

      <Container className="mt-5 text-center">
        <h1>歡迎來到 Blog 主畫面！</h1>
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
