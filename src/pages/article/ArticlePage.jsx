import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Button, Alert, Card, Badge, Form } from 'react-bootstrap';
import NavbarComponent from '../../NavbarComponent';
import { useAuth } from '../../AuthContext';
import Comment from './Comment';

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
  const [isUp, setIsUp] = useState(false);
  const [isDown, setIsDown] = useState(false);
  const [articleReactionId, setArticleReactionId] = useState(null);
  const [reactionRefreshKey, setReactionRefreshKey] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editTag, setEditTag] = useState('');
  const [reactionMap, setReactionMap] = useState({});

  const userId = user?.userId;

  useEffect(() => {
    axios.get(`http://localhost:8080/article/${articleId}`)
      .then(res => {
        setArticle(res.data);
        setEditTitle(res.data.title);
        setEditContent(res.data.content);
        setEditCategory(res.data.category);
        setEditTag(res.data.tag);
      })
      .catch(err => {
        console.error("文章載入失敗", err);
        setError('找不到這篇文章');
      });
  }, [articleId, reactionRefreshKey]);

  useEffect(() => {
    if (!article.userId) return;
    axios.get(`http://localhost:8080/users/${article.userId}`)
      .then(res => setAuthor(res.data))
      .catch(err => {
        console.error("作者載入失敗", err);
        setError('找不到這篇文章的作者');
      });
  }, [article.userId]);

  useEffect(() => {
    if (!userId || !articleId) return;
    axios.get(`http://localhost:8080/article/bookmark/${userId}`, { withCredentials: true })
      .then(res => setIsBookmarked(res.data.includes(articleId)))
      .catch(err => {
        console.error('取得收藏資訊失敗', err);
        setIsBookmarked(false);
      });
  }, [userId, articleId]);

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
            } catch {
              return { ...comment, username: '未知用戶' };
            }
          }).sort((a, b) => new Date(a.date) - new Date(b.date))
        );

        setComments(commentsWithUsernames);
      })
      .catch(err => console.error("留言載入失敗", err));
  }, [articleId, commentMsg]);

  useEffect(() => {
    if (!articleId || !userId) return;

    axios.get(`http://localhost:8080/feedback/${articleId}/reactions`, { withCredentials: true })
      .then(res => {
        const reactions = res.data;
        const myReactionsMap = {};

        reactions.forEach(r => {
          if (r.userId === userId) {
            const key = r.commentId || 'article';
            myReactionsMap[key] = {
              type: r.type,
              reactionId: r.id
            };
          }
        });

        if (myReactionsMap['article']) {
          setIsUp(myReactionsMap['article'].type === 'up');
          setIsDown(myReactionsMap['article'].type === 'down');
          setArticleReactionId(myReactionsMap['article'].reactionId);
        } else {
          setIsUp(false);
          setIsDown(false);
          setArticleReactionId(null);
        }

        setReactionMap(myReactionsMap);
      })
      .catch(err => console.error('取得 reaction 資料失敗', err));
  }, [articleId, userId, reactionRefreshKey]);

  const formatDate = (isoString) => new Date(isoString).toLocaleString('zh-TW');

  function isUserThePoster() {
    if (!user) {
      return false;
    }
    return user.userId === article.userId;
  }

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
      await axios.post(
        `http://localhost:8080/feedback/${userId}/${articleId}/${article.userId}/comment-edited`,
        comment,
        {
          headers: { 'Content-Type': 'text/plain' },
          withCredentials: true
        }
      );

      setComment('');
      setCommentMsg('留言成功！');
    } catch (err) {
      console.error('留言失敗', err);
      setCommentMsg('留言失敗，請稍後再試');
    }
  };

  const handleEditSubmit = async () => {
    try {
      const payload = {
        title: editTitle,
        content: editContent,
        category: editCategory,
        tag: editTag,
      };

      await axios.put(`http://localhost:8080/article/${articleId}`, JSON.stringify(payload), {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true,
      });

      setIsEditing(false);
      setReactionRefreshKey((k) => k + 1);
    } catch (err) {
      alert('更新文章失敗');
      console.error(err);
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
        await axios.delete(`http://localhost:8080/article/bookmark/${userId}/${articleId}`, { withCredentials: true });
        setIsBookmarked(false);
        setBookmarkMsg('已取消收藏');
      } else {
        await axios.put(`http://localhost:8080/article/bookmark/${userId}/${articleId}`, null, { withCredentials: true });
        setIsBookmarked(true);
        setBookmarkMsg('收藏成功！');
      }
    } catch (err) {
      console.error('收藏操作失敗', err);
      setBookmarkMsg('操作失敗，請稍後再試');
    }
  };

  const chat = async () => {
    setBookmarkMsg('');

    if (!user) {
      setBookmarkMsg('請先登入才能私訊作者');
      return;
    }

    try {
      navigate(`/chat`);
      await axios.post('http://localhost:8080/chats/chat', {
        user1Id: user.userId,
        user2Id: article.userId
      })
    } catch (err) {
      console.error('收藏操作失敗', err);
      setBookmarkMsg('操作失敗，請稍後再試');
    }
  };

  const addReaction = async (writerId, articleId, commentId = null, type, cancel = false, reactionId = null) => {
    if (!user) {
      alert("請先登入才能反應");
      return;
    }

    if (!cancel && !commentId && articleReactionId) {
      alert("請先取消原有的文章反應後再更換");
      return;
    }

    try {
      if (cancel && reactionId) {
        await axios.delete(
          `http://localhost:8080/feedback/${userId}/${articleId}/${reactionId}/delete-reaction`,
          { withCredentials: true }
        );
      } else if (!cancel) {
        const url = commentId
          ? `http://localhost:8080/feedback/${writerId}/${articleId}/${commentId}/${userId}/add-reaction`
          : `http://localhost:8080/feedback/${writerId}/${articleId}/${userId}/add-reaction`;

        await axios.post(url, type, {
          headers: { 'Content-Type': 'text/plain' },
          withCredentials: true
        });
      }

      setReactionRefreshKey(k => k + 1);
    } catch (err) {
      console.error('反應操作失敗', err);
      alert('操作失敗，請稍後再試');
    }
  };

  return (
    <>
      <NavbarComponent />
      <Container className="mt-5">
        {error && <Alert variant="danger">{error}</Alert>}

        <Button variant="link" onClick={() => navigate(-1)}>← 返回上一頁</Button>

        <Card className="p-4 shadow-sm">
          {isEditing ? (
            <Form.Group className="mb-3">
              <Form.Label>標題</Form.Label>
              <Form.Control value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            </Form.Group>
          ) : (
            <h3 className="mb-3">{article.title}</h3>
          )}
          <div className="d-flex justify-content-between mb-2">
            <span className="fw-bold">{author ? author.username : article.userId}</span>
            <span className="text-muted" style={{ fontSize: '0.9rem' }}>
              {formatDate(article.date)}
              {userId === article.userId && (
                <Button
                  variant="link"
                  size="sm"
                  className="ms-2 p-0 align-baseline"
                  style={{ fontSize: '0.9rem' }}
                  onClick={() => setIsEditing(true)}
                  title="編輯文章"
                >
                  ✏️
                </Button>
              )}
            </span>
          </div>

          {isEditing ? (
            <>
              <Form.Group className="mb-2">
                <Form.Label>分類</Form.Label>
                <Form.Control value={editCategory} onChange={(e) => setEditCategory(e.target.value)} />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>標籤</Form.Label>
                <Form.Control value={editTag} onChange={(e) => setEditTag(e.target.value)} />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>內容</Form.Label>
                <Form.Control as="textarea" rows={5} value={editContent} onChange={(e) => setEditContent(e.target.value)} />
              </Form.Group>
              <Button variant="primary" onClick={handleEditSubmit}>儲存</Button>{' '}
              <Button variant="secondary" onClick={() => setIsEditing(false)}>取消</Button>
            </>
          ) : (
            <Card.Text style={{ whiteSpace: 'pre-wrap' }}>{article.content}</Card.Text>
          )}

          <div className="mt-3 d-flex flex-wrap gap-2">
            {article.tag && article.tag.split(',').map((item, idx) => (
              <Badge bg="secondary" key={idx}>#{item.trim()}</Badge>
            ))}
            <Badge bg="info">分類：{article.category}</Badge>
          </div>
          <div className="mt-4 d-flex align-items-center" style={{ gap: '5px' }} >
            <Button variant={isBookmarked ? 'success' : 'outline-warning'} onClick={toggleBookmark}>
              {isBookmarked ? '✅ 已收藏' : '加入收藏'}
            </Button>
            <span></span>
            {!isUserThePoster() ? <Button
                onClick={chat}
                variant="dark"
            >私訊作者</Button>:''}
            {bookmarkMsg && <Alert variant="info" className="mt-2">{bookmarkMsg}</Alert>}
          </div>

          <div style={{ position: 'absolute', bottom: '1rem', right: '1rem' }} className="d-flex gap-2">
            <Button
              variant={isUp ? 'success' : 'outline-success'}
              onClick={() => addReaction(article.userId, articleId, null, 'up', isUp, articleReactionId)}
              disabled={isDown && !isUp}
            >👍</Button>
            <Button
              variant={isDown ? 'danger' : 'outline-danger'}
              onClick={() => addReaction(article.userId, articleId, null, 'down', isDown, articleReactionId)}
              disabled={isUp && !isDown}
            >👎</Button>
          </div>
        </Card>

        <Card className="mt-4 p-4">
          <h5>留言區</h5>

          <div className="mt-4">
            {comments.length > 0 ? (
              comments.map((cmt, idx) => (
                <Comment
                  key={idx}
                  comment={cmt}
                  index={idx}
                  reactionMap={reactionMap}
                  onReaction={(writerId, type, cancel, reactionId) =>
                    addReaction(writerId, articleId, cmt.id, type, cancel, reactionId)
                  }
                />
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
