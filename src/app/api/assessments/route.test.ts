import { NextRequest } from 'next/server';
import type { AssessmentSetupFormData } from '@/types/assessment-setup.types';

// Mock Next.js server
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: jest.fn((body, init) => ({
      json: async () => body,
      status: init?.status || 200,
      ok: (init?.status || 200) >= 200 && (init?.status || 200) < 300
    }))
  }
}));

// Mock crypto module
jest.mock('crypto', () => ({
  randomBytes: jest.fn((length: number) => {
    return Buffer.from(Array(length).fill(0).map((_, i) => i));
  })
}));

// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password_123')
}));

// Mock database modules - must be done before importing the route
jest.mock('@/db/data-source', () => ({
  AppDataSource: {
    isInitialized: false,
    initialize: jest.fn().mockResolvedValue(undefined),
    transaction: jest.fn()
  }
}));

jest.mock('@/db/entities/Lead.entity', () => ({
  Lead: { name: 'Lead' }
}));

jest.mock('@/db/entities/Region.entity', () => ({
  Region: { name: 'Region' }
}));

jest.mock('@/db/entities/Assessment.entity', () => ({
  Assessment: { name: 'Assessment' },
  ProjectType: { OTHER: 'other' },
  AssessmentStatus: { DRAFT: 'draft' }
}));

jest.mock('@/db/entities/Diagnostic.entity', () => ({
  Diagnostic: { name: 'Diagnostic' }
}));

// Now import the route after mocks are set up
import { POST } from './route';

// Mock database entities and data source
const mockLead = {
  id: 'lead-123',
  email: 'test@example.com',
  name: 'Test User',
  jobTitle: 'Director',
  organization: 'Test Org',
  role: 'Lead'
};

const mockRegion = {
  id: 'region-123',
  regionName: 'USA - California',
  geographyType: 'state',
  countries: 'USA',
  subRegion: 'California',
  scope: 'Regional',
  ecosystems: JSON.stringify(['forest']),
  gisUrl: 'https://gis.example.com'
};

const mockDiagnostic = {
  id: 'diagnostic-123',
  language: 'en',
  createdAt: new Date('2026-01-01')
};

const mockAssessment = {
  id: 'assessment-123',
  leadId: 'lead-123',
  regionId: 'region-123',
  diagnosticId: 'diagnostic-123',
  passwordHash: 'hashed_password_123',
  diagnosticYear: '2026',
  projectType: 'other',
  status: 'draft'
};

const mockLeadRepository = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn()
};

const mockRegionRepository = {
  create: jest.fn(),
  save: jest.fn()
};

const mockDiagnosticRepository = {
  findOne: jest.fn()
};

const mockAssessmentRepository = {
  create: jest.fn(),
  save: jest.fn()
};

const mockTransactionalEntityManager = {
  getRepository: jest.fn((entity: { name: string }) => {
    if (entity.name === 'Lead') return mockLeadRepository;
    if (entity.name === 'Region') return mockRegionRepository;
    if (entity.name === 'Diagnostic') return mockDiagnosticRepository;
    if (entity.name === 'Assessment') return mockAssessmentRepository;
    return {};
  })
};

// Helper to create mock request
function createMockRequest(body: AssessmentSetupFormData & { language: string }) {
  return {
    json: jest.fn().mockResolvedValue(body)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;
}

// Valid test form data
const validFormData: AssessmentSetupFormData & { language: string } = {
  title: 'Director',
  fullName: 'John Doe',
  email: 'john.doe@example.com',
  organization: 'Test Organization',
  role: 'Project Lead',
  country: 'USA',
  subRegion: 'California',
  geographyType: 'state',
  scope: 'Regional',
  ecosystems: ['forest', 'grassland'],
  gisLink: 'https://gis.example.com/map',
  language: 'en'
};

describe('POST /api/assessments', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let AppDataSource: any;

  beforeEach(async () => {
    // Get the mocked AppDataSource
    const dataSourceModule = await import('@/db/data-source');
    AppDataSource = dataSourceModule.AppDataSource;
    
    // Reset all mocks
    jest.clearAllMocks();
    
    // Reset AppDataSource state
    AppDataSource.isInitialized = false;
    AppDataSource.initialize.mockResolvedValue(undefined);
    
    // Setup default mock implementations
    mockLeadRepository.findOne.mockResolvedValue(null);
    mockLeadRepository.create.mockReturnValue(mockLead);
    mockLeadRepository.save.mockResolvedValue(mockLead);
    
    mockRegionRepository.create.mockReturnValue(mockRegion);
    mockRegionRepository.save.mockResolvedValue(mockRegion);
    
    mockDiagnosticRepository.findOne.mockResolvedValue(mockDiagnostic);
    
    mockAssessmentRepository.create.mockReturnValue(mockAssessment);
    mockAssessmentRepository.save.mockResolvedValue(mockAssessment);
    
    // Mock transaction to execute callback immediately
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    AppDataSource.transaction.mockImplementation(async (callback: any) => {
      return await callback(mockTransactionalEntityManager);
    });
  });

  describe('Lazy Loading Strategy', () => {
    it('should lazy-load database dependencies on first request', async () => {
      // Verify that database is not initialized until POST is called
      expect(AppDataSource.isInitialized).toBe(false);
      
      const request = createMockRequest(validFormData);
      
      await POST(request);
      
      // Verify that AppDataSource.initialize was called (lazy loading occurred)
      expect(AppDataSource.initialize).toHaveBeenCalledTimes(1);
    });

    it('should not reinitialize AppDataSource if already initialized', async () => {
      AppDataSource.isInitialized = true;
      
      const request = createMockRequest(validFormData);
      
      await POST(request);
      
      expect(AppDataSource.initialize).not.toHaveBeenCalled();
    });

    it('should initialize AppDataSource only once across multiple requests', async () => {
      const request1 = createMockRequest(validFormData);
      const request2 = createMockRequest({
        ...validFormData,
        email: 'another@example.com'
      });
      
      await POST(request1);
      
      // After first request, mark as initialized
      AppDataSource.isInitialized = true;
      
      await POST(request2);
      
      // Should only initialize once
      expect(AppDataSource.initialize).toHaveBeenCalledTimes(1);
    });
  });

  describe('Email Validation', () => {
    it('should accept valid email addresses', async () => {
      const request = createMockRequest(validFormData);
      
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
    });

    it('should normalize email to lowercase', async () => {
      const request = createMockRequest({
        ...validFormData,
        email: 'John.Doe@EXAMPLE.COM'
      });
      
      await POST(request);
      
      expect(mockLeadRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'john.doe@example.com' }
      });
    });

    it('should trim whitespace from email', async () => {
      const request = createMockRequest({
        ...validFormData,
        email: '  john.doe@example.com  '
      });
      
      await POST(request);
      
      expect(mockLeadRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'john.doe@example.com' }
      });
    });

    it('should reject invalid email format - missing @', async () => {
      const request = createMockRequest({
        ...validFormData,
        email: 'invalidemail.com'
      });
      
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.message).toBe('Invalid email format');
    });

    it('should reject invalid email format - missing domain', async () => {
      const request = createMockRequest({
        ...validFormData,
        email: 'user@'
      });
      
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.message).toBe('Invalid email format');
    });

    it('should reject invalid email format - spaces', async () => {
      const request = createMockRequest({
        ...validFormData,
        email: 'user name@example.com'
      });
      
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });
  });

  describe('Password Generation', () => {
    it('should generate a password for new assessment', async () => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const bcrypt = require('bcrypt');
      
      const request = createMockRequest(validFormData);
      const response = await POST(request);
      const data = await response.json();
      
      expect(data.password).toBeDefined();
      expect(typeof data.password).toBe('string');
      expect(data.password.length).toBeGreaterThan(0);
      
      // Verify password was hashed
      expect(bcrypt.hash).toHaveBeenCalledWith(
        expect.any(String),
        10
      );
    });

    it('should return plaintext password only once in response', async () => {
      const request = createMockRequest(validFormData);
      const response = await POST(request);
      const data = await response.json();
      
      expect(data.password).toBeDefined();
      expect(data.password).not.toBe('hashed_password_123');
    });

    it('should store hashed password in database', async () => {
      const request = createMockRequest(validFormData);
      
      await POST(request);
      
      expect(mockAssessmentRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          passwordHash: 'hashed_password_123'
        })
      );
    });
  });

  describe('Lead Creation/Lookup', () => {
    it('should create new lead if email does not exist', async () => {
      mockLeadRepository.findOne.mockResolvedValue(null);
      
      const request = createMockRequest(validFormData);
      
      await POST(request);
      
      expect(mockLeadRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'john.doe@example.com' }
      });
      
      expect(mockLeadRepository.create).toHaveBeenCalledWith({
        jobTitle: 'Director',
        name: 'John Doe',
        email: 'john.doe@example.com',
        organization: 'Test Organization',
        role: 'Project Lead'
      });
      
      expect(mockLeadRepository.save).toHaveBeenCalled();
    });

    it('should reuse existing lead if email exists', async () => {
      const existingLead = { ...mockLead, id: 'existing-lead-123' };
      mockLeadRepository.findOne.mockResolvedValue(existingLead);
      
      const request = createMockRequest(validFormData);
      
      await POST(request);
      
      expect(mockLeadRepository.findOne).toHaveBeenCalled();
      expect(mockLeadRepository.create).not.toHaveBeenCalled();
      expect(mockLeadRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('Region Creation', () => {
    it('should create region with all provided data', async () => {
      const request = createMockRequest(validFormData);
      
      await POST(request);
      
      expect(mockRegionRepository.create).toHaveBeenCalledWith({
        regionName: 'USA - California',
        geographyType: 'state',
        countries: 'USA',
        subRegion: 'California',
        scope: 'Regional',
        ecosystems: JSON.stringify(['forest', 'grassland']),
        gisUrl: 'https://gis.example.com/map'
      });
      
      expect(mockRegionRepository.save).toHaveBeenCalled();
    });

    it('should handle missing gisLink gracefully', async () => {
      const formDataWithoutGis = { ...validFormData };
      delete formDataWithoutGis.gisLink;
      
      const request = createMockRequest(formDataWithoutGis);
      
      await POST(request);
      
      expect(mockRegionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          gisUrl: undefined
        })
      );
    });

    it('should stringify ecosystems array', async () => {
      const request = createMockRequest(validFormData);
      
      await POST(request);
      
      const createCall = mockRegionRepository.create.mock.calls[0][0];
      expect(typeof createCall.ecosystems).toBe('string');
      expect(JSON.parse(createCall.ecosystems)).toEqual(['forest', 'grassland']);
    });
  });

  describe('Diagnostic Lookup', () => {
    it('should find most recent diagnostic for language', async () => {
      const request = createMockRequest(validFormData);
      
      await POST(request);
      
      expect(mockDiagnosticRepository.findOne).toHaveBeenCalledWith({
        where: { language: 'en' },
        order: { createdAt: 'DESC' }
      });
    });

    it('should throw error if no diagnostic found for language', async () => {
      mockDiagnosticRepository.findOne.mockResolvedValue(null);
      
      const request = createMockRequest(validFormData);
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toContain('No diagnostic found for language: en');
    });

    it('should support different language codes', async () => {
      const spanishFormData = { ...validFormData, language: 'es' };
      const request = createMockRequest(spanishFormData);
      
      await POST(request);
      
      expect(mockDiagnosticRepository.findOne).toHaveBeenCalledWith({
        where: { language: 'es' },
        order: { createdAt: 'DESC' }
      });
    });
  });

  describe('Assessment Creation', () => {
    it('should create assessment with correct relationships', async () => {
      const request = createMockRequest(validFormData);
      
      await POST(request);
      
      expect(mockAssessmentRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          leadId: 'lead-123',
          regionId: 'region-123',
          diagnosticId: 'diagnostic-123',
          passwordHash: 'hashed_password_123',
          diagnosticYear: '2026',
          projectType: 'other',
          status: 'draft'
        })
      );
      
      expect(mockAssessmentRepository.save).toHaveBeenCalled();
    });

    it('should use current year for diagnosticYear', async () => {
      const request = createMockRequest(validFormData);
      
      await POST(request);
      
      const createCall = mockAssessmentRepository.create.mock.calls[0][0];
      expect(createCall.diagnosticYear).toBe('2026');
    });

    it('should set default status to DRAFT', async () => {
      const request = createMockRequest(validFormData);
      
      await POST(request);
      
      const createCall = mockAssessmentRepository.create.mock.calls[0][0];
      expect(createCall.status).toBe('draft');
    });

    it('should set default projectType to OTHER', async () => {
      const request = createMockRequest(validFormData);
      
      await POST(request);
      
      const createCall = mockAssessmentRepository.create.mock.calls[0][0];
      expect(createCall.projectType).toBe('other');
    });
  });

  describe('Transaction Handling', () => {
    it('should execute all operations within a transaction', async () => {
      const request = createMockRequest(validFormData);
      
      await POST(request);
      
      expect(AppDataSource.transaction).toHaveBeenCalled();
      expect(mockTransactionalEntityManager.getRepository).toHaveBeenCalledTimes(4);
    });

    it('should rollback on error during transaction', async () => {
      mockRegionRepository.save.mockRejectedValue(new Error('Database error'));
      
      const request = createMockRequest(validFormData);
      const response = await POST(request);
      
      expect(response.status).toBe(500);
      
      // Verify transaction was called (rollback happens automatically in TypeORM)
      expect(AppDataSource.transaction).toHaveBeenCalled();
    });

    it('should return assessmentId and password on success', async () => {
      const request = createMockRequest(validFormData);
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.assessmentId).toBe('assessment-123');
      expect(data.password).toBeDefined();
      expect(data.message).toBe('Assessment created successfully');
    });
  });

  describe('Error Handling', () => {
    it('should handle database initialization errors', async () => {
      AppDataSource.initialize.mockRejectedValue(new Error('Connection failed'));
      
      const request = createMockRequest(validFormData);
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Connection failed');
    });

    it('should handle lead creation errors', async () => {
      mockLeadRepository.save.mockRejectedValue(new Error('Lead save failed'));
      
      const request = createMockRequest(validFormData);
      const response = await POST(request);
      
      expect(response.status).toBe(500);
    });

    it('should return user-friendly error message', async () => {
      AppDataSource.transaction.mockRejectedValue(new Error('Database error'));
      
      const request = createMockRequest(validFormData);
      const response = await POST(request);
      const data = await response.json();
      
      expect(data.message).toBe(
        'We encountered an issue while creating your assessment. Please check your information and try again.'
      );
    });

    it('should include error details in development mode', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      AppDataSource.transaction.mockRejectedValue(new Error('Detailed error'));
      
      const request = createMockRequest(validFormData);
      const response = await POST(request);
      const data = await response.json();
      
      expect(data.error).toBe('Detailed error');
      expect(data.stack).toBeDefined();
      
      process.env.NODE_ENV = originalEnv;
    });

    it('should not expose error stack in production', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      AppDataSource.transaction.mockRejectedValue(new Error('Production error'));
      
      const request = createMockRequest(validFormData);
      const response = await POST(request);
      const data = await response.json();
      
      expect(data.stack).toBeUndefined();
      
      process.env.NODE_ENV = originalEnv;
    });

    it('should handle non-Error exceptions', async () => {
      AppDataSource.transaction.mockRejectedValue('String error');
      
      const request = createMockRequest(validFormData);
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('An unexpected error occurred');
    });
  });

  describe('Request Body Validation', () => {
    it('should handle malformed JSON', async () => {
      const request = {
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON'))
      } as unknown as NextRequest;
      
      const response = await POST(request);
      
      expect(response.status).toBe(500);
    });

    it('should process all required fields', async () => {
      const request = createMockRequest(validFormData);
      
      await POST(request);
      
      // Verify all fields were processed
      expect(mockLeadRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          jobTitle: validFormData.title,
          name: validFormData.fullName,
          email: validFormData.email.toLowerCase(),
          organization: validFormData.organization,
          role: validFormData.role
        })
      );
    });
  });
});
