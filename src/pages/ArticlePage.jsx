import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Button, Alert, Card, Badge, Form } from 'react-bootstrap';
import NavbarComponent from '../NavbarComponent';
import { useAuth } from '../AuthContext';

export default function ArticlePage() {
  const { articleId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [article, setArticle] = useState({});
  const [author, setAuthor] = useState(null);
  const [error, setError] = useState(null);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [commentMsg, setCommentMsg] = useState('');
  const [bookmarkMsg, setBookmarkMsg] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);

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

  useEffect(() => {
    if (!user || !articleId) return;
    axios.get(`http://localhost:8080/article/bookmark/${user.userId}`, { withCredentials: true })
      .then(res => {
        const bookmarkedIds = res.data;
        setIsBookmarked(bookmarkedIds.includes(articleId));
      })
      .catch(err => {
        console.error('取得收藏資訊失敗', err);
        setIsBookmarked(false);
      });
  }, [user, articleId]);

  useEffect(() => {
    if (!articleId) return;

    axios.get(`http://localhost:8080/feedback/${articleId}/comments`)
      .then(async (res) => {
        const commentsRaw = res.data;

        const commentsWithUsernames = await Promise.all(
          commentsRaw.map(async (comment) => {
            try {
              const userRes = await axios.get(`http://localhost:8080/users/${comment.userId}`);
              return { ...comment, username: userRes.data.username };
            } catch (err) {
              return { ...comment, username: '未知用戶' };
            }
          }).sort((a, b) => new Date(a.date) - new Date(b.date))
        );

        setComments(commentsWithUsernames);
      })
      .catch(err => {
        console.error("留言載入失敗", err);
      });
  }, [articleId, commentMsg]);

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
      await axios.post(`http://localhost:8080/feedback/${user.userId}/${articleId}/${article.userId}/comment-edited`, comment, {
        headers: { 'Content-Type': 'text/plain' },
        withCredentials: true
      });

      setCommentMsg('留言成功！');
      setComment('');
    } catch (err) {
      console.error('留言失敗', err);
      setCommentMsg('留言失敗，請稍後再試');
    }
  };

  const toggleBookmark = async () => {
    setBookmarkMsg('');

    if (!user) {
      setBookmarkMsg('請先登入才能操作收藏');
      return;
    }

    try {
      if (isBookmarked) {
        await axios.delete(`http://localhost:8080/article/bookmark/${user.userId}/${articleId}`, {
          withCredentials: true
        });
        setBookmarkMsg('已取消收藏');
        setIsBookmarked(false);
      } else {
        await axios.put(`http://localhost:8080/article/bookmark/${user.userId}/${articleId}`, null, {
          withCredentials: true
        });
        setBookmarkMsg('收藏成功！');
        setIsBookmarked(true);
      }
    } catch (err) {
      console.error('收藏操作失敗', err);
      setBookmarkMsg('操作失敗，請稍後再試');
    }
  };

  const addReaction = async (writerId, targetId, type) => {
    if (!user) {
      alert("請先登入才能反應");
      return;
    }

    try {
      await axios.post(`http://localhost:8080/feedback/${writerId}/${targetId}/${user.userId}/add-reaction`, type, {
        headers: { 'Content-Type': 'text/plain' },
        withCredentials: true,
      });
    } catch (err) {
      console.error('Reaction 送出失敗', err);
      alert('送出失敗，請稍後再試');
    }
  };

  return (
    <>
      <NavbarComponent />
      <Container className="mt-5">
        {error && <Alert variant="danger">{error}</Alert>}

        <Button variant="link" onClick={() => navigate(-1)}>← 返回上一頁</Button>

        <Card className="p-4 shadow-sm">
          <div className="d-flex justify-content-between mb-2">
            <span className="fw-bold">{author ? author.username : article.userId}</span>
            <span className="text-muted" style={{ fontSize: '0.9rem' }}>
              {formatDate(article.date)}
            </span>
          </div>

          <Card.Text style={{ whiteSpace: 'pre-wrap' }}>
            {article.content}
          </Card.Text>

          <div className="mt-3 d-flex flex-wrap gap-2">
            {article.tag && article.tag.split(',').map((item, idx) => (
              <Badge bg="secondary" key={idx}>#{item.trim()}</Badge>
            ))}
            <Badge bg="info">分類：{article.category}</Badge>
          </div>

          <div className="mt-4">
            <Button variant={isBookmarked ? 'success' : 'outline-warning'} onClick={toggleBookmark}>
              {isBookmarked ? '✅ 已收藏' : '加入收藏'}
            </Button>
            {bookmarkMsg && <Alert variant="info" className="mt-2">{bookmarkMsg}</Alert>}
          </div>

          <div className="mt-3">
            <Button variant="outline-success" size="sm" onClick={() => addReaction(article.userId, articleId, 'up')}>👍</Button>{' '}
            <Button variant="outline-danger" size="sm" onClick={() => addReaction(article.userId, articleId, 'down')}>👎</Button>
          </div>
        </Card>

        <Card className="mt-4 p-4">
          <h5>留言區</h5>

          <div className="mt-4">
            {comments.length > 0 ? (
              comments.map((cmt, idx) => (
                <Card key={idx} className="mb-2 p-2">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="fw-bold">{cmt.username}</div>
                    <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                      B{idx + 1}
                    </div>
                  </div>
                  <div style={{ whiteSpace: 'pre-wrap' }}>{cmt.content}</div>
                  <div className="mt-2">
                    <Button
                      variant="outline-success"
                      size="sm"
                      onClick={() => addReaction(cmt.userId, articleId, 'up')}
                    >
                      👍
                    </Button>{' '}
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => addReaction(cmt.userId, articleId, 'down')}
                    >
                      👎
                    </Button>
                  </div>
                  <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                    {new Date(cmt.date).toLocaleString('zh-TW')}
                  </div>
                </Card>
              ))
            ) : (
              <p className="text-muted">目前還沒有留言</p>
            )}
          </div>

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
