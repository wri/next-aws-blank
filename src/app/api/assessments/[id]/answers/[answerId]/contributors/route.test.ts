// Mock Next.js server
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: jest.fn((body, init) => ({
      json: async () => body,
      status: init?.status || 200,
      ok: (init?.status || 200) >= 200 && (init?.status || 200) < 300,
    }))
  }
}));

// Mock database modules
jest.mock('@/db/data-source', () => ({
  AppDataSource: {
    isInitialized: false,
    initialize: jest.fn().mockResolvedValue(undefined),
    getRepository: jest.fn()
  },
  initializeDatabase: jest.fn().mockResolvedValue(undefined)
}));

// Mock assessment queries
jest.mock('@/db/queries/assessment-queries', () => ({
  getContributorsByAnswer: jest.fn(),
  setAnswerContributors: jest.fn()
}));

// Mock entities
jest.mock('@/db/entities/Answer.entity', () => ({
  Answer: class Answer {}
}));

jest.mock('@/db/entities/Contributor.entity', () => ({
  Contributor: class Contributor {}
}));

// Import after mocks are set up
import { GET, PUT } from './route';
import { AppDataSource } from '@/db/data-source';
import { 
  getContributorsByAnswer,
  setAnswerContributors
} from '@/db/queries/assessment-queries';

// Mock data
const mockAssessmentId = 'assessment-123';
const mockAnswerId = 'answer-456';
const mockOtherAssessmentId = 'assessment-999';

const mockContributors = [
  { id: 'contributor-1', name: 'John Doe', assessmentId: mockAssessmentId, createdAt: new Date() },
  { id: 'contributor-2', name: 'Jane Smith', assessmentId: mockAssessmentId, createdAt: new Date() }
];

const mockAnswer = {
  id: mockAnswerId,
  assessmentId: mockAssessmentId,
  questionId: 'question-1',
  value: 'yes',
  rationale: 'Test rationale',
  notes: 'Test notes',
  createdAt: new Date(),
  updatedAt: new Date(),
  status: 'in_progress'
};

// Helper to create mock request
function createMockRequest(body: unknown = {}) {
  return {
    json: jest.fn().mockResolvedValue(body)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
}

// Helper to create mock params
function createMockParams(id: string, answerId: string) {
  return Promise.resolve({ id, answerId });
}

describe('GET /api/assessments/[id]/answers/[answerId]/contributors', () => {
  let mockAnswerRepo: {
    findOne: jest.Mock;
  };

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup repository mock
    mockAnswerRepo = {
      findOne: jest.fn()
    };

    (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockAnswerRepo);
  });

  describe('Successful retrieval (200)', () => {
    it('should return contributors when answer belongs to assessment', async () => {
      mockAnswerRepo.findOne.mockResolvedValue(mockAnswer);
      (getContributorsByAnswer as jest.Mock).mockResolvedValue(mockContributors);

      const request = createMockRequest();
      const params = createMockParams(mockAssessmentId, mockAnswerId);

      const response = await GET(request, { params });
      const data = await response.json();

      expect(data).toEqual({
        success: true,
        contributors: mockContributors
      });
      expect(response.status).toBe(200);

      // Verify answer ownership was checked
      expect(mockAnswerRepo.findOne).toHaveBeenCalledWith({
        where: { id: mockAnswerId, assessmentId: mockAssessmentId },
        order: { updatedAt: 'DESC' }
      });

      // Verify contributors were fetched
      expect(getContributorsByAnswer).toHaveBeenCalledWith(mockAnswerId);
    });

    it('should return empty array when answer has no contributors', async () => {
      mockAnswerRepo.findOne.mockResolvedValue(mockAnswer);
      (getContributorsByAnswer as jest.Mock).mockResolvedValue([]);

      const request = createMockRequest();
      const params = createMockParams(mockAssessmentId, mockAnswerId);

      const response = await GET(request, { params });
      const data = await response.json();

      expect(data).toEqual({
        success: true,
        contributors: []
      });
      expect(response.status).toBe(200);
    });
  });

  describe('Answer not found (404)', () => {
    it('should return 404 when answer does not exist', async () => {
      mockAnswerRepo.findOne.mockResolvedValue(null);

      const request = createMockRequest();
      const params = createMockParams(mockAssessmentId, 'non-existent-answer');

      const response = await GET(request, { params });
      const data = await response.json();

      expect(data).toEqual({
        success: false,
        error: 'Answer not found in this assessment'
      });
      expect(response.status).toBe(404);

      // Should not fetch contributors
      expect(getContributorsByAnswer).not.toHaveBeenCalled();
    });

    it('should return 404 when answer belongs to different assessment', async () => {
      mockAnswerRepo.findOne.mockResolvedValue(null);

      const request = createMockRequest();
      const params = createMockParams(mockOtherAssessmentId, mockAnswerId);

      const response = await GET(request, { params });
      const data = await response.json();

      expect(data).toEqual({
        success: false,
        error: 'Answer not found in this assessment'
      });
      expect(response.status).toBe(404);

      // Verify the query used the correct assessmentId
      expect(mockAnswerRepo.findOne).toHaveBeenCalledWith({
        where: { id: mockAnswerId, assessmentId: mockOtherAssessmentId },
        order: { updatedAt: 'DESC' }
      });

      // Should not fetch contributors
      expect(getContributorsByAnswer).not.toHaveBeenCalled();
    });
  });

  describe('Error handling (500)', () => {
    it('should return 500 when database query fails', async () => {
      mockAnswerRepo.findOne.mockRejectedValue(new Error('Database connection failed'));

      const request = createMockRequest();
      const params = createMockParams(mockAssessmentId, mockAnswerId);

      const response = await GET(request, { params });
      const data = await response.json();

      expect(data).toEqual({
        success: false,
        error: 'Failed to fetch answer contributors'
      });
      expect(response.status).toBe(500);
    });

    it('should return 500 when getContributorsByAnswer fails', async () => {
      mockAnswerRepo.findOne.mockResolvedValue(mockAnswer);
      (getContributorsByAnswer as jest.Mock).mockRejectedValue(new Error('Query failed'));

      const request = createMockRequest();
      const params = createMockParams(mockAssessmentId, mockAnswerId);

      const response = await GET(request, { params });
      const data = await response.json();

      expect(data).toEqual({
        success: false,
        error: 'Failed to fetch answer contributors'
      });
      expect(response.status).toBe(500);
    });
  });
});

describe('PUT /api/assessments/[id]/answers/[answerId]/contributors', () => {
  let mockAnswerRepo: {
    findOne: jest.Mock;
  };
  let mockContributorRepo: {
    count: jest.Mock;
  };

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup repository mocks
    mockAnswerRepo = {
      findOne: jest.fn()
    };
    mockContributorRepo = {
      count: jest.fn()
    };

    (AppDataSource.getRepository as jest.Mock).mockImplementation((entity) => {
      if (entity.name === 'Answer') return mockAnswerRepo;
      if (entity.name === 'Contributor') return mockContributorRepo;
      return mockAnswerRepo; // default
    });
  });

  describe('Successful update (200)', () => {
    it('should set contributors when all validation passes', async () => {
      const contributorIds = ['contributor-1', 'contributor-2'];
      
      mockAnswerRepo.findOne.mockResolvedValue(mockAnswer);
      mockContributorRepo.count.mockResolvedValue(2);
      (setAnswerContributors as jest.Mock).mockResolvedValue(undefined);

      const request = createMockRequest({ contributorIds });
      const params = createMockParams(mockAssessmentId, mockAnswerId);

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(data).toEqual({ success: true });
      expect(response.status).toBe(200);

      // Verify answer ownership was checked
      expect(mockAnswerRepo.findOne).toHaveBeenCalledWith({
        where: { id: mockAnswerId, assessmentId: mockAssessmentId },
        order: { updatedAt: 'DESC' }
      });

      // Verify contributors belong to assessment
      expect(mockContributorRepo.count).toHaveBeenCalledWith({
        where: [
          { id: 'contributor-1', assessmentId: mockAssessmentId },
          { id: 'contributor-2', assessmentId: mockAssessmentId }
        ]
      });

      // Verify contributors were set
      expect(setAnswerContributors).toHaveBeenCalledWith(mockAnswerId, contributorIds);
    });

    it('should allow empty contributor array', async () => {
      mockAnswerRepo.findOne.mockResolvedValue(mockAnswer);
      (setAnswerContributors as jest.Mock).mockResolvedValue(undefined);

      const request = createMockRequest({ contributorIds: [] });
      const params = createMockParams(mockAssessmentId, mockAnswerId);

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(data).toEqual({ success: true });
      expect(response.status).toBe(200);

      // Should not validate contributors if array is empty
      expect(mockContributorRepo.count).not.toHaveBeenCalled();

      // Should still call setAnswerContributors (to clear)
      expect(setAnswerContributors).toHaveBeenCalledWith(mockAnswerId, []);
    });

    it('should handle single contributor', async () => {
      const contributorIds = ['contributor-1'];
      
      mockAnswerRepo.findOne.mockResolvedValue(mockAnswer);
      mockContributorRepo.count.mockResolvedValue(1);
      (setAnswerContributors as jest.Mock).mockResolvedValue(undefined);

      const request = createMockRequest({ contributorIds });
      const params = createMockParams(mockAssessmentId, mockAnswerId);

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(data).toEqual({ success: true });
      expect(response.status).toBe(200);
    });
  });

  describe('Request validation (400)', () => {
    it('should return 400 when contributorIds is not an array', async () => {
      const request = createMockRequest({ contributorIds: 'not-an-array' });
      const params = createMockParams(mockAssessmentId, mockAnswerId);

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(data).toEqual({
        success: false,
        error: 'contributorIds must be an array'
      });
      expect(response.status).toBe(400);

      // Should not proceed with any validation or update
      expect(mockAnswerRepo.findOne).not.toHaveBeenCalled();
      expect(setAnswerContributors).not.toHaveBeenCalled();
    });

    it('should return 400 when contributorIds is null', async () => {
      const request = createMockRequest({ contributorIds: null });
      const params = createMockParams(mockAssessmentId, mockAnswerId);

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(data).toEqual({
        success: false,
        error: 'contributorIds must be an array'
      });
      expect(response.status).toBe(400);
    });

    it('should return 400 when contributorIds is undefined', async () => {
      const request = createMockRequest({});
      const params = createMockParams(mockAssessmentId, mockAnswerId);

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(data).toEqual({
        success: false,
        error: 'contributorIds must be an array'
      });
      expect(response.status).toBe(400);
    });

    it('should return 400 when some contributors do not belong to assessment', async () => {
      const contributorIds = ['contributor-1', 'contributor-2', 'contributor-3'];
      
      mockAnswerRepo.findOne.mockResolvedValue(mockAnswer);
      // Only 2 out of 3 contributors belong to this assessment
      mockContributorRepo.count.mockResolvedValue(2);

      const request = createMockRequest({ contributorIds });
      const params = createMockParams(mockAssessmentId, mockAnswerId);

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(data).toEqual({
        success: false,
        error: 'One or more contributors do not belong to this assessment'
      });
      expect(response.status).toBe(400);

      // Should not update contributors
      expect(setAnswerContributors).not.toHaveBeenCalled();
    });

    it('should return 400 when contributors belong to different assessment', async () => {
      const contributorIds = ['contributor-from-other-assessment'];
      
      mockAnswerRepo.findOne.mockResolvedValue(mockAnswer);
      // No contributors match this assessment
      mockContributorRepo.count.mockResolvedValue(0);

      const request = createMockRequest({ contributorIds });
      const params = createMockParams(mockAssessmentId, mockAnswerId);

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(data).toEqual({
        success: false,
        error: 'One or more contributors do not belong to this assessment'
      });
      expect(response.status).toBe(400);

      // Verify the query checked against correct assessmentId
      expect(mockContributorRepo.count).toHaveBeenCalledWith({
        where: [{ id: 'contributor-from-other-assessment', assessmentId: mockAssessmentId }]
      });
    });
  });

  describe('Answer not found (404)', () => {
    it('should return 404 when answer does not exist', async () => {
      mockAnswerRepo.findOne.mockResolvedValue(null);

      const request = createMockRequest({ contributorIds: ['contributor-1'] });
      const params = createMockParams(mockAssessmentId, 'non-existent-answer');

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(data).toEqual({
        success: false,
        error: 'Answer not found in this assessment'
      });
      expect(response.status).toBe(404);

      // Should not proceed with update
      expect(mockContributorRepo.count).not.toHaveBeenCalled();
      expect(setAnswerContributors).not.toHaveBeenCalled();
    });

    it('should return 404 when answer belongs to different assessment', async () => {
      mockAnswerRepo.findOne.mockResolvedValue(null);

      const request = createMockRequest({ contributorIds: ['contributor-1'] });
      const params = createMockParams(mockOtherAssessmentId, mockAnswerId);

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(data).toEqual({
        success: false,
        error: 'Answer not found in this assessment'
      });
      expect(response.status).toBe(404);

      // Verify the query used the correct assessmentId
      expect(mockAnswerRepo.findOne).toHaveBeenCalledWith({
        where: { id: mockAnswerId, assessmentId: mockOtherAssessmentId },
        order: { updatedAt: 'DESC' }
      });
    });
  });

  describe('Error handling (500)', () => {
    it('should return 500 when answer lookup fails', async () => {
      mockAnswerRepo.findOne.mockRejectedValue(new Error('Database error'));

      const request = createMockRequest({ contributorIds: ['contributor-1'] });
      const params = createMockParams(mockAssessmentId, mockAnswerId);

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(data).toEqual({
        success: false,
        error: 'Failed to set answer contributors'
      });
      expect(response.status).toBe(500);
    });

    it('should return 500 when contributor validation fails', async () => {
      mockAnswerRepo.findOne.mockResolvedValue(mockAnswer);
      mockContributorRepo.count.mockRejectedValue(new Error('Database error'));

      const request = createMockRequest({ contributorIds: ['contributor-1'] });
      const params = createMockParams(mockAssessmentId, mockAnswerId);

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(data).toEqual({
        success: false,
        error: 'Failed to set answer contributors'
      });
      expect(response.status).toBe(500);
    });

    it('should return 500 when setAnswerContributors fails', async () => {
      mockAnswerRepo.findOne.mockResolvedValue(mockAnswer);
      mockContributorRepo.count.mockResolvedValue(1);
      (setAnswerContributors as jest.Mock).mockRejectedValue(new Error('Transaction failed'));

      const request = createMockRequest({ contributorIds: ['contributor-1'] });
      const params = createMockParams(mockAssessmentId, mockAnswerId);

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(data).toEqual({
        success: false,
        error: 'Failed to set answer contributors'
      });
      expect(response.status).toBe(500);
    });
  });

  describe('Assessment scoping validation', () => {
    it('should prevent cross-assessment data corruption', async () => {
      const contributorIds = ['contributor-from-assessment-999'];
      
      // Answer exists in assessment-123
      mockAnswerRepo.findOne.mockResolvedValue(mockAnswer);
      // But contributor belongs to assessment-999 (different assessment)
      mockContributorRepo.count.mockResolvedValue(0);

      const request = createMockRequest({ contributorIds });
      const params = createMockParams(mockAssessmentId, mockAnswerId);

      const response = await PUT(request, { params });
      const data = await response.json();

      expect(data.success).toBe(false);
      expect(response.status).toBe(400);
      
      // Verify the check was scoped to the correct assessment
      expect(mockContributorRepo.count).toHaveBeenCalledWith({
        where: [{ id: contributorIds[0], assessmentId: mockAssessmentId }]
      });

      // Ensure no data was written
      expect(setAnswerContributors).not.toHaveBeenCalled();
    });

    it('should use assessmentId from URL path, not request body', async () => {
      // Malicious attempt to use different assessmentId
      const contributorIds = ['contributor-1'];
      const maliciousBody = {
        contributorIds,
        assessmentId: 'different-assessment-id' // Should be ignored
      };
      
      mockAnswerRepo.findOne.mockResolvedValue(mockAnswer);
      mockContributorRepo.count.mockResolvedValue(1);
      (setAnswerContributors as jest.Mock).mockResolvedValue(undefined);

      const request = createMockRequest(maliciousBody);
      const params = createMockParams(mockAssessmentId, mockAnswerId);

      await PUT(request, { params });

      // Verify that URL param assessmentId was used, not body
      expect(mockAnswerRepo.findOne).toHaveBeenCalledWith({
        where: { id: mockAnswerId, assessmentId: mockAssessmentId },
        order: { updatedAt: 'DESC' }
      });

      expect(mockContributorRepo.count).toHaveBeenCalledWith({
        where: [{ id: contributorIds[0], assessmentId: mockAssessmentId }]
      });
    });
  });
});
