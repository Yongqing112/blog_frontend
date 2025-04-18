import { Card, Button } from 'react-bootstrap';

export default function Comment({ comment, index, onReaction, reactionMap = {} }) {
  const { username, content, date, userId, id: commentId } = comment;
  const myReaction = reactionMap[commentId] || null;

  const isUp = myReaction?.type === 'up';
  const isDown = myReaction?.type === 'down';
  const reactionId = myReaction?.reactionId;

  const handleReact = (type) => {
    const cancel = myReaction?.type === type;
    onReaction(userId, type, cancel, reactionId);
  };

  return (
    <Card className="mb-2 p-2 position-relative">
      <div className="d-flex justify-content-between align-items-center">
        <div className="fw-bold">{username}</div>
        <div className="text-muted" style={{ fontSize: '0.8rem' }}>B{index + 1}</div>
      </div>

      <div style={{ whiteSpace: 'pre-wrap' }}>{content}</div>

      <div className="text-muted mt-1" style={{ fontSize: '0.8rem' }}>
        {new Date(date).toLocaleString('zh-TW')}
      </div>

      <div
        style={{ position: 'absolute', bottom: '0.5rem', right: '0.5rem' }}
        className="d-flex gap-2"
      >
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
    </Card>
  );
}
