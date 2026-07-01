import React, { useState, useEffect } from 'react';
import { Container, Button, Spinner, Alert, Card, Badge } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'react-bootstrap-icons';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:3010';

interface InterviewStep {
  id: number;
  name: string;
  orderIndex?: number;
}

interface Candidate {
  id: number;
  fullName: string;
  currentInterviewStep: string;
  averageScore: number;
  applicationId: number;
}

const ScoreDots: React.FC<{ score: number }> = ({ score }) => {
  const max = 5;
  const filled = Math.min(Math.round(score ?? 0), max);
  return (
    <div className="d-flex gap-1 mt-1">
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          style={{
            width: 14,
            height: 14,
            borderRadius: '50%',
            backgroundColor: i < filled ? '#198754' : '#dee2e6',
            display: 'inline-block',
            flexShrink: 0,
          }}
        />
      ))}
    </div>
  );
};

const PositionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [positionName, setPositionName] = useState('');
  const [steps, setSteps] = useState<InterviewStep[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [dragOverStep, setDragOverStep] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [flowRes, candidatesRes] = await Promise.all([
          fetch(`${API_BASE}/position/${id}/interviewflow`),
          fetch(`${API_BASE}/position/${id}/candidates`),
        ]);

        if (!flowRes.ok) throw new Error(`Error ${flowRes.status} al obtener el flujo de entrevista`);
        if (!candidatesRes.ok) throw new Error(`Error ${candidatesRes.status} al obtener los candidatos`);

        const flowData = await flowRes.json();
        const candidatesData: Candidate[] = await candidatesRes.json();

        // API response shape: { interviewFlow: { positionName, interviewFlow: { interviewSteps } } }
        const flow = flowData.interviewFlow;
        setPositionName(flow?.positionName ?? '');
        const rawSteps: InterviewStep[] = flow?.interviewFlow?.interviewSteps ?? [];
        setSteps([...rawSteps].sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0)));
        setCandidates(candidatesData);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Error desconocido';
        setError(`Error al cargar los datos: ${message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleKeyboardMove = async (candidate: Candidate, targetStep: InterviewStep) => {
    if (candidate.currentInterviewStep === targetStep.name) return;

    const prevStepName = candidate.currentInterviewStep;
    setCandidates(prev =>
      prev.map(c => c.id === candidate.id ? { ...c, currentInterviewStep: targetStep.name } : c)
    );

    try {
      const res = await fetch(`${API_BASE}/candidates/${candidate.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: candidate.applicationId, currentInterviewStep: targetStep.id }),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
    } catch {
      setCandidates(prev =>
        prev.map(c => c.id === candidate.id ? { ...c, currentInterviewStep: prevStepName } : c)
      );
      setError('Error al actualizar la fase del candidato. El cambio ha sido revertido.');
    }
  };

  const handleCardKeyDown = (e: React.KeyboardEvent, candidate: Candidate) => {
    const currentIndex = steps.findIndex(s => s.name === candidate.currentInterviewStep);
    if (e.key === 'ArrowRight' && currentIndex < steps.length - 1) {
      e.preventDefault();
      handleKeyboardMove(candidate, steps[currentIndex + 1]);
    } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
      e.preventDefault();
      handleKeyboardMove(candidate, steps[currentIndex - 1]);
    }
  };

  const handleDragStart = (e: React.DragEvent, candidateId: number) => {
    setDraggingId(candidateId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDragOverStep(null);
  };

  const handleDragOver = (e: React.DragEvent, stepName: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverStep(stepName);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear when leaving the column entirely, not child elements
    if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) {
      setDragOverStep(null);
    }
  };

  const handleDrop = async (e: React.DragEvent, step: InterviewStep) => {
    e.preventDefault();
    setDragOverStep(null);

    if (draggingId === null) return;

    const candidate = candidates.find(c => c.id === draggingId);
    if (!candidate || candidate.currentInterviewStep === step.name) {
      setDraggingId(null);
      return;
    }

    const candidateId = draggingId;
    const prevStepName = candidate.currentInterviewStep;

    // Optimistic update
    setCandidates(prev =>
      prev.map(c => c.id === candidateId ? { ...c, currentInterviewStep: step.name } : c)
    );
    setDraggingId(null);

    try {
      const res = await fetch(`${API_BASE}/candidates/${candidateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: candidate.applicationId, currentInterviewStep: step.id }),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
    } catch {
      // Revert on failure
      setCandidates(prev =>
        prev.map(c => c.id === candidateId ? { ...c, currentInterviewStep: prevStepName } : c)
      );
      setError('Error al actualizar la fase del candidato. El cambio ha sido revertido.');
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <Spinner animation="border" variant="primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4 px-3 px-md-4">
      <style>{`
        .kanban-column {
          width: 100%;
        }
        @media (min-width: 768px) {
          .kanban-column {
            min-width: 280px;
            max-width: 280px;
            width: 280px;
          }
        }
        .candidate-card {
          cursor: grab;
          transition: opacity 0.2s, box-shadow 0.2s;
          user-select: none;
        }
        .candidate-card:active {
          cursor: grabbing;
        }
        .candidate-card.is-dragging {
          opacity: 0.4;
        }
        .candidate-card:focus {
          outline: 2px solid #0d6efd;
          outline-offset: 2px;
        }
        .kanban-col-inner {
          background-color: #f8f9fa;
          border-radius: 8px;
          min-height: 200px;
          transition: background-color 0.15s, border 0.15s;
        }
        .kanban-col-inner.drop-target {
          background-color: #d1e7dd;
          outline: 2px dashed #198754;
        }
      `}</style>

      <div className="d-flex align-items-center mb-4 gap-2">
        <Button
          variant="link"
          className="p-0 text-dark text-decoration-none"
          onClick={() => navigate('/positions')}
          aria-label="Volver al listado"
        >
          <ArrowLeft size={24} />
        </Button>
        <h2 className="mb-0">{positionName || `Posición #${id}`}</h2>
      </div>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)} className="mb-3">
          {error}
        </Alert>
      )}

      <div
        className="d-flex flex-column flex-md-row gap-3 overflow-auto pb-3"
        style={{ alignItems: 'flex-start' }}
      >
        {steps.map(step => {
          const stepCandidates = candidates.filter(c => c.currentInterviewStep === step.name);
          const isDropTarget = dragOverStep === step.name;

          return (
            <div
              key={step.id}
              className="kanban-column flex-shrink-0"
              onDragOver={e => handleDragOver(e, step.name)}
              onDragLeave={handleDragLeave}
              onDrop={e => handleDrop(e, step)}
            >
              <div className={`kanban-col-inner p-2 ${isDropTarget ? 'drop-target' : ''}`} style={{ minHeight: 200 }}>
                  <div className="d-flex align-items-center justify-content-between mb-2 px-1">
                    <h6 className="fw-semibold mb-0">{step.name}</h6>
                    <Badge bg="secondary">{stepCandidates.length}</Badge>
                  </div>

                  <div className="d-flex flex-column gap-2">
                    {stepCandidates.map(candidate => (
                      <Card
                        key={candidate.id}
                        className={`candidate-card shadow-sm ${draggingId === candidate.id ? 'is-dragging' : ''}`}
                        draggable
                        tabIndex={0}
                        role="button"
                        aria-label={`${candidate.fullName}, fase: ${candidate.currentInterviewStep}. Usa ← → para mover entre columnas.`}
                        onDragStart={e => handleDragStart(e, candidate.id)}
                        onDragEnd={handleDragEnd}
                        onKeyDown={e => handleCardKeyDown(e, candidate)}
                      >
                        <Card.Body className="py-2 px-3">
                          <div className="fw-medium small">{candidate.fullName}</div>
                          <ScoreDots score={candidate.averageScore} />
                          <select
                            className="visually-hidden"
                            aria-label={`Move ${candidate.fullName} to another phase`}
                            value={candidate.currentInterviewStep}
                            onChange={e => {
                              const target = steps.find(s => s.name === e.target.value);
                              if (target) handleKeyboardMove(candidate, target);
                            }}
                          >
                            {steps.map(s => (
                              <option key={s.id} value={s.name}>{s.name}</option>
                            ))}
                          </select>
                        </Card.Body>
                      </Card>
                    ))}

                    {stepCandidates.length === 0 && (
                      <div className="text-muted text-center small py-3">Sin candidatos</div>
                    )}
                  </div>
              </div>
            </div>
          );
        })}

        {steps.length === 0 && !loading && (
          <div className="text-muted">No hay fases de entrevista configuradas.</div>
        )}
      </div>
    </Container>
  );
};

export default PositionDetail;
