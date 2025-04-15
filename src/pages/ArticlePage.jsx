import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Button, Alert, Card, Badge, Form } from 'react-bootstrap';
import NavbarComponent from '../NavbarComponent';
import { useAuth } from '../AuthContext';

export default function ArticlePage() {
  const { articleId } = useParams();
  const { user } = useAuth();
  const [article, setArticle] = useState({});
  const [author, setAuthor] = useState(null);
  const [error, setError] = useState(null);
  const [comment, setComment] = useState('');
  const [commentMsg, setCommentMsg] = useState('');
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

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    setCommentMsg('');

    if (!user) {
      setCommentMsg('請先登入才能留言');
      return;
    }

    if (!comment.trim()) {
      setCommentMsg('留言內容不能為空');
      return;
    }

    try {
      await axios.post(`http://localhost:8080/feedback/${user.userId}/${articleId}/comment-edited`, comment, {
        headers: { 'Content-Type': 'text/plain' }
      });

      setCommentMsg('留言成功！');
      setComment('');
    } catch (err) {
      console.error('留言失敗', err);
      setCommentMsg('留言失敗，請再試一次');
    }
  };

  return (
    <>
      <NavbarComponent />
      <Container className="mt-5">
        {error && <Alert variant="danger">{error}</Alert>}

        <Button variant="link" onClick={() => navigate(-1)}>← 返回上一頁</Button>

        <Card className="p-4 shadow-sm">
          {/* 作者＋時間 */}
          <div className="d-flex justify-content-between mb-2">
            <span className="fw-bold">{author ? author.username : article.userId}</span>
            <span className="text-muted" style={{ fontSize: '0.9rem' }}>
              {formatDate(article.date)}
            </span>
          </div>

          {/* 內容 */}
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

        {/* 留言區 */}
        <Card className="mt-4 p-4">
          <h5>留言區</h5>
          <Form onSubmit={handleCommentSubmit}>
            <Form.Control
              as="textarea"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="輸入你的留言..."
            />
            <Button className="mt-2" type="submit">送出留言</Button>
          </Form>
          {commentMsg && <Alert variant="info" className="mt-2">{commentMsg}</Alert>}
        </Card>
      </Container>
    </>
  );
}
