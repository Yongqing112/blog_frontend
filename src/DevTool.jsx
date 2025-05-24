import { useState } from 'react';
import axios from 'axios';
import { Container, Button, Alert, Spinner, Card } from 'react-bootstrap';
import { useAuth } from './AuthContext';

export default function DevTool() {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [variant, setVariant] = useState('info');
  const [loading, setLoading] = useState(false);

  const createArticles = async () => {
    if (!user) {
      setVariant('danger');
      setMessage('請先登入後再執行');
      return;
    }

    setLoading(true);
    setMessage('開始執行...');
    setVariant('info');

    try {
      setMessage('開始發文...');

      for (let i = 1; i <= 10; i++) {
        await axios.post('http://localhost:8080/article/', {
          articleId: `article-${i}`,
          userId: user.userId,
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

  const createTestUsers = async () => {
    setLoading(true);
    setMessage('開始執行...');
    setVariant('info');

    try {
      setMessage('開始註冊...');

      fetch('http://localhost:8080/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // 等同於 axios 的 withCredentials: true
        body: JSON.stringify({
          username: '1',
          password: '1'
        })
      })
          .then(res => res.json())
          .then(data => {
            console.log('註冊成功:')
          })
          .catch(err => console.error('註冊失敗:', err));

      fetch('http://localhost:8080/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // 等同於 axios 的 withCredentials: true
        body: JSON.stringify({
          username: '2',
          password: '2'
        })
      })
          .then(res => res.json())
          .then(data => {
            console.log('註冊成功:')
          })
          .catch(err => console.error('註冊失敗:', err));

      setVariant('success');
      setMessage("建立測試 user 成功");
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
          <Button
            variant="primary"
            onClick={createArticles}
            disabled={loading || !user}
          >
            {loading
              ? <>
                  <Spinner animation="border" size="sm" /> 執行中...
                </>
              : user
                ? '開始執行'
                : '請先登入'}
          </Button>

          <p></p>
          <Card.Text>新增測試 user</Card.Text>
          <Button
              variant="primary"
              onClick={createTestUsers}
              disabled={loading}
          >開始執行
          </Button>
          {message && (
            <Alert className="mt-3 text-center" variant={variant}>
              {message}
            </Alert>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}
