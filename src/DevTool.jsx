import { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Button, Alert, Spinner, Card } from 'react-bootstrap';

export default function DevTool() {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');
  const [variant, setVariant] = useState('info');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:8080/users/profile', { withCredentials: true })
      .then(res => {
        setUser(res.data);
        localStorage.setItem('userId', res.data.userId);
      })
      .catch(() => {
        setUser(null);
      });
  }, []);

  const createTestUserAndPosts = async () => {

    setLoading(true);
    setMessage('開始執行...');
    setVariant('info');

    try {

      setMessage('開始發文...');

      for (let i = 1; i <= 10; i++) {
        await axios.post('http://localhost:8080/article/', {
          articleId: `article-${i}`,
          userId: localStorage.getItem('userId'),
          title: `測試文章 ${i}`,
          content: `這是第 ${i} 篇測試內容。`,
          tag: 'test',
          category: '測試分類',
          date: new Date().toISOString(),
        });
      }

      setVariant('success');
      setMessage('全部文章發表成功！');

    } catch (err) {
      console.error(err);
      setVariant('danger');
      setMessage('執行失敗，請檢查 console log');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Card>
        <Card.Body>
          <Card.Title>前端 Dev Tool</Card.Title>
          <Card.Text>發表 10 篇文章</Card.Text>
          <Button variant="primary" onClick={createTestUserAndPosts} disabled={loading}>
            {loading ? <><Spinner animation="border" size="sm" /> 執行中...</> : '開始執行'}
          </Button>
          {message && <Alert className="mt-3" variant={variant}>{message}</Alert>}
        </Card.Body>
      </Card>
    </Container>
  );
}
