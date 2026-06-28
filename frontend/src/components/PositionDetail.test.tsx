import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PositionDetail from './PositionDetail';

global.fetch = jest.fn();
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

const mockFlowResponse = {
  interviewFlow: {
    positionName: 'Senior Full-Stack Engineer',
    interviewFlow: {
      id: 1,
      description: 'Standard flow',
      interviewSteps: [
        { id: 1, name: 'Initial Screening', orderIndex: 1 },
        { id: 2, name: 'Technical Interview', orderIndex: 2 },
      ],
    },
  },
};

const mockCandidates = [
  { id: 1, fullName: 'John Doe', currentInterviewStep: 'Initial Screening', averageScore: 4, applicationId: 10 },
  { id: 2, fullName: 'Jane Smith', currentInterviewStep: 'Technical Interview', averageScore: 3, applicationId: 11 },
];

function renderWithRouter(positionId = '1') {
  return render(
    <MemoryRouter initialEntries={[`/positions/${positionId}`]}>
      <Routes>
        <Route path="/positions/:id" element={<PositionDetail />} />
        <Route path="/positions" element={<div>Positions list</div>} />
      </Routes>
    </MemoryRouter>
  );
}

function mockSuccessfulFetch() {
  mockFetch
    .mockResolvedValueOnce({ ok: true, json: async () => mockFlowResponse } as Response)
    .mockResolvedValueOnce({ ok: true, json: async () => mockCandidates } as Response);
}

describe('PositionDetail', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('shows a loading spinner on initial render', () => {
    mockFetch.mockReturnValue(new Promise(() => {}));
    renderWithRouter();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders the position name after a successful fetch', async () => {
    mockSuccessfulFetch();
    renderWithRouter();
    await waitFor(() => {
      expect(screen.getByText('Senior Full-Stack Engineer')).toBeInTheDocument();
    });
  });

  it('renders all interview phase columns', async () => {
    mockSuccessfulFetch();
    renderWithRouter();
    await waitFor(() => {
      expect(screen.getByText('Initial Screening')).toBeInTheDocument();
      expect(screen.getByText('Technical Interview')).toBeInTheDocument();
    });
  });

  it('places candidates in their correct columns', async () => {
    mockSuccessfulFetch();
    renderWithRouter();
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  it('shows an error alert when the flow fetch fails', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 } as Response);
    renderWithRouter();
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  it('renders a back navigation button', async () => {
    mockSuccessfulFetch();
    renderWithRouter();
    await waitFor(() => {
      expect(screen.getByLabelText('Volver al listado')).toBeInTheDocument();
    });
  });

  it('shows "Sin candidatos" in columns with no candidates', async () => {
    mockSuccessfulFetch();
    renderWithRouter();
    await waitFor(() => {
      expect(screen.getByText('Sin candidatos')).toBeInTheDocument();
    });
  });

  it('navigates back to positions list when back button is clicked', async () => {
    mockSuccessfulFetch();
    renderWithRouter();
    await waitFor(() => {
      expect(screen.getByLabelText('Volver al listado')).toBeInTheDocument();
    });
    await userEvent.click(screen.getByLabelText('Volver al listado'));
    expect(screen.getByText('Positions list')).toBeInTheDocument();
  });

  it('moves a candidate to a new phase via keyboard select', async () => {
    mockSuccessfulFetch();
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) } as Response);

    renderWithRouter();
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const select = screen.getByLabelText('Move John Doe to another phase');
    await userEvent.selectOptions(select, 'Technical Interview');

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/candidates/1'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ applicationId: 10, currentInterviewStep: 2 }),
        })
      );
    });
  });
});
