import { Card, Button } from 'react-bootstrap';
import { useAuth } from '../../AuthContext';

export default function Comment({ comment, index, onReaction, reactionMap = {}, articleUserId, onDelete }) {
  const { user } = useAuth();
  const { username, content, date, userId, id: commentId } = comment;
  const myReaction = reactionMap[commentId] || null;

  const isUp = myReaction?.type === 'up';
  const isDown = myReaction?.type === 'down';
  const reactionId = myReaction?.reactionId;

  const handleReact = (type) => {
    const cancel = myReaction?.type === type;
    onReaction(userId, type, cancel, reactionId);
  };

  const canDelete = user && (user.userId === userId || user.userId === articleUserId);
  return (
    <Card className="mb-3 p-3">
      <div className="d-flex align-items-start">
        <img
          src="/user_icon.jpg"
          alt="用戶頭像"
          style={{
            width: '45px',
            height: '45px',
            borderRadius: '50%',
            objectFit: 'cover',
            marginRight: '15px'
          }}
        />

        <div className="flex-grow-1">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <div className="fw-bold">{username}</div>
            <div className="d-flex align-items-center">
              {canDelete && (
                <Button
                  variant="outline-danger"
                  size="sm"
                  className="me-2"
                  onClick={() => onDelete(commentId)}
                >
                  🗑️
                </Button>
              )}
              <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                B{index + 1}
              </div>
            </div>
          </div>

          <div style={{ whiteSpace: 'pre-wrap' }}>{content}</div>

          <div className="d-flex justify-content-between align-items-center mt-2">
            <div className="text-muted" style={{ fontSize: '0.8rem' }}>
              {new Date(date).toLocaleString('zh-TW')}
            </div>

            <div className="d-flex gap-2">
              <Button
                variant={isUp ? 'success' : 'outline-success'}
                size="sm"
                onClick={() => handleReact('up')}
                disabled={isDown && !isUp}
              >
                👍
              </Button>
              <Button
                variant={isDown ? 'danger' : 'outline-danger'}
                size="sm"
                onClick={() => handleReact('down')}
                disabled={isUp && !isDown}
              >
                👎
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
