import { Card, Button } from 'react-bootstrap';

export default function Comment({ comment, index, onReaction }) {
  return (
    <Card className="mb-2 p-2">
      <div className="d-flex justify-content-between align-items-center">
        <div className="fw-bold">{comment.username}</div>
        <div className="text-muted" style={{ fontSize: '0.8rem' }}>B{index + 1}</div>
      </div>
      <div style={{ whiteSpace: 'pre-wrap' }}>{comment.content}</div>
      <div className="mt-2">
        <Button
          variant="outline-success"
          size="sm"
          onClick={() => onReaction(comment.userId, 'up')}
        >
          👍
        </Button>{' '}
        <Button
          variant="outline-danger"
          size="sm"
          onClick={() => onReaction(comment.userId, 'down')}
        >
          👎
        </Button>
      </div>
      <div className="text-muted" style={{ fontSize: '0.8rem' }}>
        {new Date(comment.date).toLocaleString('zh-TW')}
      </div>
    </Card>
  );
}
