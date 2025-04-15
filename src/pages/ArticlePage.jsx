import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Button, Alert, Card, Badge } from 'react-bootstrap';
import NavbarComponent from '../NavbarComponent';

export default function ArticlePage() {
  const { articleId } = useParams();
  const [article, setArticle] = useState({});
  const [author, setAuthor] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`http://localhost:8080/article/${articleId}`)
      .then(res => {
        setArticle(res.data);
      })
      .catch(err => {
        console.error("文章載入失敗", err);
        setError('找不到這篇文章');
      });
  }, [articleId]);

  useEffect(() => {
    if (!article.userId) return;

    axios.get(`http://localhost:8080/users/${article.userId}`)
      .then(res => {
        setAuthor(res.data);
      })
      .catch(err => {
        console.error("作者載入失敗", err);
        setError('找不到這篇文章的作者');
      });
  }, [article.userId]);

  const formatDate = (isoString) => new Date(isoString).toLocaleString('zh-TW');

  return (
    <>
      <NavbarComponent />
      <Container className="mt-5">
        {error && <Alert variant="danger">{error}</Alert>}

        <Button variant="link" onClick={() => navigate(-1)}>← 返回上一頁</Button>

        <Card className="p-4 shadow-sm">
          {/* 作者名稱＋時間 */}
          <div className="d-flex justify-content-between mb-2">
            <span className="fw-bold">{author ? author.username : article.userId}</span>
            <span className="text-muted" style={{ fontSize: '0.9rem' }}>
              {formatDate(article.date)}
            </span>
          </div>

          {/* 文章內容 */}
          <Card.Text style={{ whiteSpace: 'pre-wrap' }}>
            {article.content}
          </Card.Text>

          {/* 標籤 & 分類 */}
          <div className="mt-3 d-flex flex-wrap gap-2">
            {article.tag && article.tag.split(',').map((item, idx) => (
              <Badge bg="secondary" key={idx}>#{item.trim()}</Badge>
            ))}
            <Badge bg="info">分類：{article.category}</Badge>
          </div>
        </Card>
      </Container>
    </>
  );
}
