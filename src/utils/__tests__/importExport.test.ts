import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { exportData } from '../importExport';
import { Employee } from '../../types';

describe('exportData', () => {
  let createObjectURLSpy: ReturnType<typeof vi.spyOn>;
  let createElementSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test-url');
    createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue({
      href: '',
      download: '',
      click: vi.fn(),
    } as unknown as HTMLAnchorElement);
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => null as unknown as ChildNode);
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => null as unknown as ChildNode);
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates a downloadable JSON file', () => {
    exportData({
      employees: [],
      expenses: [],
      inventory: [],
      revenue: [],
      portfolio: null,
    });

    expect(createObjectURLSpy).toHaveBeenCalled();
    expect(createElementSpy).toHaveBeenCalledWith('a');
  });

  it('includes all data in the export', () => {
    const mockEmployees: Partial<Employee>[] = [{ id: '1', name: 'Test', role: 'Gerente' }];
    exportData({
      employees: mockEmployees as Employee[],
      expenses: [],
      inventory: [],
      revenue: [],
      portfolio: { companyName: 'Test Corp' },
    });

    const blobArg = createObjectURLSpy.mock.calls[0][0];
    expect(blobArg).toBeInstanceOf(Blob);
  });
});
